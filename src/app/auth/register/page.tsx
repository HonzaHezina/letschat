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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error('Hesla nejsou stejná!');
      return;
    }
    if (!gender) {
        toast.error('Vyberte prosím pohlaví.');
        return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, gender: gender } },
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      toast.success('Registrace úspěšná! Zkontrolujte prosím svůj e-mail pro ověření.');

      const urlParams = new URLSearchParams(window.location.search);
      const claimId = urlParams.get('claimId');
      if (claimId) {
          await supabase.functions.invoke('claim-chat', {
              body: { anonymousId: claimId }
          });
          toast.success('Chat byl úspěšně přiřazen k vašemu účtu!');
      }

      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="page imageleft">
      <div className="image" style={{ backgroundImage: "url('/media/custom/image-left.webp')" }}></div>
      <div className="content">
        <h1>Nová registrace</h1>
        <div className="registration">
            <SocialButton provider="facebook">Registrovat se pomocí Facebooku</SocialButton>
            <SocialButton provider="google">Registrovat se pomocí Google</SocialButton>

            <form onSubmit={handleRegister} className="form">
                <div className="input">
                    <div className="text">Jméno a přijmení</div>
                    <div className="insert"><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                </div>
                <div className="input">
                    <div className="text">E-mail</div>
                    <div className="insert"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                </div>
                <div className="input">
                    <div className="text">Heslo</div>
                    <div className="insert"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                </div>
                <div className="input">
                    <div className="text">Heslo znovu</div>
                    <div className="insert"><input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required /></div>
                </div>
                <div className="input">
                    <div className="text">Pohlaví</div>
                    <div className="insert">
                        <div className="line">
                            <label className="radio">
                                <input type="radio" name="gender" value="woman" checked={gender === 'woman'} onChange={(e) => setGender(e.target.value)} />
                                <span className="text">Žena</span>
                            </label>
                            <label className="radio">
                                <input type="radio" name="gender" value="man" checked={gender === 'man'} onChange={(e) => setGender(e.target.value)} />
                                <span className="text">Muž</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="input">
                    <div className="text"></div>
                    <div className="insert">
                        <input type="submit" value={loading ? 'Registrace...' : 'Registrovat'} disabled={loading} />
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
