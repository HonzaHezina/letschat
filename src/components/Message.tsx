"use client";

import React from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

export interface MessageProps {
  id: string;
  content: string;
  senderId: string;
  currentUserId: string;
  timestamp: string | Date;
  senderDisplayName?: string;
}

const Message: React.FC<MessageProps> = ({ content, senderId, currentUserId, timestamp, senderDisplayName }) => {
  const isCurrentUser = senderId === currentUserId;
  const time = format(new Date(timestamp), 'HH:mm', { locale: cs });
  const displayName = senderDisplayName || `Uživatel ${senderId.substring(0, 6)}`;

  return (
    <div className={`flex mb-3 ${isCurrentUser ? 'justify-end pl-6 sm:pl-10' : 'justify-start pr-6 sm:pr-10'}`}> {/* Added horizontal padding to parent to constrain width slightly less than full */}
      <div
        className={`max-w-xs sm:max-w-md md:max-w-lg px-4 py-2.5 rounded-xl shadow-md break-words ${ /* Increased shadow, break-words */
          isCurrentUser
            ? 'bg-primary text-white rounded-br-none' // Primary color for current user
            : 'bg-surface text-text-primary rounded-bl-none' // Surface color for others
        }`}
      >
        {!isCurrentUser && (
          <p className="text-xs font-semibold text-primary-dark mb-0.5"> {/* Changed sender name color */}
            {displayName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-teal-100' : 'text-text-secondary opacity-80'} text-right`}> {/* Adjusted timestamp colors */}
          {time}
        </p>
      </div>
    </div>
  );
};

export default Message;
