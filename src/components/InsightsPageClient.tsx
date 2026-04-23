'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useMarketStore } from '@/lib/store';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function InsightsPageClient() {
  const stocks = useMarketStore((s) => s.stocks);
  const priceHistory = useMarketStore((s) => s.priceHistory);

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 8);
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 8);
  const volatilityRanked = [...stocks].sort((a, b) => b.volatility - a.volatility).slice(0, 10);

  const sectorData = useMemo(() => {
    const map: Record<string, { changes: number[]; tickers: string[] }> = {};
    stocks.forEach((s) => {
      if (!map[s.sector]) map[s.sector] = { changes: [], tickers: [] };
      map[s.sector].changes.push(s.changePercent);
      map[s.sector].tickers.push(s.ticker);
    });
    return Object.entries(map).map(([sector, data]) => ({
      sector,
      avgChange: data.changes.reduce((a, b) => a + b, 0) / data.changes.length,
      count: data.tickers.length,
      tickers: data.tickers,
    })).sort((a, b) => b.avgChange - a.avgChange);
  }, [stocks]);

  const marketIndex = useMemo(() => {
    const tickers = Object.keys(priceHistory);
    if (tickers.length === 0) return [];
    const refHistory = priceHistory[tickers[0]] || [];
    return refHistory.map((_, idx) => {
      let sum = 0;
      let count = 0;
      for (const ticker of tickers) {
        const h = priceHistory[ticker];
        if (h && h[idx]) {
          const base = h[0]?.price || 1;
          sum += (h[idx].price / base) * 100;
          count++;
        }
      }
      return {
        timestamp: refHistory[idx]?.timestamp || 0,
        value: count > 0 ? +(sum / count).toFixed(2) : 100,
      };
    });
  }, [priceHistory]);

  const gainCount = stocks.filter((s) => s.changePercent > 0).length;
  const totalStocks = stocks.length;
  const breadth = totalStocks > 0 ? (gainCount / totalStocks) * 100 : 50;
  const avgMomentum = stocks.reduce((a, s) => a + s.momentum, 0) / (totalStocks || 1);
  const avgVolatility = stocks.reduce((a, s) => a + s.volatility, 0) / (totalStocks || 1);
  const highestPrice = [...stocks].sort((a, b) => b.price - a.price)[0];
  const lowestPrice = [...stocks].sort((a, b) => a.price - b.price)[0];
  const indexPositive = marketIndex.length >= 2 && marketIndex[marketIndex.length - 1]?.value >= marketIndex[0]?.value;

  const sentiment = breadth > 60 ? 'Bullish' : breadth < 40 ? 'Bearish' : 'Neutral';
  const sentimentColor = breadth > 60 ? 'text-green-600' : breadth < 40 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Market Insights</h1>
        <div className="flex items-center gap-5 text-sm font-mono">
          <span className="text-gray-500">Sentiment: <span className={`font-bold ${sentimentColor}`}>{sentiment}</span></span>
          <span className="text-gray-500">Breadth: <span className="font-bold text-gray-900">{breadth.toFixed(0)}%</span></span>
        </div>
      </div>

      {/* Top bar: market trend + sector chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Market trend chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Market Trend</h2>
            <span className={`text-lg font-mono font-bold ${indexPositive ? 'text-green-600' : 'text-red-600'}`}>
              {marketIndex.length > 0 ? marketIndex[marketIndex.length - 1].value.toFixed(2) : '—'}
            </span>
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketIndex}>
                <defs>
                  <linearGradient id="insightIdxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={indexPositive ? '#16a34a' : '#dc2626'} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={indexPositive ? '#16a34a' : '#dc2626'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#cbd5e1" tick={{ fontSize: 12 }} minTickGap={60} axisLine={false} />
                <YAxis stroke="#cbd5e1" tick={{ fontSize: 12 }} width={55} tickFormatter={(v: number) => v.toFixed(1)} domain={['dataMin - 0.15 * (dataMax - dataMin)', 'dataMax + 0.15 * (dataMax - dataMin)']} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }} labelFormatter={(v: number) => formatTime(v)} formatter={(v: number) => [v.toFixed(2), 'Index']} />
                <Area type="natural" dataKey="value" stroke={indexPositive ? '#16a34a' : '#dc2626'} strokeWidth={3} fill="url(#insightIdxGrad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector performance bar chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Sector Performance</h2>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#cbd5e1" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v.toFixed(1)}%`} axisLine={false} />
                <YAxis type="category" dataKey="sector" stroke="#cbd5e1" tick={{ fontSize: 12 }} width={85} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Avg Change']} />
                <Bar dataKey="avgChange" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {sectorData.map((entry) => (
                    <Cell key={entry.sector} fill={entry.avgChange >= 0 ? '#16a34a' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gainers, Losers, Volatility - 3 column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Gainers */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-green-50">
            <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider">Top Gainers</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3">Ticker</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gainers.map((s) => (
                <tr key={s.ticker} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/stock/${s.ticker}`} className="font-mono font-bold text-sm text-blue-600 hover:text-blue-700">
                      {s.ticker}
                    </Link>
                  </td>
                  <td className="text-right px-5 py-3 text-sm font-mono text-gray-900">${s.price.toFixed(2)}</td>
                  <td className="text-right px-5 py-3 text-sm font-mono font-bold text-green-600">+{s.changePercent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Losers */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-red-50">
            <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider">Top Losers</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3">Ticker</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {losers.map((s) => (
                <tr key={s.ticker} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/stock/${s.ticker}`} className="font-mono font-bold text-sm text-blue-600 hover:text-blue-700">
                      {s.ticker}
                    </Link>
                  </td>
                  <td className="text-right px-5 py-3 text-sm font-mono text-gray-900">${s.price.toFixed(2)}</td>
                  <td className="text-right px-5 py-3 text-sm font-mono font-bold text-red-600">{s.changePercent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Highest Volatility */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-amber-50">
            <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Highest Volatility</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3">Ticker</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Vol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {volatilityRanked.map((s) => (
                <tr key={s.ticker} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/stock/${s.ticker}`} className="font-mono font-bold text-sm text-blue-600 hover:text-blue-700">
                      {s.ticker}
                    </Link>
                  </td>
                  <td className="text-right px-5 py-3 text-sm font-mono text-gray-900">${s.price.toFixed(2)}</td>
                  <td className="text-right px-5 py-3 text-sm font-mono font-bold text-amber-600">{(s.volatility * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Advancing</div>
          <div className="text-2xl font-bold text-green-600 font-mono">{gainCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Declining</div>
          <div className="text-2xl font-bold text-red-600 font-mono">{totalStocks - gainCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Avg Momentum</div>
          <div className={`text-2xl font-bold font-mono ${avgMomentum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {avgMomentum >= 0 ? '+' : ''}{(avgMomentum * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Avg Volatility</div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{(avgVolatility * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Price Range</div>
          <div className="text-sm font-mono text-gray-900">
            ${lowestPrice?.price.toFixed(2) || '—'} - ${highestPrice?.price.toFixed(2) || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
