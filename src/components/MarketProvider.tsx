'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/lib/store';

export default function MarketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const startEngine = useMarketStore((s) => s.startEngine);
  const stopEngine = useMarketStore((s) => s.stopEngine);

  useEffect(() => {
    startEngine();
    return () => stopEngine();
  }, [startEngine, stopEngine]);

  return <>{children}</>;
}
