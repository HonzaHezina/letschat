import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { logEvent } from '../_shared/log.ts';

// Basic hashing function for PIN (for a real app, use a more secure library like bcrypt)
async function hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { code, anonymousId, pin } = await req.json();
  const logData = { module: 'room', operation: 'finalize-join', data: { code, anonymousId, hasPin: !!pin } };

  try {
    if (!code || !anonymousId) throw new Error('Code and anonymousId are required.');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 1. Find the code and its pair
    const { data: codeData, error: codeError } = await supabase.from('codes').select('id, linked_to, room_id, used, pin_hash').eq('code', code.toUpperCase()).single();
    if (codeError || !codeData) throw new Error('Neplatný kód.');

    // 2. Handle PIN verification if code is already used and has a PIN
    if (codeData.used && codeData.pin_hash) {
        if (!pin) throw new Error('Tento chat vyžaduje PIN.');
        const providedPinHash = await hashPin(pin);
        if (providedPinHash !== codeData.pin_hash) {
            throw new Error('Nesprávný PIN.');
        }
    }

    // 3. Find or create the room
    let roomId = codeData.room_id;
    if (!roomId) {
        const { data: newRoom, error: roomErr } = await supabase.from('rooms').insert({}).select('id').single();
        if (roomErr) throw roomErr;
        roomId = newRoom.id;
        await supabase.from('codes').update({ room_id: roomId }).in('id', [codeData.id, codeData.linked_to]);
    }

    // 4. Check participants
    const { data: participants, error: pError } = await supabase.from('room_participants').select('id, anonymous_id').eq('room_id', roomId);
    if (pError) throw pError;
    const isParticipant = participants.some(p => p.anonymous_id === anonymousId);
    if (participants.length >= 2 && !isParticipant) throw new Error('Místnost je již plná.');

    // 5. Add participant if not already in
    if (!isParticipant) {
        await supabase.from('room_participants').insert({ room_id: roomId, anonymous_id: anonymousId, code_id: codeData.id });

        // 6. Set PIN if it's a new entry and PIN was provided
        if (!codeData.used && pin) {
            const newPinHash = await hashPin(pin);
            await supabase.from('codes').update({ pin_hash: newPinHash }).eq('id', codeData.id);
            // Also update the linked code's PIN hash to be the same
            if (codeData.linked_to) {
                 await supabase.from('codes').update({ pin_hash: newPinHash }).eq('id', codeData.linked_to);
            }
        }

        // 7. Mark code as used
        await supabase.from('codes').update({ used: 1, date_first: new Date().toISOString() }).eq('id', codeData.id);
    }

    await logEvent({ ...logData, data: { ...logData.data, roomId } });
    return new Response(JSON.stringify({ roomId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    await logEvent({ ...logData, error: error.message });
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
