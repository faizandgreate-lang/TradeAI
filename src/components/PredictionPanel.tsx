import { useState, useEffect } from 'react';
import { Bot, Target, Clock, ArrowRight, Zap, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { generatePrediction } from '../lib/gemini';
import { addHistoryItem, getApiKey } from '../lib/storage';
import { fetchTopCryptoMarkets } from '../lib/coingecko';
import { translations, type Language } from '../lib/translations';
import type { MarketData } from '../lib/coingecko';

interface PredictionResult {
  direction: 'UP' | 'DOWN';
  confidence: number;
  reasoning: string;
}

const TIMEFRAMES = ['1 minute', '2 minutes', '5 minutes', '15 minutes', '30 minutes', '1 hour'];
const ASSET_TYPES = ['Crypto', 'Forex', 'Stocks', 'Binary Options'];

interface PredictionPanelProps {
  onNewPrediction: () => void;
  assetType: string;
  setAssetType: (type: string) => void;
  pair: string;
  setPair: (pair: string) => void;
  popularPairs: Record<string, string[]>;
  lang: Language;
}

export function PredictionPanel({ 
  onNewPrediction, 
  assetType, 
  setAssetType, 
  pair, 
  setPair,
  popularPairs,
  lang
}: PredictionPanelProps) {
  const t = translations[lang];
  const [timeframe, setTimeframe] = useState('5 minutes');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  const [marketData, setMarketData] = useState<MarketData[]>([]);

  useEffect(() => {
    fetchTopCryptoMarkets().then(setMarketData);
  }, []);

  const handlePredict = async () => {
    if (!getApiKey()) {
      setError('Please configure your Google Gemini API Key in the settings first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Find current market data if it's crypto
      const currentAsset = marketData.find(m => 
        pair.toLowerCase().includes(m.symbol.toLowerCase()) || 
        m.symbol.toLowerCase() === pair.split('/')[0].toLowerCase()
      );

      const prediction = await generatePrediction(
        assetType,
        pair,
        timeframe,
        currentAsset?.current_price,
        currentAsset?.price_change_percentage_24h
      );

      setResult(prediction);
      
      addHistoryItem({
        assetType,
        pair,
        timeframe,
        direction: prediction.direction,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning
      });
      
      onNewPrediction();
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while predicting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden relative">
      <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="text-primary" /> {t.predictionEngine}
        </h2>
        <div className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Zap size={14} className="animate-pulse" /> Gemini 2.5 Active
        </div>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6 md:space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Target size={14} /> {t.assetType}
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
              {ASSET_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setAssetType(type)}
                  className={`py-3 md:py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
                    assetType === type 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Target size={14} /> {t.tradingPair}
            </label>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-primary transition-all font-mono appearance-none"
            >
              {popularPairs[assetType].map(p => (
                <option key={p} value={p} className="bg-[#0B0E14]">{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock size={14} /> {t.timeframe}
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-primary transition-all font-mono appearance-none"
            >
              {TIMEFRAMES.map(t => <option key={t} value={t} className="bg-[#0B0E14]">{t}</option>)}
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading 
                ? 'bg-primary/50 text-white/50 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-primary/20 hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <><Zap className="animate-spin" size={20} /> {t.analyzing}</>
            ) : (
              <>{t.generate} <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} /></>
            )}
          </button>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result Area */}
        <div className="bg-black/40 rounded-xl border border-white/5 p-6 flex flex-col justify-center min-h-[300px]">
          {!result && !loading && (
            <div className="text-center text-slate-500 flex flex-col items-center">
              <Bot size={48} className="mb-4 opacity-50" />
              <p>Configure your parameters and click predict to get AI analysis.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-b-2 border-primary/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot size={24} className="text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-primary font-mono animate-pulse">Processing data streams...</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="text-center mb-6">
                <div className="text-sm font-bold text-slate-400 mb-2">{pair} • {timeframe}</div>
                <div className={`text-6xl font-black mb-2 flex items-center justify-center gap-4 ${
                  result.direction === 'UP' ? 'text-success' : 'text-danger'
                }`}>
                  {result.direction === 'UP' ? <TrendingUp size={48} /> : <TrendingDown size={48} />}
                  {result.direction}
                </div>
                <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1 text-sm font-mono text-slate-300">
                  {t.confidence}: <span className={result.confidence > 80 ? 'text-primary font-bold' : ''}>{result.confidence}%</span>
                </div>
              </div>
              
              <div className="mt-auto bg-white/5 rounded-lg p-4 text-sm text-slate-300 leading-relaxed border-l-4 border-primary">
                <strong className="text-white block mb-1">{t.reasoning}:</strong>
                {result.reasoning}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
