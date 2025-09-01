// Runtime shims for Supabase Edge Functions used only for local editor/build
// convenience. These shims dynamically import remote modules at runtime so
// TypeScript/IDE doesn't need to resolve remote ESM URLs during analysis.

// Note: these are only shims to ease local type-checking / editing. The
// production environment (Supabase Edge) will use the original remote imports.

export function serve(handler: (req: Request) => Response | Promise<Response>) {
  // Indirect dynamic import to avoid static analysis picking up the remote URL.
  // Start the actual server asynchronously.
  // eslint-disable-next-line no-new-func
  const dynamicImport = new Function('m', 'return import(m)');
  (async () => {
    const mod = await (dynamicImport as any)('https://deno.land/std@0.168.0/http/server.ts');
    (mod as any).serve(handler);
  })();
}

export async function createClient(...args: any[]) {
  // Indirect dynamic import to avoid editor static resolution.
  // eslint-disable-next-line no-new-func
  const dynamicImport = new Function('m', 'return import(m)');
  const mod = await (dynamicImport as any)('https://esm.sh/@supabase/supabase-js@2');
  return (mod as any).createClient(...args);
}

export async function getBcrypt() {
  // eslint-disable-next-line no-new-func
  const dynamicImport = new Function('m', 'return import(m)');
  const mod = await (dynamicImport as any)('https://esm.sh/bcryptjs');
  return (mod as any).default;
}
