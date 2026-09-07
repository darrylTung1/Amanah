export const keys = [
  'affordability',
  'continuity',
  'vitality',
  'equity',
  'habitability',
] as const;
export type Metric = (typeof keys)[number];
export type Values = Record<Metric, number>;
export type Flag =
  | 'LINEAGE_BROKEN'
  | 'MONOCULTURE'
  | 'EXODUS'
  | 'HEAT_LOCK'
  | 'TRUST_DIVIDEND';
export type State = Values & {
  year: number;
  capacity: number;
  flags: Flag[];
  streaks: [number, number, number];
};
export const initial: State = {
  year: 2026,
  affordability: 0.52,
  continuity: 0.61,
  vitality: 0.68,
  equity: 0.44,
  habitability: 0.49,
  capacity: 60,
  flags: [],
  streaks: [0, 0, 0],
};
type Policy = {
  name: string;
  cost: number;
  immediate: Partial<Values>;
  annual: Partial<Values>;
  decay: number;
  veto?: string;
};
export const levers = {
  rent_covenant: {
    name: 'Rent covenant',
    cost: 22,
    immediate: { affordability: 0.1 },
    annual: { affordability: 0.012, continuity: 0.006, vitality: -0.004 },
    decay: 0.97,
    veto: 'landlord_teo',
  },
  trade_grant: {
    name: 'Trade & apprenticeship grant',
    cost: 18,
    immediate: { continuity: 0.08 },
    annual: { continuity: 0.01, equity: 0.004 },
    decay: 0.95,
  },
  pedestrianise: {
    name: 'Pedestrianise & shade',
    cost: 26,
    immediate: { habitability: 0.1, vitality: 0.05 },
    annual: { habitability: 0.006, vitality: 0.004, affordability: -0.003 },
    decay: 0.98,
    veto: 'operator_jo',
  },
  visitor_levy: {
    name: 'Community visitor levy',
    cost: -15,
    immediate: { vitality: -0.04, equity: 0.06 },
    annual: { equity: 0.006, vitality: -0.003 },
    decay: 0.99,
    veto: 'operator_jo',
  },
  land_trust: {
    name: 'Community land trust',
    cost: 40,
    immediate: { affordability: 0.06, continuity: 0.04, equity: 0.08 },
    annual: { affordability: 0.008, equity: 0.006 },
    decay: 0.99,
    veto: 'landlord_teo',
  },
  adaptive_reuse: {
    name: 'Adaptive reuse',
    cost: 14,
    immediate: { vitality: 0.06, equity: 0.03 },
    annual: { vitality: 0.005, affordability: -0.004 },
    decay: 0.98,
    veto: 'custodian_rahim',
  },
  cooling_retrofit: {
    name: 'Cooling retrofit',
    cost: 24,
    immediate: { habitability: 0.12 },
    annual: { habitability: 0.008 },
    decay: 0.96,
  },
  night_economy: {
    name: 'Expand the night economy',
    cost: 8,
    immediate: { vitality: 0.1 },
    annual: {
      vitality: 0.008,
      habitability: -0.006,
      equity: -0.004,
      continuity: -0.005,
    },
    decay: 0.99,
    veto: 'tenant_salmah',
  },
} satisfies Record<string, Policy>;
export type LeverId = keyof typeof levers;
export const riders = {
  sunset_10y: 'Ten-year sunset',
  compensation_fund: 'Owner compensation fund',
  lineage_only: 'Lineage trades only',
  loading_window: 'Morning loading window',
  youth_board_seat: 'Youth board seat',
  noise_curfew: 'Noise curfew',
  archive_clause: 'Archive protection clause',
};
export type RiderId = keyof typeof riders;
export type Decision = { lever: LeverId; riders: RiderId[] };
export type DecisionRecord = {
  v: 1;
  weights: [number, number, number, number];
  rounds: Decision[];
};
export function allowedRiders(id: LeverId): RiderId[] {
  return [
    'sunset_10y',
    'youth_board_seat',
    ...(['rent_covenant', 'land_trust'].includes(id)
      ? ['compensation_fund']
      : []),
    ...(['rent_covenant', 'trade_grant'].includes(id) ? ['lineage_only'] : []),
    ...(id === 'pedestrianise' ? ['loading_window'] : []),
    ...(id === 'night_economy' ? ['noise_curfew'] : []),
    ...(id === 'adaptive_reuse' ? ['archive_clause'] : []),
  ] as RiderId[];
}
export function policy(d: Decision): Policy {
  const p: Policy = structuredClone(levers[d.lever]);
  if (
    d.riders.length > 1 ||
    d.riders.some((r) => !allowedRiders(d.lever).includes(r))
  )
    throw Error('Invalid rider');
  for (const r of d.riders) {
    if (r === 'compensation_fund') p.cost += 12;
    if (r === 'lineage_only') {
      for (const k of keys) {
        if (p.immediate[k]) p.immediate[k]! *= 0.7;
        if (p.annual[k]) p.annual[k]! *= 0.7;
      }
      p.annual.continuity = (p.annual.continuity ?? 0) + 0.004;
    }
    if (r === 'loading_window')
      p.annual.habitability = (p.annual.habitability ?? 0) - 0.002;
    if (r === 'youth_board_seat')
      p.annual.equity = (p.annual.equity ?? 0) + 0.003;
    if (r === 'noise_curfew') {
      p.annual.habitability! *= 0.5;
      p.annual.equity! *= 0.5;
      p.immediate.vitality! *= 0.7;
    }
    if (r === 'archive_clause') {
      p.cost += 6;
      p.immediate.continuity = (p.immediate.continuity ?? 0) + 0.02;
    }
  }
  return p;
}
export const people = [
  {
    id: 'tenant_salmah',
    name: 'Mdm Salmah',
    role: 'Third-generation textile trader',
    initials: 'MS',
    weights: [0.38, 0.27, 0.05, 0.2, 0.1],
    evidence:
      'Twenty-eight years on Arab Street. My renewal asks for 2.1 times the rent. I have six weeks.',
    concern: 'A shop is a livelihood, not just a façade.',
  },
  {
    id: 'youth_faiz',
    name: 'Faiz',
    role: 'Youth arts organiser',
    initials: 'F',
    weights: [0.1, 0.18, 0.14, 0.34, 0.24],
    evidence:
      'Our programmes bring young people here. They need affordable space and a say in what comes next.',
    concern: 'Let the next generation belong here.',
  },
  {
    id: 'custodian_rahim',
    name: 'Ustaz Rahim',
    role: 'Heritage custodian & archivist',
    initials: 'UR',
    weights: [0.16, 0.52, 0.1, 0.14, 0.08],
    evidence:
      'The archive records trade lineages. Once an apprenticeship ends, a display cannot replace it.',
    concern: 'Keep the knowledge alive, not merely on display.',
  },
  {
    id: 'landlord_teo',
    name: 'Mr Teo',
    role: 'Family property trust',
    initials: 'MT',
    weights: [-0.32, 0.08, 0.52, -0.04, 0.12],
    evidence:
      'Our family trust has refinancing obligations. A covenant needs a credible compensation plan.',
    concern: 'Who pays for the promise you want me to make?',
  },
  {
    id: 'operator_jo',
    name: 'Jo',
    role: 'Food & tour operator',
    initials: 'J',
    weights: [-0.08, 0.18, 0.48, 0.04, 0.22],
    evidence:
      'Footfall supports our staff. Deliveries still need access when streets close to traffic.',
    concern: 'A living district also needs a working economy.',
  },
];
export const flagText: Record<Flag, string> = {
  LINEAGE_BROKEN:
    'Trade knowledge was lost. Continuity can recover only slowly.',
  MONOCULTURE: 'A visitor monoculture permanently intensified rent pressure.',
  EXODUS: 'Displacement broke community networks. Equity is now capped.',
  HEAT_LOCK: 'Heat and crowding damaged liveability and slowed recovery.',
  TRUST_DIVIDEND:
    'Sustained trust strengthened shared capacity and continuity.',
};
const clamp = (x: number, min = 0.02, max = 0.98) =>
  Math.min(max, Math.max(min, x));
