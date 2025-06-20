"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { SupabaseClient } from '@supabase/supabase-js';
import QrScanner from '@/components/QrScanner';
import toast from 'react-hot-toast';
import { useUserStore } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react'; // Using Loader2 for a slightly different spinner

export default function HomePage() {
  const router = useRouter();
  const supabase = useSupabase() as SupabaseClient;
  const getEnsuredUserId = useUserStore(state => state.getEnsuredUserId);
  const userId = useUserStore(state => state.userId);
  const [isLoading, setIsLoading] = useState(false); // For chat joining/creation process

  useEffect(() => {
    if (!userId) {
      getEnsuredUserId();
    }
  }, [userId, getEnsuredUserId]);

  const handleChatCodeDetected = async (code: string) => {
    const currentUserId = useUserStore.getState().getEnsuredUserId();
    if (!supabase || !currentUserId) {
      toast.error("Chyba: Klient Supabase nebo ID uživatele není k dispozici.");
      return;
    }
    if (!code.trim()) {
      toast.error("Kód chatu nemůže být prázdný.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Hledání nebo vytváření chatu...");

    try {
      let { data: existingChat, error: findError } = await supabase
        .from('chats')
        .select('id, chat_code, expires_at')
        .eq('chat_code', code.toUpperCase())
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingChat) {
        if (new Date(existingChat.expires_at) < new Date()) {
          toast.error("Tento chat vypršel a již není dostupný.", { id: toastId });
          setIsLoading(false);
          return;
        }
        toast.success(`Připojování k chatu: ${existingChat.chat_code}`, { id: toastId });
        router.push(`/chat/${existingChat.id}`);
      } else {
        const newChatCode = code.toUpperCase();
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({ chat_code: newChatCode, expires_at: expires_at })
          .select('id, chat_code')
          .single();

        if (createError) {
          if (createError.code === '23505') { // Unique constraint violation
            // Attempt to fetch this chat again, could be a race condition
            const { data: raceChat, error: raceError } = await supabase
              .from('chats')
              .select('id, chat_code, expires_at')
              .eq('chat_code', newChatCode)
              .single();

            if (raceError && raceError.code !== 'PGRST116') throw raceError;

            if (raceChat) {
               if (new Date(raceChat.expires_at) < new Date()) {
                 toast.error("Tento chat vypršel a již není dostupný.", { id: toastId });
                 setIsLoading(false); return;
               }
               toast.success(`Připojování k existujícímu chatu: ${raceChat.chat_code}`, { id: toastId });
               router.push(`/chat/${raceChat.id}`);
               return; // Important: exit after handling race condition successfully
            } else {
              // If still not found after unique violation, then it's a genuine problem or a very quick expiration
              toast.error(`Chat s kódem ${newChatCode} nelze vytvořit, možná již existuje a vypršel, nebo zkuste jiný kód.`, { id: toastId });
              setIsLoading(false);
              return;
            }
          }
          throw createError; // Re-throw other creation errors
        }

        if (newChat) {
          toast.success(`Nový chat "${newChat.chat_code}" vytvořen!`, { id: toastId });
          router.push(`/chat/${newChat.id}`);
        } else {
          // This case should ideally be caught by createError handling
          throw new Error("Nepodařilo se vytvořit nový chat.");
        }
      }
    } catch (error: any) {
      // Ensure toastId is dismissed only if it hasn't been updated by a success/error toast
      // Most specific errors above already handle toastId. This is a fallback.
      if (toastId) toast.dismiss(toastId);
      console.error("Chyba při zpracování kódu chatu:", error);
      toast.error(`Chyba: ${error.message || "Nelze se připojit k chatu."}`);
    } finally {
      // Only set isLoading to false if not navigating or if an error occurred before navigation
      // If navigation is successful, the component will unmount.
      // To prevent brief UI flicker if navigation is slightly delayed:
      // Check if we are still on the same page.
      // However, router.push is async, so this check is not straightforward.
      // For simplicity, we set it here. If navigation occurs, unmount handles it.
      setIsLoading(false);
    }
  };

  if (!userId && typeof window !== 'undefined') {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-text-secondary">Načítání uživatelského sezení...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center py-8 md:py-12" // Added vertical padding
    >
      <div className="bg-surface p-6 sm:p-8 md:p-10 rounded-xl shadow-xl max-w-lg w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
          Vítejte v LetsChat!
        </h1>
        <p className="text-md sm:text-lg text-text-secondary mb-2">
          Chcete věnovat Let‘s Chatku nebo někdo ji věnoval vám?
        </p>
        <p className="text-md sm:text-lg text-text-secondary mb-6">
          Držíte ji v ruce? Zadejte její kód a začněte chatovat.
        </p>

        <div className="mb-6">
          <QrScanner onCodeDetected={handleChatCodeDetected} autoStart={false} />
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Pro opakovaný vstup do chatu použijte stejný kód LetsChatky.
          Chaty automaticky vyprší po 24 hodinách.
        </p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
          <div className="bg-surface p-6 rounded-lg shadow-2xl flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-text-primary">Zpracovávání...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
