'use client';

import { useMarketStore } from '@/lib/store';
import { formatDate, getEventImpactText } from '@/lib/calculations';
import Link from 'next/link';
import { useState, useMemo } from 'react';

type SentimentFilter = 'all' | 'bullish' | 'bearish' | 'neutral';

export default function EventsPageClient() {
  const eventLog = useMarketStore((s) => s.eventLog);
  const stocks = useMarketStore((s) => s.stocks);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  // Get unique sectors from events
  const sectors = useMemo(() => {
    const sectorSet = new Set<string>();
    eventLog.forEach((e) => {
      Object.keys(e.impacts).forEach((s) => sectorSet.add(s));
    });
    return Array.from(sectorSet).sort();
  }, [eventLog]);

  // Filter events by sentiment
  const filteredEvents = useMemo(() => {
    return eventLog.filter((event) => {
      // Sentiment filter
      const totalImpact = Object.values(event.impacts).reduce((a, b) => a + b, 0);
      if (sentimentFilter === 'bullish' && totalImpact <= 0) return false;
      if (sentimentFilter === 'bearish' && totalImpact >= 0) return false;
      if (sentimentFilter === 'neutral' && totalImpact !== 0) return false;

      // Sector filter
      if (sectorFilter !== 'all' && !event.impacts[sectorFilter]) return false;

      return true;
    });
  }, [eventLog, sentimentFilter, sectorFilter]);

  // Statistics
  const stats = useMemo(() => {
    const bullishCount = eventLog.filter(
      (e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) > 0
    ).length;
    const bearishCount = eventLog.filter(
      (e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) < 0
    ).length;
    const neutralCount = eventLog.filter(
      (e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) === 0
    ).length;
    return { bullishCount, bearishCount, neutralCount };
  }, [eventLog]);

  // Get top affected stocks for each event
  const getTopMoversForEvent = (impacts: Record<string, number>) => {
    const stocksByImpact: Array<[string, number]> = [];
    stocks.forEach((stock) => {
      const sectorImpact = impacts[stock.sector] || 0;
      if (sectorImpact !== 0) {
        stocksByImpact.push([stock.ticker, sectorImpact]);
      }
    });
    return stocksByImpact
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3);
  };

  return (
    <div className="w-full px-6 py-6">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Market Events</h1>

      {/* Filters + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Sentiment Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Sentiment</p>
          <div className="space-y-2">
            {(['all', 'bullish', 'bearish', 'neutral'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSentimentFilter(filter)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  sentimentFilter === filter
                    ? filter === 'all'
                      ? 'bg-gray-900 text-white'
                      : filter === 'bullish'
                        ? 'bg-green-50 text-green-700'
                        : filter === 'bearish'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter === 'all' && '📊 All'}
                {filter === 'bullish' && '📈 Bullish'}
                {filter === 'bearish' && '📉 Bearish'}
                {filter === 'neutral' && '➖ Neutral'}
              </button>
            ))}
          </div>
        </div>

        {/* Sector Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Sector</p>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Events</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-mono font-bold text-gray-900">{eventLog.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Bullish</span>
              <span className="font-mono font-bold text-green-600">{stats.bullishCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Bearish</span>
              <span className="font-mono font-bold text-red-600">{stats.bearishCount}</span>
            </div>
          </div>
        </div>

        {/* Sector Impact Heatmap */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Top Sectors</p>
          <div className="space-y-2 text-sm">
            {sectors.slice(0, 4).map((sector) => {
              const sectorEvents = eventLog.filter((e) => e.impacts[sector]);
              const avgImpact =
                sectorEvents.length > 0
                  ? sectorEvents.reduce((sum, e) => sum + (e.impacts[sector] || 0), 0) / sectorEvents.length
                  : 0;
              return (
                <div key={sector} className="flex justify-between items-center">
                  <span className="text-gray-600 truncate">{sector}</span>
                  <span
                    className={`font-mono font-bold text-xs ${avgImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {avgImpact >= 0 ? '+' : ''}{(avgImpact * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
            <p className="text-gray-400">No events match the selected filters</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const totalImpact = Object.values(event.impacts).reduce((a, b) => a + b, 0);
            const isPositive = totalImpact > 0;
            const topMovers = getTopMoversForEvent(event.impacts);

            return (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{event.name}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div
                      className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                        isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {isPositive ? '+' : ''}{(totalImpact * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mb-4">{formatDate(event.timestamp)}</p>

                {/* Sector Impacts */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                  {Object.entries(event.impacts)
                    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                    .slice(0, 6)
                    .map(([sector, impact]) => (
                      <div
                        key={sector}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold text-center ${
                          impact >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <div className="font-semibold text-gray-600">{sector.slice(0, 3).toUpperCase()}</div>
                        <div>{impact >= 0 ? '+' : ''}{(impact * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                </div>

                {/* Top Affected Stocks */}
                {topMovers.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Top Affected Stocks</p>
                    <div className="flex gap-2 flex-wrap">
                      {topMovers.map(([ticker, impact]) => (
                        <Link
                          key={ticker}
                          href={`/stock/${ticker}`}
                          className="px-3 py-1 bg-gray-100 hover:bg-blue-50 rounded-lg text-sm font-mono font-bold text-gray-700 hover:text-blue-700 transition-colors"
                        >
                          {ticker} {impact >= 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
