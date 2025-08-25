"use client";

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Room {
    id: number;
    name: string;
    // last_message: string; // Could be added later
}

export default function ChatListSidebar() {
    const supabase = useSupabase();
    const pathname = usePathname();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                setRooms(roomData || []);
            }
            setLoading(false);
        };

        fetchRooms();
    }, [supabase]);

    if (loading) {
        return <div className="p-4"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="chat">
            <ul className="menu">
                {rooms.map(room => (
                    <li key={room.id}>
                        <Link href={`/chat/${room.id}`} className={pathname === `/chat/${room.id}` ? 'active' : ''}>
                             <div className="image" style={{backgroundImage: "url('/media/custom/chat-icon.webp')"}}></div>
                             <div className="name">
                                <h3>{room.name || `Chat #${room.id}`}</h3>
                                <p className="status">Toto je poslední zpráva...</p>
                             </div>
                             <div className="info">
                                 {/* New message count can go here */}
                             </div>
                        </Link>
                    </li>
                ))}
                {rooms.length === 0 && <li className="p-4 text-sm text-gray-500">Nemáte žádné aktivní chaty.</li>}
            </ul>
        </div>
    );
}
