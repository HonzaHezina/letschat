"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { User, SupabaseClient } from '@supabase/supabase-js';
import Chat from '@/components/Chat';
import toast from 'react-hot-toast';
import { ArrowLeft, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface ChatDetails {
  id: string;
  chat_code: string;
  expires_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useSupabase();

  const chatId = typeof params.chatId === 'string' ? params.chatId : null;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase || !chatId) {
        setError(chatId ? "Supabase client not available." : "Chat ID is missing.");
        setIsLoading(false);
        return;
      }

      // 1. Check for authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Pro přístup k chatu se musíte přihlásit.");
        router.replace('/auth/login');
        return;
      }
      setCurrentUser(user);

      // 2. Fetch chat details
      try {
        const { data, error: fetchError } = await supabase
          .from('chats')
          .select('id, chat_code, expires_at')
          .eq('id', chatId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') throw new Error("Chat nebyl nalezen.");
          throw fetchError;
        }

        if (!data) throw new Error("Chat nebyl nalezen.");

        if (new Date(data.expires_at) < new Date()) {
          throw new Error("Tento chat vypršel.");
        }

        setChatDetails(data);
      } catch (err: any) {
        console.error("Error loading chat details:", err);
        setError(err.message || "Failed to load chat.");
        toast.error(err.message || "Failed to load chat.");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [chatId, supabase, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
        Načítání chatu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4 text-center">
        <XCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-500 mb-2">Chyba</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft size={18} className="mr-2"/>
          Zpět na domovskou stránku
        </Button>
      </div>
    );
  }

  if (!chatDetails || !currentUser) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Něco se pokazilo. Zkuste to prosím znovu.</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          <ArrowLeft size={18} className="mr-2"/>
          Zpět na domovskou stránku
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Chat
        chatId={chatDetails.id}
        currentUserId={currentUser.id}
        chatCode={chatDetails.chat_code}
      />
    </motion.div>
  );
}
