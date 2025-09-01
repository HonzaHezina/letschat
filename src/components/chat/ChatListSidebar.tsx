"use client";

import React, { useState, useEffect } from 'react';
import { useSupabaseSafe } from '@/contexts/SupabaseProvider';
import TABLES from '@/lib/dbTables';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Chat {
    id: string;
    name?: string;
}

interface ChatListSidebarProps {
    chats?: Chat[];
    onSelect?: (id: string) => void;
}

export default function ChatListSidebar({ chats, onSelect }: ChatListSidebarProps) {
    const supabase = useSupabaseSafe();
    const pathname = usePathname();
    const [rooms, setRooms] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) return;
        if (chats) {
            setRooms(chats);
            setLoading(false);
            return;
        }

        const fetchRooms = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }

                const { data: roomData, error } = await supabase
                    .from(TABLES.ROOMS)
                    .select('id, name')
                    .limit(20);

                if (error) {
                    console.error('Error fetching rooms:', error);
                    setRooms([]);
                } else {
                    setRooms((roomData as Chat[]) || []);
                }
            } catch (err) {
                console.error('Failed to fetch rooms', err);
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [supabase, chats]);

    if (!supabase) {
        return <div className="flex justify-center items-center h-screen text-lg">Načítám chatovací klient...</div>;
    }
    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /></div>;

    const displayChats = chats || rooms;

    return (
        <div className="chat">
            <ul className="menu">
                {displayChats.map((chat) => (
                    <li key={chat.id}>
                        {onSelect ? (
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onSelect(chat.id); }}
                                className={pathname === `/chat/${chat.id}` ? 'active' : ''}
                            >
                                <div className="image" data-background="/media/custom/chat-image.webp"></div>
                                <div className="name">
                                    <h3>{chat.name || `Chat #${chat.id}`}</h3>
                                    <p className="status">Toto je poslední zpráva...</p>
                                </div>
                                <div className="info" />
                            </a>
                        ) : (
                            <Link href={`/chat/${chat.id}`} className={pathname === `/chat/${chat.id}` ? 'active' : ''}>
                                <div className="image" data-background="/media/custom/chat-image.webp"></div>
                                <div className="name">
                                    <h3>{chat.name || `Chat #${chat.id}`}</h3>
                                    <p className="status">Toto je poslední zpráva...</p>
                                </div>
                                <div className="info" />
                            </Link>
                        )}
                    </li>
                ))}
                {displayChats.length === 0 && <li className="p-4 text-sm text-gray-500">Nemáte žádné aktivní chaty.</li>}
            </ul>
        </div>
    );
}
