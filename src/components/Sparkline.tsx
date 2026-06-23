'use client';

import { useEffect, useState } from 'react';
import { fetchSparkline } from '@/lib/birdeye';

interface SparklineProps {
  address: string;
  width?: number;
  height?: number;
}

/**
 * Tiny inline SVG sparkline of a token's recent closes.
 * Green when the last close is above the first, red otherwise.
 * Renders nothing (flat baseline) while loading or if data is unavailable
 * so the surrounding row keeps its height and never jumps layout.
 */
export default function Sparkline({ address, width = 48, height = 20 }: SparklineProps) {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchSparkline(address).then((pts) => {
      if (!cancelled) setData(pts);
    });
    return () => { cancelled = true; };
  }, [address]);

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const up = data.length >= 2 ? data[data.length - 1] >= data[0] : true;
  const stroke = up ? '#00C853' : '#FF1744';

  let d = '';
  if (data.length >= 2) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const span = max - min || 1;
    const step = w / (data.length - 1);
    d = data
      .map((v, i) => {
        const x = pad + i * step;
        const y = pad + h - ((v - min) / span) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  } else {
    // Flat baseline placeholder while data is loading/empty.
    d = `M${pad},${(pad + h / 2).toFixed(2)} L${pad + w},${(pad + h / 2).toFixed(2)}`;
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={data.length >= 2 ? 1 : 0.35}
      />
    </svg>
  );
}
