import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Získání proměnných prostředí
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  // Najdi místnost podle kódu
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('name', code)
    .maybeSingle();

  if (error || !room) {
    return NextResponse.json({ error: 'Neplatný kód.' }, { status: 404 });
  }

  return NextResponse.json(room);
}
