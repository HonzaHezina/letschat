import { serve, createClient } from '../_shared/runtime-shims.ts';
import { corsHeaders } from '../_shared/cors.ts';

const TABLES = {
  CODES: 'codes',
  ROOM_PARTICIPANTS: 'room_participants',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, anonymousId } = await req.json();
    if (!code || !anonymousId) throw new Error('Code and anonymousId are required.');

    const supabase = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: codeData, error: codeError } = await supabase
      .from(TABLES.CODES)
      .select('id, room_id, used, pin_hash, anonymous_hash')
      .eq('code', code.toUpperCase())
      .single();

    if (codeError || !codeData) {
      return new Response(JSON.stringify({ status: 'invalid' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    if (!codeData.room_id) { // No room yet, so it's a new entry
        return new Response(JSON.stringify({ status: 'new' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // Room exists, check participants
  const { data: participants, error: pError } = await supabase
    .from(TABLES.ROOM_PARTICIPANTS)
        .select('id, anonymous_id')
        .eq('room_id', codeData.room_id);

    if (pError) throw pError;

  const isParticipant = (participants as any[]).some((p: any) => p.anonymous_id === anonymousId);

    if (participants.length >= 2 && !isParticipant) {
        return new Response(JSON.stringify({ status: 'full' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // Determine status for re-joining
    let status: string;
    if (codeData.pin_hash) {
        status = 'protected';
    } else {
        // Here you could verify the anonymous_hash against a cookie if needed,
        // but for now we'll just say it's unprotected.
        status = 'unprotected';
    }

    return new Response(JSON.stringify({ status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (err: unknown) {
    const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
