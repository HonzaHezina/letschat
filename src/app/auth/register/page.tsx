"use client";

import React, { useState } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

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
    if (!supabase) {
      toast.error('Supabase client is not available.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          gender: gender,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/auth/login');
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (!supabase) {
      toast.error('Supabase client is not available.');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Nová registrace</h1>

        <div className="space-y-4">
          <button onClick={() => handleSocialLogin('facebook')} className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />
            Registrovat se pomocí Facebooku
          </button>
          <button onClick={() => handleSocialLogin('google')} className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <FaGoogle className="w-5 h-5 mr-2 text-red-600" />
            Registrovat se pomocí Google
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2">
            <hr className="flex-grow border-gray-300" />
            <span className="text-gray-400">nebo</span>
            <hr className="flex-grow border-gray-300" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Jméno a přijmení</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Heslo</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-700">Heslo znovu</label>
            <input id="passwordConfirm" type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Pohlaví</span>
            <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                    <input type="radio" name="gender" value="woman" checked={gender === 'woman'} onChange={(e) => setGender(e.target.value)} className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" />
                    <span className="ml-2 text-sm text-gray-700">Žena</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="gender" value="man" checked={gender === 'man'} onChange={(e) => setGender(e.target.value)} className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" />
                    <span className="ml-2 text-sm text-gray-700">Muž</span>
                </label>
            </div>
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
              {loading ? 'Registrace...' : 'Registrovat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
