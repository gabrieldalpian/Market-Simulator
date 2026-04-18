'use client';

import { useMarketStore } from '@/lib/store';
import { eventDefinitions } from '@/lib/events';

export default function EventButtons() {
  const triggerEvent = useMarketStore((s) => s.triggerEvent);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Trigger Event
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {eventDefinitions.map((eventDef) => (
          <button
            key={eventDef.id}
            onClick={() => triggerEvent(eventDef)}
            className="w-full text-left px-4 py-3 rounded-lg border transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              borderColor: eventDef.color + '40',
              backgroundColor: eventDef.color + '08',
            }}
          >
            <div
              className="font-semibold text-sm"
              style={{ color: eventDef.color }}
            >
              {eventDef.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {eventDef.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
