"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseSafe } from '@/contexts/SupabaseProvider';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Send, Loader2, AlertTriangle } from 'lucide-react'; // Added Loader2, AlertTriangle
import Message, { MessageProps as AppMessageProps } from './Message';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion } from 'framer-motion';

interface SupabaseMessage {
  id: string;
  room_id: string;
  participant_id: number;
  content: string;
  created_at: string;
}
import Link from 'next/link';
import TABLES from '@/lib/dbTables';
import type { User } from '@supabase/supabase-js';
import { useAnonymousId } from '@/hooks/useAnonymousId';

interface ChatProps {
  chatId: string;
  chatCode?: string;
}

const Chat: React.FC<ChatProps> = ({ chatId, chatCode }) => {
  const supabase = useSupabaseSafe() as SupabaseClient;
  const anonymousUserId = useAnonymousId();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase]);

  if (!supabase) {
    return <div className="flex justify-center items-center h-screen text-lg">Načítám chatovací klient...</div>;
  }
  const currentUserId = user ? user.id : anonymousUserId;
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AppMessageProps[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRlsBanner, setShowRlsBanner] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const fetchOrCreateParticipantId = async () => {
      if (!currentUserId || !chatId) return;
      const lookupField = user ? 'user_id' : 'anonymous_id';
      const { data, error } = await supabase
        .from(TABLES.ROOM_PARTICIPANTS)
        .select('id')
        .eq('room_id', chatId)
        .eq(lookupField, currentUserId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching participant ID:", error);
        setError("Nepodařilo se ověřit vaši účast v této místnosti.");
      } else if (data) {
        setParticipantId(data.id);
      } else {
        // Pokud anonymní, pokus o automatické vytvoření účastníka
        if (!user) {
          // Získat code_id podle chatCode (pokud je k dispozici).
          // Pokud to selže, zkusíme fallback – najít code podle room_id.
          let codeId: number | null = null;
          if (chatCode) {
            const { data: codeRow, error: codeError } = await supabase
              .from(TABLES.CODES)
              .select('id')
              .eq('code', chatCode)
              .maybeSingle();
            if (codeError) console.warn('Error fetching code by code value:', codeError);
            if (codeRow && typeof codeRow.id === 'number') codeId = codeRow.id;
          }

          if (!codeId) {
            // Fallback: najdi code podle room_id (může být uložen v codes.room_id)
            try {
              const { data: byRoom, error: byRoomError } = await supabase
                .from(TABLES.CODES)
                .select('id')
                .eq('room_id', chatId)
                .limit(1)
                .maybeSingle();
              if (byRoomError) console.warn('Error fetching code by room_id fallback:', byRoomError);
              if (byRoom && typeof byRoom.id === 'number') codeId = byRoom.id;
            } catch (e) {
              console.warn('Fallback code fetch threw:', e);
            }
          }

          if (!codeId) {
            console.error('Failed to resolve code_id for chat. chatId:', chatId, 'chatCode:', chatCode);
            setError('Nepodařilo se najít kód místnosti. Kontaktujte administrátora nebo zkuste znovu.');
            setParticipantId(null);
            return;
          }
          try {
            // Call server-side API to create participant with service role (bypasses RLS)
            const resp = await fetch('/api/finalize-join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roomId: chatId, code: chatCode, anonymousId: currentUserId }),
            });
            const json = await resp.json();
            if (!resp.ok) {
              console.error('Server API create participant failed:', resp.status, json);
              if (resp.status === 403 && json?.error && String(json.error).toLowerCase().includes('rls')) {
                const msg = 'Vytvoření účastníka zablokováno pravidly RLS. Pro lokální testování spusťte `supabase/dev_rls_open.sql` nebo nastavte SUPABASE_SERVICE_ROLE_KEY v .env.local.';
                setError(msg);
                toast.error(msg);
              } else {
                setError('Nepodařilo se vytvořit anonymního účastníka přes server. Viz konzole.');
              }
              setParticipantId(null);
            } else if (json.participant) {
              const p = Array.isArray(json.participant) ? json.participant[0] : json.participant;
              if (p && typeof p.id === 'number') {
                setParticipantId(p.id);
              } else {
                console.warn('Unexpected server participant response:', json);
                setError('Nepodařilo se vytvořit anonymního účastníka. Neočekávaná odpověď od serveru.');
                setParticipantId(null);
              }
            } else {
              console.error('Server create participant returned no participant:', json);
              setError('Nepodařilo se vytvořit anonymního účastníka. Viz konzole.');
              setParticipantId(null);
            }
          } catch (err) {
            console.error('Error calling server finalize-join API:', err);
            setError('Nepodařilo se vytvořit anonymního účastníka. Viz konzole.');
            setParticipantId(null);
          }
        } else {
          setParticipantId(null);
        }
      }
    };
    fetchOrCreateParticipantId();
  }, [supabase, chatId, user, currentUserId]);


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const mapSupabaseMessageToAppMessage = useCallback((msg: SupabaseMessage): AppMessageProps => ({
    id: msg.id,
    content: msg.content,
    senderId: String(msg.participant_id), // Convert number to string
    currentUserId: participantId,
    timestamp: new Date(msg.created_at),
  }), [participantId]);

  // Merge incoming messages into existing array without duplicates (by id).
  // mode: 'replace' => replace entire list with incoming (deduped)
  // mode: 'prepend' => add incoming before prev (skip ids already present)
  // mode: 'append' => add incoming after prev (skip ids already present)
  const mergeMessages = useCallback((prev: AppMessageProps[], incoming: AppMessageProps[], mode: 'replace' | 'prepend' | 'append') => {
    if (mode === 'replace') {
      const seen = new Set<string>();
      const out: AppMessageProps[] = [];
      for (const m of incoming) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          out.push(m);
        }
      }
      return out;
    }
    if (mode === 'prepend') {
      const prevIds = new Set(prev.map(p => p.id));
      const toAdd = incoming.filter(m => !prevIds.has(m.id));
      return [...toAdd, ...prev];
    }
    // append
    const existing = new Set(prev.map(p => p.id));
    const toAdd = incoming.filter(m => !existing.has(m.id));
    return [...prev, ...toAdd];
  }, []);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!chatId) return;

    try {
  // Load the latest 10 messages by default
  const resp = await fetch(`/api/room-rows?roomId=${encodeURIComponent(chatId)}&latest=true&limit=10`);
      const json = await resp.json();
      if (!resp.ok) {
        console.error('Server fetchMessages failed:', resp.status, json);
        if (resp.status === 403 && json?.error && String(json.error).toLowerCase().includes('rls')) {
          const msg = 'Přístup k historii je zablokován pravidly RLS. Pro lokální testování spusťte `supabase/dev_rls_open.sql` nebo nastavte SUPABASE_SERVICE_ROLE_KEY v .env.local.';
          setError(msg);
          toast.error(msg);
        } else {
          setError('Nepodařilo se načíst zprávy.');
          toast.error('Nepodařilo se načíst zprávy.');
        }
      } else {
  const mapped = (json.rows || []).map((r: SupabaseMessage) => mapSupabaseMessageToAppMessage(r));
  // dev sanity: ensure fetched rows belong to current roomId
  if (process.env.NODE_ENV !== 'production') {
    const wrongRoom = (json.rows || []).find((r: SupabaseMessage) => String(r.room_id) !== String(chatId));
    if (wrongRoom) console.warn('Fetched rows contain a row for different room_id', wrongRoom.room_id, 'expected', chatId);
  }
  // store messages newest-first so index 0 is newest; replace existing list to avoid duplicates
  setMessages(prev => mergeMessages(prev, mapped.reverse(), 'replace'));
        // Ensure messages container shows newest-first at the top after load
        requestAnimationFrame(() => {
          const el = messagesContainerRef.current;
          if (el) el.scrollTop = 0;
        });
        // fallback small timeout in case content not yet rendered
        setTimeout(() => {
          const el = messagesContainerRef.current;
          if (el) el.scrollTop = 0;
        }, 50);
      }
    } catch (err: any) {
      console.error('Error fetching messages via server API:', err);
      setError('Nepodařilo se načíst zprávy.');
      toast.error('Nepodařilo se načíst zprávy.');
    } finally {
      setIsLoading(false);
    }
  }, [chatId, mapSupabaseMessageToAppMessage]);

  // Load older messages (pagination) - fetch `limit` messages older than given timestamp
  const fetchOlder = useCallback(async (beforeIso: string, limit = 10) => {
    if (!chatId) return [];
    try {
      const resp = await fetch(`/api/room-rows?roomId=${encodeURIComponent(chatId)}&before=${encodeURIComponent(beforeIso)}&limit=${limit}`);
      const json = await resp.json();
      if (!resp.ok) {
        console.error('Failed to fetch older messages', resp.status, json);
        return [];
      }
      return (json.rows || []).map((r: SupabaseMessage) => mapSupabaseMessageToAppMessage(r));
    } catch (e) {
      console.error('Error fetching older messages', e);
      return [];
    }
  }, [chatId, mapSupabaseMessageToAppMessage]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // onScroll handler for messages container to fetch older messages when scrolled to top
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    let isLoadingOlder = false;
    const handleScroll = async () => {
      const target = el as HTMLElement;
      // update isAtTop state
      const atTop = target.scrollTop <= 50;
      setIsAtTop(atTop);

      // load older messages when user scrolls to bottom (because newest is rendered at top)
      const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 5;
      if (nearBottom && !isLoadingOlder && messages.length > 0) {
        isLoadingOlder = true;
        // messages is newest-first, so the oldest message is the last element
        const oldest = messages[messages.length - 1];
        const beforeIso = oldest?.timestamp instanceof Date ? oldest.timestamp.toISOString() : (oldest ? new Date(oldest.timestamp).toISOString() : new Date().toISOString());
        const older = await fetchOlder(beforeIso, 10);
        if (older.length > 0) {
          // append older messages to the end (older = older->newer)
          setMessages((prev) => mergeMessages(prev, older, 'append'));
        } else {
          // helpful dev log when no older messages found
          if (process.env.NODE_ENV !== 'production') console.debug('fetchOlder returned 0 rows for before=', beforeIso, 'roomId=', chatId);
        }
        isLoadingOlder = false;
      }
    };
    el.addEventListener('scroll', handleScroll);
    // Initialize isAtBottom
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [fetchOlder, messages]);

  // Auto-scroll behavior for newest-first layout: scroll to top only when user is at top (or initial load)
  const initialLoadRef = useRef(true);
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (initialLoadRef.current) {
      // initial load - scroll to top to show newest messages
      el.scrollTop = 0;
      initialLoadRef.current = false;
      return;
    }
    if (isAtTop) {
      // smooth scroll to top when user is at top
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [messages, isAtTop]);

  // When switching chats, ensure the messages container shows the newest messages at the top
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    // small delay to allow messages to render
    requestAnimationFrame(() => {
      el.scrollTop = 0;
    });
  }, [chatId]);

  useEffect(() => {
    if (!supabase || !chatId) return;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

  const channel = supabase
      .channel(`room:${chatId}`)
      .on<SupabaseMessage>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.ROOM_ROWS, filter: `room_id=eq.${chatId}` },
        (payload) => {
          const newMessagePayload = payload.new as SupabaseMessage;
          const appMsg = mapSupabaseMessageToAppMessage(newMessagePayload);
          setMessages(prev => mergeMessages(prev, [appMsg], 'prepend'));
        }
      )
        .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') console.log(`Subscribed to room ${chatId}`);
        if (status === 'CHANNEL_ERROR') {
          console.error(`Subscription error:`, err);
          setError("Chyba připojení k real-time chatu.");
        }
      });
    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, chatId, mapSupabaseMessageToAppMessage]);

  // Polling fallback when realtime fails
  useEffect(() => {
    let timer: any = null;
    if (error && error.includes('real-time')) {
      // Start polling every 3s
      timer = setInterval(() => {
        fetchMessages();
      }, 3000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [error, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
  if (!newMessage.trim() || !participantId) return;

    const messageToSend = {
      room_id: chatId,
  participant_id: participantId,
      content: newMessage.trim()
    };
    setNewMessage('');

    try {
      const resp = await fetch('/api/room-rows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: chatId, participantId, content: messageToSend.content }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        console.error('Server send message failed:', resp.status, json);
        if (resp.status === 403 && json?.error && String(json.error).toLowerCase().includes('rls')) {
          const msg = 'Odesílání zprávy zablokováno pravidly RLS. Pro lokální testování spusťte `supabase/dev_rls_open.sql` nebo nastavte SUPABASE_SERVICE_ROLE_KEY v .env.local.';
          toast.error(msg);
          setError(msg);
        } else {
          toast.error('Nepodařilo se odeslat zprávu.');
        }
        setNewMessage(messageToSend.content);
      } else {
        // If server returned the saved row, prepend it (newest-first layout)
        if (json.row) {
          const appMsg = mapSupabaseMessageToAppMessage(json.row);
          setMessages((prev) => {
            // remove any optimistic temp message that matches content and sender
            const filtered = prev.filter(m => !(String(m.senderId) === String(appMsg.senderId) && m.content === appMsg.content && String(m.id).startsWith('temp-')));
            return [appMsg, ...filtered];
          });
          // ensure newest message is visible at top
          requestAnimationFrame(() => {
            const el = messagesContainerRef.current;
            if (el) el.scrollTop = 0;
          });
          setTimeout(() => {
            const el = messagesContainerRef.current;
            if (el) el.scrollTop = 0;
          }, 50);
        } else {
          // optimistic fallback: create a temporary message and prepend so user sees it immediately
          const tempMsg = {
            id: `temp-${Date.now()}`,
            content: messageToSend.content,
            participant_id: participantId,
            created_at: new Date().toISOString(),
          } as SupabaseMessage;
          const appTemp = mapSupabaseMessageToAppMessage(tempMsg);
          setMessages(prev => mergeMessages(prev, [appTemp], 'prepend'));
          requestAnimationFrame(() => {
            const el = messagesContainerRef.current;
            if (el) el.scrollTop = 0;
          });
        }
      }
    } catch (err) {
      console.error('Error calling server send-message API:', err);
      toast.error('Nepodařilo se odeslat zprávu.');
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
  <div className="chat flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] bg-black rounded-xl shadow-2xl border border-border-color overflow-hidden text-black">
      {/* Registration banner removed from chat page; will be placed elsewhere later */}
      {/* Helpful RLS banner shown when server indicates RLS is blocking reads */}
      {error && String(error).toLowerCase().includes('rls') && showRlsBanner && (
        <div className="p-3 bg-yellow-50 border-b border-yellow-200 text-yellow-900 text-sm">
          <div className="font-medium">Problém s přístupem k historii chatu</div>
          <div className="mt-1">Čtení zpráv je zablokované pravidly Row Level Security (RLS).</div>
          <div className="mt-2 text-xs text-text-secondary">Pro lokální testování spusťte <code>supabase/dev_rls_open.sql</code> nebo nastavte <code>SUPABASE_SERVICE_ROLE_KEY</code> v <code>.env.local</code>. Po dokončení testu vraťte pravidla pomocí <code>supabase/dev_rls_revert.sql</code>.</div>
          <div className="mt-2"><button onClick={() => setShowRlsBanner(false)} className="underline">Skrýt</button></div>
        </div>
      )}

      <div className="box flex flex-col h-full">
        {chatCode && (
          <div className="p-3.5 sm:p-4 border-b border-border-color bg-surface rounded-t-xl">
            <h2 className="text-lg font-semibold text-primary text-center truncate">
              Chat Kód: <span className="font-bold">{chatCode}</span>
            </h2>
          </div>
        )}

  <div
    ref={(el) => { messagesContainerRef.current = el; }}
    className="messages overflow-y-auto p-4 bg-black"
  style={{ height: 'calc(64px * 5)' }}
  > {/* Chat area dark background; fixed to show 10 messages */}
          <div className="bubbles">
            {messages.length === 0 && !isLoading && ( // Ensure not loading before showing "no messages"
              <div className="text-center text-text-secondary pt-10">Zatím žádné zprávy. Začněte konverzaci!</div>
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
          
        </div>
      </div>
      {error && messages.length > 0 && ( // Display non-critical error here if messages are present
        <div className="p-2 bg-red-50 border-t border-red-200 text-danger text-xs text-center">
          {error}
        </div>
      )}
      {participantId ? (
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-border-color bg-gray-900 rounded-b-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napište zprávu..."
              className="flex-grow"
              aria-label="Nová zpráva"
              wrapperClassName="flex-grow"
            />
            <Button type="submit" variant="primary" aria-label="Odeslat zprávu" disabled={!newMessage.trim()} size="md">
              <Send size={20} />
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-3 sm:p-4 border-t border-border-color bg-surface rounded-b-xl text-center text-sm text-text-secondary">
          Nejste účastníkem tohoto chatu. Pro odesílání zpráv se nejdříve připojte.
        </div>
      )}
    </div>
  );
};

export default Chat;
