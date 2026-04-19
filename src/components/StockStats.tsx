'use client';

import { Stock } from '@/lib/types';

interface StockStatsProps {
  stock: Stock;
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-mono text-sm font-bold ${color || 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

export default function StockStats({ stock }: StockStatsProps) {
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
        Statistics
      </h3>
      <div>
        <StatRow label="Current Price" value={`$${stock.price.toFixed(2)}`} />
        <StatRow label="Open Price" value={`$${stock.openPrice.toFixed(2)}`} />
        <StatRow
          label="Change"
          value={`${isPositive ? '+' : ''}${stock.change.toFixed(2)}`}
          color={changeColor}
        />
        <StatRow
          label="Change %"
          value={`${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%`}
          color={changeColor}
        />
        <StatRow
          label="Session High"
          value={`$${stock.high.toFixed(2)}`}
          color="text-green-600"
        />
        <StatRow
          label="Session Low"
          value={`$${stock.low.toFixed(2)}`}
          color="text-red-600"
        />
        <StatRow label="Sector" value={stock.sector} />
        <StatRow
          label="Momentum"
          value={`${stock.momentum > 0 ? '+' : ''}${stock.momentum.toFixed(4)}`}
          color={stock.momentum >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatRow
          label="Volatility"
          value={`${(stock.volatility * 100).toFixed(1)}%`}
        />
      </div>
    </div>
  );
}
