"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Plus, Printer, Star } from 'lucide-react';
import { User } from '@supabase/supabase-js';

// Helper to generate a random code
const generateChatCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


export default function HomePage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [chatCode, setChatCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleJoinChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatCode.trim()) {
      toast.error("Zadejte kód chatu.");
      return;
    }
    setIsJoining(true);
    const toastId = toast.loading("Hledání chatu...");

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Pro připojení k chatu se musíte přihlásit.", { id: toastId });
            router.push('/auth/login');
            return;
        }

        const { data: existingChat, error } = await supabase
            .from('chats')
            .select('id, chat_code, expires_at')
            .eq('chat_code', chatCode.toUpperCase())
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (existingChat) {
            if (new Date(existingChat.expires_at) < new Date()) {
                toast.error("Tento chat vypršel.", { id: toastId });
                return;
            }
            toast.success(`Připojování k chatu: ${existingChat.chat_code}`, { id: toastId });
            router.push(`/chat/${existingChat.id}`);
        } else {
            toast.error("Chat s tímto kódem nebyl nalezen.", { id: toastId });
        }
    } catch (error: any) {
        toast.error(`Chyba: ${error.message}`, { id: toastId });
    } finally {
        setIsJoining(false);
    }
  };

  const handleCreateChat = async () => {
    setIsCreating(true);
    const toastId = toast.loading("Vytváření nového chatu...");

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Pro vytvoření chatu se musíte přihlásit.", { id: toastId });
            router.push('/auth/login');
            return;
        }

        const newChatCode = generateChatCode();
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { data: newChat, error } = await supabase
            .from('chats')
            .insert({
                chat_code: newChatCode,
                expires_at: expires_at,
                created_by: user.id
            })
            .select('id, chat_code')
            .single();

        if (error) throw error;

        if (newChat) {
            toast.success(`Nový chat "${newChat.chat_code}" vytvořen!`, { id: toastId });
            router.push(`/chat/${newChat.id}`);
        } else {
            throw new Error("Nepodařilo se vytvořit chat.");
        }

    } catch (error: any) {
        toast.error(`Chyba: ${error.message}`, { id: toastId });
    } finally {
        setIsCreating(false);
    }
  };


  const Card = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <motion.div
        className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-3 bg-indigo-100 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </motion.div>
  );

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center">
        <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
        >
          Vítejte v Let&apos;s Chat
        </motion.h1>
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-gray-600"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis porttitor metus at tempus. Quisque dictum sem tellus.
        </motion.p>
      </section>

      {/* Main Action Sections */}
      <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Chci LetsChatku */}
        <div className="bg-indigo-600 text-white p-8 rounded-lg shadow-xl flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-bold mb-3">Chci Let&apos;s Chatku</h2>
            <p className="mb-4">Vytvořte si novou soukromou chatovací místnost.</p>
            <button
                onClick={handleCreateChat}
                disabled={isCreating}
                className="bg-yellow-400 text-indigo-800 font-bold py-3 px-6 rounded-full hover:bg-yellow-300 transition-colors disabled:bg-yellow-200 flex items-center"
            >
                {isCreating ? <Loader2 className="animate-spin mr-2" /> : null}
                {isCreating ? 'Vytváření...' : "Vytvořit nový chat"}
            </button>
        </div>

        {/* Uz mam LetsChatku */}
        <div className="bg-gray-100 p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Už mám Let&apos;s Chatku</h2>
            <p className="mb-4 text-gray-600">Zadejte kód a vstupte do existujícího chatu.</p>
            <form onSubmit={handleJoinChat} className="flex items-center">
                <input
                    type="text"
                    placeholder="Zadejte platný kód"
                    value={chatCode}
                    onChange={(e) => setChatCode(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" disabled={isJoining} className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center w-12 h-10">
                    {isJoining ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                </button>
            </form>
        </div>
      </section>

      {/* Additional Options */}
      <section className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card icon={<Printer className="w-8 h-8 text-indigo-600" />} title="Let's Chatku si vytisknu sám">
                <p>Popis pro tisk.</p>
            </Card>
            <Card icon={<Star className="w-8 h-8 text-indigo-600" />} title="Chci si objednat profi Let's Chatku">
                <p>Popis pro profi objednávku.</p>
            </Card>
            <Card icon={<Plus className="w-8 h-8 text-indigo-600" />} title="Chci pouze kód pro seznámení">
                <p>Popis pro kód.</p>
            </Card>
          </div>
      </section>

      {/* What is LetsChat Section */}
      <section id="what-is-letschat" className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Co je to Let&apos;s Chatka a k čemu slouží?</h2>
        <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
      </section>
    </div>
  );
}
