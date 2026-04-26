import axios from 'axios';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface MarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export async function fetchTopCryptoMarkets(): Promise<MarketData[]> {
  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    console.warn('CoinGecko API limit reached or offline. Using neural fallback data.');
    // Mock data fallback
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 65432.10,
        price_change_percentage_24h: 2.45,
        market_cap: 1200000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3456.78,
        price_change_percentage_24h: -1.20,
        market_cap: 400000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        current_price: 145.30,
        price_change_percentage_24h: 5.67,
        market_cap: 60000000000,
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
      },
      {
        id: 'binancecoin',
        symbol: 'bnb',
        name: 'BNB',
        current_price: 580.45,
        price_change_percentage_24h: 0.85,
        market_cap: 85000000000,
        image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png'
      },
      {
        id: 'ripple',
        symbol: 'xrp',
        name: 'XRP',
        current_price: 0.62,
        price_change_percentage_24h: -0.45,
        market_cap: 35000000000,
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
      }
    ];
  }
}
