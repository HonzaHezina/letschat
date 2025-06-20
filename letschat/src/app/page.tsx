"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation'; // Keep this if it was there, or ensure it is
import { SupabaseClient } from '@supabase/supabase-js'; // Keep this
import { useSupabase } from '@/contexts/SupabaseProvider'; // Keep this
import QrScanner from '@/components/QrScanner';
import toast from 'react-hot-toast';
import { useUserStore } from '@/stores/userStore'; // Import the store
import { motion } from 'framer-motion'; // Add framer-motion

// Remove or comment out the old getOrCreateUserId function
// const getOrCreateUserId = (): string => { ... };

export default function HomePage() {
  const router = useRouter();
  const supabase = useSupabase() as SupabaseClient;
  // const [userId, setUserId] = useState<string | null>(null); // Remove useState for userId
  const getEnsuredUserId = useUserStore(state => state.getEnsuredUserId);
  // userId will be null initially if not hydrated yet, then update upon hydration or getEnsuredUserId call.
  const userId = useUserStore(state => state.userId);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ensure userId is initialized and available in the store.
    // This call will trigger an update to the userId state if it was null.
    if (!userId) {
      getEnsuredUserId();
    }
  }, [userId, getEnsuredUserId]);

  const handleChatCodeDetected = async (code: string) => {
    const currentUserId = useUserStore.getState().getEnsuredUserId(); // Get latest ID
    if (!supabase || !currentUserId) { // Check currentUserId directly
      toast.error("Chyba: Klient Supabase nebo ID uživatele není k dispozici.");
      return;
    }
    if (!code.trim()) {
        toast.error("Kód chatu nemůže být prázdný.");
        return;
    }

    // Ensure userId is available before proceeding with Supabase calls
    // This is a double check, as currentUserId above should be set.
    if (!currentUserId) {
        toast.error("ID uživatele se stále inicializuje. Zkuste to prosím znovu.");
        return;
    }

    setIsLoading(true);
    toast.loading("Hledání nebo vytváření chatu...");

    try {
      // 1. Try to find an existing chat with this code
      // Use currentUserId obtained from the store
      let { data: existingChat, error: findError } = await supabase
        .from('chats')
        .select('id, chat_code, expires_at')
        .eq('chat_code', code.toUpperCase()) // Ensure code is consistently cased
        .single();

      if (findError && findError.code !== 'PGRST116') { // PGRST116: "single row not found"
        throw findError;
      }

      if (existingChat) {
        // Check if chat is expired
        if (new Date(existingChat.expires_at) < new Date()) {
          toast.dismiss();
          toast.error("Tento chat vypršel a již není dostupný.");
          // Optionally, delete the expired chat or mark it as inactive
          // await supabase.from('chats').delete().eq('id', existingChat.id);
          setIsLoading(false);
          return;
        }
        toast.dismiss();
        toast.success(`Připojování k chatu: ${existingChat.chat_code}`);
        router.push(`/chat/${existingChat.id}`);
      } else {
        // 2. If not found, create a new chat
        const newChatCode = code.toUpperCase(); // Use the user-provided code if it's for a new chat
        // Or generate a new one if you don't want users to create arbitrary codes:
        // const newChatCode = uuidv4().substring(0, 8).toUpperCase();

        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({ chat_code: newChatCode, expires_at: expires_at })
          .select('id, chat_code')
          .single();

        if (createError) {
          if (createError.code === '23505') { // Unique violation for chat_code
             toast.dismiss();
             toast.error(`Chat s kódem ${newChatCode} již existuje nebo došlo ke konfliktu. Zkuste jiný kód.`);
             // Attempt to fetch this chat again as it might have been created by another request simultaneously
             handleChatCodeDetected(newChatCode); // Retry with the same code
             return;
          }
          throw createError;
        }

        if (newChat) {
          toast.dismiss();
          toast.success(`Nový chat "${newChat.chat_code}" vytvořen!`);
          router.push(`/chat/${newChat.id}`);
        } else {
          throw new Error("Nepodařilo se vytvořit nový chat.");
        }
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("Chyba při zpracování kódu chatu:", error);
      toast.error(`Chyba: ${error.message || "Nelze se připojit k chatu."}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId && typeof window !== 'undefined') { // Check for userId, but allow SSR pass-through
    // The useEffect above will trigger getEnsuredUserId, which then updates userId.
    // This state might show briefly.
    return <div className="flex justify-center items-center min-h-screen">Načítání uživatele...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 flex flex-col items-center"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Vítejte v LetsChat!</h1>
        <p className="text-lg text-text-secondary">
          Naskenujte QR kód nebo zadejte kód pro připojení k anonymnímu chatu.
        </p>
        <p className="text-sm text-gray-500 mt-1">Chaty automaticky vyprší po 24 hodinách.</p>
      </div>

      <QrScanner onCodeDetected={handleChatCodeDetected} autoStart={false} />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Zpracovávání...
          </div>
        </div>
      )}
    </motion.div>
  );
}
