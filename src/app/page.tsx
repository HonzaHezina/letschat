"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [chatCode, setChatCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatCode.trim()) {
      toast.error("Zadejte kód chatu.");
      return;
    }
    setIsLoading(true);
    router.push(`/join/${chatCode.toUpperCase()}`);
  };

  return (
    <>
      <div className="frame">
        <div className="box2">
          <div className="item" style={{ backgroundImage: "url('/media/promo/chat-woman.webp')" }}>
            <div className="bottom">
              <img src="/media/box2/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Chci Let&apos;s&nbsp;Chatku</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis porttitor metus at tempus. Quisque dictum sem tellus, eu hendrerit libero malesuada suscipit.</p>
                <p>In sit amet neque.</p>
              </div>
              <a href="#chci-letschatku" className="arrow scroll" title="Chci Let's Chatku"></a>
            </div>
          </div>

          <div className="item" style={{ backgroundImage: "url('/media/promo/chat-man.webp')" }}>
            <div className="bottom">
              <img src="/media/box2/wave-yellow.svg" className="wave" alt="Let'sChat" />
              <div className="content yellow">
                <h2>Už mám Let&apos;s&nbsp;Chatku</h2>
                <p>Integer a magna sed nisl consectetur ullamcorper semper pretium lacus vitae euismod vel mi.</p>
                <div className="container input">
                  <form id="form-code" onSubmit={handleJoinChat} className="form">
                    <input name="code" type="text" value={chatCode} onChange={(e) => setChatCode(e.target.value)} maxLength={5} placeholder="Zadej kód pro vstup" />
                    <input type="submit" value="Vstoupit" disabled={isLoading} />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="frame">
        <div id="chci-letschatku" className="box4">
          <Link href="/dashboard" className="item" style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Let&apos;s&nbsp;Chatku si&nbsp;vytisknu sám</h2>
              </div>
              <div className="plus"></div>
            </div>
          </Link>
          <Link href="/dashboard" className="item" style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Chci si&nbsp;objednat profi Let&apos;s&nbsp;Chatku</h2>
              </div>
              <div className="plus"></div>
            </div>
          </Link>
          <Link href="/dashboard" className="item" style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <h2>Chci pouze kód pro seznámení</h2>
              </div>
              <div className="plus"></div>
            </div>
          </Link>
          <a href="#" className="item disabled" style={{ backgroundImage: "url('https://placehold.co/300x700/webp')" }}>
            <div className="bottom">
              <img src="/media/box4/wave.svg" className="wave" alt="Let'sChat" />
              <div className="content">
                <div className="disabled">Připravujeme</div>
                <h2>Chci udělat dojem s&nbsp;Let&apos;s&nbsp;Chatku</h2>
              </div>
              <div className="plus"></div>
            </div>
          </a>
        </div>
      </div>

      <div className="frame">
        <div className="promo">
          <h2>Co je to Let&apos;s&nbsp;Chatka a&nbsp;k&nbsp;čemu slouží?</h2>
          <a href="#" className="arrow" title="Co je to Let's Chatka a k čemu slouží?"></a>
          <img src="/media/promo/cards.webp" className="cards" alt="Co je to Let's Chatka a k čemu slouží" />
        </div>
      </div>
    </>
  );
}
