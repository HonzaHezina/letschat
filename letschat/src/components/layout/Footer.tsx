import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Let's Chat. Vsaď na jednu kartu.</p>
        </div>
        <div className="flex mt-4 md:mt-0">
          <Link href="https://www.letschat.zone" target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm text-gray-300 hover:text-white">
            www.letschat.zone
          </Link>
          {/* Add other footer links if necessary */}
        </div>
      </div>
    </footer>
  );
}
