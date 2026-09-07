import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  run,
  encode,
  decode,
  levers,
  allowedRiders,
  policy,
  keys,
} from './model.ts';
const record = (rounds = []) => ({ v: 1, weights: [3, 3, 2, 2], rounds });
test('inaction breaks lineage by 2126', () =>
  assert.ok(run(record()).at(-1).flags.includes('LINEAGE_BROKEN')));
test('compensated covenant preserves affordability above .50 at 2050', () =>
  assert.ok(
    run(
      record([{ lever: 'rent_covenant', riders: ['compensation_fund'] }]),
      2050,
    ).at(-1).affordability > 0.5,
  ));
test('three night economy moves trigger monoculture and exodus', () => {
  const s = run(
    record(Array(3).fill({ lever: 'night_economy', riders: [] })),
  ).at(-1);
  assert.ok(s.flags.includes('MONOCULTURE'));
  assert.ok(s.flags.includes('EXODUS'));
});
test('URL roundtrip reproduces every annual state', () => {
  const r = record([{ lever: 'land_trust', riders: ['compensation_fund'] }]);
  assert.deepEqual(run(r), run(decode(encode(r))));
});
test('all single policies and riders remain bounded and flags irreversible', () => {
  for (const lever of Object.keys(levers)) {
    for (const rider of [null, ...allowedRiders(lever)]) {
      const t = run(record([{ lever, riders: rider ? [rider] : [] }]));
      for (let i = 0; i < t.length; i++) {
        for (const k of keys) assert.ok(t[i][k] >= 0.02 && t[i][k] <= 0.98);
        assert.ok(t[i].capacity >= 0 && t[i].capacity <= 100);
        if (i)
          for (const f of t[i - 1].flags) assert.ok(t[i].flags.includes(f));
      }
    }
  }
});
test('malformed records and incompatible riders are rejected', () => {
  for (const x of ['bad', 'e30', 'a'.repeat(4000)])
    assert.throws(() => decode(x));
  assert.throws(() =>
    policy({ lever: 'cooling_retrofit', riders: ['noise_curfew'] }),
  );
  assert.throws(() => run({ ...record(), weights: [10, 10, 0, 0] }));
});
test('capacity is charged including compensation and insufficient funding rejected', () => {
  assert.equal(
    run(
      record([{ lever: 'land_trust', riders: ['compensation_fund'] }]),
      2026,
    )[0].capacity,
    8,
  );
  assert.throws(() =>
    run(
      record([
        { lever: 'land_trust', riders: ['compensation_fund'] },
        { lever: 'land_trust', riders: ['compensation_fund'] },
      ]),
    ),
  );
});
