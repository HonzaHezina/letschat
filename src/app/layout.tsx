"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/custom.css";
import "../styles/jquery-ui.css";
import "../styles/main-layout.css";
import "../styles/legacy-styles.css";
import "../styles/template-styles.css";
import { SupabaseProvider } from "@/contexts/SupabaseProvider";
import { Toaster } from 'react-hot-toast';
import TemplateHeader from "@/components/layout/TemplateHeader";
import TemplateFooter from "@/components/layout/TemplateFooter";
import { usePathname } from 'next/navigation';

interface RootLayoutProps {
  children: React.ReactNode;
}

const inter = Inter({ subsets: ["latin"] });

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  let pageClass = '';
  let menuActive = '';

  if (pathname === '/') {
    pageClass = 'page-hp';
    menuActive = '';
  } else if (pathname === '/auth/register') {
    pageClass = 'page-left-image';
    menuActive = 'registration';
  } else if (pathname === '/auth/login') {
    pageClass = 'page-left-image';
    menuActive = 'login';
  } else if (pathname === '/dashboard') {
    pageClass = 'page-full';
    menuActive = 'chats';
  } else if (pathname.startsWith('/chat')) {
    pageClass = 'page-left-right';
    menuActive = 'chat';
  } else if (pathname === '/profile') {
    pageClass = 'page-full';
    menuActive = 'profile';
  }

  const bodyClassName = `${inter.className} ${pageClass === 'page-hp' ? 'image' : ''}`;

  return (
    <html lang="cs">
      <body className={bodyClassName}>
        <SupabaseProvider>
          <div className="main">
            <Toaster position="top-center" />
            <TemplateHeader page={pageClass} menu={menuActive} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <TemplateFooter />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
};

export default RootLayout;
