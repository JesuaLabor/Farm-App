import React from 'react';

export interface PricePoint {
  date: string;
  price: number;
  marketLocation?: string;
}

interface PriceChartProps {
  data: PricePoint[];
  unit?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, unit = '₱' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '14px' }}>
        No price history points available for selected crop & region.
      </div>
    );
  }

  const height = 240;
  const width = 650;
  const padding = 40;

  const prices = data.map((d) => d.price);
  const minPrice = Math.max(0, Math.min(...prices) * 0.9);
  const maxPrice = Math.max(...prices) * 1.1 || 10;

  const getX = (index: number) => {
    if (data.length === 1) return width / 2;
    return padding + (index / (data.length - 1)) * (width - 2 * padding);
  };

  const getY = (price: number) => {
    return height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);
  };

  const pointsString = data.map((d, i) => `${getX(i)},${getY(d.price)}`).join(' ');

  // SVG Area path
  const areaString = `${pointsString} ${getX(data.length - 1)},${height - padding} ${getX(0)},${height - padding}`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - 2 * padding);
          const val = maxPrice - ratio * (maxPrice - minPrice);
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeDasharray="4" />
              <text x={padding - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">
                {unit}{Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={areaString} fill="url(#priceGradient)" />

        {/* Polyline */}
        <polyline fill="none" stroke="#16a34a" strokeWidth="3" points={pointsString} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Dots & Labels */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.price);
          const formattedDate = d.date.split('T')[0];

          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="5" fill="#15803d" stroke="#fff" strokeWidth="2" />
              <text x={cx} y={height - 12} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                {formattedDate}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
