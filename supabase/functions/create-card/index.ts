import { serve, createClient } from '../_shared/runtime-shims.ts';
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
  const supabase = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated.');

    const logData = { module: 'room', operation: 'create-card', data: { userId: user.id } };
    await logEvent(logData);

    const serviceRoleClient = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Deno does not have a native transaction API for Supabase yet.
    // We will perform operations sequentially with checks.
    // A more robust solution would be a PostgreSQL function (RPC).

    let codeA: string, codeB: string;
  const TABLES = { CODES: 'codes' };
  let isUnique = false;

    // Generate two unique codes
    do {
        codeA = generateCode();
        codeB = generateCode();
    const { data: existingCodes, error } = await serviceRoleClient
      .from(TABLES.CODES)
            .select('code')
            .in('code', [codeA, codeB]);
        if (error) throw error;
        if (existingCodes.length === 0) {
            isUnique = true;
        }
    } while (!isUnique);

    // Insert the two new codes and link them
    const { data: recordA, error: errorA } = await serviceRoleClient
      .from(TABLES.CODES)
      .insert({ code: codeA, user_id: user.id })
      .select('id')
      .single();

    if (errorA) throw errorA;

    const { data: recordB, error: errorB } = await serviceRoleClient
      .from(TABLES.CODES)
      .insert({ code: codeB, user_id: user.id, linked_to: recordA.id })
      .select('id')
      .single();

    if (errorB) throw errorB;

    // Update the first record to link to the second
    const { error: updateError } = await serviceRoleClient
      .from(TABLES.CODES)
      .update({ linked_to: recordB.id })
      .eq('id', recordA.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ codeA, codeB }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: unknown) {
    // We don't have logData here if user is not authenticated, so we try to get the user
    // from the incoming request authorization header if present.
  const tmpClient = await createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );
  const { data: { user } } = await tmpClient.auth.getUser();
    const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    await logEvent({ module: 'room', operation: 'create-card', data: { userId: user?.id }, error: message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
