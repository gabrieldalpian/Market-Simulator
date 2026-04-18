'use client';

import { useMarketStore } from '@/lib/store';

export default function EventFeed() {
  const eventLog = useMarketStore((s) => s.eventLog);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Event Feed
        </h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {eventLog.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            No events triggered yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {eventLog.map((event) => (
              <div key={event.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900">
                    {event.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{event.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(event.impacts).map(([sector, impact]) => (
                    <span
                      key={sector}
                      className={`text-xs px-1.5 py-0.5 rounded-md ${
                        impact >= 0
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {sector} {impact >= 0 ? '+' : ''}
                      {(impact * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
