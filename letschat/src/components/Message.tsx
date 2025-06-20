"use client";

import React from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale'; // Czech locale

export interface MessageProps {
  id: string; // Or number, depending on your DB schema
  content: string;
  senderId: string; // Anonymous ID of the sender
  currentUserId: string; // Anonymous ID of the current user
  timestamp: string | Date; // ISO string or Date object
  senderDisplayName?: string; // Optional display name (e.g., "Uživatel X")
}

const Message: React.FC<MessageProps> = ({ content, senderId, currentUserId, timestamp, senderDisplayName }) => {
  const isCurrentUser = senderId === currentUserId;
  const time = format(new Date(timestamp), 'HH:mm', { locale: cs });

  // Basic display name logic if not provided
  const displayName = senderDisplayName || `Uživatel ${senderId.substring(0, 6)}`;

  return (
    <div className={`flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow ${
          isCurrentUser
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-gray-200 text-text-primary rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <p className="text-xs font-semibold text-secondary mb-0.5">
            {displayName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} text-right`}>
          {time}
        </p>
      </div>
    </div>
  );
};

export default Message;
