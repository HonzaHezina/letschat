"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User } from '@supabase/supabase-js';
import { Loader2, MessageSquare, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Chat {
  id: string;
  chat_code: string;
  expires_at: string;
}

export default function ChatsPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async (currentUser: User) => {
    if (!supabase) return;
    try {
      // For now, we fetch chats created by the user.
      // A more complex app would have a participants table.
      const { data, error } = await supabase
        .from('chats')
        .select('id, chat_code, expires_at')
        .eq('created_by', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChats(data || []);
    } catch (error: any) {
      toast.error(`Chyba při načítání chatů: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            fetchChats(user);
        } else {
            router.push('/auth/login');
        }
    };
    checkUser();
  }, [supabase, router, fetchChats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Moje chaty</h1>
        <Link href="/" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <PlusCircle className="w-5 h-5 mr-2" />
          Vytvořit/Připojit se
        </Link>
      </div>

      {chats.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Zatím žádné chaty</h2>
          <p className="mt-2 text-gray-500">Vytvořte si nový chat nebo se k nějakému připojte na hlavní stránce.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <Link href={`/chat/${chat.id}`} key={chat.id} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-indigo-700">{chat.chat_code}</h2>
                  <p className="text-sm text-gray-500">
                    Vyprší za {formatDistanceToNow(new Date(chat.expires_at), { addSuffix: true, locale: cs })}
                  </p>
                </div>
                <span className="text-indigo-600 hover:text-indigo-800">Vstoupit do chatu &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
