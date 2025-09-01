import { NextRequest, NextResponse } from 'next/server';
let warnedAboutServiceKey = false;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function serviceClient() {
  const mod = await import('@supabase/supabase-js');
  const { createClient } = mod;
  const keyToUse = SERVICE_ROLE_KEY || ANON_KEY || null;
  if (!SUPABASE_URL || !keyToUse) throw new Error('Missing SUPABASE_URL or SUPABASE keys on server');
  if (!SERVICE_ROLE_KEY && ANON_KEY && !warnedAboutServiceKey) {
    console.warn('Service role key missing; falling back to anon key for service client (dev only).');
    warnedAboutServiceKey = true;
  }
  return createClient(String(SUPABASE_URL), String(keyToUse));
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const roomId = url.searchParams.get('roomId');
    const limitParam = url.searchParams.get('limit');
    const latest = url.searchParams.get('latest');
    const before = url.searchParams.get('before'); // ISO timestamp
    if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });

  const supabase = await serviceClient();
    let query = supabase.from('room_rows').select('*').eq('room_id', Number(roomId));
    // Pagination helpers
    const limit = limitParam ? Number(limitParam) : null;
    if (latest === 'true' && limit) {
      // fetch latest N messages (order desc then reverse)
      const { data, error } = await query.order('created_at', { ascending: false }).limit(limit as number);
      if (error) {
        console.error('Service GET room_rows error:', error);
        if ((error as any)?.code === '42501') {
          console.warn('RLS blocked read on room_rows; returning 403. Set SUPABASE_SERVICE_ROLE_KEY or run dev_rls_open.sql to allow reads.');
          return NextResponse.json({ error: 'RLS blocked read on room_rows' }, { status: 403 });
        }
        return NextResponse.json({ error: 'DB error', details: error }, { status: 500 });
      }
      // reverse to ascending order for UI
      return NextResponse.json({ rows: (data || []).reverse() }, { status: 200 });
    }
    if (before && limit) {
      // fetch messages older than `before` timestamp
      const beforeDate = new Date(before);
      const { data, error } = await query.lt('created_at', beforeDate.toISOString()).order('created_at', { ascending: false }).limit(limit as number);
      if (error) {
        console.error('Service GET room_rows error:', error);
        if ((error as any)?.code === '42501') {
          console.warn('RLS blocked read on room_rows; returning 403. Set SUPABASE_SERVICE_ROLE_KEY or run dev_rls_open.sql to allow reads.');
          return NextResponse.json({ error: 'RLS blocked read on room_rows' }, { status: 403 });
        }
        return NextResponse.json({ error: 'DB error', details: error }, { status: 500 });
      }
      return NextResponse.json({ rows: (data || []).reverse() }, { status: 200 });
    }

    // default: return all rows ascending
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) {
      console.error('Service GET room_rows error:', error);
      // If RLS is blocking reads (common in dev when anon key is used), return 403 so client sees the issue.
      if ((error as any)?.code === '42501') {
        console.warn('RLS blocked read on room_rows; returning 403. Set SUPABASE_SERVICE_ROLE_KEY or run dev_rls_open.sql to allow reads.');
        return NextResponse.json({ error: 'RLS blocked read on room_rows' }, { status: 403 });
      }
      return NextResponse.json({ error: 'DB error', details: error }, { status: 500 });
    }
    return NextResponse.json({ rows: data }, { status: 200 });
  } catch (err: any) {
    console.error('Service GET room_rows failed:', err);
    return NextResponse.json({ error: 'Unhandled server error', details: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, participantId, content } = body;
    if (!roomId || !participantId || !content) return NextResponse.json({ error: 'roomId, participantId and content required' }, { status: 400 });

  const supabase = await serviceClient();

    // Validate participant belongs to room
    const { data: participant, error: pErr } = await supabase
      .from('room_participants')
      .select('id, room_id')
      .eq('id', Number(participantId))
      .maybeSingle();
    if (pErr) {
      console.error('Service validate participant error:', pErr);
      return NextResponse.json({ error: 'DB error', details: pErr }, { status: 500 });
    }
    if (!participant || Number(participant.room_id) !== Number(roomId)) {
      return NextResponse.json({ error: 'Participant not in room or not found' }, { status: 403 });
    }

    const insert = { room_id: Number(roomId), participant_id: Number(participantId), content };
    const { data, error } = await supabase.from('room_rows').insert([insert]).select('*').maybeSingle();
    if (error) {
      console.error('Service insert room_rows error:', error);
      if ((error as any)?.code === '42501') {
        console.warn('RLS blocked insert into room_rows. Set SUPABASE_SERVICE_ROLE_KEY or run dev_rls_open.sql to allow inserts in dev.');
        return NextResponse.json({ error: 'RLS blocked insert', details: error }, { status: 403 });
      }
      return NextResponse.json({ error: 'Insert failed', details: error }, { status: 500 });
    }
    return NextResponse.json({ row: data }, { status: 200 });
  } catch (err: any) {
    console.error('Service POST room_rows failed:', err);
    return NextResponse.json({ error: 'Unhandled server error', details: String(err) }, { status: 500 });
  }
}
