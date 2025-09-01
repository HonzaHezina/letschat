"use client";

import React, { useState } from 'react';
import { useSupabaseSafe } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Re-using the SocialButton from the original file as it contains correct logic.
const SocialButton = ({ provider, children }: { provider: 'google' | 'facebook', children: React.ReactNode }) => {
  const supabase = useSupabaseSafe();
  const handleSocialLogin = async () => {
    if (!supabase) {
      // Client not ready
      toast.error('Klient není připraven, zkuste to prosím za moment.');
      return;
    }
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
  const [password2, setPassword2] = useState('');
  const [sex, setSex] = useState('');
  const [errors, setErrors] = useState({
      name: '',
      email: '',
      password: '',
      password2: '',
      sex: ''
  });
  const [isPassword1Visible, setPassword1Visible] = useState(false);
  const [isPassword2Visible, setPassword2Visible] = useState(false);

  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseSafe();
  const router = useRouter();

  const validateForm = () => {
      const newErrors = { name: '', email: '', password: '', password2: '', sex: '' };
      let isValid = true;

      if (!name) {
          newErrors.name = 'Zadejte jméno a přijmení!';
          isValid = false;
      }
      if (!email) {
          newErrors.email = 'Zadejte e-mail!';
          isValid = false;
      }
      if (!password) {
          newErrors.password = 'Zadejte heslo!';
          isValid = false;
      }
      if (password !== password2) {
          newErrors.password2 = 'Hesla nejsou stejná!';
          isValid = false;
      }
      if (!sex) {
          newErrors.sex = 'Vyberte jednu možnost';
          isValid = false;
      }

      setErrors(newErrors);
      return isValid;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    if (!supabase) {
      setLoading(false);
      toast.error('Klient není připraven, zkuste to prosím znovu za moment.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, gender: sex } },
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      toast.success('Registrace úspěšná! Zkontrolujte prosím svůj e-mail pro ověření.');

      const urlParams = new URLSearchParams(window.location.search);
      const claimId = urlParams.get('claimId');
      if (claimId) {
          try {
            if (!supabase) throw new Error('Supabase client not available');
            await supabase.functions.invoke('claim-chat', {
                body: { anonymousId: claimId }
            });
            toast.success('Chat byl úspěšně přiřazen k vašemu účtu!');
          } catch (functionError) {
            toast.error('Nepodařilo se přiřadit chat.');
          }
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

        <SocialButton provider="facebook">Registrovat se&nbsp;pomocí Facebooku</SocialButton>
        <SocialButton provider="google">Registrovat se&nbsp;pomocí Google</SocialButton>

        <div className="registration">
          <form id="form-registration" onSubmit={handleRegister} method="post" className="form" noValidate>
            <div className="input">
              <div className="text">Jméno a&nbsp;přijmení</div>
              <div className="insert">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={255}
                  placeholder="Tvoje jméno a přijmení"
                />
                {errors.name && <div className="error" style={{display: 'block'}}>{errors.name}</div>}
              </div>
            </div>

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
                  type={isPassword1Visible ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={255}
                  placeholder="Heslo k přihlášení"
                />
                {errors.password && <div className="error" style={{display: 'block'}}>{errors.password}</div>}
                <div className="visible" data-input="password1" onClick={() => setPassword1Visible(!isPassword1Visible)}></div>
              </div>
            </div>

            <div className="input">
              <div className="text">Heslo znovu</div>
              <div className="insert">
                <input
                  type={isPassword2Visible ? 'text' : 'password'}
                  name="password2"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  maxLength={255}
                  placeholder="Heslo pro kontrolu"
                />
                {errors.password2 && <div className="error" style={{display: 'block'}}>{errors.password2}</div>}
                <div className="visible" data-input="password2" onClick={() => setPassword2Visible(!isPassword2Visible)}></div>
              </div>
            </div>

            <div className="input">
              <div className="text">Pohlaví</div>
              <div className="insert">
                <div className="line">
                  <label className="radio">
                    <input
                      type="radio"
                      name="sex"
                      value="female"
                      checked={sex === 'female'}
                      onChange={(e) => setSex(e.target.value)}
                    />
                    <span className="text">Žena</span>
                  </label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="sex"
                      value="male"
                      checked={sex === 'male'}
                      onChange={(e) => setSex(e.target.value)}
                    />
                    <span className="text">Muž</span>
                  </label>
                </div>
                {errors.sex && <div className="error" style={{display: 'block'}}>{errors.sex}</div>}
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
