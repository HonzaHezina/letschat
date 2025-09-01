/* Quick test script for the finalize_join RPC
   Usage (PowerShell):
     $env:SUPABASE_SERVICE_ROLE_KEY="<service role key>"
     $env:NEXT_PUBLIC_SUPABASE_URL="https://..."
     node scripts/test-finalize-join.js A1234 00000000-0000-0000-0000-000000000000
*/
const fetch = (typeof global !== 'undefined' && global.fetch) ? global.fetch : (...args) => require('node-fetch')(...args);

const [,, code, anonymousId, pin] = process.argv;
if (!code || !anonymousId) {
  console.error('Usage: node scripts/test-finalize-join.js <CODE> <ANONYMOUS_UUID> [PIN]');
  process.exit(2);
}

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SERVICE_KEY || !SUPABASE_URL) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in your env.');
  process.exit(3);
}

(async () => {
  try {
    const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/finalize_join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ p_code: code.toUpperCase(), p_anonymous_id: anonymousId, p_pin: pin ?? null }),
    });

    const text = await resp.text();
    console.log('Status:', resp.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error calling RPC:', err);
    process.exit(4);
  }
})();
