"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import Message, { MessageProps as AppMessageProps } from './Message'; // Renamed to avoid conflict
import Input from './ui/Input';
import Button from './ui/Button';

// Define the structure of a message as it comes from Supabase
interface SupabaseMessage {
  id: string; // Assuming UUID from Supabase
  chat_id: string;
  user_id: string; // Anonymous user ID
  content: string;
  created_at: string; // ISO timestamp
}

interface ChatProps {
  chatId: string; // The ID of the current chat room
  currentUserId: string; // Anonymous ID of the current user
  chatCode?: string; // Optional: for display purposes
}

const Chat: React.FC<ChatProps> = ({ chatId, currentUserId, chatCode }) => {
  const supabase = useSupabase() as SupabaseClient; // Type assertion for stricter type checking
  const [messages, setMessages] = useState<AppMessageProps[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mapper function
  const mapSupabaseMessageToAppMessage = (msg: SupabaseMessage): AppMessageProps => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.user_id,
    currentUserId: currentUserId,
    timestamp: new Date(msg.created_at),
    // senderDisplayName: `User ${msg.user_id.substring(0,6)}` // Or more sophisticated logic
  });

  // Fetch initial messages
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
      setError("Nepodařilo se načíst zprávy.");
      toast.error("Nepodařilo se načíst zprávy.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, chatId, currentUserId]); // Added currentUserId to dependency array

  useEffect(() => {
    fetchMessages();
    scrollToBottom();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Set up Supabase real-time subscription
  useEffect(() => {
    if (!supabase || !chatId) return;

    // Clean up previous channel if chatId changes
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
          // Add message only if it's not already present (e.g. to avoid duplicates from sender)
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
          setError("Chyba připojení k chatu v reálném čase.");
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
  }, [supabase, chatId, currentUserId]); // Added currentUserId to dependency array

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !chatId) return;

    // const tempMessageId = `temp-${Date.now()}`; // Temporary ID for optimistic update

    // Optimistic update (optional, but good for UX)
    // const optimisticMessage: AppMessageProps = {
    //   id: tempMessageId,
    //   content: newMessage,
    //   senderId: currentUserId,
    //   currentUserId: currentUserId,
    //   timestamp: new Date(),
    // };
    // setMessages(prev => [...prev, optimisticMessage]);

    const messageToSend = {
      chat_id: chatId,
      user_id: currentUserId,
      content: newMessage.trim(),
    };

    setNewMessage(''); // Clear input immediately

    try {
      const { error: insertError } = await supabase.from('messages').insert(messageToSend);
      if (insertError) {
        throw insertError;
      }
      // If not using optimistic updates or if you need to confirm,
      // the real-time subscription should pick up the new message.
      // If there was an optimistic update, you might want to remove it here
      // and wait for the subscription to add the confirmed message,
      // or update the optimistic message with the real ID from DB.
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error("Nepodařilo se odeslat zprávu.");
      // Rollback optimistic update if it was used
      // setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setNewMessage(messageToSend.content); // Put message back in input
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Načítání zpráv...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] border rounded-lg shadow-md bg-white">
      {chatCode && (
        <div className="p-3 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-text-primary text-center">
            Chat Kód: <span className="text-primary font-bold">{chatCode}</span>
          </h2>
        </div>
      )}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 pt-10">
            Zatím žádné zprávy. Začněte konverzaci!
          </div>
        )}
        {messages.map((msg) => (
          <Message key={msg.id} {...msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napište zprávu..."
            className="flex-grow"
            aria-label="Nová zpráva"
          />
          <Button type="submit" variant="primary" aria-label="Odeslat zprávu" disabled={!newMessage.trim()}>
            <Send size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
