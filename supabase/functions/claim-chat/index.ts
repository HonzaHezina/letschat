import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { logEvent } from '../_shared/log.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the user from the authorization header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated.');

    const { anonymousId } = await req.json();
    if (!anonymousId) {
      throw new Error('Anonymous ID is required to claim a chat.');
    }

    const logData = { module: 'profile', operation: 'claim-chat', data: { userId: user.id, anonymousId } };
    await logEvent(logData);

    // Use the service role client to perform the update
    const serviceRoleClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find the participant record by anonymousId and update it with the registered user_id
    const { data, error } = await serviceRoleClient
      .from('room_participants')
      .update({ user_id: user.id })
      .eq('anonymous_id', anonymousId)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, updatedRecords: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    await logEvent({ module: 'profile', operation: 'claim-chat', error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
