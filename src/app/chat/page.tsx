import React from 'react';
import ChatListSidebar from '@/components/chat/ChatListSidebar';
import ChatMessages from '@/components/chat/ChatMessages';

interface ChatPageProps {
  chats: Array<{
    id: string;
    name: string;
    status: string;
    image: string;
    newMessages?: number;
  }>;
}

const ChatPage: React.FC<ChatPageProps> = ({ chats }) => {
  return (
    <div className="page leftright">
      <div className="frame">
        <div className="chat">
          <div className="left">
            <ChatListSidebar chats={chats} />
          </div>
          <div className="content">
            <ChatMessages messages={[]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;