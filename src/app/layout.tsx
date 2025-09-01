"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/custom.css";
import "../styles/jquery-ui.css";
import "../styles/main-layout.css";
import "../styles/legacy-styles.css";
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
      <head>
        <link rel="icon" type="image/x-icon" href="/media/favicon/favicon.ico" />
        <link rel="stylesheet" href="/vendor/jquery/jquery-ui.min.css" />
        <link rel="stylesheet" href="/storage/css/style.css" />
      </head>
      <body className={bodyClassName}>
        <SupabaseProvider>
          <div className="main">
            <Toaster position="top-center" />
            <TemplateHeader page={pageClass} menu={menuActive} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            {/* The original .source template omits the footer on registration and login pages */}
            {pathname !== '/auth/register' && pathname !== '/auth/login' && <TemplateFooter />}
          </div>
        </SupabaseProvider>
            {/* Legacy vendor scripts copied from .source to public/vendor and public/storage */}
            <script src="/vendor/jquery/jquery.min.js"></script>
            <script src="/vendor/jquery/jquery-ui.min.js"></script>
            <script src="/storage/js/app.js"></script>
      </body>
    </html>
  );
};

export default RootLayout;
