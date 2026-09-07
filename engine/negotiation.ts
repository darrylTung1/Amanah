import { allowedRiders, levers, type LeverId, type RiderId } from './model.ts';
export type Position = {
  stance: 'concede' | 'hold' | 'conditional';
  rider: RiderId | null;
  reason_line: string;
};
export function resolvePosition(
  lever: LeverId,
  person: string,
  input: unknown,
): Position {
  const hold: Position = {
    stance: 'hold',
    rider: null,
    reason_line: 'The proposal needs a valid agreement before it can proceed.',
  };
  if (!input || typeof input !== 'object') return hold;
  const p = input as Position;
  if (
    !['concede', 'hold', 'conditional'].includes(p.stance) ||
    typeof p.reason_line !== 'string' ||
    p.reason_line.length > 240 ||
    p.reason_line.trim().split(/\s+/).length > 18
  )
    return hold;
  if (p.rider !== null && !allowedRiders(lever).includes(p.rider)) return hold;
  const veto = 'veto' in levers[lever] ? levers[lever].veto : undefined;
  if (veto && veto !== person) return hold;
  if (
    (p.stance === 'conditional' && !p.rider) ||
    (p.stance !== 'conditional' && p.rider !== null)
  )
    return hold;
  return {
    stance: p.stance,
    rider: p.rider,
    reason_line: p.reason_line.trim(),
  };
}
export function scriptedPosition(
  lever: LeverId,
  person: string,
  argument: string,
): Position {
  const required: Partial<Record<LeverId, RiderId>> = {
    rent_covenant: 'compensation_fund',
    land_trust: 'compensation_fund',
    pedestrianise: 'loading_window',
    visitor_levy: 'sunset_10y',
    adaptive_reuse: 'archive_clause',
    night_economy: 'noise_curfew',
  };
  const r = required[lever];
  const words: Partial<Record<RiderId, RegExp>> = {
    compensation_fund: /compensat|fund|refinanc/i,
    loading_window: /load|deliver|morning/i,
    sunset_10y: /sunset|review|ten|10/i,
    archive_clause: /archiv|record|protect/i,
    noise_curfew: /noise|curfew|quiet/i,
  };
  return resolvePosition(
    lever,
    person,
    r && words[r]?.test(argument)
      ? {
          stance: 'conditional',
          rider: r,
          reason_line: `I can accept this with the ${r.replaceAll('_', ' ')} condition.`,
        }
      : {
          stance: 'hold',
          rider: null,
          reason_line:
            'Address my specific concern with a concrete protection, then we can talk.',
        },
  );
}
