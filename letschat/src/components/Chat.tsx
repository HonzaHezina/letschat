"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Send, Loader2, AlertTriangle } from 'lucide-react'; // Added Loader2, AlertTriangle
import Message, { MessageProps as AppMessageProps } from './Message';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion } from 'framer-motion';

interface SupabaseMessage {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface ChatProps {
  chatId: string;
  currentUserId: string;
  chatCode?: string;
}

const Chat: React.FC<ChatProps> = ({ chatId, currentUserId, chatCode }) => {
  const supabase = useSupabase() as SupabaseClient;
  const [messages, setMessages] = useState<AppMessageProps[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const mapSupabaseMessageToAppMessage = useCallback((msg: SupabaseMessage): AppMessageProps => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.user_id,
    currentUserId: currentUserId,
    timestamp: new Date(msg.created_at),
  }), [currentUserId]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!supabase || !chatId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data.map(mapSupabaseMessageToAppMessage));
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError("Nepodařilo se načíst zprávy. Zkuste obnovit stránku.");
      toast.error("Nepodařilo se načíst zprávy.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, chatId, mapSupabaseMessageToAppMessage]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if(messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!supabase || !chatId) return;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on<SupabaseMessage>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const newMessagePayload = payload.new as SupabaseMessage;
          setMessages((prevMessages) => {
            if (prevMessages.find(msg => msg.id === newMessagePayload.id)) {
              return prevMessages;
            }
            return [...prevMessages, mapSupabaseMessageToAppMessage(newMessagePayload)];
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to chat ${chatId}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Subscription error for chat ${chatId}:`, err);
          setError("Chyba připojení k chatu v reálném čase. Zprávy se nemusí aktualizovat.");
          toast.error("Chyba připojení k chatu. Zkuste obnovit stránku.");
        }
      });
    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, chatId, mapSupabaseMessageToAppMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !chatId) return;
    const messageToSend = { chat_id: chatId, user_id: currentUserId, content: newMessage.trim() };
    setNewMessage('');
    try {
      const { error: insertError } = await supabase.from('messages').insert(messageToSend);
      if (insertError) throw insertError;
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error("Nepodařilo se odeslat zprávu.");
      setNewMessage(messageToSend.content);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-text-secondary">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        Načítání zpráv...
      </div>
    );
  }

  if (error && messages.length === 0) { // Only show full page error if no messages are loaded
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center p-4">
        <AlertTriangle size={48} className="text-danger mb-4" />
        <h2 className="text-xl font-semibold text-danger mb-2">Chyba při načítání chatu</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <Button onClick={fetchMessages} variant="outline">Zkusit znovu</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] max-h-[700px] bg-white rounded-xl shadow-2xl border border-border-color overflow-hidden">
      {chatCode && (
        <div className="p-3.5 sm:p-4 border-b border-border-color bg-surface rounded-t-xl">
          <h2 className="text-lg font-semibold text-primary text-center truncate">
            Chat Kód: <span className="font-bold">{chatCode}</span>
          </h2>
        </div>
      )}
      <div className="flex-grow overflow-y-auto p-4 space-y-1 bg-background"> {/* Changed bg to background */}
        {messages.length === 0 && !isLoading && ( // Ensure not loading before showing "no messages"
          <div className="text-center text-text-secondary pt-10">
            Zatím žádné zprávy. Začněte konverzaci!
          </div>
        )}
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
          >
            <Message {...msg} />
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && messages.length > 0 && ( // Display non-critical error here if messages are present
        <div className="p-2 bg-red-50 border-t border-red-200 text-danger text-xs text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-border-color bg-surface rounded-b-xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napište zprávu..."
            className="flex-grow" // Input itself will grow
            aria-label="Nová zpráva"
            wrapperClassName="flex-grow" // Ensure input wrapper takes up space
          />
          <Button type="submit" variant="primary" aria-label="Odeslat zprávu" disabled={!newMessage.trim()} size="md"> {/* Ensure button size is appropriate */}
            <Send size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
