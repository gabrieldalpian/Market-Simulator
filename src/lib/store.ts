import { create } from 'zustand';
import { Stock, PricePoint, MarketEvent, EventDefinition, Holding } from './types';
import { initialStocks } from './stocks';
import { updateStockPrice, applyEventImpact } from './marketEngine';

let engineTimeout: ReturnType<typeof setTimeout> | null = null;

function generateInitialHistory(
  stock: Stock,
  points: number = 30
): PricePoint[] {
  const history: PricePoint[] = [];
  const now = Date.now();
  let currentPrice = stock.openPrice * (0.97 + Math.random() * 0.06);

  for (let i = points; i >= 1; i--) {
    const noise =
      (Math.random() - 0.5) * stock.openPrice * stock.volatility;
    const drift = (stock.price - currentPrice) / (i * 2);
    currentPrice = Math.max(0.01, currentPrice + noise + drift);
    history.push({
      timestamp: now - i * 2500,
      price: Math.round(currentPrice * 100) / 100,
    });
  }

  history.push({ timestamp: now, price: stock.price });
  return history;
}

interface MarketStore {
  stocks: Stock[];
  holdings: Holding[];
  priceHistory: Record<string, PricePoint[]>;
  eventLog: MarketEvent[];
  isRunning: boolean;
  startEngine: () => void;
  stopEngine: () => void;
  tick: () => void;
  triggerEvent: (eventDef: EventDefinition) => void;
}

export const useMarketStore = create<MarketStore>((set, get) => {
  const initHistory: Record<string, PricePoint[]> = {};
  for (const stock of initialStocks) {
    initHistory[stock.ticker] = generateInitialHistory(stock);
  }

  return {
    stocks: initialStocks.map((s) => ({ ...s })),
    holdings: [
      { ticker: 'NXAI', shares: 10, avgCost: 320 },
      { ticker: 'QFLX', shares: 25, avgCost: 125 },
      { ticker: 'SYNR', shares: 15, avgCost: 200 },
      { ticker: 'ORBX', shares: 5, avgCost: 440 },
      { ticker: 'ZYPHR', shares: 8, avgCost: 395 },
      { ticker: 'FSNR', shares: 12, avgCost: 270 },
      { ticker: 'NRVN', shares: 6, avgCost: 310 },
      { ticker: 'VLTX', shares: 20, avgCost: 245 },
      { ticker: 'NBLX', shares: 4, avgCost: 320 },
      { ticker: 'ATMT', shares: 15, avgCost: 230 },
    ],
    priceHistory: initHistory,
    eventLog: [],
    isRunning: false,

    startEngine: () => {
      if (get().isRunning) return;
      set({ isRunning: true });

      const scheduleTick = () => {
        const delay = 2000 + Math.random() * 1000;
        engineTimeout = setTimeout(() => {
          get().tick();
          if (get().isRunning) {
            scheduleTick();
          }
        }, delay);
      };

      scheduleTick();
    },

    stopEngine: () => {
      set({ isRunning: false });
      if (engineTimeout) {
        clearTimeout(engineTimeout);
        engineTimeout = null;
      }
    },

    tick: () => {
      const now = Date.now();
      const updatedStocks = get().stocks.map((stock) => {
        const updated = updateStockPrice(stock);
        return {
          ...updated,
          high: Math.max(stock.high, updated.price),
          low: Math.min(stock.low, updated.price),
        };
      });

      const updatedHistory = { ...get().priceHistory };
      for (const stock of updatedStocks) {
        const history = [...(updatedHistory[stock.ticker] || [])];
        history.push({ timestamp: now, price: stock.price });
        if (history.length > 200) {
          history.shift();
        }
        updatedHistory[stock.ticker] = history;
      }

      set({ stocks: updatedStocks, priceHistory: updatedHistory });
    },

    triggerEvent: (eventDef: EventDefinition) => {
      const now = Date.now();
      const event: MarketEvent = {
        id: `${eventDef.id}-${now}`,
        name: eventDef.name,
        description: eventDef.description,
        timestamp: now,
        impacts: eventDef.impacts,
      };

      const updatedStocks = get().stocks.map((stock) => {
        const updated = applyEventImpact(stock, eventDef.impacts);
        return {
          ...updated,
          high: Math.max(stock.high, updated.price),
          low: Math.min(stock.low, updated.price),
        };
      });

      const updatedHistory = { ...get().priceHistory };
      for (const stock of updatedStocks) {
        const history = [...(updatedHistory[stock.ticker] || [])];
        history.push({ timestamp: now, price: stock.price });
        if (history.length > 200) {
          history.shift();
        }
        updatedHistory[stock.ticker] = history;
      }

      set({
        stocks: updatedStocks,
        priceHistory: updatedHistory,
        eventLog: [event, ...get().eventLog].slice(0, 50),
      });
    },
  };
});
