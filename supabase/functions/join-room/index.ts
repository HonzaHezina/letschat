import { serve, createClient } from '../_shared/runtime-shims.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { logEvent } from '../_shared/log.ts';

const TABLES = {
  CODES: 'codes',
  ROOMS: 'rooms',
  ROOM_PARTICIPANTS: 'room_participants',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { code, anonymousId } = await req.json();
  const logData = { module: 'room', operation: 'join-room', data: { code, anonymousId } };

  try {
    if (!code || !anonymousId) {
      throw new Error('Code and anonymousId are required.');
    }

    const supabase = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find the code record (ignore pin_hash for testovací účely)
    const { data: codeData, error: codeError } = await supabase
      .from(TABLES.CODES)
      .select('id, linked_to, room_id, used')
      .eq('code', code.toUpperCase())
      .single();

    // Pro testovací účely neřešíme hash PINu
    if (codeError || !codeData) {
      return new Response(JSON.stringify({ error: 'Neplatný kód.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    let roomId = codeData.room_id;

    // If no room is associated yet, create one
    if (!roomId) {
      const { data: newRoom, error: newRoomError } = await supabase
        .from(TABLES.ROOMS)
        .insert({})
        .select('id')
        .single();

      if (newRoomError) throw newRoomError;
      roomId = newRoom.id;

      // Update both codes with the new room_id
      const { error: updateCodesError } = await supabase
        .from(TABLES.CODES)
        .update({ room_id: roomId })
        .in('id', [codeData.id, codeData.linked_to]);

      if (updateCodesError) throw updateCodesError;
    }

    // Check participants
    const { data: participants, error: participantsError } = await supabase
      .from(TABLES.ROOM_PARTICIPANTS)
      .select('id, anonymous_id')
      .eq('room_id', roomId);

    if (participantsError) throw participantsError;

  const isAlreadyParticipant = (participants as any[]).some((p: any) => p.anonymous_id === anonymousId);

    if (participants.length >= 2 && !isAlreadyParticipant) {
      return new Response(JSON.stringify({ error: 'Místnost je již plná.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Add user as a participant if not already in
    if (!isAlreadyParticipant) {
      const { error: insertParticipantError } = await supabase
        .from(TABLES.ROOM_PARTICIPANTS)
        .insert({
          room_id: roomId,
          anonymous_id: anonymousId,
          code_id: codeData.id,
          role: `Účastník ${participants.length + 1}`
        });

      if (insertParticipantError) throw insertParticipantError;

      // Mark code as used
  await supabase.from(TABLES.CODES).update({ used: 1, date_first: new Date().toISOString() }).eq('id', codeData.id);
    }

    return new Response(JSON.stringify({ roomId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: unknown) {
    const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    await logEvent({ ...logData, error: message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
