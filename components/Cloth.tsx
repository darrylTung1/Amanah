import { type State } from '@/engine/model';
const parcels = [
  { x: 90, y: 105, w: 140, h: 85, k: 'continuity', name: 'Lineage trades' },
  { x: 247, y: 105, w: 155, h: 85, k: 'equity', name: 'Community spaces' },
  { x: 420, y: 105, w: 100, h: 85, k: 'habitability', name: 'Shade corridor' },
  { x: 90, y: 215, w: 140, h: 95, k: 'affordability', name: 'Arab Street' },
  { x: 247, y: 215, w: 155, h: 95, k: 'continuity', name: 'Bussorah Street' },
  { x: 420, y: 215, w: 100, h: 95, k: 'vitality', name: 'Visitor economy' },
  { x: 90, y: 333, w: 225, h: 80, k: 'equity', name: 'Residents & makers' },
  { x: 333, y: 333, w: 187, h: 80, k: 'vitality', name: 'Food & gathering' },
] as const;
export default function Cloth({
  state,
  compact = false,
}: {
  state: State;
  compact?: boolean;
}) {
  return (
    <div className="clothframe">
      <div className="maphead">
        <span>Kampong Gelam · Singapore</span>
        <span>{state.year} / the living district</span>
      </div>
      <svg
        className="cloth"
        viewBox="0 0 610 500"
        role="img"
        aria-label={`District diagram in ${state.year}; dye intensity represents community outcomes`}
      >
        <defs>
          <pattern
            id={`weave-${state.year}`}
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 1H7M1 0V7"
              stroke="#ede4d2"
              strokeWidth=".4"
              opacity=".18"
            />
          </pattern>
        </defs>
        <g transform="translate(10 12) matrix(.90 -.23 .28 .72 -20 80)">
          <rect
            x="62"
            y="76"
            width="484"
            height="365"
            fill="#0e1729"
            stroke="#ede4d2"
            strokeWidth="2"
          />
          <rect
            x="70"
            y="84"
            width="468"
            height="349"
            fill={`url(#weave-${state.year})`}
            stroke="#ede4d2"
            strokeDasharray="2 6"
            opacity=".5"
          />
          {parcels.map((p, i) => (
            <g key={p.name}>
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx="3"
                fill={['#af8854', '#3e7c6e', '#73a28a', '#d9a323'][i % 4]}
                fillOpacity={0.12 + state[p.k] * 0.85}
                stroke="#ede4d2"
                strokeWidth="2"
              />
              <path
                d={`M${p.x + 8} ${p.y + 8}h${p.w - 16}v${p.h - 16}h-${p.w - 16}z`}
                fill={`url(#weave-${state.year})`}
                stroke="#ede4d2"
                strokeWidth=".6"
                strokeDasharray="3 4"
              />
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2 - 3}
                textAnchor="middle"
                fill="#ede4d2"
                fontSize="12"
              >
                {p.name}
              </text>
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2 + 18}
                textAnchor="middle"
                fill="#ede4d2"
                fontSize="16"
              >
                {Math.round(state[p.k] * 100)}
              </text>
            </g>
          ))}
          <text x="80" y="465" fill="#ede4d2" opacity=".6" fontSize="12">
            North Bridge Road
          </text>
          <text x="250" y="68" fill="#ede4d2" opacity=".6" fontSize="12">
            Sultan Gate
          </text>
        </g>
      </svg>
      <div className="mapfoot">
        <span>Eight parcels. Interwoven futures.</span>
        <span>↑ N</span>
      </div>
      {!compact && (
        <div className="legend">
          <span>
            <i />
            Living heritage
          </span>
          <span>
            <i style={{ background: '#3e7c6e' }} />
            Shared spaces
          </span>
          <span>
            <i style={{ background: '#d9a323' }} />
            Local livelihoods
          </span>
        </div>
      )}
    </div>
  );
}
