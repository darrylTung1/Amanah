import type { State } from './model.ts';
import { districtRating } from './rating.ts';

export const kampongGlamLocations = [
  { id: 'sultan-mosque', name: 'Sultan Mosque', parcel: 'commons', x: 57, y: 48, start: 'sultan-mosque', future: 'sultan-mosque' },
  { id: 'arab-street', name: 'Arab Street', parcel: 'arab', x: 33, y: 64, start: 'arab-street', future: 'arab-street' },
  { id: 'haji-lane', name: 'Haji Lane', parcel: 'visitors', x: 30, y: 36, start: 'haji-lane', future: 'haji-lane' },
] as const;

export function kampongGlamArtwork(state: State, location?: { start: string; future: string }) {
  const score = districtRating(state).score;
  // The supplied 2094 artwork represents the game's final (2093) council.
  const stage = state.year >= 2093 ? '2094' : state.year >= 2060 ? '2060' : 'start';
  const condition = stage === 'start' ? '' : stage === '2094' && score < 25 ? '-very-bad' : score < 50 ? '-bad' : '';
  const file = location ? stage === 'start' ? location.start : location.future : 'kampung-glam';
  return `/images/kampong-glam/${stage}/${file}${condition}.png`;
}
