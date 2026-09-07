import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePosition, scriptedPosition } from './negotiation.ts';
test('only the veto holder may release a restricted policy', () => {
  assert.equal(
    resolvePosition('rent_covenant', 'youth_faiz', {
      stance: 'concede',
      rider: null,
      reason_line: 'Yes.',
    }).stance,
    'hold',
  );
});
test('reject wrong riders, inconsistent stances, and oversized explanations', () => {
  for (const p of [
    { stance: 'conditional', rider: 'noise_curfew', reason_line: 'Yes' },
    { stance: 'conditional', rider: null, reason_line: 'Yes' },
    { stance: 'concede', rider: 'compensation_fund', reason_line: 'Yes' },
    { stance: 'concede', rider: null, reason_line: 'word '.repeat(19) },
  ])
    assert.equal(
      resolvePosition('rent_covenant', 'landlord_teo', p).stance,
      'hold',
    );
});
test('written negotiation requires the specific concern to be addressed', () => {
  assert.equal(
    scriptedPosition('rent_covenant', 'landlord_teo', 'Please do what I say')
      .stance,
    'hold',
  );
  assert.equal(
    scriptedPosition(
      'rent_covenant',
      'landlord_teo',
      'We will provide a compensation fund',
    ).rider,
    'compensation_fund',
  );
});
