'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: { price: number }[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export default function MiniChart({ data, width = 80, height = 28, positive }: MiniChartProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-gray-50 rounded" />;
  }

  const isUp = positive !== undefined ? positive : data[data.length - 1].price >= data[0].price;
  const color = isUp ? '#16a34a' : '#dc2626';

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
