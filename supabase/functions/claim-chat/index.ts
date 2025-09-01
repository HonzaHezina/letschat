import { serve, createClient } from '../_shared/runtime-shims.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { logEvent } from '../_shared/log.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the user from the authorization header
    const supabaseClient = await createClient(
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
  const serviceRoleClient = await createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

    // Find the participant record by anonymousId and update it with the registered user_id
  const TABLES = { ROOM_PARTICIPANTS: 'room_participants' };
    const { data, error } = await serviceRoleClient
      .from(TABLES.ROOM_PARTICIPANTS)
      .update({ user_id: user.id })
      .eq('anonymous_id', anonymousId)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, updatedRecords: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: unknown) {
    const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    await logEvent({ module: 'profile', operation: 'claim-chat', error: message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
