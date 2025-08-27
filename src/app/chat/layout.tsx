import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
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

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data, error } = await supabase
                    .from('chat_participants')
                    .select('chat_id')
                    .eq('user_id', anonymousId);

                if (error) throw error;

                if (data) {
                    const chatIds = data.map((item: ChatParticipant) => item.chat_id);
                    const { data: chats, error: chatsError } = await supabase
                        .from('chats')
                        .select('*')
                        .in('id', chatIds);

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
    }, [anonymousId]);

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
