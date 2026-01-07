import React, { createContext, useContext, ReactNode } from 'react';
import { useCryptoData, CoinData, GlobalData, FearGreedData, SearchItem } from '@/hooks/useCryptoData';

interface CryptoDataContextType {
  coins: CoinData[];
  globalData: GlobalData | null;
  fearGreed: FearGreedData | null;
  searchIndex: SearchItem[];
  marketMovers: {
    gainers: CoinData[];
    losers: CoinData[];
  };
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const CryptoDataContext = createContext<CryptoDataContextType | null>(null);

export function CryptoDataProvider({ children }: { children: ReactNode }) {
  const data = useCryptoData();

  return (
    <CryptoDataContext.Provider value={data}>
      {children}
    </CryptoDataContext.Provider>
  );
}

export function useCryptoDataContext() {
  const context = useContext(CryptoDataContext);
  if (!context) {
    throw new Error('useCryptoDataContext must be used within CryptoDataProvider');
  }
  return context;
}
