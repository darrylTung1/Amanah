import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSave, saveKey } from './save.ts';

const save = () => ({
  version: 1,
  record: { v: 3, district: 'chinatown', weights: [3, 3, 2, 2], rounds: [] },
  draft: [{ lever: 'night_economy', riders: [] }],
  sceneId: null,
  lever: null,
  accepted: false,
  showingFuture: false,
});
test('saved drafts round-trip independently for each district', () => {
  const original = save();
  assert.deepEqual(readSave(JSON.stringify(original), 'chinatown'), original);
  assert.notEqual(saveKey('chinatown'), saveKey('little-india'));
  assert.throws(() => readSave(JSON.stringify(original), 'little-india'));
});
test('corrupt saves, invalid policies and inconsistent outcome screens are rejected', () => {
  for (const value of [
    '{',
    'null',
    JSON.stringify({ ...save(), version: 2 }),
    JSON.stringify({ ...save(), showingFuture: true }),
    JSON.stringify({ ...save(), draft: [{ lever: 'missing', riders: [] }] }),
  ]) {
    assert.throws(() => readSave(value, 'chinatown'));
  }
});
test('completed councils restore without an unfinished draft', () => {
  const original = save();
  original.record.rounds = Array.from({ length: 3 }, () => ({
    lever: 'night_economy',
    riders: [],
  }));
  original.draft = [];
  original.showingFuture = true;
  assert.deepEqual(readSave(JSON.stringify(original), 'chinatown'), original);
});
