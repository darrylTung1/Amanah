import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { initial, keys } from './model.ts';
import { kampongGlamArtwork, kampongGlamLocations } from './kampong-glam-art.ts';
import { parcelScenario, getScenario } from './scenarios.ts';
import manifest from '../public/audio/dialogue/manifest.json' with { type: 'json' };

test('Kampong Glam overview and landmarks have assets at every year and score boundary', () => {
  for (const [year, score, stage, suffix] of [
    [2026, 10, 'start', ''], [2059, 20, 'start', ''],
    [2060, 50, '2060', ''], [2060, 49, '2060', '-bad'],
    [2060, 24, '2060', '-bad'], [2092, 24, '2060', '-bad'],
    [2093, 50, '2094', ''], [2093, 49, '2094', '-bad'],
    [2093, 25, '2094', '-bad'], [2093, 24, '2094', '-very-bad'],
    [2126, 24, '2094', '-very-bad'],
  ]) {
    const state = { ...initial, year, ...Object.fromEntries(keys.map(k => [k, score / 100])) };
    for (const place of [undefined, ...kampongGlamLocations]) {
      const path = kampongGlamArtwork(state, place);
      assert.equal(path, `/images/kampong-glam/${stage}/${place?.start ?? 'kampung-glam'}${suffix}.png`);
      assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
    }
  }
  const mixed = { ...initial, year: 2093, affordability: 0.1, continuity: 0.9, vitality: 0.9, equity: 0.9, habitability: 0.9 };
  assert.equal(kampongGlamArtwork(mixed), '/images/kampong-glam/2094/kampung-glam.png');
});

test('Kampong Glam buttons open their local concerns with matching voice recordings', () => {
  const expected = { 'sultan-mosque': 'who-belongs', 'arab-street': 'six-weeks', 'haji-lane': 'too-busy' };
  for (const year of [2026, 2060, 2093]) {
    for (const place of kampongGlamLocations) {
      const state = { ...initial, year };
      const id = parcelScenario(place.parcel, state);
      assert.equal(id, expected[place.id]);
      const scene = getScenario(id, state, 'kampong-glam');
      const key = `scene|${id}${id === 'six-weeks' && year !== 2026 ? '|later' : ''}`;
      assert.equal(manifest[key].text, scene.dialogue);
    }
  }
});
