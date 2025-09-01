import React from 'react';
import Link from 'next/link';

interface TemplateFooterProps {}

const TemplateFooter: React.FC<TemplateFooterProps> = () => {
  return (
    <footer className="footer">
      <div className="frame">
        <div className="content">
            <a href="#" className="logo" title="Let's Chat"><img src="/media/custom/footer-logo.svg" alt="Let's Chat" title="Let's Chat" /></a>

            <div className="claim">www.letschat.zone<span>Vsaď na jednu kartu</span></div>
            <div className="copy">&copy; 2025<br/>Let's Chat</div>

        </div>
      </div>
    </footer>
  );
};

export default TemplateFooter;