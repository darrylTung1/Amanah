import assert from 'node:assert/strict';
import { encode } from '../engine/model.ts';
const origin = process.argv[2] || 'http://localhost:3000';
const record = {
  v: 1,
  weights: [3, 3, 2, 2],
  rounds: [{ lever: 'rent_covenant', riders: ['compensation_fund'] }],
};
for (const path of ['/', '/council', '/receipt?d=invalid']) {
  const r = await fetch(origin + path);
  assert.equal(r.status, 200, path);
  assert.match(await r.text(), /Amanah/);
}
const post = (path, body) =>
  fetch(origin + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(body),
  });
let r = await post('/api/resolve', {
  lever: 'rent_covenant',
  person: 'landlord_teo',
  position: {
    stance: 'conditional',
    rider: 'compensation_fund',
    reason_line: 'The compensation covers our obligations.',
  },
});
assert.equal(r.status, 200);
assert.equal((await r.json()).stance, 'conditional');
r = await post('/api/resolve', {
  lever: 'rent_covenant',
  person: 'youth_faiz',
  position: { stance: 'concede', rider: null, reason_line: 'Yes' },
});
assert.equal((await r.json()).stance, 'hold');
r = await post('/api/resolve', {
  lever: 'not_a_policy',
  person: 'landlord_teo',
  position: {},
});
assert.equal(r.status, 400);
r = await post('/api/narrate', { record, year: 2036 });
assert.equal(r.status, 200);
const a = await r.json();
assert.ok(a.text.length > 100);
const start = performance.now();
r = await post('/api/narrate', { record, year: 2036 });
assert.equal(r.status, 200);
assert.equal(a.source, 'written');
assert.equal(a.audio, null);
assert.deepEqual(await r.json(), a);
console.log(`Local narration response: ${Math.round(performance.now() - start)}ms`);
r = await post('/api/narrate', { record, year: 2126 });
assert.equal(r.status, 400);
r = await fetch(origin + '/api/agent-url?person=not_a_person');
assert.equal(r.status, 404);
const completed = {
  ...record,
  rounds: [
    ...record.rounds,
    { lever: 'trade_grant', riders: [] },
    { lever: 'cooling_retrofit', riders: [] },
  ],
};
r = await fetch(origin + '/receipt?d=' + encode(completed));
assert.equal(r.status, 200);
console.log(
  'HTTP smoke checks passed: routes, authority, invalid requests, prerecorded narration fallback and completed receipt route.',
);
