import { NextRequest, NextResponse } from 'next/server';
let warnedAboutServiceKey = false;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, code, anonymousId } = body;
    if (!anonymousId) return NextResponse.json({ error: 'anonymousId required' }, { status: 400 });
    if (!roomId && !code) return NextResponse.json({ error: 'roomId or code required' }, { status: 400 });

    // Prefer service role key, but fall back to anon key if missing (dev convenience).
    let keyToUse = SERVICE_ROLE_KEY || ANON_KEY || null;
    if (!SUPABASE_URL || !keyToUse) {
      const msg = `Server env missing: SUPABASE_URL=${!!SUPABASE_URL}, SERVICE_ROLE_KEY=${!!SERVICE_ROLE_KEY}, ANON_KEY=${!!ANON_KEY}`;
      console.error(msg);
      return NextResponse.json({ error: 'Supabase keys not configured on server. See server logs.' , details: msg }, { status: 500 });
    }
    if (!SERVICE_ROLE_KEY && ANON_KEY) {
      console.warn('Service role key not present; using anon key as fallback. RLS may block some operations.');
    }

    const mod = await import('@supabase/supabase-js');
    const { createClient } = mod;
    if (!SERVICE_ROLE_KEY && ANON_KEY && !warnedAboutServiceKey) {
      console.warn('Service role key not present; using anon key as fallback. RLS may block some operations.');
      warnedAboutServiceKey = true;
    }
    const supabase = createClient(String(SUPABASE_URL), String(keyToUse));

    // Resolve code_id if code provided, or try to find code by room_id
    let codeId: number | null = null;
    if (code) {
      const { data: codeRow, error: codeErr } = await supabase.from('codes').select('id').eq('code', code).maybeSingle();
      if (codeErr) console.warn('Service route: error fetching code by code:', codeErr);
      if (codeRow && typeof (codeRow as any).id === 'number') codeId = (codeRow as any).id;
    }
    if (!codeId && roomId) {
      const { data: byRoom, error: byRoomErr } = await supabase.from('codes').select('id').eq('room_id', roomId).limit(1).maybeSingle();
      if (byRoomErr) console.warn('Service route: error fetching code by room_id:', byRoomErr);
      if (byRoom && typeof (byRoom as any).id === 'number') codeId = (byRoom as any).id;
    }

    if (!codeId) {
      console.error('Service route: could not resolve code_id; roomId:', roomId, 'code:', code);
      return NextResponse.json({ error: 'code_id not found', details: { roomId, code } }, { status: 404 });
    }

    const insertPayload: any = { room_id: Number(roomId), anonymous_id: anonymousId, code_id: codeId };
    if (!roomId) delete insertPayload.room_id; // if not provided

    const { data, error } = await supabase.from('room_participants').insert([insertPayload]).select('id').maybeSingle();
    if (error) {
      console.error('Service route insert error:', error);
      if ((error as any)?.code === '42501') {
        console.warn('RLS blocked insert into room_participants. If you are testing locally, either set SUPABASE_SERVICE_ROLE_KEY in your env or run supabase/dev_rls_open.sql to temporarily relax policies.');
        return NextResponse.json({ error: 'RLS blocked insert', details: error }, { status: 403 });
      }
      return NextResponse.json({ error: 'Insert failed', details: error }, { status: 500 });
    }
    // Return created participant id and raw data
    return NextResponse.json({ participant: data }, { status: 200 });
  } catch (err: any) {
    console.error('Service route failed:', err);
    return NextResponse.json({ error: 'Unhandled server error', details: String(err) }, { status: 500 });
  }
}
