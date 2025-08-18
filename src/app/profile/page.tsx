"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; gender: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async (currentUser: User) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('profiles').select('full_name, gender').eq('id', currentUser.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setProfile(data);
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
    if (!user || !profile) return;
    setUpdating(true);
    const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        gender: profile.gender,
        updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    if (error) {
      toast.error(`Chyba při aktualizaci profilu: ${error.message}`);
    } else {
      toast.success('Profil byl úspěšně aktualizován!');
    }
    setUpdating(false);
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page full">
        <div className="wave"></div>
        <div className="content">
            <h1>Můj profil</h1>
            <div className="profile">
                <div className="photo">
                    <img src="https://placehold.co/400x400/webp" alt="Profile photo" />
                    {/* Additional info can be added here if needed */}
                </div>
                <div className="content">
                    <form onSubmit={handleUpdateProfile} className="form">
                        <div className="input">
                            <div className="text">Jméno a přijmení</div>
                            <div className="insert"><input type="text" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required /></div>
                        </div>
                        <div className="input">
                            <div className="text">E-mail</div>
                            <div className="insert"><input type="email" value={user?.email || ''} disabled /></div>
                        </div>
                        <div className="input">
                            <div className="text">Pohlaví</div>
                            <div className="insert">
                                <div className="line">
                                    <label className="radio">
                                        <input type="radio" name="gender" value="woman" checked={profile.gender === 'woman'} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} />
                                        <span className="text">Žena</span>
                                    </label>
                                    <label className="radio">
                                        <input type="radio" name="gender" value="man" checked={profile.gender === 'man'} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} />
                                        <span className="text">Muž</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="input">
                            <div className="text"></div>
                            <div className="insert">
                                <input type="submit" value={updating ? 'Ukládání...' : 'Uložit změny'} disabled={updating} />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
}
