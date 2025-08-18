import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="frame">
        <div className="content">
          <Link href="/" className="logo" title="Let's Chat">
            <img src="/media/custom/footer-logo.svg" alt="Let's Chat" title="Let's Chat" />
          </Link>
          <div className="claim">
            www.letschat.zone
            <span>Vsaď na jednu kartu</span>
          </div>
          <div className="copy">
            &copy; {new Date().getFullYear()}<br />
            Let&apos;s Chat
          </div>
        </div>
      </div>
    </footer>
  );
}
