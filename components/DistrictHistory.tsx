'use client';
import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { keys, type Metric, type State } from '@/engine/model';

export default function DistrictHistory({ timeline }: { timeline: State[] }) {
  const [metric, setMetric] = useState<Metric>('affordability');
  const reduced = useReducedMotion();
  const first = timeline[0];
  const last = timeline.at(-1)!;
  const x = (year: number) =>
    36 + ((year - first.year) / (last.year - first.year || 1)) * 528;
  const y = (value: number) => 144 - value * 124;
  const path = timeline
    .map(
      (s, i) =>
        `${i ? 'L' : 'M'}${x(s.year).toFixed(2)},${y(s[metric]).toFixed(2)}`,
    )
    .join(' ');
  return (
    <div className="district-history">
      <div className="history-select">
        <label htmlFor="history-metric">Category</label>
        <select
          id="history-metric"
          value={metric}
          onChange={(event) => setMetric(event.target.value as Metric)}
        >
          {keys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <strong>
          {Math.round(first[metric] * 100)} → {Math.round(last[metric] * 100)}
        </strong>
      </div>
      <svg
        viewBox="0 0 600 178"
        role="img"
        aria-label={`${metric} from ${first.year} to ${last.year}, on a fixed scale of zero to one hundred. Exact sampled values are in the data table below.`}
      >
        {[0, 0.5, 1].map((value) => (
          <g key={value}>
            <line
              x1="36"
              x2="564"
              y1={y(value)}
              y2={y(value)}
              className="history-grid"
            />
            <text x="28" y={y(value) + 4} textAnchor="end">
              {value * 100}
            </text>
          </g>
        ))}
        <m.path
          d={path}
          animate={{ d: path }}
          transition={{ duration: reduced ? 0 : 0.55, ease: 'easeInOut' }}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {[first.year, 2050, last.year]
          .filter((year, i, all) => all.indexOf(year) === i)
          .map((year) => (
            <text key={year} x={x(year)} y="168" textAnchor="middle">
              {year}
            </text>
          ))}
      </svg>
      <p className="small muted">Annual conditions · Fixed 0–100 scale</p>
    </div>
  );
}
