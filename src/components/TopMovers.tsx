'use client';

import Link from 'next/link';
import { useMarketStore } from '@/lib/store';

export default function TopMovers() {
  const stocks = useMarketStore((s) => s.stocks);

  const sorted = [...stocks].sort(
    (a, b) => b.changePercent - a.changePercent
  );
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
          Top Gainers
        </h3>
        <div className="space-y-2">
          {gainers.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {stock.ticker}
                </span>
                <span className="text-sm text-slate-600">{stock.name}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-slate-900">
                  ${stock.price.toFixed(2)}
                </div>
                <div className="font-mono text-xs text-green-600">
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">
          Top Losers
        </h3>
        <div className="space-y-2">
          {losers.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {stock.ticker}
                </span>
                <span className="text-sm text-slate-600">{stock.name}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-slate-900">
                  ${stock.price.toFixed(2)}
                </div>
                <div className="font-mono text-xs text-red-600">
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
