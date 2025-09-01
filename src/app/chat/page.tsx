"use client";

import React, { useEffect, useState } from 'react';
import ChatListSidebar from '@/components/chat/ChatListSidebar';
import ChatMessages from '@/components/chat/ChatMessages';
import { useSupabase } from '@/contexts/SupabaseProvider';
import TABLES from '@/lib/dbTables';

interface ChatPageProps {
  /* props removed — component fetchuje data přímo */
}

const ChatPage: React.FC<ChatPageProps> = () => {
  const [chats, setChats] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<any>>([]);

  const supabase = useSupabase();

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(TABLES.CHATS)
          .select('id, name, status, image, created_at')
          .order('created_at', { ascending: false });
        if (error) {
          console.error("Supabase fetch chats error:", error);
          setError(error.message);
          setChats([]);
        } else {
          setChats(data || []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Chyba při načítání chatů.');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const fetchMessages = async () => {
      try {
        // Upravit tabulku podle vaší schémy (room_rows / messages)
        const { data, error } = await supabase
          .from(TABLES.ROOM_ROWS)
          .select('*')
          .eq('room_id', selectedChatId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Supabase fetch messages error:", error);
          if (isMounted) setMessages([]);
        } else {
          if (isMounted) setMessages(data || []);
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) setMessages([]);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`room:${selectedChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLES.ROOM_ROWS, filter: `room_id=eq.${selectedChatId}` }, (payload: any) => {
        const newRow = payload.new;
        setMessages(prev => [...prev, newRow]);
      })
      .subscribe();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedChatId]);

  return (
    <div className="page leftright">
      <div className="frame">
        <div className="chat">
          <div className="left">
            <ChatListSidebar chats={chats} onSelect={(id) => setSelectedChatId(id)} />
          </div>

          <div className="content">
            {loading ? (
              <div className="p-6 text-center">Načítání...</div>
            ) : error ? (
              <div className="p-6 text-center text-danger">Chyba: {error}</div>
            ) : (
              <ChatMessages messages={messages} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;