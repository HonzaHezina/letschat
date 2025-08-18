"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Chat {
  id: string;
  chat_code: string;
  created_at: string;
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
      const { data, error } = await supabase
        .from('chats')
        .select('id, chat_code, created_at')
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
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page full">
        <div className="wave"></div>
        <div className="content">
            <h1>Moje chaty</h1>
            <div className="chats">
                {chats.length === 0 ? (
                    <p>Zatím nemáte žádné aktivní chaty. Nový můžete vytvořit na hlavní stránce.</p>
                ) : (
                    chats.map(chat => (
                        <div key={chat.id} className="item">
                            <div className="image">
                                <div className="overlay">
                                    <div className="content cover" style={{backgroundImage: "url('/media/custom/chat-icon.webp')"}}></div>
                                </div>
                            </div>
                            <div className="content">
                                <h3>{chat.chat_code}</h3>
                                <div className="created">
                                    Vytvořeno: {format(new Date(chat.created_at), 'd. M. yyyy', { locale: cs })}
                                </div>
                                <Link href={`/chat/${chat.id}`} className="enter">Vstoupit do chatu</Link>
                            </div>
                            <ul className="action">
                                {/* Action icons can be added here */}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
}
