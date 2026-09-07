import { initial, keys, type State } from './model.ts';
import { districtRating } from './rating.ts';

export type Agreement = 'none' | 'met' | 'unmet';
export function characterMood(state: State, weights: readonly number[], agreement: Agreement = 'none') {
  const score = districtRating(state).score;
  const total = weights.reduce((sum, weight) => sum + Math.abs(weight), 0);
  const benefit = total ? keys.reduce((sum, key, index) => sum + (state[key] - initial[key]) * weights[index], 0) / total : 0;
  if (score < 50 || agreement === 'unmet' || benefit < -0.02) return 'sad';
  if (agreement === 'met' || (score >= 60 && benefit >= 0)) return 'happy';
  return 'neutral';
}
