import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initial, levers, policy } from './model.ts';
import {
  leadScenario,
  getScenario,
  parcelScenario,
  requiredProtection,
  policyOwner,
} from './scenarios.ts';
import { scriptedPosition } from './negotiation.ts';
test('later scenarios follow irreversible conditions in a stable priority order', () => {
  assert.equal(leadScenario(initial), 'six-weeks');
  const later = { ...initial, year: 2036 };
  assert.equal(
    leadScenario({
      ...later,
      flags: ['EXODUS', 'HEAT_LOCK', 'LINEAGE_BROKEN'],
    }),
    'cannot-relearn',
  );
  assert.equal(
    leadScenario({ ...later, flags: ['EXODUS', 'HEAT_LOCK'] }),
    'who-belongs',
  );
  assert.equal(leadScenario({ ...later, habitability: 0.39 }), 'hot-afternoon');
  assert.equal(leadScenario({ ...later, continuity: 0.44 }), 'empty-stool');
  assert.equal(
    leadScenario({ ...later, vitality: 0.8, affordability: 0.4 }),
    'too-busy',
  );
});
test('all eight parcels open valid scenes with playable policies', () => {
  for (const id of [
    'trades',
    'commons',
    'shade',
    'arab',
    'bussorah',
    'visitors',
    'makers',
    'food',
  ]) {
    const scene = getScenario(parcelScenario(id, initial), initial);
    assert.equal(scene.options.length, 3);
    for (const [lever] of scene.options) assert.ok(levers[lever]);
  }
  assert.equal(
    parcelScenario('trades', { ...initial, flags: ['LINEAGE_BROKEN'] }),
    'cannot-relearn',
  );
});
test('later tenancy scenes never repeat the 2026 lease deadline', () => {
  const scene = getScenario('six-weeks', { ...initial, year: 2050 });
  assert.equal(scene.title, 'Room to stay');
  assert.doesNotMatch(scene.dialogue, /new lease|twice the rent|six weeks/i);
});
test('every explicit protection offer is accepted by the existing negotiation rules and has a valid cost', () => {
  for (const [lever, rider] of Object.entries(requiredProtection)) {
    const owner = policyOwner(lever);
    const result = scriptedPosition(lever, owner, rider.replaceAll('_', ' '));
    assert.equal(result.stance, 'conditional');
    assert.equal(result.rider, rider);
    assert.ok(Number.isFinite(policy({ lever, riders: [rider] }).cost));
    assert.equal(
      scriptedPosition(lever, 'not_the_owner', rider).stance,
      'hold',
    );
  }
  assert.equal(
    policy({ lever: 'rent_covenant', riders: ['compensation_fund'] }).cost,
    34,
  );
});
