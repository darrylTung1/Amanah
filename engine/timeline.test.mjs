import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  run,
  encode,
  decode,
  councilYears,
  outcomeYears,
  programme,
  utilities,
} from './model.ts';
import { testimony } from '../content/narration.ts';

const d = (lever, rider) => ({ lever, riders: rider ? [rider] : [] });
const record = {
  v: 3,
  weights: [3, 3, 2, 2],
  rounds: [
    programme([d('rent_covenant', 'compensation_fund'), d('cooling_retrofit')]),
    programme([
      d('trade_grant'),
      d('visitor_levy', 'sunset_10y'),
      d('pedestrianise', 'loading_window'),
    ]),
    programme([d('land_trust'), d('visitor_levy', 'sunset_10y')]),
  ],
};

test('new councils intervene at 2026, 2060 and 2093, with no hidden 2036 or 2050 moves', () => {
  assert.deepEqual(councilYears(record), [2026, 2060, 2093]);
  assert.deepEqual(outcomeYears(record), [2060, 2093, 2126]);
  const firstOnly = { ...record, rounds: record.rounds.slice(0, 1) };
  assert.deepEqual(run(record, 2059), run(firstOnly, 2059));
  assert.notDeepEqual(run(record, 2060).at(-1), run(firstOnly, 2060).at(-1));
  const firstTwo = { ...record, rounds: record.rounds.slice(0, 2) };
  assert.deepEqual(run(record, 2092), run(firstTwo, 2092));
  assert.notDeepEqual(run(record, 2093).at(-1), run(firstTwo, 2093).at(-1));
  assert.equal(run(record).length, 101);
  assert.deepEqual(run(decode(encode(record))), run(record));
});

test('legacy records retain their exact annual trajectories', () => {
  const hashes = [
    'e9dc746b1dc2fa1559d9aec2da3e30b5477cd09f0bacc7b7b76f257849471fa9',
    '2de5aaad8ab0323318fc93d74a9fbe52fb49bd7b4de3c3365b67d8ac8a986c40',
  ];
  for (const v of [1, 2]) {
    const legacy = {
      ...record,
      v,
      rounds:
        v === 1
          ? record.rounds.map(({ lever, riders }) => ({ lever, riders }))
          : record.rounds,
    };
    assert.deepEqual(councilYears(legacy), [2026, 2036, 2050]);
    assert.equal(
      createHash('sha256')
        .update(JSON.stringify(run(legacy)))
        .digest('hex'),
      hashes[v - 1],
    );
  }
});

test('future testimony names the new year and generation', () => {
  const timeline = run(record);
  for (const year of outcomeYears(record)) {
    const clip = testimony(timeline.find((s) => s.year === year));
    assert.ok(clip.persona.includes(String(year)));
    assert.ok(!clip.text.includes('Ten years'));
  }
});
test('shared stewardship still benefits every stakeholder on the new timeline', () => {
  for (const person of utilities(run(record).at(-1))) {
    assert.ok(
      person.change > 0,
      `${person.name} should gain from shared stewardship`,
    );
  }
});
