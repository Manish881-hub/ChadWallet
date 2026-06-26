'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchTokenOverview } from '@/lib/birdeye';

export interface TokenData {
  address: string;
  symbol: string;
  name: string;
  logo_uri: string;
  price: number;
  price_change_24h_percent: number;
  price_change_1h_percent: number;
  price_change_5m_percent: number;
  price_change_6h_percent: number;
  price_change_4h_percent: number;
  market_cap: number;
  real_fdv: number;
  volume_24h: number;
  liquidity: number;
  holder: number;
  [key: string]: any;
}

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

interface TokenContextType {
  selectedToken: TokenData | null;
  selectToken: (address: string) => void;
  loading: boolean;
}

const TokenContext = createContext<TokenContextType>({
  selectedToken: null,
  selectToken: () => {},
  loading: true,
});

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleCollapsed: () => {},
});

export function useSelectedToken() {
  return useContext(TokenContext);
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function TokenProvider({ children, initialAddress }: { children: React.ReactNode; initialAddress?: string }) {
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(initialAddress ?? null);

  const selectToken = useCallback((addr: string) => {
    setAddress(addr);
  }, []);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    setLoading(true);
    fetchTokenOverview(address)
      .then((info) => {
        if (!cancelled && info) setSelectedToken(info);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [address]);

  return (
    <TokenContext.Provider value={{ selectedToken, selectToken, loading }}>
      {children}
    </TokenContext.Provider>
  );
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = useCallback(() => setCollapsed((p) => !p), []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}
