"use client";


import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseSafe } from '@/contexts/SupabaseProvider';
import { useAnonymousId } from '@/hooks/useAnonymousId';
import toast from 'react-hot-toast';
import TABLES from '@/lib/dbTables';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabaseSafe();
  const anonymousId = useAnonymousId();
  const code = typeof params.code === 'string' ? params.code.toUpperCase() : '';
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Klient není připraven, zkuste to prosím znovu za moment.');
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Vstupuji do místnosti...");
    try {
      const { data: room, error: roomError } = await supabase
        .from(TABLES.ROOMS)
        .select('*')
        .eq('name', code)
        .maybeSingle();
      if (roomError) throw roomError;
      if (!room) throw new Error("Místnost nenalezena");

      // Najdi code_id podle kódu
      const { data: codeRow, error: codeError } = await supabase
        .from(TABLES.CODES)
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (codeError) throw codeError;
      if (!codeRow) throw new Error("Kód nenalezen");

      // Ověř, zda už anonymní účastník existuje v místnosti
      const { data: existingParticipant } = await supabase
        .from(TABLES.ROOM_PARTICIPANTS)
        .select('id')
        .eq('room_id', room.id)
        .eq('anonymous_id', anonymousId)
        .maybeSingle();

      if (!existingParticipant) {
        // Use server-side API to create participant (bypass RLS safely)
        const resp = await fetch('/api/finalize-join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, code: code, anonymousId }),
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || 'Failed to create participant via server');
      }
      toast.success("Vstup úspěšný!", { id: toastId });
      router.push(`/chat/${room.id}`);
    } catch(error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center text-primary">Vstup do místnosti</h1>
        <form onSubmit={handleSubmit}>
          <button type="submit" disabled={submitting || !supabase} className="w-full mt-4 px-4 py-3 text-white bg-primary rounded-md hover:bg-primary-dark disabled:bg-gray-400">
            {submitting ? 'Vstupuji...' : 'Vstoupit do chatu'}
          </button>
        </form>
      </div>
    </div>
  );
}

