import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, keys, people } from './model.ts';
import { characterMood } from './character-mood.ts';
const uniform = score => ({ ...initial, ...Object.fromEntries(keys.map(key => [key, score / 100])) });
test('expressions combine the overall score, personal outcomes and agreement', () => {
  const weights = people[0].weights;
  assert.equal(characterMood(initial, weights), 'neutral');
  assert.equal(characterMood(initial, weights, 'unmet'), 'sad');
  assert.equal(characterMood(initial, weights, 'met'), 'happy');
  assert.equal(characterMood(uniform(49), weights, 'met'), 'sad');
  assert.equal(characterMood(uniform(70), weights), 'happy');
  assert.equal(characterMood(uniform(70), weights, 'unmet'), 'sad');
  const personalLoss = { ...initial, affordability: .98, vitality: .25, continuity: .9, equity: .9, habitability: .9 };
  assert.equal(characterMood(personalLoss, people[3].weights), 'sad');
});
