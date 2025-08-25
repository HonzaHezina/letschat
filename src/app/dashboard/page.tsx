"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User } from '@supabase/supabase-js';
import { Loader2, PlusCircle } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCodes, setNewCodes] = useState<{codeA: string, codeB: string} | null>(null);

  const fetchRooms = useCallback(async (currentUser: User) => {
    // This logic will need to be more complex later,
    // fetching rooms where the user is a participant.
    // For now, we fetch rooms created from codes owned by the user.
    // This is a simplification for this step.
    setLoading(false); // Placeholder
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchRooms(user);
      } else {
        router.push('/auth/login');
      }
    };
    checkUser();
  }, [supabase, router, fetchRooms]);

  const handleCreateCard = async () => {
    setIsCreating(true);
    setNewCodes(null);
    const toastId = toast.loading("Vytvářím novou kartičku...");
    try {
        const { data, error } = await supabase.functions.invoke('create-card');
        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setNewCodes(data);
        toast.success("Nová kartička úspěšně vytvořena!", { id: toastId });
    } catch(err: any) {
        toast.error(`Chyba: ${err.message}`, { id: toastId });
    } finally {
        setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="page full">
        <div className="wave"></div>
        <div className="content">
            <div className="flex justify-between items-center mb-6">
                <h1>Můj přehled</h1>
                <button onClick={handleCreateCard} disabled={isCreating} className="inline-flex items-center px-4 py-2 bg-secondary text-primary font-bold rounded-md hover:bg-yellow-500">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {isCreating ? 'Vytvářím...' : 'Vytvořit novou kartičku'}
                </button>
            </div>

            {newCodes && (
                <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                    <h3 className="font-bold">Nové kódy byly vygenerovány!</h3>
                    <p>Sdílejte jeden kód s druhou osobou. Každý použijte jeden pro vstup do chatu.</p>
                    <div className="flex gap-4 mt-2 font-mono text-lg">
                        <p>Kód A: <span className="font-extrabold p-1 bg-white rounded">{newCodes.codeA}</span></p>
                        <p>Kód B: <span className="font-extrabold p-1 bg-white rounded">{newCodes.codeB}</span></p>
                    </div>
                </div>
            )}

            <div className="chats">
                {rooms.length === 0 && !loading ? (
                    <p>Zatím nemáte žádné aktivní chaty.</p>
                ) : (
                    rooms.map(room => (
                        <div key={room.id} className="item">
                            {/* Room display logic will go here */}
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
}
