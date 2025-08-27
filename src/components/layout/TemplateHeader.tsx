"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TemplateHeaderProps {
  page?: string;
  menu?: string;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({ page, menu }) => {
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const headerClassName = `header ${page === 'page-hp' ? ' margin' : ''}`;

  const closeMenu = () => setMenuOpen(false);

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
                <li>
                  <span className="icon menu icon-about"></span>
                  <Link href="#" title="Co je Let's Chat">Co je Let's&nbsp;Chat</Link>
                </li>
                <li>
                  <span className="icon menu icon-login"></span>
                  <Link href="/auth/login" title="Přihlásit" className={menu === 'login' || pathname === '/auth/login' ? 'active' : ''}>Přihlásit</Link>
                </li>
                <li>
                  <span className="icon menu icon-register"></span>
                  <Link href="/auth/register" title="Registrace" className={menu === 'registration' || pathname === '/auth/register' ? 'active' : ''}>Registrace</Link>
                </li>
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
            <li>
              <span className="icon menu icon-about"></span>
              <Link href="#" title="Co je Let's Chat" onClick={closeMenu}>Co je Let's&nbsp;Chat</Link>
            </li>
            <li>
              <span className="icon menu icon-login"></span>
              <Link href="/auth/login" title="Přihlásit" className={menu === 'login' || pathname === '/auth/login' ? 'active' : ''} onClick={closeMenu}>Přihlásit</Link>
            </li>
            <li>
              <span className="icon menu icon-register"></span>
              <Link href="/auth/register" title="Registrace" className={menu === 'registration' || pathname === '/auth/register' ? 'active' : ''} onClick={closeMenu}>Registrace</Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default TemplateHeader;