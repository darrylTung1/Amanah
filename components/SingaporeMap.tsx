'use client';
import map from '@/content/singapore-map.json';

export default function SingaporeMap({
  active,
  onEnter,
}: {
  active: boolean;
  onEnter: () => void;
}) {
  const [x, y] = map.kampongGlam;
  function enter() {
    // Reveal the already-mounted council immediately; CSS overlaps the scenes.
    if (active) onEnter();
  }
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
            aria-label="Silhouette map of Singapore. Kampong Glam is marked in the south of the main island."
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
              S I N G A P O R E S T R A I T
            </text>
            <g transform="translate(928 72)" className="island-compass">
              <text y="-20" textAnchor="middle">
                N
              </text>
              <path d="M0-10L-6 12L0 7L6 12Z" fill="currentColor" />
            </g>
          </svg>
          <button
            id="singapore-marker"
            type="button"
            className="island-pin"
            style={{ left: `${x / 10}%`, top: `${y / 6.2}%` }}
            onClick={enter}
            disabled={!active}
            aria-label="Enter Kampong Glam council"
          >
            <span className="island-pin-dot" aria-hidden="true" />
            <span className="island-pin-label">
              <small>Enter the council</small>
              <strong>
                Kampong Glam <span aria-hidden="true">↗</span>
              </strong>
            </span>
          </button>
        </div>
      </div>
      <div className="island-caption">
        <span>Choose a district</span>
        <a href="/maps/ATTRIBUTION.txt" target="_blank" rel="noreferrer">
          Map attribution
        </a>
      </div>
    </main>
  );
}
