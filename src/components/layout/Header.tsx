"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase?.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    }) ?? {};

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Let&apos;sChat
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/#what-is-letschat" className="text-gray-600 hover:text-indigo-600">
            Co je Let&apos;s Chat
          </Link>
          {loading ? (
            <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
          ) : user ? (
            <>
              <Link href="/profile" className="text-gray-600 hover:text-indigo-600">
                Profil
              </Link>
              <Link href="/chats" className="text-gray-600 hover:text-indigo-600">
                Moje Chaty
              </Link>
              <button onClick={handleLogout} className="text-gray-600 hover:text-indigo-600">
                Odhlásit
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-indigo-600">
                Přihlásit
              </Link>
              <Link href="/auth/register" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                Registrace
              </Link>
            </>
          )}
        </div>
        {/* Mobile menu can be added here later */}
      </nav>
    </header>
  );
}
