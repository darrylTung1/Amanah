'use client';
import './SingaporeMap.css';
import map from '@/content/singapore-map.json';
import { districtNames } from '@/engine/districts';
import { districtIds, type DistrictId } from '@/engine/model';

export default function SingaporeMap({
  active,
  onEnter,
  selected,
}: {
  active: boolean;
  onEnter: (id: DistrictId) => void;
  selected: DistrictId;
}) {
  const points = {
    'kampong-glam': map.kampongGlam,
    chinatown: map.chinatown,
    'little-india': map.littleIndia,
  };
  const [x, y] = points[selected];
  return (
    <main className="island-screen">
      <div className={`island-map ${!active ? 'island-map-zooming' : ''}`}>
        <div
          className="island-cartography"
          style={{ transformOrigin: `${x / 10}% ${y / 6.2}%` }}
        >
          <svg
            viewBox="0 0 1000 620"
            role="img"
            aria-label="Silhouette map of Singapore. Kampong Glam, Chinatown and Little India are marked in the south of the main island."
          >
            <defs>
              <linearGradient id="island-fill" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#f1e6cb" />
                <stop offset="1" stopColor="#ab9770" />
              </linearGradient>
              <pattern
                id="island-grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M50 0H0V50"
                  fill="none"
                  stroke="#e9dfc8"
                  strokeOpacity=".06"
                />
              </pattern>
            </defs>
            <rect width="1000" height="620" fill="url(#island-grid)" />
            <g
              className="island-outline"
              fill="url(#island-fill)"
              stroke="#f2dfac"
              strokeWidth="1"
              fillRule="evenodd"
            >
              {map.paths.map((path, i) => (
                <path key={i} d={path} />
              ))}
            </g>
            <text x="500" y="572" className="island-sea" textAnchor="middle">
              Singapore
            </text>
            <g transform="translate(928 72)" className="island-compass">
              <text y="-20" textAnchor="middle">
                N
              </text>
              <path d="M0-10L-6 12L0 7L6 12Z" fill="currentColor" />
            </g>
          </svg>
          {districtIds.map((id) => {
            const [px, py] = points[id];
            return (
              <button
                key={id}
                id={`singapore-marker-${id}`}
                type="button"
                className={`island-pin island-pin-${id}`}
                style={{ left: `${px / 10}%`, top: `${py / 6.2}%` }}
                onClick={() => active && onEnter(id)}
                disabled={!active}
                aria-label={`Enter ${districtNames[id]} council`}
              >
                <span className="island-pin-dot" aria-hidden="true" />
                <span className="island-pin-label">
                  <small>Enter the council</small>
                  <strong>
                    {districtNames[id]} <span aria-hidden="true">↗</span>
                  </strong>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="island-caption">
        <a href="/maps/ATTRIBUTION.txt" target="_blank" rel="noreferrer">
          Map attribution
        </a>
      </div>
    </main>
  );
}
