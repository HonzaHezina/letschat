"use client";

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Chat {
    id: string; // Assuming chat IDs are strings, adjust if needed
    name?: string; // Name might be optional
    // Add other fields as needed based on your 'chats' table structure
    // For example: created_at?: string; last_message?: string;
}

interface ChatListSidebarProps {
    chats?: Chat[];
}

export default function ChatListSidebar({ chats }: ChatListSidebarProps) {
    const supabase = useSupabase();
    const pathname = usePathname();
    const [rooms, setRooms] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If chats are provided as a prop, use them and don't fetch data
        if (chats) {
            setRooms(chats);
            setLoading(false);
            return;
        }

        const fetchRooms = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return; // Don't fetch rooms if user is not logged in
            }

            // This query is complex: fetch rooms where the user is a participant
            // For now, we'll use a placeholder. A real implementation would use an RPC call.
            const { data: roomData, error } = await supabase
                .from('rooms')
                .select('id, name')
                .limit(5); // Placeholder

            if (error) {
                console.error("Error fetching rooms:", error);
            } else {
                // Map roomData to Chat type if necessary, or ensure it matches
                // For now, assuming structure is compatible or will be handled by TypeScript
                setRooms(roomData as Chat[] || []);
            }
            setLoading(false);
        };

        fetchRooms();
    }, [supabase, chats]);

    if (loading) {
        return <div className="p-4"><Loader2 className="animate-spin" /></div>;
    }

    // Use chats prop if provided, otherwise use local rooms state
    const displayChats = chats || rooms;

    return (
        <div className="chat">
            <ul className="menu">
                {displayChats.map(chat => (
                    <li key={chat.id}>
                        <Link href={`/chat/${chat.id}`} className={pathname === `/chat/${chat.id}` ? 'active' : ''}>
                             <div className="image" style={{backgroundImage: "url('/media/custom/chat-icon.webp')"}}></div>
                             <div className="name">
                                <h3>{chat.name || `Chat #${chat.id}`}</h3>
                                <p className="status">Toto je poslední zpráva...</p>
                             </div>
                             <div className="info">
                                 {/* New message count can go here */}
                             </div>
                        </Link>
                    </li>
                ))}
                {displayChats.length === 0 && <li className="p-4 text-sm text-gray-500">Nemáte žádné aktivní chaty.</li>}
            </ul>
        </div>
    );
}
