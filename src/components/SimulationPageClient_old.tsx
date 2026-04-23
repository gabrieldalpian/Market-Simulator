'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useMarketStore } from '@/lib/store';
import { eventDefinitions } from '@/lib/events';
import { formatDate, getMarketBreadth } from '@/lib/calculations';
import type { EventDefinition } from '@/lib/types';

interface TriggeredEvent {
  id: string;
  name: string;
  color: string;
  timestamp: number;
  impacts: Record<string, number>;
}

export default function SimulationPageClient() {
  const triggerEvent = useMarketStore((s) => s.triggerEvent);
  const stocks = useMarketStore((s) => s.stocks);
  const eventLog = useMarketStore((s) => s.eventLog);
  const isRunning = useMarketStore((s) => s.isRunning);
  const startEngine = useMarketStore((s) => s.startEngine);
  const stopEngine = useMarketStore((s) => s.stopEngine);

  const [recentTriggers, setRecentTriggers] = useState<TriggeredEvent[]>([]);
  const [flashId, setFlashId] = useState<string | null>(null);

  const handleTrigger = useCallback((eventDef: EventDefinition) => {
    triggerEvent(eventDef);
    const trigger: TriggeredEvent = {
      id: `sim-${Date.now()}-${eventDef.id}`,
      name: eventDef.name,
      color: eventDef.color,
      timestamp: Date.now(),
      impacts: eventDef.impacts,
    };
    setRecentTriggers((prev) => [trigger, ...prev].slice(0, 15));
    setFlashId(eventDef.id);
    setTimeout(() => setFlashId(null), 1000);
  }, [triggerEvent]);

  const positiveEvents = eventDefinitions.filter((e) => {
    const totalImpact = Object.values(e.impacts).reduce((a, b) => a + b, 0);
    return totalImpact > 0;
  });

  const negativeEvents = eventDefinitions.filter((e) => {
    const totalImpact = Object.values(e.impacts).reduce((a, b) => a + b, 0);
    return totalImpact < 0;
  });

  const neutralEvents = eventDefinitions.filter((e) => {
    const totalImpact = Object.values(e.impacts).reduce((a, b) => a + b, 0);
    return totalImpact === 0;
  });

  // Get most impacted stocks from recent trigger
  const lastImpacts = recentTriggers.length > 0 ? recentTriggers[0].impacts : {};
  const impactedStocks = useMemo(() => {
    return Object.entries(lastImpacts)
      .flatMap(([sector, impact]) => {
        return stocks
          .filter((s) => s.sector === sector)
          .map((s) => ({ ticker: s.ticker, name: s.name, sector, impact, price: s.price, changePercent: s.changePercent }));
      })
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 5);
  }, [lastImpacts, stocks]);

  const breadth = getMarketBreadth(stocks);
  const bullishEventCount = eventLog.filter((e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) > 0).length;
  const bearishEventCount = eventLog.filter((e) => Object.values(e.impacts).reduce((a, b) => a + b, 0) < 0).length;

  return (
    <div className="w-full px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Market Simulation</h1>
          <p className="text-sm text-gray-500">Trigger events to observe real-time market reactions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isRunning ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={`text-sm font-semibold uppercase tracking-wider ${isRunning ? 'text-green-700' : 'text-gray-600'}`}>
              {isRunning ? 'Market Live' : 'Paused'}
            </span>
          </div>
          <button
            onClick={isRunning ? stopEngine : startEngine}
            className={`px-4 py-2 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all ${
              isRunning
                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
            }`}
          >
            {isRunning ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Events Triggered</span>
            <div className="text-2xl font-bold text-gray-900 font-mono mt-1">{eventLog.length}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Bullish Events</span>
            <div className="text-2xl font-bold text-green-600 font-mono mt-1">{bullishEventCount}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Bearish Events</span>
            <div className="text-2xl font-bold text-red-600 font-mono mt-1">{bearishEventCount}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Last Event</span>
            <div className="text-lg font-bold text-gray-900 font-mono mt-1">
              {recentTriggers.length > 0 ? formatDate(recentTriggers[0].timestamp).split(' ').pop() : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Event Triggers */}
        <div className="xl:col-span-2 space-y-6">
          {/* Bullish Events */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-green-50">
              <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider">🔺 Bullish Events</h3>
              <p className="text-xs text-green-600 mt-1">Positive market catalysts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
              {positiveEvents.map((eventDef) => {
                const totalImpact = Object.values(eventDef.impacts).reduce((a, b) => a + b, 0);
                const isFlashing = flashId === eventDef.id;
                return (
                  <button
                    key={eventDef.id}
                    onClick={() => handleTrigger(eventDef)}
                    className={`text-left px-4 py-3 rounded-lg border-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${isFlashing ? 'ring-2 ring-green-400 scale-[1.01]' : ''}`}
                    style={{
                      borderColor: eventDef.color + '80',
                      backgroundColor: isFlashing ? eventDef.color + '15' : eventDef.color + '08',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-sm flex-1" style={{ color: eventDef.color }}>
                        {eventDef.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-green-600 bg-green-50 px-2 py-1 rounded ml-2 flex-shrink-0">
                        +{(totalImpact * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{eventDef.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(eventDef.impacts).slice(0, 3).map(([sector, impact]) => (
                        <span
                          key={sector}
                          className={`text-xs px-1.5 py-0.5 rounded-md font-mono font-semibold ${
                            impact > 0 ? 'bg-green-50 text-green-700' : impact < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {sector} {impact > 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bearish Events */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-red-50">
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">🔻 Bearish Events</h3>
              <p className="text-xs text-red-600 mt-1">Negative market catalysts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
              {negativeEvents.map((eventDef) => {
                const totalImpact = Object.values(eventDef.impacts).reduce((a, b) => a + b, 0);
                const isFlashing = flashId === eventDef.id;
                return (
                  <button
                    key={eventDef.id}
                    onClick={() => handleTrigger(eventDef)}
                    className={`text-left px-4 py-3 rounded-lg border-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${isFlashing ? 'ring-2 ring-red-400 scale-[1.01]' : ''}`}
                    style={{
                      borderColor: eventDef.color + '80',
                      backgroundColor: isFlashing ? eventDef.color + '15' : eventDef.color + '08',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-sm flex-1" style={{ color: eventDef.color }}>
                        {eventDef.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded ml-2 flex-shrink-0">
                        {(totalImpact * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{eventDef.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(eventDef.impacts).slice(0, 3).map(([sector, impact]) => (
                        <span
                          key={sector}
                          className={`text-xs px-1.5 py-0.5 rounded-md font-mono font-semibold ${
                            impact > 0 ? 'bg-green-50 text-green-700' : impact < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {sector} {impact > 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neutral Events */}
          {neutralEvents.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">⚖ Neutral Events</h3>
                <p className="text-xs text-gray-600 mt-1">Mixed or sector-specific impacts</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
                {neutralEvents.map((eventDef) => {
                  const isFlashing = flashId === eventDef.id;
                  return (
                    <button
                      key={eventDef.id}
                      onClick={() => handleTrigger(eventDef)}
                      className={`text-left px-4 py-3 rounded-lg border-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${isFlashing ? 'ring-2 ring-gray-400 scale-[1.01]' : ''}`}
                      style={{
                        borderColor: eventDef.color + '80',
                        backgroundColor: isFlashing ? eventDef.color + '15' : eventDef.color + '08',
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-sm flex-1" style={{ color: eventDef.color }}>
                          {eventDef.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{eventDef.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(eventDef.impacts).slice(0, 3).map(([sector, impact]) => (
                          <span
                            key={sector}
                            className={`text-xs px-1.5 py-0.5 rounded-md font-mono font-semibold ${
                              impact > 0 ? 'bg-green-50 text-green-700' : impact < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {sector} {impact > 0 ? '+' : ''}{(impact * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Live Impact Monitor */}
        <div className="space-y-6">
          {/* Market Breadth */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Market Breadth</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Advancing</span>
                  <span className="text-sm font-mono font-bold text-green-600">{breadth.advancing}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 transition-all"
                    style={{ width: `${Math.min(100, (breadth.advancing / stocks.length) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Declining</span>
                  <span className="text-sm font-mono font-bold text-red-600">{breadth.declining}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 transition-all"
                    style={{ width: `${Math.min(100, (breadth.declining / stocks.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Affected Stocks */}
          {impactedStocks.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-200 bg-amber-50">
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">⚡ Most Affected</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {impactedStocks.map((s) => (
                  <Link
                    key={s.ticker}
                    href={`/stock/${s.ticker}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="font-mono font-bold text-sm text-blue-600">{s.ticker}</span>
                      <span className="text-xs text-gray-500 ml-2">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900">${s.price.toFixed(2)}</div>
                      <div className={`font-mono text-xs font-bold ${s.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Event History */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Event Log</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {recentTriggers.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  Trigger events to see impact log
                </div>
              ) : (
                recentTriggers.map((t) => {
                  const totalImpact = Object.values(t.impacts).reduce((a, b) => a + b, 0);
                  return (
                    <div key={t.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm" style={{ color: t.color }}>
                          {t.name}
                        </span>
                        <span className={`text-xs font-mono font-bold ${totalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalImpact >= 0 ? '+' : ''}{(totalImpact * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(t.timestamp)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">How It Works</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>✓ Click any event button to trigger immediately</li>
              <li>✓ Effects apply to relevant sectors and stocks</li>
              <li>✓ Market reacts in real-time to changes</li>
              <li>✓ Track all events in the log</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
