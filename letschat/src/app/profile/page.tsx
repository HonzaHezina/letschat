"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; gender: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async (currentUser: User) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, gender')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      toast.error(`Chyba při načítání profilu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            fetchProfile(user);
        } else {
            router.push('/auth/login');
        }
    };
    checkUser();
  }, [supabase, router, fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase || !user || !profile) return;

    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        gender: profile.gender,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error(`Chyba při aktualizaci profilu: ${error.message}`);
    } else {
      toast.success('Profil byl úspěšně aktualizován!');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || !profile) {
    // This case is mostly handled by the redirect, but it's good practice
    return <p>Profil se nepodařilo načíst.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Můj profil</h1>
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-3 py-2 mt-1 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Jméno a přijmení</label>
          <input
            id="fullName"
            type="text"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
            <span className="block text-sm font-medium text-gray-700">Pohlaví</span>
            <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                    <input type="radio" name="gender" value="woman" checked={profile.gender === 'woman'} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="form-radio h-4 w-4 text-indigo-600" />
                    <span className="ml-2 text-sm text-gray-700">Žena</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="gender" value="man" checked={profile.gender === 'man'} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="form-radio h-4 w-4 text-indigo-600" />
                    <span className="ml-2 text-sm text-gray-700">Muž</span>
                </label>
            </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={updating}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {updating ? 'Aktualizace...' : 'Uložit změny'}
          </button>
        </div>
      </form>
    </div>
  );
}
