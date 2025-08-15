"use client"; // This is a client component

import { createContext, useContext, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/lib/supabaseClient'; // Ensure this path is correct

type SupabaseContextType = {
  supabase: SupabaseClient | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  // We check if supabase is null in the context, which it shouldn't be if initialized correctly.
  if (context.supabase === null) {
    throw new Error('Supabase client is null. Check SupabaseProvider initialization.');
  }
  return context.supabase;
};
