"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useAnonymousId } from '../hooks/useAnonymousId';
import QrScanner from '../components/QrScanner';

interface HomePageProps {
    // Add any props you need for the HomePage component
}

const HomePage: React.FC<HomePageProps> = () => {
  const router = useRouter();
  const [chatCode, setChatCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
    const [qrCode, setQrCode] = useState<string>('');
    const [error, setError] = useState<string>('');
    const anonymousId = useAnonymousId();

  const handleJoinChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatCode.trim()) {
      setFormError("Zadejte platný kód");
      return;
    }
    setIsLoading(true);
    router.push(`/join/${chatCode.toUpperCase()}`);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError('');
    setChatCode(e.target.value);
  }

    const handleScan = async (data: string | null) => {
        if (data) {
            setQrCode(data);
            try {
                const { data: chat, error } = await supabase
                    .from('chats')
                    .select('*')
                    .eq('qr_code', data)
                    .single();

                if (error) throw error;

                if (chat) {
                    router.push(`/chat/${chat.id}`);
                } else {
                    setError('Invalid QR code');
                }
            } catch (err) {
                setError('Error scanning QR code');
            }
        }
    };

    const handleError = (err: any) => {
        setError(err.message);
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
                  <form id="form-code" onSubmit={handleJoinChat} className="form" noValidate>
                    <input name="code" type="text" value={chatCode} onChange={handleCodeChange} maxLength={16} placeholder="Zadej kód pro vstup" />
                    <input type="submit" value="Vstoupit" disabled={isLoading} />
                  </form>
                  {formError && <div id="form-code-error" className="error" style={{display: 'block'}}>{formError}</div>}
                </div>
                                <div className="qr-scanner-container">
                                    <QrScanner onScan={handleScan} onError={handleError} />
                                    {error && <p className="error">{error}</p>}
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
};

export default HomePage;

