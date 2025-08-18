"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import toast from 'react-hot-toast';

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
      toast.error("Zadejte platný kód.");
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

  // The JSX structure is now based on the provided HTML
  return (
    <>
      <div className="frame">
        <div className="box2">
          <div className="item" style={{ backgroundImage: "url('/media/promo/chat-woman.webp')" }}>
            <div className="bottom">
              <img src="/media/box2/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Chci Let&apos;s&nbsp;Chatku</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis porttitor metus at tempus. Quisque dictum sem tellus, eu hendrerit libero malesuada suscipit.</p>
                <p>In sit amet neque.</p>
              </div>
              <a href="#chci-letschatku" className="arrow scroll" title="Chci Let's Chatku"></a>
            </div>
          </div>

          <div className="item" style={{ backgroundImage: "url('/media/promo/chat-man.webp')" }}>
            <div className="bottom">
              <img src="/media/box2/wave-yellow.svg" className="wave" alt="Let'sChat" />
              <div className="content yellow">
                <h2>Už mám Let&apos;s&nbsp;Chatku</h2>
                <p>Integer a magna sed nisl consectetur ullamcorper semper pretium lacus vitae euismod vel mi.</p>
                <div className="container input">
                  <form id="form-code" onSubmit={handleJoinChat} className="form">
                    <input name="code" type="text" value={chatCode} onChange={(e) => setChatCode(e.target.value)} maxLength={16} placeholder="Zadej kód pro vstup" />
                    <input type="submit" value="Vstoupit" disabled={isJoining} />
                  </form>
                  {/* Error display logic can be added here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="frame">
        <div id="chci-letschatku" className="box4">
          <a href="#" className="item" onClick={(e) => { e.preventDefault(); handleCreateChat(); }} style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Let&apos;s&nbsp;Chatku si&nbsp;vytisknu sám</h2>
              </div>
              <div className="plus"></div>
            </div>
          </a>
          <a href="#" className="item" onClick={(e) => { e.preventDefault(); handleCreateChat(); }} style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Chci si&nbsp;objednat profi Let&apos;s&nbsp;Chatku</h2>
              </div>
              <div className="plus"></div>
            </div>
          </a>
          <a href="#" className="item" onClick={(e) => { e.preventDefault(); handleCreateChat(); }} style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Chci pouze kód pro seznámení</h2>
              </div>
              <div className="plus"></div>
            </div>
          </a>
          <a href="#" className="item disabled" style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <div className="disabled">Připravujeme</div>
                <h2>Chci udělat dojem s&nbsp;Let&apos;s&nbsp;Chatku</h2>
              </div>
              <div className="plus"></div>
            </div>
          </a>
        </div>
      </div>

      <div className="frame">
        <div className="promo">
          <h2>Co je to Let&apos;s&nbsp;Chatka a&nbsp;k&nbsp;čemu slouží?</h2>
          <a href="#" className="arrow" title="Co je to Let's Chatka a k čemu slouží?"></a>
          <img src="/media/promo/cards.webp" className="cards" alt="Co je to Let's Chatka a k čemu slouží" />
        </div>
      </div>
    </>
  );
}
