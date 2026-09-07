import test from 'node:test';
import assert from 'node:assert/strict';
import { districtRating } from './rating.ts';
import { initial, keys } from './model.ts';
test('rating averages all five categories without including capacity', () => {
  assert.equal(districtRating(initial).score, 55);
  assert.equal(districtRating({ ...initial, capacity: 0 }).score, 55);
  assert.equal(
    districtRating(Object.fromEntries(keys.map((k) => [k, 1]))).score,
    100,
  );
});
test('a high average never conceals a critically low category', () => {
  const result = districtRating({
    ...Object.fromEntries(keys.map((k) => [k, 1])),
    equity: 0.2,
  });
  assert.equal(result.score, 84);
  assert.deepEqual(result.critical, ['equity']);
});
