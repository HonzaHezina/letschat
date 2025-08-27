import React from 'react';
import Link from 'next/link';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
    return (
    <footer className="footer">
            <div className="content">
                <div className="logo">
                    <Link href="/">
            <img src="/media/custom/footer-logo.svg" alt="Let's Chat" title="Let's Chat" />
          </Link>
        </div>
                <nav>
                    <ul className="menu">
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/chat">Chat</Link></li>
                        <li><Link href="/dashboard">Dashboard</Link></li>
                        <li><Link href="/auth/login">Login</Link></li>
                    </ul>
                </nav>
                <div className="claim">www.letschat.zone<span>Vsaď na jednu kartu</span></div>
                <div className="copy">&copy; {new Date().getFullYear()}<br />Let's Chat</div>
      </div>
    </footer>
  );
};

export default Footer;
