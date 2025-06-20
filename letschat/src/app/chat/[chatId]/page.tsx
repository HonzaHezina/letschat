"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { SupabaseClient } from '@supabase/supabase-js';
import Chat from '@/components/Chat'; // Your Chat component
import toast from 'react-hot-toast';
import { ArrowLeft, XCircle } from 'lucide-react'; // Added XCircle
import Button from '@/components/ui/Button'; // Your Button component
import { useUserStore } from '@/stores/userStore'; // Import the store
import { motion } from 'framer-motion'; // Add framer-motion

// Remove or comment out the old getUserIdFromStorage function
// const getUserIdFromStorage = (): string | null => { ... };

interface ChatDetails {
  id: string;
  chat_code: string;
  expires_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useSupabase() as SupabaseClient;

  const chatId = typeof params.chatId === 'string' ? params.chatId : null;
  // const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Remove useState
  const getEnsuredUserId = useUserStore(state => state.getEnsuredUserId);
  const currentUserId = useUserStore(state => state.userId); // Get userId

  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to load user ID and then chat details
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure userId is initialized and available.
    if (!currentUserId) {
      const id = getEnsuredUserId();
      if (!id) {
        // This case should ideally not happen if getEnsuredUserId works correctly
        // and store initialization logic is sound.
        toast.error("Chybí ID uživatele. Vraťte se na domovskou stránku.");
        router.replace('/');
        return;
      }
      // The component will re-render once currentUserId is populated from the store.
    }
  }, [currentUserId, getEnsuredUserId, router]);

  useEffect(() => {
    // This effect now depends on currentUserId being populated from the store.
    // It will run once currentUserId is available.
    if (!currentUserId && typeof window !== 'undefined') {
      // If still no userId after the first effect (which should set it),
      // it implies an issue or delay. We show loading or an error.
      // The initial isLoading state is true, so this might not be strictly needed here,
      // as the main loading block will cover it.
      setIsLoading(true); // Ensure loading is true if currentUserId isn't ready
      return;
    }

    if (!chatId || !supabase) {
      if (!chatId) {
         setError("Chybí ID chatu.");
      } else {
         setError("Supabase klient není k dispozici."); // Should not happen if context is setup
      }
      setIsLoading(false);
      return;
    }

    // At this point, currentUserId should be available. If not, it's an issue.
    if (!currentUserId) {
        setError("ID uživatele není k dispozici. Zkuste obnovit stránku.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true); // Explicitly set loading for chat details fetch
    setError(null);

    const fetchChatDetails = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('chats')
          .select('id, chat_code, expires_at')
          .eq('id', chatId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') { // Not found
            throw new Error("Chat nebyl nalezen.");
          }
          throw fetchError; // Other Supabase errors
        }

        if (!data) {
          throw new Error("Chat nebyl nalezen.");
        }

        if (new Date(data.expires_at) < new Date()) {
          throw new Error("Tento chat vypršel.");
        }

        setChatDetails(data);

      } catch (err: any) {
        console.error("Chyba při načítání detailů chatu:", err);
        setError(err.message || "Nepodařilo se načíst chat.");
        toast.error(err.message || "Nepodařilo se načíst chat.");
        // Optional: redirect after a delay if chat is invalid
        // setTimeout(() => router.replace('/'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatDetails();

  }, [chatId, supabase, router, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Načítání chatu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <XCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-500 mb-2">Chyba</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <Button onClick={() => router.push('/')} leftIcon={<ArrowLeft size={18}/>}>
          Zpět na domovskou stránku
        </Button>
      </div>
    );
  }

  if (!chatDetails || !currentUserId) {
    // This case should ideally be caught by isLoading or error states,
    // but as a fallback:
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <p>Něco se pokazilo. Zkuste to prosím znovu.</p>
        <Button onClick={() => router.push('/')} leftIcon={<ArrowLeft size={18}/>} className="mt-4">
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
      className="container mx-auto p-0 md:p-4 h-full"
    >
      {/* Optionally, add a back button or more chat context here if needed */}
      {/* <Button onClick={() => router.push('/')} variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} className="mb-2">
        Nové skenování / Kód
      </Button> */}
      <Chat
        chatId={chatDetails.id}
        currentUserId={currentUserId}
        chatCode={chatDetails.chat_code}
      />
    </motion.div>
  );
}
