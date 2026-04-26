import { useEffect, useRef } from 'react';

interface TradingChartProps {
  pair: string;
}

export function TradingChart({ pair }: TradingChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clean up previous widget
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // Map our pairs to TradingView symbols
    // e.g. BTC/USD -> BINANCE:BTCUSDT
    // EUR/USD -> FX:EURUSD
    // AAPL -> NASDAQ:AAPL
    let symbol = pair.replace('/', '');
    if (pair.includes('/')) {
      if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE'].includes(pair.split('/')[0])) {
        symbol = `BINANCE:${symbol}T`;
      } else {
        symbol = `FX:${symbol}`;
      }
    } else {
      symbol = `NASDAQ:${symbol}`;
    }

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    container.current.appendChild(script);
  }, [pair]);

  return (
    <div className="glass rounded-2xl overflow-hidden mt-8 h-[500px] w-full border border-white/5">
      <div className="bg-white/5 border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live Market Analysis: {pair}
        </h3>
      </div>
      <div className="w-full h-full pb-10" ref={container}>
        <div className="tradingview-widget-container__widget w-full h-full"></div>
      </div>
    </div>
  );
}
