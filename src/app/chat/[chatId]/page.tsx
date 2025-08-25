"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import Chat from '@/components/Chat';
import toast from 'react-hot-toast';
import { ArrowLeft, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface ChatDetails {
  id: string;
  chat_code: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useSupabase();

  const chatId = typeof params.chatId === 'string' ? params.chatId : null;
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!chatId) {
        setError("Chybí ID chatu.");
        setIsLoading(false);
        return;
      }

      try {
        // We only need to fetch the room's public code to display it.
        // The actual participation logic is handled by the Chat component and anonymous ID.
        const { data, error: fetchError } = await supabase
          .from('rooms')
          .select('id, name') // Assuming the code is stored in the 'name' field for simplicity
          .eq('id', chatId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Místnost nenalezena.");

        setChatDetails({ id: data.id, chat_code: data.name || `Místnost #${data.id}` });

      } catch (err: any) {
        console.error("Chyba při načítání detailů chatu:", err);
        setError(err.message || "Nepodařilo se načíst chat.");
        toast.error(err.message || "Nepodařilo se načíst chat.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatDetails();
  }, [chatId, supabase, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center">
        <XCircle size={48} className="text-danger mb-4" />
        <h2 className="text-xl font-semibold text-danger mb-2">Chyba</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft size={18} className="mr-2"/>
          Zpět na domovskou stránku
        </Button>
      </div>
    );
  }

  if (!chatDetails) return null; // Should be covered by error/loading states

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Chat
        chatId={chatDetails.id}
        chatCode={chatDetails.chat_code}
      />
    </motion.div>
  );
}
