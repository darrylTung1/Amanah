import data from '../content/scenarios.json' with { type: 'json' };
import chinatown from '../content/chinatown-scenarios.json' with { type: 'json' };
import type { DistrictId } from './model.ts';
import { type State, type LeverId, type RiderId, levers } from './model.ts';
export type Scenario = {
  id: string;
  title: string;
  place: string;
  speaker: string;
  dialogue: string;
  question: string;
  options: [LeverId, string][];
  consequence: string;
};
const scenarios = data as unknown as Scenario[];
export const requiredProtection: Partial<Record<LeverId, RiderId>> = {
  rent_covenant: 'compensation_fund',
  land_trust: 'compensation_fund',
  pedestrianise: 'loading_window',
  visitor_levy: 'sunset_10y',
  adaptive_reuse: 'archive_clause',
  night_economy: 'noise_curfew',
};
export function leadScenario(s: State): string {
  if (s.year === 2026) return 'six-weeks';
  if (s.flags.includes('LINEAGE_BROKEN')) return 'cannot-relearn';
  if (s.flags.includes('EXODUS')) return 'who-belongs';
  if (s.flags.includes('HEAT_LOCK') || s.habitability < 0.4)
    return 'hot-afternoon';
  if (s.continuity < 0.45) return 'empty-stool';
  if (s.equity < 0.35) return 'who-belongs';
  if (
    s.flags.includes('MONOCULTURE') ||
    (s.vitality > 0.7 && s.affordability < 0.5)
  )
    return 'too-busy';
  if (s.vitality < 0.4) return 'new-keys';
  return 'six-weeks';
}
export function getScenario(
  id: string,
  s: State,
  district: DistrictId = 'kampong-glam',
): Scenario {
  if (district === 'chinatown') {
    const scene =
      (chinatown as unknown as Scenario[]).find((x) => x.id === id) ??
      (chinatown[0] as unknown as Scenario);
    if (scene.id === 'hot-afternoon' && s.habitability >= 0.4)
      return { ...scene, title: 'A comfortable route' };
    if (scene.id === 'six-weeks' && s.year !== 2026)
      return {
        ...scene,
        title: 'Keeping a place in Chinatown',
        dialogue:
          'The lease is only one part of staying here. People need customers, room to learn and neighbours who can afford to remain. Which part of that promise will this council keep?',
      };
    return scene;
  }
  const scene = scenarios.find((x) => x.id === id) ?? scenarios[0];
  if (scene.id === 'hot-afternoon' && s.habitability >= 0.4)
    return { ...scene, title: 'A cooler street' };
  if (scene.id === 'six-weeks' && s.year !== 2026)
    return {
      ...scene,
      title: 'Room to stay',
      dialogue:
        'Keeping a trade alive means keeping room for the people who practise it. Each decision changes what staying here requires. What will make room for the next generation?',
    };
  return scene;
}
export function parcelScenario(parcel: string, s: State): string {
  const mapping: Record<string, string> = {
    trades: s.flags.includes('LINEAGE_BROKEN')
      ? 'cannot-relearn'
      : 'empty-stool',
    commons: 'who-belongs',
    shade: 'hot-afternoon',
    arab: 'six-weeks',
    bussorah: 'new-keys',
    visitors: 'too-busy',
    makers: 'everyday-space',
    food: 'after-dark',
  };
  return mapping[parcel] ?? leadScenario(s);
}
export function sceneParcel(id: string): string {
  return (
    (
      {
        'six-weeks': 'arab',
        'empty-stool': 'trades',
        'cannot-relearn': 'trades',
        'too-busy': 'visitors',
        'after-dark': 'food',
        'hot-afternoon': 'shade',
        'who-belongs': 'commons',
        'everyday-space': 'makers',
        'new-keys': 'bussorah',
      } as Record<string, string>
    )[id] ?? 'arab'
  );
}
export const policyExplanation: Record<LeverId, string> = {
  rent_covenant:
    'Improve affordability and support continuity, with a small drag on economic activity.',
  trade_grant:
    'Support apprenticeships and living trades. Rent pressure remains.',
  pedestrianise:
    'Improve shade, walking and activity. More demand can put pressure on rents.',
  visitor_levy:
    'Raise shared funds and equity, with a reduction in visitor activity.',
  land_trust:
    'Support affordability and shared ownership at a substantial upfront cost.',
  adaptive_reuse:
    'Bring new activity into old spaces; affordability faces additional pressure.',
  cooling_retrofit:
    'Improve everyday comfort. It does not directly address rents or skills.',
  night_economy:
    'Increase activity, with costs to continuity, equity and habitability.',
};
export function policyOwner(id: LeverId) {
  const p = levers[id];
  return 'veto' in p ? p.veto : null;
}
