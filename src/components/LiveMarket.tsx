import { useEffect, useState } from 'react';
import { fetchTopCryptoMarkets } from '../lib/coingecko';
import type { MarketData } from '../lib/coingecko';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function LiveMarket() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchTopCryptoMarkets();
      setMarkets(data);
      setLoading(false);
    };
    
    loadData();
    const interval = setInterval(loadData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 md:p-8 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity size={80} className="text-primary" />
      </div>
      
      <h3 className="text-lg md:text-xl font-black text-white mb-6 flex items-center gap-3 font-orbitron">
        <Activity className="text-primary animate-pulse" size={24} /> Live Neural Market Feed
      </h3>

      {markets.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-mono">
          <p>📡 Synchronizing with global data streams...</p>
          <p className="text-xs mt-2">Connecting to CoinGecko Neural Network</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {markets.slice(0, 5).map(market => {
            const isPositive = market.price_change_percentage_24h >= 0;
            return (
              <div key={market.id} className="bg-black/60 rounded-2xl p-4 md:p-6 border border-white/5 hover:border-primary/50 transition-all cursor-default robot-border">
                <div className="flex flex-col items-center gap-2 md:gap-4 mb-3 md:mb-4">
                  <img src={market.image} alt={market.name} className="w-10 h-10 md:w-16 md:h-16 rounded-full shadow-[0_0_15px_rgba(41,143,139,0.3)]" />
                  <div className="text-center">
                    <span className="font-black text-white block text-sm md:text-lg tracking-widest">{market.symbol.toUpperCase()}</span>
                    <span className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold">{market.name}</span>
                  </div>
                </div>
                <div className="text-lg md:text-2xl font-black font-mono text-white mb-2 text-center">
                  ${market.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs md:text-sm font-black flex items-center justify-center gap-1 py-1 rounded-full ${
                  isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(market.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
