import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/custom.css";
import "@/styles/jquery-ui.css";
import "@/styles/main-layout.css";
import { SupabaseProvider } from "@/contexts/SupabaseProvider";
import { Toaster } from 'react-hot-toast';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Let's Chat",
  description: "Anonymní QR chat aplikace",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <SupabaseProvider>
          <div className="flex flex-col min-h-screen">
            <Toaster position="top-center" />
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
