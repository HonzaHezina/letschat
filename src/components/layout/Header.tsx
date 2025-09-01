"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabaseSafe } from '@/contexts/SupabaseProvider';
import { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
    // Add any props you need for the Header component
}

const Header: React.FC<HeaderProps> = () => {
  const supabase = useSupabaseSafe();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
    router.push('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const headerClassName = `header ${pathname === '/' ? 'margin' : ''}`;

  if (!supabase) {
    return <div className="flex justify-center items-center h-screen text-lg">Načítám chatovací klient...</div>;
  }
  return (
    <>
      <header className={headerClassName}>
        <div className="frame">
          <div className="content">
            <Link href="/" className="logo" title="Let's Chat">
              <img src="/media/custom/header-logo.svg" alt="Let'sChat" title="Let's Chat" />
            </Link>
            <nav>
              <ul className="menu">
                <li className="wave"></li>
                <li><span className="icon menu icon-about"></span><Link href="#" title="Co je Let's Chat">Co je Let's&nbsp;Chat</Link></li>
                <li><span className="icon menu icon-login"></span><Link href="/auth/login" title="Přihlásit" className={pathname === '/auth/login' ? 'active' : ''}>Přihlásit</Link></li>
                <li><span className="icon menu icon-register"></span><Link href="/auth/register" title="Registrace" className={pathname === '/auth/register' ? 'active' : ''}>Registrace</Link></li>
              </ul>
              <a id="menu-burger" href="#" className="burger" onClick={(e) => { e.preventDefault(); setMenuOpen(!isMenuOpen); }}>
                <img src="/media/icon/menu.svg" alt="Menu" title="Menu" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div id="menu-box" style={{ display: 'block' }}>
          <a href="#" className="close" onClick={(e) => { e.preventDefault(); closeMenu(); }}>
            <img src="/media/icon/close.svg" alt="Zavřít" title="Zavřít" />
          </a>
          <ul>
            <li><span className="icon menu icon-about"></span><Link href="#" title="Co je Let's Chat" onClick={closeMenu}>Co je Let's&nbsp;Chat</Link></li>
            <li><span className="icon menu icon-login"></span><Link href="/auth/login" title="Přihlásit" className={pathname === '/auth/login' ? 'active' : ''} onClick={closeMenu}>Přihlásit</Link></li>
            <li><span className="icon menu icon-register"></span><Link href="/auth/register" title="Registrace" className={pathname === '/auth/register' ? 'active' : ''} onClick={closeMenu}>Registrace</Link></li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Header;
