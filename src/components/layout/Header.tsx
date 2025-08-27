"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
    // Add any props you need for the Header component
}

const Header: React.FC<HeaderProps> = () => {
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

  const closeMenu = () => setMenuOpen(false);

  const headerClassName = `header ${pathname === '/' ? 'margin' : ''}`;

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
                {user ? (
                  <>
                    <li className="logged">
                      <span className="icon menu icon-chats"></span>
                      <Link href="/dashboard" title="Moje Let's Chatky" className={pathname === '/dashboard' ? 'active' : ''}>
                        Moje Let's&nbsp;Chatky
                      </Link>
                    </li>
                    <li className="logged">
                      <span className="icon menu icon-profile"></span>
                      <Link href="#" title="Můj profil">
                        Můj profil
                      </Link>
                    </li>
                    <li className="wave"></li>
                    <li>
                      <span className="icon menu icon-help"></span>
                      <Link href="#" title="Pomoc">Pomoc</Link>
                    </li>
                    <li>
                      <span className="icon menu icon-logout"></span>
                      <a href="#" title="Odhlášení" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Odhlášení</a>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <span className="icon menu icon-help"></span>
                      <Link href="#" title="Pomoc">Pomoc</Link>
                    </li>
                    <li>
                      <span className="icon menu icon-login"></span>
                      <Link href="/auth/login" title="Přihlášení" className={pathname === '/auth/login' ? 'active' : ''}>Přihlášení</Link>
                    </li>
                  </>
                )}
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
            {user ? (
              <>
                <li className="logged">
                  <span className="icon menu icon-chats"></span>
                  <Link href="/dashboard" title="Moje Let's Chatky" className={pathname === '/dashboard' ? 'active' : ''} onClick={closeMenu}>
                    Moje Let's&nbsp;Chatky
                  </Link>
                </li>
                <li className="logged">
                  <span className="icon menu icon-profile"></span>
                  <Link href="#" title="Můj profil" onClick={closeMenu}>
                    Můj profil
                  </Link>
                </li>
                <li>
                  <span className="icon menu icon-help"></span>
                  <Link href="#" title="Pomoc" onClick={closeMenu}>Pomoc</Link>
                </li>
                <li>
                  <span className="icon menu icon-logout"></span>
                  <a href="#" title="Odhlášení" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Odhlášení</a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <span className="icon menu icon-help"></span>
                  <Link href="#" title="Pomoc" onClick={closeMenu}>Pomoc</Link>
                </li>
                <li>
                  <span className="icon menu icon-login"></span>
                  <Link href="/auth/login" title="Přihlášení" className={pathname === '/auth/login' ? 'active' : ''} onClick={closeMenu}>Přihlášení</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Header;
