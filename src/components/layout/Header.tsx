"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const supabase = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase?.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    }) ?? {};

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setMenuOpen(false);
  };

  const NavLink = ({ href, title, iconClass }: { href: string, title: string, iconClass: string }) => (
    <li>
      <span className={`icon menu ${iconClass}`}></span>
      <Link href={href} title={title} className={pathname === href ? 'active' : ''} onClick={() => setMenuOpen(false)}>
        {title}
      </Link>
    </li>
  );

  const AuthLinks = () => (
    <>
      {user ? (
        <>
          <NavLink href="/profile" title="Profil" iconClass="icon-profile" />
          <NavLink href="/chats" title="Moje Chaty" iconClass="icon-chats" />
          <li className="logged">
            <span className="icon menu icon-logout"></span>
            <a href="#" title="Odhlásit" onClick={handleLogout}>Odhlásit</a>
          </li>
        </>
      ) : (
        <>
          <NavLink href="/auth/login" title="Přihlásit" iconClass="icon-login" />
          <NavLink href="/auth/register" title="Registrace" iconClass="icon-register" />
        </>
      )}
    </>
  );


  return (
    <>
      <header className="header margin">
        <div className="frame">
          <div className="content">
            <Link href="/" className="logo" title="Let's Chat">
              <img src="/media/custom/header-logo.svg" alt="Let'sChat" title="Let's Chat" />
            </Link>
            <nav>
              <ul className="menu">
                <li className="wave"></li>
                <NavLink href="/#what-is-letschat" title="Co je Let's Chat" iconClass="icon-about" />
                {!loading && <AuthLinks />}
              </ul>
              <a id="menu-burger" href="#" className="burger" onClick={(e) => {e.preventDefault(); setMenuOpen(true)}}>
                <img src="/media/icon/menu.svg" alt="Menu" title="Menu" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div id="menu-box" style={{ display: 'block' }}>
          <a href="#" className="close" onClick={(e) => {e.preventDefault(); setMenuOpen(false)}}>
            <img src="/media/icon/close.svg" alt="Zavřít" title="Zavřít" />
          </a>
          <ul>
            <NavLink href="/#what-is-letschat" title="Co je Let's Chat" iconClass="icon-about" />
            {!loading && <AuthLinks />}
          </ul>
        </div>
      )}
    </>
  );
}
