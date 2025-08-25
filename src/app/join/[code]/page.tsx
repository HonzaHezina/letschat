"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useAnonymousId } from '@/hooks/useAnonymousId';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

type CodeStatus = 'new' | 'protected' | 'unprotected' | 'full' | 'invalid';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabase();
  const anonymousId = useAnonymousId();

  const code = typeof params.code === 'string' ? params.code.toUpperCase() : '';
  const [status, setStatus] = useState<CodeStatus | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCodeStatus = async () => {
      if (!code || !anonymousId) return;
      try {
        const { data, error } = await supabase.functions.invoke('get-code-status', {
          body: { code, anonymousId },
        });
        if (error) throw error;
        if (data.status) {
          setStatus(data.status);
        } else {
            throw new Error(data.error || 'Failed to get code status.');
        }
      } catch (error: any) {
        toast.error(error.message);
        setStatus('invalid');
      } finally {
        setLoading(false);
      }
    };
    if(anonymousId) fetchCodeStatus();
  }, [code, anonymousId, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'protected' && pin.length !== 5) {
        toast.error("PIN musí mít 5 číslic.");
        return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Vstupuji do místnosti...");

    try {
        const { data, error } = await supabase.functions.invoke('finalize-join', {
            body: { code, anonymousId, pin: pin || null }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        toast.success("Vstup úspěšný!", { id: toastId });
        router.push(`/chat/${data.roomId}`);

    } catch(error: any) {
        toast.error(error.message, { id: toastId });
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  if (status === 'invalid' || !status) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-xl"><h2 className="text-xl font-bold text-danger">Neplatný kód</h2><p className="text-gray-600 mt-2">Tento kód neexistuje nebo vypršel.</p></div>;
  }

  return (
    <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-center text-primary">Vstup do místnosti</h1>
            <p className="text-center text-gray-600">Kód: <span className="font-mono font-bold text-lg">{code}</span></p>

            <form onSubmit={handleSubmit}>
                {status === 'new' && (
                    <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-gray-700">Ochraný PIN (volitelný)</label>
                        <p className="text-xs text-gray-500 mb-2">Zadejte 5místný PIN pro ochranu vašeho vstupu. Pokud ho zapomenete, ztratíte přístup.</p>
                        <input
                            id="pin"
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={5}
                            placeholder="12345"
                            className="w-full text-center tracking-[.5em] text-lg px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                )}
                {status === 'protected' && (
                     <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-gray-700">Zadejte Váš 5místný PIN</label>
                        <input id="pin" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} maxLength={5} required className="w-full text-center tracking-[.5em] text-lg px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                )}
                {status === 'full' && (
                    <div className="p-4 text-center bg-red-100 text-danger rounded-md">
                        <p className="font-bold">Místnost je plná</p>
                        <p className="text-sm">Bohužel, k tomuto chatu se již připojili dva účastníci.</p>
                    </div>
                )}

                {status !== 'full' && (
                    <button type="submit" disabled={submitting} className="w-full mt-4 px-4 py-3 text-white bg-primary rounded-md hover:bg-primary-dark disabled:bg-gray-400">
                        {submitting ? 'Vstupuji...' : 'Vstoupit do chatu'}
                    </button>
                )}
            </form>
        </div>
    </div>
  );
}
