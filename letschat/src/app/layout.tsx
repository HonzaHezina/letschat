import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/contexts/SupabaseProvider";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/stores/UserProvider"; // Assuming a UserProvider for Zustand initialization

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LetsChat",
  description: "Anonymní QR chat aplikace pro rychlé a dočasné konverzace.",
  manifest: "/manifest.json",
  themeColor: "#0D9488", // Updated to new primary color
  icons: {
    apple: "/icons/icon-192x192.png",
    icon: "/icons/icon-72x72.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-text-primary`}>
        {/* Wrap with UserProvider to ensure Zustand store is initialized */}
        <UserProvider>
          <SupabaseProvider>
            <header className="bg-primary text-white shadow-md">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <a href="/" className="text-2xl font-bold text-white"> {/* White text on dark primary */}
                      LetsChat
                    </a>
                  </div>
                  {/* Placeholder for potential menu or nav items if needed later */}
                  {/* <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      <a href="#" className="text-gray-300 hover:bg-primary-dark hover:text-white px-3 py-2 rounded-md text-sm font-medium">Menu Item</a>
                    </div>
                  </div> */}
                </div>
              </div>
            </header>

            <main className="flex-grow w-full container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            <footer className="bg-surface border-t border-border-color">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-text-secondary text-sm">
                © {new Date().getFullYear()} LetsChat - Anonymní & Dočasný Chat.
                {/* <p className="mt-1">Inspirováno designem letschat.zone</p> */}
              </div>
            </footer>
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                style: {
                  background: '#333', // Dark background for toasts
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981', // success color (green)
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444', // danger color (red)
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SupabaseProvider>
        </UserProvider>
      </body>
    </html>
  );
}
