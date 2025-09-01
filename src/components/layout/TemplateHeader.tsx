"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TemplateHeaderProps {
  page?: string;
  menu?: string;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({ page, menu }) => {
  const pathname = usePathname();

  const headerClassName = `header${page === 'page-hp' ? ' margin' : ''}`;

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
                  <a href="#" title="Co je Let's Chat">Co je Let's&nbsp;Chat</a>
                </li>
                <li>
                  <span className="icon menu icon-login"></span>
                  <a href="/auth/login" title="Přihlásit" className={menu === 'login' || pathname === '/auth/login' ? 'active' : ''}>Přihlásit</a>
                </li>
                <li>
                  <span className="icon menu icon-register"></span>
                  <a href="/auth/register" title="Registrace" className={menu === 'registration' || pathname === '/auth/register' ? 'active' : ''}>Registrace</a>
                </li>
              </ul>
              <a id="menu-burger" href="#" className="burger">
                <img src="/media/icon/menu.svg" alt="Menu" title="Menu" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div id="menu-box">
        <a href="#" className="close">
          <img src="/media/icon/close.svg" alt="Zavřít" title="Zavřít" />
        </a>

        <ul>
          <li>
            <span className="icon menu icon-about"></span>
            <a href="#" title="Co je Let's Chat">Co je Let's&nbsp;Chat</a>
          </li>
          <li>
            <span className="icon menu icon-login"></span>
            <a href="/auth/login" title="Přihlásit" className={menu === 'login' || pathname === '/auth/login' ? 'active' : ''}>Přihlásit</a>
          </li>
          <li>
            <span className="icon menu icon-register"></span>
            <a href="/auth/register" title="Registrace" className={menu === 'registration' || pathname === '/auth/register' ? 'active' : ''}>Registrace</a>
          </li>
        </ul>

      </div>
    </>
  );
};

export default TemplateHeader;