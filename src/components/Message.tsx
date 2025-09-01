"use client";

import React from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

export interface MessageProps {
  id: string;
  content: string;
  senderId: string;
  currentUserId: string | number | null;
  timestamp: string | Date;
  senderDisplayName?: string;
}

const Message: React.FC<MessageProps> = ({ content, senderId, currentUserId, timestamp, senderDisplayName }) => {
  const isCurrentUser = String(senderId) === String(currentUserId);
  const time = format(new Date(timestamp), 'd.M.yyyy HH:mm', { locale: cs });
  const displayName = senderDisplayName || `Uživatel ${String(senderId).substring(0, 6)}`;

  // Use .source template classes: bubble + pagea/pageb
  const bubbleClass = isCurrentUser ? 'bubble pageb' : 'bubble pagea';
  const imageUrl = isCurrentUser ? '/media/custom/chat-test-2.webp' : '/media/custom/chat-image.webp';

  return (
    <div className={bubbleClass}>
      <div className="image" data-background={imageUrl}></div>
      <div className="text">
        <div className="date">{time}</div>
        <span>{content}</span>
      </div>
    </div>
  );
};

export default Message;
