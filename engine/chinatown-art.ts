import type { State } from './model.ts';
import { districtRating } from './rating.ts';

export const chinatownLocations = [
  { id: 'sri-mariamman', name: 'Sri Mariamman Temple', parcel: 'commons', x: 36, y: 28, start: 'srimarianam', future: 'sri-marianam' },
  { id: 'duxton', name: 'Duxton Road', parcel: 'arab', x: 29, y: 62, start: 'duxton-road', future: 'duxton' },
  { id: 'maxwell', name: 'Maxwell Food Centre', parcel: 'food', x: 47, y: 73, start: 'maxwell', future: 'maxwell' },
] as const;
export type ChinatownLocation = (typeof chinatownLocations)[number];

export function chinatownArtwork(state: State, location: { start: string; future: string }) {
  const score = districtRating(state).score;
  // The supplied 2094 artwork represents the game's final (2093) council.
  const stage = state.year >= 2093 ? '2094' : state.year >= 2060 ? '2060' : 'start';
  const condition = stage === 'start' ? '' : stage === '2094' && score < 25 ? '-very-bad' : score < 50 ? '-bad' : '';
  const file = stage === 'start' ? location.start : location.future;
  return `/images/chinatown/${stage}/${file}${condition}.png`;
}
