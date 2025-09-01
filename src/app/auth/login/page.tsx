"use client";

import React, { useState } from 'react';
import { useSupabaseSafe } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SocialButton = ({ provider, children }: { provider: 'google' | 'facebook', children: React.ReactNode }) => {
  const supabase = useSupabaseSafe();
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
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseSafe();
  const router = useRouter();

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;
    if (!email) {
        newErrors.email = 'Zadejte e-mailovou adresu!';
        isValid = false;
    }
    // No password error message is specified for empty password, only for invalid login.
    setErrors(newErrors);
    return isValid;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    if (!supabase) {
      // supabase not initialized yet; show a generic error or early return
      setLoading(false);
      toast.error('Klient není připraven, zkuste to prosím znovu za moment.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // The user's code suggests a generic error for the password field.
      setErrors({ email: '', password: 'Neplatný e-mail nebo heslo!' });
      // Also show a toast for accessibility, as the inline error might be missed.
      toast.error('Neplatný e-mail nebo heslo!');
    } else {
      toast.success('Přihlášení úspěšné!');
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="page imageleft">
      <div className="image" style={{ backgroundImage: "url('/media/custom/image-left.webp')" }}></div>
      <div className="content">
        <h1>Přihlášení</h1>

  <SocialButton provider="facebook">Přihlásit se&nbsp;pomocí Facebooku</SocialButton>
  <SocialButton provider="google">Přihlásit se&nbsp;pomocí Google</SocialButton>

        <div className="login">
          <form id="form-login" onSubmit={handleLogin} method="post" className="form" noValidate>
            <div className="input">
              <div className="text">E-mail</div>
              <div className="insert">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  placeholder="E-mailová adresa"
                />
                {errors.email && <div className="error" style={{display: 'block'}}>{errors.email}</div>}
              </div>
            </div>

            <div className="input">
              <div className="text">Heslo</div>
              <div className="insert">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={255}
                  placeholder="Heslo k přihlášení"
                />
                {errors.password && <div className="error" style={{display: 'block'}}>{errors.password}</div>}
                <div className="visible" data-input="password1" onClick={() => setPasswordVisible(!isPasswordVisible)}></div>
              </div>
            </div>

            <div className="input">
              <div className="text"></div>
              <div className="insert">
                <input type="submit" value={loading ? 'Přihlašování...' : 'Přihlásit'} disabled={loading || !supabase} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
