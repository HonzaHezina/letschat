"use client";

import React, { useState } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SocialButton = ({ provider, children }: { provider: 'google' | 'facebook', children: React.ReactNode }) => {
    const supabase = useSupabase();
    const handleSocialLogin = async () => {
        if (!supabase) return;
        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };
    return (
        <a href="#" onClick={(e) => { e.preventDefault(); handleSocialLogin(); }} className={`vendor ${provider}`}>
            <div className={`logo ${provider}`}></div>
            <div className="content">{children}</div>
        </a>
    );
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Přihlášení úspěšné!');
      router.push('/chats');
    }
    setLoading(false);
  };

  return (
    <div className="page imageleft">
      <div className="image" style={{ backgroundImage: "url('/media/custom/image-left.webp')" }}></div>
      <div className="content">
        <h1>Přihlášení</h1>
        <div className="login">
            <SocialButton provider="facebook">Přihlásit se pomocí Facebooku</SocialButton>
            <SocialButton provider="google">Přihlásit se pomocí Google</SocialButton>

            <form onSubmit={handleLogin} className="form">
                <div className="input">
                    <div className="text">E-mail</div>
                    <div className="insert">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>
                <div className="input">
                    <div className="text">Heslo</div>
                    <div className="insert">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                </div>
                <div className="input">
                    <div className="text"></div>
                    <div className="insert">
                        <input type="submit" value={loading ? 'Přihlašování...' : 'Přihlásit'} disabled={loading} />
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