export function run(record: DecisionRecord, end = 2126): State[] {
  validate(record);
  let s = structuredClone(initial);
  const timeline: State[] = [];
  const active: { p: Policy; year: number; sunset: boolean }[] = [];
  while (s.year <= end) {
    const round = [2026, 2036, 2050].indexOf(s.year);
    const d = record.rounds[round];
    if (d) {
      const p = policy(d);
      if (s.capacity < p.cost) throw Error('Insufficient capacity');
      s.capacity = clamp(s.capacity - p.cost, 0, 100);
      for (const k of keys) s[k] = clamp(s[k] + (p.immediate[k] ?? 0));
      active.push({ p, year: s.year, sunset: d.riders.includes('sunset_10y') });
    }
    timeline.push(structuredClone(s));
    if (s.year === end) break;
    const {
      affordability: A,
      continuity: C,
      vitality: V,
      equity: E,
      habitability: H,
    } = s;
    const delta: Values = {
      affordability:
        -0.008 -
        (s.flags.includes('MONOCULTURE') ? 0.06 : 0.03) * Math.max(0, V - 0.6),
      continuity:
        -0.006 - 0.07 * Math.max(0, 0.5 - A) + 0.02 * Math.max(0, A - 0.65),
      vitality: 0.004 + 0.045 * (C - 0.5) - 0.025 * Math.max(0, 0.4 - H),
      equity: -0.005 + 0.05 * (A - 0.5) - 0.03 * Math.max(0, V - 0.7),
      habitability: -0.004 - 0.02 * Math.max(0, V - 0.65),
    };
    let dk = 1.2 + 6 * Math.max(0, V - 0.5);
    for (const a of active) {
      const age = s.year - a.year;
      const decay =
        a.sunset && age >= 10
          ? Math.pow(a.p.decay, 10) * Math.pow(0.8, age - 10)
          : Math.pow(a.p.decay, age);
      for (const k of keys) delta[k] += (a.p.annual[k] ?? 0) * decay;
    }
    if (s.flags.includes('TRUST_DIVIDEND')) {
      dk += 3;
      delta.continuity += 0.004;
    }
    if (s.flags.includes('LINEAGE_BROKEN'))
      delta.continuity = Math.min(0.003, delta.continuity);
    if (s.flags.includes('HEAT_LOCK')) {
      delta.vitality -= 0.01;
      if (delta.habitability > 0) delta.habitability *= 0.5;
    }
    for (const k of keys)
      s[k] = clamp(
        s[k] + delta[k],
        0.02,
        k === 'equity' && s.flags.includes('EXODUS') ? 0.5 : 0.98,
      );
    s.capacity = clamp(s.capacity + dk, 0, 100);
    s.year++;
    s.streaks = [
      s.continuity < 0.3 ? s.streaks[0] + 1 : 0,
      s.equity < 0.25 ? s.streaks[1] + 1 : 0,
      s.equity > 0.65 && s.continuity > 0.6 ? s.streaks[2] + 1 : 0,
    ];
    const add = (f: Flag, condition: boolean) => {
      if (condition && !s.flags.includes(f)) s.flags.push(f);
    };
    add('LINEAGE_BROKEN', s.streaks[0] >= 5);
    add('MONOCULTURE', s.vitality > 0.8 && s.continuity < 0.45);
    add('EXODUS', s.streaks[1] >= 3);
    add('HEAT_LOCK', s.habitability < 0.35);
    add('TRUST_DIVIDEND', s.streaks[2] >= 5);
  }
  return timeline;
}
export function validate(x: unknown): asserts x is DecisionRecord {
  if (!x || typeof x !== 'object') throw Error('Invalid decision record');
  const r = x as DecisionRecord;
  if (
    r.v !== 1 ||
    !Array.isArray(r.weights) ||
    r.weights.length !== 4 ||
    r.weights.some((n) => !Number.isInteger(n) || n < 0 || n > 10) ||
    r.weights.reduce((a, b) => a + b, 0) !== 10 ||
    !Array.isArray(r.rounds) ||
    r.rounds.length > 3
  )
    throw Error('Invalid decision record');
  for (const d of r.rounds) {
    if (!d || !Object.hasOwn(levers, d.lever) || !Array.isArray(d.riders))
      throw Error('Invalid decision');
    policy(d);
  }
}
export const encode = (r: DecisionRecord) => {
  validate(r);
  return btoa(JSON.stringify(r))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
};
export const decode = (v: string): DecisionRecord => {
  if (v.length > 3000 || !/^[\w-]+$/.test(v))
    throw Error('Invalid receipt link');
  const r: unknown = JSON.parse(
    atob(v.replaceAll('-', '+').replaceAll('_', '/')),
  );
  validate(r);
  return r;
};
export const signature = (s: State) =>
  `${s.year}|${keys
    .slice(0, 4)
    .map(
      (k) => k[0].toUpperCase() + (s[k] < 0.4 ? 'L' : s[k] < 0.65 ? 'M' : 'H'),
    )
    .join('')}|${[...s.flags].sort().join(',')}`;
export const utilities = (s: State) =>
  people
    .map((p) => ({
      ...p,
      change:
        keys.reduce(
          (sum, k, i) => sum + (s[k] - initial[k]) * p.weights[i],
          0,
        ) / p.weights.reduce((sum, w) => sum + Math.abs(w), 0),
    }))
    .sort((a, b) => b.change - a.change);
