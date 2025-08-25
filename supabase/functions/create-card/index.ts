import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { logEvent } from '../_shared/log.ts';

// Helper function to generate a unique 5-character code
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated.');

    const logData = { module: 'room', operation: 'create-card', data: { userId: user.id } };
    await logEvent(logData);

    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Deno does not have a native transaction API for Supabase yet.
    // We will perform operations sequentially with checks.
    // A more robust solution would be a PostgreSQL function (RPC).

    let codeA: string, codeB: string;
    let isUnique = false;

    // Generate two unique codes
    do {
        codeA = generateCode();
        codeB = generateCode();
        const { data: existingCodes, error } = await serviceRoleClient
            .from('codes')
            .select('code')
            .in('code', [codeA, codeB]);
        if (error) throw error;
        if (existingCodes.length === 0) {
            isUnique = true;
        }
    } while (!isUnique);

    // Insert the two new codes and link them
    const { data: recordA, error: errorA } = await serviceRoleClient
      .from('codes')
      .insert({ code: codeA, user_id: user.id })
      .select('id')
      .single();

    if (errorA) throw errorA;

    const { data: recordB, error: errorB } = await serviceRoleClient
      .from('codes')
      .insert({ code: codeB, user_id: user.id, linked_to: recordA.id })
      .select('id')
      .single();

    if (errorB) throw errorB;

    // Update the first record to link to the second
    const { error: updateError } = await serviceRoleClient
      .from('codes')
      .update({ linked_to: recordB.id })
      .eq('id', recordA.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ codeA, codeB }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // We don't have logData here if user is not authenticated, so we create it.
    const { data: { user } } = await createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    ).auth.getUser();
    await logEvent({ module: 'room', operation: 'create-card', data: { userId: user?.id }, error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
