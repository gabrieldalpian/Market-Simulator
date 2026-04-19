'use client';

import Link from 'next/link';
import { useMarketStore } from '@/lib/store';
import StockChart from './StockChart';
import StockStats from './StockStats';
import MiniChart from './MiniChart';

interface StockPageClientProps {
  ticker: string;
}

export default function StockPageClient({ ticker }: StockPageClientProps) {
  const stock = useMarketStore((s) =>
    s.stocks.find((st) => st.ticker === ticker)
  );
  const stocks = useMarketStore((s) => s.stocks);
  const eventLog = useMarketStore((s) => s.eventLog);
  const priceHistory = useMarketStore((s) => s.priceHistory);

  if (!stock) {
    return (
      <div className="w-full px-6 py-6">
        <Link href="/market" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
          &larr; Back to Market
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Stock Not Found</h2>
          <p className="text-sm text-gray-500">No stock found with ticker &quot;{ticker}&quot;</p>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const relevantEvents = eventLog.filter((e) => e.impacts[stock.sector] !== undefined);

  // Related stocks in same sector
  const relatedStocks = stocks.filter((s) => s.sector === stock.sector && s.ticker !== stock.ticker);

  return (
    <div className="w-full px-6 py-6">
      <Link href="/market" className="text-blue-600 hover:text-blue-700 text-sm mb-3 inline-block">
        &larr; Back to Market
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold text-gray-900 font-mono">{stock.ticker}</h1>
            <span className="text-base text-gray-500">{stock.name}</span>
            <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">{stock.sector}</span>
          </div>
          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-4xl font-bold text-gray-900 font-mono">${stock.price.toFixed(2)}</span>
            <span className={`text-xl font-mono font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <StockChart ticker={stock.ticker} />
        </div>
        <div>
          <StockStats stock={stock} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Event History */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Events ({stock.sector})
            </h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {relevantEvents.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No events have affected this sector yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {relevantEvents.map((event) => {
                  const impact = event.impacts[stock.sector];
                  const impactPositive = impact >= 0;
                  return (
                    <div key={event.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">{event.name}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-mono px-2 py-1 rounded-md ${impactPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {impactPositive ? '+' : ''}{(impact * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{event.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Related Stocks */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Related ({stock.sector})
            </h3>
          </div>
          {relatedStocks.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">No related stocks</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {relatedStocks.map((s) => {
                const pos = s.changePercent >= 0;
                const hist = priceHistory[s.ticker] || [];
                const cd = hist.slice(-20).map((p) => ({ price: p.price }));
                return (
                  <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-blue-600">{s.ticker}</span>
                      <span className="text-xs text-gray-500">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MiniChart data={cd} width={64} height={24} positive={pos} />
                      <span className="font-mono text-sm text-gray-900">${s.price.toFixed(2)}</span>
                      <span className={`font-mono text-xs font-bold ${pos ? 'text-green-600' : 'text-red-600'}`}>
                        {pos ? '+' : ''}{s.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
