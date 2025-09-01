import React from 'react';

interface ChatMessagesProps {
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    date: string;
    image?: string;
  }>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <div className="box">
      <div className="title">
        <span>Na poli u&nbsp;Třebíče</span>
        <a href="#" className="settings" title="Nastavení"></a>
        <ul className="settings">
          <li><a href="#" title="Profil"><span className="icon chat icon-profile"></span>Profil</a></li>
          <li><a href="#" title="Změnit název chatu"><span className="icon chat icon-edit"></span>Změnit název chatu</a></li>
          <li><a href="#" title="Smazat chat"><span className="icon chat icon-delete"></span>Smazat chat</a></li>
        </ul>
      </div>
      <div className="messages">
        <div className="bubbles">
          {messages.map((message) => {
            // Map sender to .source template bubble sides. Assumption: sender === 'me' means current user.
            const isCurrent = message.sender === 'me';
            const bubbleClass = isCurrent ? 'bubble pageb' : 'bubble pagea';
            const imageUrl = message.image ? message.image : `/media/custom/${message.sender}.webp`;
            return (
              <div key={message.id} className={bubbleClass}>
                <div className="image" data-background={imageUrl}></div>
                <div className="text">
                  <div className="date">{message.date}</div>
                  {message.image ? (
                    <div className="image"><img src={message.image} alt="Chat image" /></div>
                  ) : (
                    <span>{message.text}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="tool">
        <form id="form-chat-message" action="#" method="post" className="form">
          <input type="hidden" name="id" value="2" />
          <input name="message" type="text" defaultValue="" maxLength={2048} placeholder="Napište zprávu ..." />
          <input type="submit" value="" />
        </form>
        <a href="#" id="chat-camera" className="camera"></a>
        <a href="#" id="chat-image" className="image"></a>
      </div>
    </div>
  );
};

export default ChatMessages;