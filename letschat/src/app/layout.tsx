import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Example font
import "./globals.css";
import { SupabaseProvider } from "@/contexts/SupabaseProvider";
import { Toaster } from "react-hot-toast"; // Import Toaster

const inter = Inter({ subsets: ["latin"] }); // Example font initialization

export const metadata: Metadata = {
  title: "LetsChat",
  description: "Anonymous QR chat application for real-time, private conversations.",
  manifest: "/manifest.json", // For PWA
  themeColor: "#1E3A8A", // Example theme color matching primary
  icons: { // Icons for PWA and browser tabs
    apple: "/icons/icon-192x192.png",
    icon: "/icons/icon-72x72.png", // A smaller icon for general use
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs"> {/* Changed lang to Czech "cs" */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SupabaseProvider>
          <header className="bg-primary text-white p-4 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">LetsChat</h1>
            </div>
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-100 text-gray-700 p-4 text-center text-sm">
            © {new Date().getFullYear()} LetsChat - Anonymní & Dočasný Chat
          </footer>
          <Toaster position="top-center" reverseOrder={false} /> {/* Add Toaster component */}
        </SupabaseProvider>
      </body>
    </html>
  );
}
