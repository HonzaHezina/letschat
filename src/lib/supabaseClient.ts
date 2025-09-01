// Provide a lazy async getter for the Supabase client to avoid bundling
// the realtime module into server bundles (which can trigger bundler warnings).
// We dynamically import '@supabase/supabase-js' at runtime in the browser only.

let _client: any = null;

export async function getSupabaseClient() {
  if (_client) return _client;

  const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const supabaseAnonKey = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
      'Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase client will be initialized but requests may fail.'
    );
  }

  // Use an indirect import to avoid static analysis by bundlers that
  // would otherwise traverse into the Supabase package and warn about
  // dynamic requires inside its dependencies (like realtime-js).
  const mod = await import('@supabase/supabase-js');
  const { createClient } = mod;
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export default getSupabaseClient;
