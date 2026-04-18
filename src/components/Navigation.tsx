'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMarketStore } from '@/lib/store';

export default function Navigation() {
  const pathname = usePathname();
  const stocks = useMarketStore((s) => s.stocks);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/market', label: 'Market' },
    { path: '/trades', label: 'Trades' },
    { path: '/events', label: 'Events' },
    { path: '/insights', label: 'Insights' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/simulation', label: 'Simulation' },
  ];

  // Duplicate stocks for seamless scroll loop
  const tickerStocks = [...stocks, ...stocks];

  return (
    <div className="sticky top-0 z-50">
      {/* Main nav */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors tracking-tight flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Synthetic Market Engine
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* LiveTicker bar - dark themed, animated scroll */}
      <div className="bg-gray-900 border-b border-gray-800 overflow-hidden" style={{ height: '48px' }}>
        <div className="flex items-center h-full ticker-scroll" style={{ width: 'max-content' }}>
          {tickerStocks.map((stock, idx) => {
            const pos = stock.changePercent >= 0;
            return (
              <Link
                key={`${stock.ticker}-${idx}`}
                href={`/stock/${stock.ticker}`}
                className="flex items-center gap-3 flex-shrink-0 hover:bg-gray-800 px-5 h-full transition-colors"
              >
                <span className="text-sm font-mono font-bold text-white">{stock.ticker}</span>
                <span className="text-sm font-mono text-gray-300">${stock.price.toFixed(2)}</span>
                <span className={`text-sm font-mono font-bold ${pos ? 'text-green-400' : 'text-red-400'}`}>
                  {pos ? '▲' : '▼'} {pos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
