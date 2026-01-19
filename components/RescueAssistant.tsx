
import React, { useState, useRef, useEffect } from 'react';
import { createRescueAssistant } from '../services/geminiService';
import { ChatMessage, TriageCategory } from '../types';

interface Props {
  onBack: () => void;
}

const STORAGE_KEY = 'wildretter_rescue_chat_history';

export const RescueAssistant: React.FC<Props> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<TriageCategory | null>(null);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Initialize history from localStorage
  useEffect(() => {
    if (isInitialized.current) return;

    const savedHistory = localStorage.getItem(STORAGE_KEY);
    let initialMessages: ChatMessage[] = [];
    
    if (savedHistory) {
      try {
        initialMessages = JSON.parse(savedHistory);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }

    if (initialMessages.length === 0) {
      initialMessages = [
        { role: 'model', text: 'Hallo! Ich bin dein WildRetter Assistent. Beschreibe mir bitte das Tier und was passiert ist. Wo befindest du dich?' }
      ];
    }

    setMessages(initialMessages);
    chatRef.current = createRescueAssistant(initialMessages);
    isInitialized.current = true;
  }, []);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      let text = response.text || 'Entschuldigung, ich konnte dich nicht verstehen.';
      
      // Category detection from tags
      if (text.includes('[CATEGORY:POLICE]')) {
        setDetectedCategory('POLICE');
        text = text.replace('[CATEGORY:POLICE]', '').trim();
      } else if (text.includes('[CATEGORY:SHELTER]')) {
        setDetectedCategory('SHELTER');
        text = text.replace('[CATEGORY:SHELTER]', '').trim();
      }

      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'model', text: 'Verbindungsfehler. Bitte versuche es erneut.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Möchtest du den gesamten Gesprächsverlauf löschen?")) {
      localStorage.removeItem(STORAGE_KEY);
      const welcome = { role: 'model' as const, text: 'Hallo! Ich bin dein WildRetter Assistent. Beschreibe mir bitte das Tier und was passiert ist. Wo befindest du dich?' };
      setMessages([welcome]);
      setDetectedCategory(null);
      chatRef.current = createRescueAssistant([]);
    }
  };

  const isPolice = detectedCategory === 'POLICE';
  const themeHex = isPolice ? '#ef4444' : '#52b788';
  const themeBorder = isPolice ? 'border-red-500/20' : 'border-[#52b788]/20';
  const themeBg = isPolice ? 'bg-red-500' : 'bg-[#52b788]';
  const themeBgMuted = isPolice ? 'bg-red-950/40' : 'bg-[#1b4332]/40';

  return (
    <div className={`w-full max-w-lg mx-auto h-[80vh] flex flex-col glass-card rounded-[48px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-2 ${themeBorder} animate-in fade-in zoom-in duration-700 relative`}>
      {/* Decorative Background Glow */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 ${isPolice ? 'bg-red-500/10' : 'bg-[#52b788]/10'} blur-[80px] rounded-full pointer-events-none`}></div>

      {/* Header */}
      <div className={`${themeBgMuted} backdrop-blur-xl p-8 border-b ${themeBorder} flex items-center justify-between relative z-10`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 ${themeBg} rounded-3xl flex items-center justify-center text-[#061a14] shadow-xl shadow-black/20 rotate-3 transition-colors duration-500`}>
            <i className={`fas ${isPolice ? 'fa-shield-halved' : 'fa-headset'} text-2xl`}></i>
          </div>
          <div>
            <h3 className="font-black text-white text-lg uppercase tracking-tight leading-none mb-1">Rescue Agent</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 ${isPolice ? 'bg-red-500' : 'bg-[#52b788]'} rounded-full animate-pulse transition-colors duration-500`}></span>
              <p className={`text-[10px] ${isPolice ? 'text-red-400' : 'text-[#52b788]'} font-black uppercase tracking-[0.2em] transition-colors duration-500`}>Live Support aktiv</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearHistory}
            title="Verlauf löschen"
            className="w-10 h-10 rounded-full hover:bg-red-500/10 transition-all flex items-center justify-center text-white/20 hover:text-red-500"
          >
            <i className="fas fa-trash-can text-sm"></i>
          </button>
          <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full hover:bg-white/10 transition-all flex items-center justify-center text-white/40 hover:text-white"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide relative z-10">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[88%] p-5 rounded-[32px] text-sm leading-relaxed shadow-lg ${
              m.role === 'user' 
              ? `${themeBg} text-[#061a14] font-bold rounded-tr-none border-b-4 ${isPolice ? 'border-red-900' : 'border-[#2d6a4f]'} transition-colors duration-500` 
              : 'bg-[#061a14]/60 text-[#d8f3dc] border border-white/5 rounded-tl-none backdrop-blur-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-[#061a14]/60 p-5 rounded-[24px] border border-white/5 rounded-tl-none flex gap-2">
              <span className={`w-2 h-2 ${isPolice ? 'bg-red-500' : 'bg-[#52b788]'} rounded-full animate-bounce transition-colors duration-500`}></span>
              <span className={`w-2 h-2 ${isPolice ? 'bg-red-500' : 'bg-[#52b788]'} rounded-full animate-bounce [animation-delay:0.2s] transition-colors duration-500`}></span>
              <span className={`w-2 h-2 ${isPolice ? 'bg-red-500' : 'bg-[#52b788]'} rounded-full animate-bounce [animation-delay:0.4s] transition-colors duration-500`}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 bg-[#061a14]/60 backdrop-blur-2xl border-t border-white/5 relative z-10">
        <div className="relative flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Beschreibe die Situation..."
            className={`flex-1 bg-[#061a14]/80 border-2 ${isPolice ? 'border-red-500/20 focus:border-red-500' : 'border-[#52b788]/20 focus:border-[#52b788]'} rounded-[28px] py-5 px-7 text-sm text-white focus:border-opacity-100 outline-none transition-all placeholder:text-white/20 shadow-inner font-medium`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`w-16 h-16 ${themeBg} hover:opacity-90 disabled:bg-gray-700 rounded-[24px] flex items-center justify-center text-[#061a14] shadow-2xl shadow-black/20 active:scale-95 disabled:opacity-50 transition-all shrink-0`}
          >
            <i className="fas fa-paper-plane text-xl"></i>
          </button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <i className={`fas ${isPolice ? 'fa-shield-halved' : 'fa-user-shield'} ${isPolice ? 'text-red-500' : 'text-[#52b788]'} text-[10px]`}></i>
          <p className={`text-[9px] ${isPolice ? 'text-red-500/60' : 'text-[#52b788]/60'} font-black uppercase tracking-[0.3em]`}>
            Identität geschützt • Mission Erde Support
          </p>
        </div>
      </div>
    </div>
  );
};
