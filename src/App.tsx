import { useState, useEffect } from 'react';
import { Settings, ExternalLink, Activity, Languages } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { LiveMarket } from './components/LiveMarket';
import { PredictionPanel } from './components/PredictionPanel';
import { HistoryTable } from './components/HistoryTable';
import { TradingChart } from './components/TradingChart';
import { ChatInterface } from './components/ChatInterface';
import { getHistory, clearHistory } from './lib/storage';
import { translations, type Language } from './lib/translations';
import type { PredictionHistoryItem } from './lib/storage';

const POPULAR_PAIRS: Record<string, string[]> = {
  'Crypto': ['BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD'],
  'Forex': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'],
  'Stocks': ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'GOOGL', 'MSFT', 'META', 'NFLX'],
  'Binary Options': ['BTC/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'ETH/USD']
};

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  
  const [assetType, setAssetType] = useState('Crypto');
  const [pair, setPair] = useState(POPULAR_PAIRS['Crypto'][0]);

  const t = translations[lang];

  useEffect(() => {
    setHistory(getHistory());
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  const handleNewPrediction = () => {
    setHistory(getHistory());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className={`min-h-screen pb-20 scanline relative overflow-hidden ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-bounce [animation-duration:10s]"></div>
        <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-primary/10 rounded-full blur-[80px] animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-36 transition-all">
            <div className="flex items-center gap-3 md:gap-8">
              <img 
                src="/logo.png" 
                alt="Trading-linux-aios Logo" 
                className="w-12 h-12 md:w-28 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(41,143,139,0.7)]"
              />
              <span className="font-black text-xl md:text-4xl tracking-tight text-white">
                Trading<span className="text-primary">-linux-aios</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={toggleLang}
                className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 md:px-4 py-2 rounded-full transition-all border border-white/5 hover:border-white/20"
              >
                <Languages size={14} /> {lang === 'en' ? 'Arabic' : 'English'}
              </button>
              <a 
                href="https://khan.linux-aios.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 md:px-4 py-2 rounded-full transition-all border border-white/5 hover:border-white/20"
              >
                {t.portfolio} <ExternalLink size={14} />
              </a>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 md:p-2.5 text-slate-400 hover:text-primary transition-colors bg-white/5 hover:bg-primary/10 rounded-full border border-white/5"
                title={t.settings}
              >
                <Settings size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10">
        {/* Hero */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-6xl font-black text-white mb-3 md:mb-4 tracking-tighter uppercase font-orbitron">
            {t.title}
          </h1>
          <p className="text-sm md:text-xl text-slate-400 font-bold max-w-2xl mx-auto tracking-wide">
            {t.subtitle}
          </p>
          <div className="mt-6 md:mt-8 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">
            <Activity size={16} /> {t.neuralNetwork}
          </div>
        </div>

        <LiveMarket lang={lang} />
        
        <PredictionPanel 
          onNewPrediction={handleNewPrediction} 
          assetType={assetType}
          setAssetType={setAssetType}
          pair={pair}
          setPair={setPair}
          popularPairs={POPULAR_PAIRS}
          lang={lang}
        />

        <TradingChart pair={pair} />
        
        <HistoryTable history={history} onClear={handleClearHistory} lang={lang} />

      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} lang={lang} />
      <ChatInterface lang={lang} />
    </div>
  );
}

export default App;
