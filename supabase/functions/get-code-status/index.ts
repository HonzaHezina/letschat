import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, anonymousId } = await req.json();
    if (!code || !anonymousId) throw new Error('Code and anonymousId are required.');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: codeData, error: codeError } = await supabase
      .from('codes')
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
        .from('room_participants')
        .select('id, anonymous_id')
        .eq('room_id', codeData.room_id);

    if (pError) throw pError;

    const isParticipant = participants.some(p => p.anonymous_id === anonymousId);

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

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
