import { serve, createClient, getBcrypt } from '../_shared/runtime-shims.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { logEvent } from '../_shared/log.ts';

const TABLES = {
  CODES: 'codes',
  ROOMS: 'rooms',
  ROOM_PARTICIPANTS: 'room_participants',
};

// Use bcrypt via runtime shim
let _bcrypt: any = null;
async function ensureBcrypt() {
  if (!_bcrypt) _bcrypt = await getBcrypt();
  return _bcrypt;
}

function hashPinSync(pin: string): string {
  // use cost 10 for quick hashing of short PINs
  // bcryptjs provides sync methods - ensure sync availability via shim at runtime
  // (in editor this is a no-op shim)
  // eslint-disable-next-line no-sync
  return (globalThis as any).BCRYPT_HASH_SYNC ? (globalThis as any).BCRYPT_HASH_SYNC(pin) : ("" + pin);
}

function comparePinSync(pin: string, hash: string): boolean {
  // eslint-disable-next-line no-sync
  return (globalThis as any).BCRYPT_COMPARE_SYNC ? (globalThis as any).BCRYPT_COMPARE_SYNC(pin, hash) : pin === hash;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { code, anonymousId, pin } = await req.json();
  const logData = { module: 'room', operation: 'finalize-join', data: { code, anonymousId, hasPin: !!pin } };

  try {
    if (!code || !anonymousId) throw new Error('Code and anonymousId are required.');

  const supabase = await createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Delegate the atomic finalize-join work to a DB-side RPC function to avoid race conditions
  // @ts-ignore: Deno types are provided in supabase/functions/types.d.ts in runtime; ignore editor warning
  const serviceRoleClient = await createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: rpcData, error: rpcError } = await serviceRoleClient.rpc('finalize_join', { p_code: code.toUpperCase(), p_anonymous_id: anonymousId, p_pin: pin ?? null });
    if (rpcError) {
      const msg = String(rpcError.message || rpcError);
      if (msg.includes('invalid_code')) throw new Error('Neplatný kód.');
      if (msg.includes('pin_required')) throw new Error('Tento chat vyžaduje PIN.');
      if (msg.includes('invalid_pin')) throw new Error('Nesprávný PIN.');
      if (msg.includes('room_full')) throw new Error('Místnost je již plná.');
      throw rpcError;
    }

    const roomId = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    await logEvent({ ...logData, data: { ...logData.data, roomId } });
    return new Response(JSON.stringify({ roomId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (err: unknown) {
    const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    await logEvent({ ...logData, error: message });
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
