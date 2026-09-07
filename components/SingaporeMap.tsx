'use client';
import './SingaporeMap.css';
import map from '@/content/singapore-map.json';
import { districtNames } from '@/engine/districts';
import { districtIds, type DistrictId } from '@/engine/model';

// A deterministic, illustrative density field, not census or measured land-use data.
const densityBands = ['#315d59', '#488078', '#829477', '#c1a86c', '#e5bb77', '#ffe0a1'];
const densityPaths = densityBands.map(() => '');
const centres = [[510, 365, 105, 80, 1], [675, 295, 140, 60, .7], [325, 315, 110, 90, .65], [430, 160, 75, 65, .6], [600, 230, 85, 60, .55]];
for (let y = 80; y < 540; y += 5) {
  for (let x = 75; x < 930; x += 5) {
    const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    const density = centres.reduce((sum, [cx, cy, rx, ry, weight]) => sum + weight * Math.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)), 0);
    if (Math.abs(noise) > .25 + density * .65) continue;
    const band = Math.min(5, Math.floor(density * 4.3 + Math.abs(noise)));
    const size = 1.2 + Math.abs(noise) * 2.1;
    densityPaths[band] += `M${x},${y}h${size.toFixed(1)}v${size.toFixed(1)}h-${size.toFixed(1)}z`;
  }
}

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
      <div className="atlas-heading">
        <div><p className="atlas-kicker">An island of shared futures</p><h1>What will we <em>leave behind?</em></h1></div>
        <p>Every neighbourhood holds a story.<br />Choose a district. Shape its next chapter.</p>
      </div>
      <div className={`island-map ${!active ? 'island-map-zooming' : ''}`}>
        <div
          className="island-cartography"
          style={{ transformOrigin: `${x / 10}% ${y / 6.2}%` }}
        >
          <svg
            viewBox="0 0 1000 620"
            role="img"
            aria-label="Textured illustrative density map of Singapore, with warm clusters showing imagined urban intensity, not measured population. Kampong Glam, Chinatown and Little India are marked."
          >
            <defs>
              <linearGradient id="island-fill" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#274c49" />
                <stop offset="1" stopColor="#102f35" />
              </linearGradient>
              <clipPath id="island-land-clip">{map.paths.map((path, i) => <path key={i} d={path} />)}</clipPath>
              <filter id="island-grain" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="8" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <filter id="island-density-glow"><feGaussianBlur stdDeviation="5" /></filter>
              <pattern id="island-hatching" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <path d="M0 0V8" stroke="#93c0ae" strokeWidth=".5" opacity=".22" />
              </pattern>
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
              stroke="#80b3a0"
              strokeWidth="1"
              fillRule="evenodd"
            >
              {map.paths.map((path, i) => (
                <path key={i} d={path} />
              ))}
            </g>
            <g clipPath="url(#island-land-clip)" aria-hidden="true">
              <rect width="1000" height="620" fill="url(#island-hatching)" />
              <g filter="url(#island-density-glow)" opacity=".6">
                {densityPaths.slice(3).map((d, i) => <path key={i} d={d} fill={densityBands[i + 3]} />)}
              </g>
              {densityPaths.map((d, i) => <path key={i} d={d} fill={densityBands[i]} />)}
              <rect width="1000" height="620" filter="url(#island-grain)" opacity=".12" style={{ mixBlendMode: 'soft-light' }} />
            </g>
            <text x="500" y="572" className="island-sea" textAnchor="middle">
              S I N G A P O R E   S T R A I T
            </text>
            <g transform="translate(918 82)" className="island-compass" aria-label="Compass: north up, east right, south down, west left">
              <circle r="27" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth=".7" />
              <circle r="22" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth=".7" />
              <path d="M-18-18L18 18M18-18L-18 18" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth=".8" />
              <path d="M0-30L6 0L0 30L-6 0ZM-30 0L0-6L30 0L0 6Z" fill="#6f9691" stroke="#bdd0bd" strokeWidth=".6" />
              <path d="M0-30L0 0L6 0Z" fill="#ffe0a1" />
              <path d="M0 0L0 30L-6 0ZM0 0L30 0L0 6Z" fill="#cfdbc7" />
              <circle r="3" fill="#ffe0a1" />
              <text y="-39" textAnchor="middle" fill="#ffe0a1">N</text>
              <text x="43" y="5" textAnchor="middle">E</text>
              <text y="49" textAnchor="middle">S</text>
              <text x="-43" y="5" textAnchor="middle">W</text>
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
        <div className="atlas-legend"><span>Illustrative density</span><span className="atlas-density-scale" aria-hidden="true" /><span>Sparse → Dense</span></div>
        <a href="/maps/ATTRIBUTION.txt" target="_blank" rel="noreferrer">
          Map attribution
        </a>
      </div>
    </main>
  );
}
