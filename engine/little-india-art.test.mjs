import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { initial, keys } from './model.ts';
import { littleIndiaArtwork, littleIndiaLocations } from './little-india-art.ts';
import { parcelScenario, getScenario } from './scenarios.ts';
import manifest from '../public/audio/dialogue/manifest.json' with { type: 'json' };

test('Little India overview and landmarks have assets at every year and score boundary', () => {
  for (const [year, score, stage, suffix] of [
    [2026, 10, 'start', ''], [2059, 20, 'start', ''],
    [2060, 50, '2060', ''], [2060, 49, '2060', '-bad'],
    [2060, 24, '2060', '-bad'], [2092, 24, '2060', '-bad'],
    [2093, 50, '2094', ''], [2093, 49, '2094', '-bad'],
    [2093, 25, '2094', '-bad'], [2093, 24, '2094', '-very-bad'],
    [2126, 24, '2094', '-very-bad'],
  ]) {
    const state = { ...initial, year, ...Object.fromEntries(keys.map(k => [k, score / 100])) };
    for (const place of [undefined, ...littleIndiaLocations]) {
      const path = littleIndiaArtwork(state, place);
      assert.equal(path, `/images/little-india/${stage}/${place?.start ?? 'little-india'}${suffix}.png`);
      assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
    }
  }
  const mixed = { ...initial, year: 2093, affordability: 0.1, continuity: 0.9, vitality: 0.9, equity: 0.9, habitability: 0.9 };
  assert.equal(littleIndiaArtwork(mixed), '/images/little-india/2094/little-india.png');
});

test('Little India buttons open their local concerns with matching voice recordings', () => {
  const expected = { 'sri-veeramakaliamman': 'who-belongs', 'tan-teng-niah': 'hot-afternoon', 'indian-heritage-centre': 'new-keys' };
  for (const year of [2026, 2060, 2093]) {
    for (const place of littleIndiaLocations) {
      const state = { ...initial, year };
      const id = parcelScenario(place.parcel, state);
      assert.equal(id, expected[place.id]);
      const scene = getScenario(id, state, 'little-india');
      const key = `little-india|scene|${id}${id === 'six-weeks' && year !== 2026 ? '|later' : ''}`;
      assert.equal(manifest[key].text, scene.dialogue);
    }
  }
});
