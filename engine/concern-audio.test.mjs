import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initial } from './model.ts';
import { getScenario } from './scenarios.ts';
import manifest from '../public/audio/dialogue/manifest.json' with { type: 'json' };

test('every concern and later tenancy has matching recorded text and playable MP3 data', () => {
  for (const [district, file] of Object.entries({ 'kampong-glam': 'scenarios.json', chinatown: 'chinatown-scenarios.json', 'little-india': 'little-india-scenarios.json' })) {
    const scenes = JSON.parse(readFileSync(new URL(`../content/${file}`, import.meta.url), 'utf8'));
    for (const scene of scenes) {
      for (const year of scene.id === 'six-weeks' ? [2026, 2060, 2093] : [2026]) {
        const expected = getScenario(scene.id, { ...initial, year }, district);
        const key = `${district === 'kampong-glam' ? '' : district + '|'}scene|${scene.id}${year !== 2026 ? '|later' : ''}`;
        const clip = manifest[key];
        assert.ok(clip, key);
        assert.equal(clip.text, expected.dialogue, key);
        assert.equal(clip.source, 'elevenlabs');
        const bytes = readFileSync(new URL(`../public${clip.audio}`, import.meta.url));
        assert.ok(bytes.length > 1000, key);
        assert.ok(bytes.toString('ascii', 0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224), `Invalid MP3: ${key}`);
      }
    }
  }
});
