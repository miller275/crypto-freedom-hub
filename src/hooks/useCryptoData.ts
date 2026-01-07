import { useState, useEffect, useMemo } from 'react';

export interface CoinData {
  id: string;
  cmcId: number;
  rank: number;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  sparkline: number[];
}

export interface GlobalData {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  ethDominance: number;
  totalCoins: number;
  marketCapChange24h: number;
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export interface SearchItem {
  id: string;
  cmcId: number;
  name: string;
  symbol: string;
  rank: number;
}

interface CMCListing {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  quote: {
    USD: {
      price: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
      volume_24h: number;
    };
  };
}

// Generate sparkline from price changes (simulated based on 7d trend)
const generateSparkline = (change7d: number): number[] => {
  const points = 24;
  const data: number[] = [];
  let value = 100;
  const trendFactor = change7d / 100 / points;
  
  for (let i = 0; i < points; i++) {
    const volatility = (Math.random() - 0.5) * 0.02;
    value = value * (1 + trendFactor + volatility);
    data.push(value);
  }
  
  return data;
};

export function useCryptoData() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null);
  const [searchIndex, setSearchIndex] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [listingsRes, globalRes, fgRes, metaRes, searchRes] = await Promise.all([
          fetch('/data/listings.json').catch(() => null),
          fetch('/data/global.json').catch(() => null),
          fetch('/data/fear-greed.json').catch(() => null),
          fetch('/data/meta.json').catch(() => null),
          fetch('/data/search-index.json').catch(() => null),
        ]);

        // Process listings
        if (listingsRes?.ok) {
          const listingsData = await listingsRes.json();
          if (listingsData.data) {
            const processedCoins: CoinData[] = listingsData.data.map((coin: CMCListing) => ({
              id: coin.slug,
              cmcId: coin.id,
              rank: coin.cmc_rank,
              name: coin.name,
              symbol: coin.symbol,
              logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
              price: coin.quote.USD.price,
              change1h: coin.quote.USD.percent_change_1h || 0,
              change24h: coin.quote.USD.percent_change_24h || 0,
              change7d: coin.quote.USD.percent_change_7d || 0,
              marketCap: coin.quote.USD.market_cap || 0,
              volume24h: coin.quote.USD.volume_24h || 0,
              circulatingSupply: coin.circulating_supply || 0,
              totalSupply: coin.total_supply,
              maxSupply: coin.max_supply,
              sparkline: generateSparkline(coin.quote.USD.percent_change_7d || 0),
            }));
            setCoins(processedCoins);
          }
        }

        // Process global data
        if (globalRes?.ok) {
          const globalJson = await globalRes.json();
          if (globalJson.data) {
            const g = globalJson.data;
            setGlobalData({
              totalMarketCap: g.quote?.USD?.total_market_cap || 0,
              total24hVolume: g.quote?.USD?.total_volume_24h || 0,
              btcDominance: g.btc_dominance || 0,
              ethDominance: g.eth_dominance || 0,
              totalCoins: g.active_cryptocurrencies || 0,
              marketCapChange24h: g.quote?.USD?.total_market_cap_yesterday_percentage_change || 0,
            });
          }
        }

        // Process Fear & Greed
        if (fgRes?.ok) {
          const fgJson = await fgRes.json();
          if (fgJson.data?.[0]) {
            const fg = fgJson.data[0];
            setFearGreed({
              value: parseInt(fg.value),
              classification: fg.value_classification,
              timestamp: new Date(parseInt(fg.timestamp) * 1000).toISOString(),
            });
          }
        }

        // Process meta
        if (metaRes?.ok) {
          const metaJson = await metaRes.json();
          setLastUpdated(metaJson.updated_at);
        }

        // Process search index
        if (searchRes?.ok) {
          const searchJson = await searchRes.json();
          setSearchIndex(searchJson);
        }

      } catch (err) {
        setError('Failed to load data. Using fallback data.');
        console.error('Data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Market movers (top gainers/losers)
  const marketMovers = useMemo(() => {
    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }, [coins]);

  return {
    coins,
    globalData,
    fearGreed,
    searchIndex,
    marketMovers,
    isLoading,
    error,
    lastUpdated,
  };
}

// Singleton to share data across components
let cachedData: ReturnType<typeof useCryptoData> | null = null;

export function useCryptoDataCached() {
  const data = useCryptoData();
  if (!cachedData || data.coins.length > 0) {
    cachedData = data;
  }
  return cachedData || data;
}
