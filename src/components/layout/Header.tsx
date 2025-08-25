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
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      {user ? (
        <>
          <li><Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Můj přehled</Link></li>
          <li><a href="#" onClick={handleLogout}>Odhlásit</a></li>
        </>
      ) : (
        <>
          <li><Link href="/auth/login" className={pathname === '/auth/login' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Přihlásit</Link></li>
          <li><Link href="/auth/register" className={pathname === '/auth/register' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Registrace</Link></li>
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
              <img src="/media/custom/header-logo.svg" alt="Let'sChat" />
            </Link>
            <nav>
              <ul className="menu">
                <NavLinks />
              </ul>
              <a id="menu-burger" href="#" className="burger" onClick={(e) => { e.preventDefault(); setMenuOpen(!isMenuOpen); }}>
                <img src="/media/icon/menu.svg" alt="Menu" />
              </a>
            </nav>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div id="menu-box" style={{ display: 'block' }}>
           <a href="#" className="close" onClick={(e) => {e.preventDefault(); setMenuOpen(false)}}>
            <img src="/media/icon/close.svg" alt="Zavřít" />
          </a>
          <ul>
            <NavLinks />
          </ul>
        </div>
      )}
    </>
  );
}
