"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseSafe } from '@/contexts/SupabaseProvider';
import TABLES from '@/lib/dbTables';
import { useAnonymousId } from '../../hooks/useAnonymousId';
import ChatListSidebar from '../../components/chat/ChatListSidebar';

interface ChatParticipant {
  chat_id: string;
}

interface ChatLayoutProps {
    children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const anonymousId = useAnonymousId();

    const supabase = useSupabaseSafe();

    useEffect(() => {
        if (!supabase || !anonymousId) return; // počkej na načtení klienta i ID
        const fetchChats = async () => {
            try {
                const { data, error } = await supabase
                    .from(TABLES.ROOM_PARTICIPANTS)
                    .select('room_id')
                    .eq('anonymous_id', anonymousId);

                if (error) throw error;

                if (data) {
                    const roomIds = data.map((item: any) => item.room_id);
                    const { data: chats, error: chatsError } = await supabase
                        .from(TABLES.ROOMS)
                        .select('*')
                        .in('id', roomIds);

                    if (chatsError) throw chatsError;

                    setChats(chats || []);
                }
            } catch (err) {
                setError('Error fetching chats');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [anonymousId, supabase]);

    if (!supabase) {
        return <div className="flex justify-center items-center h-screen text-lg">Načítám chatovací klient...</div>;
    }
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="page">
            <div className="flex">
                <ChatListSidebar chats={chats} />
                <div className="flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;
