// Minimal editor-only shims for Deno globals and remote ESM imports used by
// Supabase Edge Functions. These declarations exist only to silence editor
// type-checker errors in a monorepo where Deno/esm.sh imports are present.

export {};

declare global {
  // Minimal Deno env typing for editor only
  var Deno: {
    env: {
      get(name: string): string | undefined;
    };
  };
}

// serve from deno std
declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// Supabase (esm.sh) minimal shims
declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export function createClient(...args: any[]): any;
  export default createClient;
}

declare module 'https://esm.sh/@supabase/supabase-js' {
  export function createClient(...args: any[]): any;
  export default createClient;
}

// bcryptjs shim
declare module 'https://esm.sh/bcryptjs' {
  const bcrypt: {
    hashSync(data: string, saltOrRounds?: number): string;
    compareSync(data: string, encrypted: string): boolean;
  };
  export default bcrypt;
}

// Generic fallbacks
declare module 'https://esm.sh/*' {
  const whatever: any;
  export default whatever;
}

declare module 'https://deno.land/*' {
  const whatever: any;
  export default whatever;
}
