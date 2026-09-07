import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { initial, keys } from './model.ts';
import { chinatownArtwork, chinatownLocations } from './chinatown-art.ts';

test('Chinatown artwork uses period and overall district rating at exact boundaries', () => {
  const cases = [
    [2026, 10, 'start', ''], [2059, 20, 'start', ''],
    [2060, 50, '2060', ''], [2060, 49, '2060', '-bad'],
    [2060, 24, '2060', '-bad'], [2092, 24, '2060', '-bad'],
    [2093, 50, '2094', ''], [2093, 49, '2094', '-bad'],
    [2093, 25, '2094', '-bad'], [2093, 24, '2094', '-very-bad'],
    [2126, 24, '2094', '-very-bad'],
  ];
  for (const [year, score, stage, suffix] of cases) {
    const state = { ...initial, year, ...Object.fromEntries(keys.map(k => [k, score / 100])) };
    for (const place of chinatownLocations) {
      const path = chinatownArtwork(state, place);
      assert.equal(path, `/images/chinatown/${stage}/${stage === 'start' ? place.start : place.future}${suffix}.png`);
      assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
    }
  }
});

test('asset condition uses all five metrics rather than a location-specific metric', () => {
  const state = { ...initial, year: 2093, affordability: 0.1, continuity: 0.9, vitality: 0.9, equity: 0.9, habitability: 0.9 };
  assert.equal(chinatownArtwork(state, chinatownLocations[1]), '/images/chinatown/2094/duxton.png');
});
