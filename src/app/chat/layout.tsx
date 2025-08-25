import React from 'react';

import ChatListSidebar from '@/components/chat/ChatListSidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page leftright">
        <div className="left">
            <ChatListSidebar />
        </div>
        <div className="content">
            {children}
        </div>
    </div>
  );
}
