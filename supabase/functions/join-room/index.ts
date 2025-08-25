import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { logEvent } from '../_shared/log.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { code, anonymousId } = await req.json();
  const logData = { module: 'room', operation: 'join-room', data: { code, anonymousId } };

  try {
    if (!code || !anonymousId) {
      throw new Error('Code and anonymousId are required.');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find the code record
    const { data: codeData, error: codeError } = await supabase
      .from('codes')
      .select('id, linked_to, room_id, used')
      .eq('code', code.toUpperCase())
      .single();

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
        .from('rooms')
        .insert({})
        .select('id')
        .single();

      if (newRoomError) throw newRoomError;
      roomId = newRoom.id;

      // Update both codes with the new room_id
      const { error: updateCodesError } = await supabase
        .from('codes')
        .update({ room_id: roomId })
        .in('id', [codeData.id, codeData.linked_to]);

      if (updateCodesError) throw updateCodesError;
    }

    // Check participants
    const { data: participants, error: participantsError } = await supabase
      .from('room_participants')
      .select('id, anonymous_id')
      .eq('room_id', roomId);

    if (participantsError) throw participantsError;

    const isAlreadyParticipant = participants.some(p => p.anonymous_id === anonymousId);

    if (participants.length >= 2 && !isAlreadyParticipant) {
      return new Response(JSON.stringify({ error: 'Místnost je již plná.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Add user as a participant if not already in
    if (!isAlreadyParticipant) {
      const { error: insertParticipantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          anonymous_id: anonymousId,
          code_id: codeData.id,
          role: `Účastník ${participants.length + 1}`
        });

      if (insertParticipantError) throw insertParticipantError;

      // Mark code as used
      await supabase.from('codes').update({ used: 1, date_first: new Date().toISOString() }).eq('id', codeData.id);
    }

    return new Response(JSON.stringify({ roomId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    await logEvent({ ...logData, error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
