import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, programme, encode, decode, keys } from './model.ts';
const d = (lever, rider) => ({ lever, riders: rider ? [rider] : [] });
const record = (rounds) => ({
  v: 2,
  weights: [3, 3, 2, 2],
  rounds: rounds.map(programme),
});
const sustainable = record([
  [d('rent_covenant', 'compensation_fund'), d('cooling_retrofit')],
  [
    d('trade_grant'),
    d('visitor_levy', 'sunset_10y'),
    d('pedestrianise', 'loading_window'),
  ],
  [d('land_trust')],
]);
const growth = record([
  [d('night_economy', 'noise_curfew'), d('adaptive_reuse', 'archive_clause')],
  [d('night_economy', 'noise_curfew'), d('pedestrianise', 'loading_window')],
  [d('night_economy', 'noise_curfew'), d('adaptive_reuse', 'archive_clause')],
]);
test('multi-policy budgets and immediate effects apply once in programme order', () => {
  const state = run(
    { ...sustainable, rounds: sustainable.rounds.slice(0, 1) },
    2026,
  )[0];
  assert.equal(state.capacity, 2);
  assert.ok(Math.abs(state.affordability - 0.62) < 1e-10);
  assert.ok(Math.abs(state.habitability - 0.61) < 1e-10);
  assert.deepEqual(state.investments, ['rent_covenant', 'cooling_retrofit']);
  assert.throws(() =>
    run(
      record([[d('land_trust', 'compensation_fund'), d('cooling_retrofit')]]),
    ),
  );
});
test('programmes reject duplicates, fourth actions, nesting and v1 bundles', () => {
  assert.throws(() => run(record([[d('trade_grant'), d('trade_grant')]])));
  assert.throws(() => programme(Array(4).fill(d('trade_grant'))));
  assert.throws(() =>
    run({ v: 1, weights: [3, 3, 2, 2], rounds: sustainable.rounds }),
  );
  assert.throws(() =>
    run(
      record([
        [
          d('trade_grant'),
          { ...d('cooling_retrofit'), actions: [d('trade_grant')] },
        ],
      ]),
    ),
  );
});
test('maintained programmes produce a viable mixed ending while growth retains risks', () => {
  const good = run(sustainable).at(-1),
    bad = run(growth).at(-1);
  assert.ok(
    good.affordability > 0.5 && good.habitability > 0.5 && good.equity > 0.6,
  );
  assert.ok(good.affordability < 0.8 && good.habitability < 0.8);
  assert.ok(
    bad.flags.includes('EXODUS') && bad.flags.includes('LINEAGE_BROKEN'),
  );
  assert.ok(good.continuity - bad.continuity > 0.4);
  for (const r of [sustainable, growth]) {
    const t = run(r);
    assert.deepEqual(t, run(decode(encode(r))));
    for (let i = 0; i < t.length; i++) {
      for (const k of keys) assert.ok(t[i][k] >= 0.02 && t[i][k] <= 0.98);
      assert.ok(t[i].capacity >= 0 && t[i].capacity <= 100);
      if (i) for (const f of t[i - 1].flags) assert.ok(t[i].flags.includes(f));
    }
  }
});
test('renewals replace rather than infinitely stacking the same annual policy', () => {
  const t = run(
    record([[d('trade_grant')], [d('trade_grant')], [d('trade_grant')]]),
  );
  assert.equal(
    t.at(-1).investments.filter((x) => x === 'trade_grant').length,
    1,
  );
});
