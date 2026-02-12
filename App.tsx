
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, VideoPlatform, VideoMetadata } from './types';
import { fetchVideoMetadataWithAI } from './services/geminiService';

declare global {
  interface Window {
    Telegram: any;
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Mini App ranglarini Telegram mavzusiga moslash
      if (tg.themeParams.bg_color) {
        document.body.style.backgroundColor = tg.themeParams.bg_color;
      }
    }

    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: "Salom! Men SnapMedia AI botiman. 🤖\n\nYouTube yoki Instagram havolasini yuboring. Men uni tahlil qilaman va haqiqiy faylni yuklab beraman.",
        timestamp: Date.now()
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const handleSend = async (text: string) => {
    const url = text.trim();
    if (!url) return;

    const isUrl = url.match(/https?:\/\/[^\s]+/);
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: url, timestamp: Date.now() }]);
    setInputValue('');
    setIsBotTyping(true);

    if (isUrl) {
      try {
        const metadata = await fetchVideoMetadataWithAI(url);
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'bot',
          videoData: metadata,
          timestamp: Date.now()
        }]);
      } catch (e) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'bot',
          text: "❌ Havolani tahlil qilib bo'lmadi.",
          timestamp: Date.now()
        }]);
      }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        text: "Iltimos, to'g'ri havola yuboring.",
        timestamp: Date.now()
      }]);
    }
    setIsBotTyping(false);
  };

  /**
   * BU MUHIM: Ma'lumotni Telegram Botga (Python backend) yuborish
   */
  const sendToBot = (video: VideoMetadata, format: 'mp4' | 'mp3') => {
    if (!tg) {
      alert("Faqat Telegram ichida ishlaydi!");
      return;
    }

    // Python backend qabul qiladigan JSON ma'lumot
    const data = {
      action: 'download',
      url: video.url,
      format: format,
      title: video.title
    };

    // Telegramga ma'lumotni yuboramiz va Mini Appni yopamiz
    tg.sendData(JSON.stringify(data));
    
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    
    // Foydalanuvchiga bildirishnoma
    tg.showConfirm("So'rovingiz qabul qilindi! Bot hozir sizga faylni yuboradi.", (ok: boolean) => {
      if (ok) tg.close();
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-[#0e1621] relative overflow-hidden font-sans">
      <header className="bg-[#17212b] px-4 py-3 flex items-center border-b border-black/20 shadow-lg z-30">
        <div className="w-10 h-10 rounded-full bg-[#2481cc] flex items-center justify-center mr-3 border border-white/10">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-[15px] text-white">SnapMedia AI</h1>
          <p className="text-[11px] text-[#4ea4f6] font-bold">Python Backend Ready</p>
        </div>
        <button onClick={() => tg?.close()} className="p-2 text-[#708499]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5}/></svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4 tg-chat-bg hide-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.videoData ? (
              <div className="message-bubble message-in shadow-xl overflow-hidden border border-white/5 w-full max-w-[280px]">
                <div className="relative">
                  <img src={msg.videoData.thumbnail} className="w-full aspect-video object-cover" alt="" />
                </div>
                <div className="p-4 bg-[#182533]">
                  <h3 className="font-bold text-[14px] text-white mb-2 line-clamp-2">{msg.videoData.title}</h3>
                  <p className="text-[11px] text-slate-400 mb-4 italic">"{msg.videoData.aiSummary}"</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => sendToBot(msg.videoData!, 'mp4')} 
                      className="w-full bg-[#2481cc] text-white text-[13px] font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
                    >
                      <span>Botga yuborish (MP4)</span>
                    </button>
                    <button 
                      onClick={() => sendToBot(msg.videoData!, 'mp3')} 
                      className="w-full bg-[#1c2936] text-[#4ea4f6] text-[13px] font-bold py-3 rounded-xl border border-white/5"
                    >
                      MP3 Sifatida yuklash
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`message-bubble p-3 shadow-md ${msg.type === 'user' ? 'message-out' : 'message-in'}`}>
                <p className="text-[14px] text-white leading-relaxed font-medium">{msg.text}</p>
              </div>
            )}
          </div>
        ))}
        {isBotTyping && <div className="text-[10px] text-blue-400 ml-4 animate-pulse">AI o'ylamoqda...</div>}
      </div>

      <div className="bg-[#17212b] p-3 border-t border-black/20 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="flex items-center space-x-2">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            placeholder="Havolani kiriting..."
            className="flex-1 bg-[#0e1621] rounded-2xl px-4 py-3 outline-none text-white placeholder-slate-600 border border-white/5"
          />
          <button 
            onClick={() => handleSend(inputValue)}
            className="w-12 h-12 rounded-full bg-[#2481cc] text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
