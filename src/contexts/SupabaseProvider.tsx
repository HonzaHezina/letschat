"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';

type SupabaseContextType = {
  supabase: SupabaseClient | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await getSupabaseClient();
        if (mounted) setClient(c as SupabaseClient);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize Supabase client', e);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase: client }}>
      {children}
    </SupabaseContext.Provider>
  );
};
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  if (context.supabase === null) {
    throw new Error('Supabase client is not initialized yet. Use within client components after initialization.');
  }
  return context.supabase;
};

// A safe hook that returns the Supabase client or null while it initializes.
export const useSupabaseSafe = (): SupabaseClient | null => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
};
