"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useAnonymousId } from '@/hooks/useAnonymousId';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const supabase = useSupabase();
  const anonymousId = useAnonymousId();
  const [chatCode, setChatCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatCode.trim()) {
      toast.error("Zadejte kód chatu.");
      return;
    }
    setIsLoading(true);
    router.push(`/join/${chatCode}`);
  };

  // Using a simplified version of the new UI for the anonymous-first flow
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-primary">Vítejte v LetsChat</h1>
        <p className="text-gray-600">Zadejte kód z vaší kartičky a začněte chatovat.</p>

        <form onSubmit={handleJoinChat} className="flex items-center">
          <input
            type="text"
            placeholder="Zadejte Váš kód"
            value={chatCode}
            onChange={(e) => setChatCode(e.target.value.toUpperCase())}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={5}
          />
          <button
            type="submit"
            disabled={isLoading || !anonymousId}
            className="px-5 py-3 bg-primary text-white rounded-r-lg hover:bg-primary-dark disabled:bg-gray-400 flex items-center justify-center w-20 h-[51px]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4">
          Pokud jste obdrželi kartičku, zadejte kód a budete spojeni s druhou osobou.
        </p>
      </div>
    </div>
  );
}
