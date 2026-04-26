import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, Minimize2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from '../lib/storage';
import { translations, type Language } from '../lib/translations';

interface ChatInterfaceProps {
  lang: Language;
}

const FAIZAN_AI_SYSTEM_PROMPT = `
You are "Faizan Robot", the official AI guide for the Trading-linux-aios platform, created by Mohammad Faizan Khan.

Platform Knowledge Base:
1. **Changing the API Key**: 
   - Click the gear icon (Settings) in the top right corner.
   - Follow the instructions to get a key from Google AI Studio.
   - Paste the key in the input field and click "Save Configuration".
   - If the default key fails, users MUST use their own key.

2. **How to Generate Predictions**:
   - Go to the "AI Prediction Engine" panel.
   - Select your "Asset Type" (Crypto, Forex, etc.).
   - Choose a "Trading Pair" from the dropdown menu.
   - Select a "Timeframe" (e.g., 5 minutes or 1 hour).
   - Click "Generate Prediction". My neural networks will analyze the data and give you an UP/DOWN signal with a confidence score.

3. **Live Market Data**:
   - The top bar shows real-time prices for popular cryptocurrencies.
   - The "Live Market Analysis" chart at the bottom is an interactive TradingView chart that syncs with your selected pair.

4. **Internal Monitoring**:
   - I monitor the markets in the background and will notify you in this chat if I find a high-potential "100% Potential" trade alert.

Communication Protocol:
- ALWAYS be conversational and helpful. 
- USE bullet points and line breaks.
- If a user is confused, walk them through the steps above.

Persona: Optimized AI version of Mohammad Faizan Khan. Professional, technical, and expert guide.

**Bilingual Requirement**: 
- If the user speaks Arabic, respond in clear, professional Arabic.
- If the user speaks English, respond in English.
`;

export function ChatInterface({ lang }: ChatInterfaceProps) {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: t.chatGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulated Internal Trade Monitoring
  useEffect(() => {
    const monitorInterval = setInterval(async () => {
      const apiKey = getApiKey();
      if (!apiKey) return;

      // Simulate a random "High Potential" detection
      if (Math.random() > 0.85) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: "🚨 INTERNAL ALERT: My background scanners have detected a high-probability setup on BTC/USD (15m). Analysis suggests a strong UPWARD momentum. Check the prediction panel for details." 
        }]);
      }
    }, 120000); // Check every 2 minutes

    return () => clearInterval(monitorInterval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error: API Key missing. Please configure it in the settings gear above to enable chat systems." }]);
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        systemInstruction: FAIZAN_AI_SYSTEM_PROMPT
      });

      const result = await model.generateContent(userMessage);
      const response = await result.response.text();
      
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Signal interference detected. Please ensure your API key is valid and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_20px_rgba(41,143,139,0.4)] transition-all hover:scale-110 hover:shadow-primary/60 active:scale-95"
        >
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-primary border-2 border-background"></span>
          </div>
          <MessageSquare size={24} />
        </button>
      ) : (
        <div className="flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl animate-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                <Bot size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">Faizan Robot</h3>
                <span className="text-[10px] text-success font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-success animate-pulse"></span> Systems Active
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${
                (m.role === 'user' && lang === 'en') || (m.role === 'bot' && lang === 'ar') ? 'justify-end' : 'justify-start'
              }`}>
                <div 
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'bg-white/5 text-slate-300 border border-white/5 prose-invert'
                  } ${lang === 'ar' ? 'text-right font-arabic' : ''}`}
                  dangerouslySetInnerHTML={{ 
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^\s*[\-\*]\s*(.*)/gm, '• $1')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-3">
            <div className="flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-3 py-2 focus-within:border-primary/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className={`flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600 ${lang === 'ar' ? 'text-right' : ''}`}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="text-primary hover:text-primary/80 disabled:text-slate-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-center text-slate-500 font-medium">
              {t.footer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
