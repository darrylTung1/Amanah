import type { State } from './model.ts';
import { districtRating } from './rating.ts';

export const littleIndiaLocations = [
  { id: 'sri-veeramakaliamman', name: 'Sri Veeramakaliamman Temple', parcel: 'commons', x: 65, y: 36, start: 'sri-veeramakaliamman-temple', future: 'sri-veeramakaliamman-temple' },
  { id: 'tan-teng-niah', name: 'Former House of Tan Teng Niah', parcel: 'shade', x: 55, y: 54, start: 'former-house-of-tan-teng-niah', future: 'former-house-of-tan-teng-niah' },
  { id: 'indian-heritage-centre', name: 'Indian Heritage Centre', parcel: 'bussorah', x: 19, y: 48, start: 'indian-heritage-centre', future: 'indian-heritage-centre' },
] as const;

export function littleIndiaArtwork(state: State, location?: { start: string; future: string }) {
  const score = districtRating(state).score;
  // Supplied 2094 artwork begins at the game's final council in 2093.
  const stage = state.year >= 2093 ? '2094' : state.year >= 2060 ? '2060' : 'start';
  const condition = stage === 'start' ? '' : stage === '2094' && score < 25 ? '-very-bad' : score < 50 ? '-bad' : '';
  const file = location ? stage === 'start' ? location.start : location.future : 'little-india';
  return `/images/little-india/${stage}/${file}${condition}.png`;
}
