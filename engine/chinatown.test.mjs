import test from 'node:test';
import assert from 'node:assert/strict';
import { encode, decode, run, programme, initial, policy } from './model.ts';
import { districtPeople } from './districts.ts';
import {
  getScenario,
  parcelScenario,
  requiredProtection,
  sceneParcel,
} from './scenarios.ts';
import { districtParcels } from '../components/district/parcels.ts';
import { recordedTestimony } from '../content/recordings.ts';

const move = (lever, rider) => ({ lever, riders: rider ? [rider] : [] });
test('each landmark opens its own matching place and keeps its selection', () => {
  for (const district of ['chinatown', 'kampong-glam']) {
    for (const parcel of districtParcels(district)) {
      const id = parcelScenario(parcel.id, initial);
      const scene = getScenario(id, initial, district);
      assert.ok(
        scene.place.startsWith(parcel.name),
        `${parcel.name}: ${scene.place}`,
      );
      assert.equal(sceneParcel(id), parcel.id);
    }
  }
  const maxwell = districtParcels('chinatown').find(
    (p) => p.name === 'Maxwell Food Centre',
  );
  assert.ok(maxwell);
  assert.match(
    getScenario(parcelScenario(maxwell.id, initial), initial, 'chinatown')
      .dialogue,
    /hawkers/,
  );
});
test('Chinatown locations have local scenarios with valid, affordable opening choices', () => {
  const roster = districtPeople('chinatown');
  assert.equal(new Set(roster.map((p) => p.name)).size, 5);
  for (const parcel of districtParcels('chinatown')) {
    const scene = getScenario(
      parcelScenario(parcel.id, initial),
      initial,
      'chinatown',
    );
    assert.ok(roster.some((p) => p.id === scene.speaker));
    assert.ok(
      scene.options.some(
        ([lever]) =>
          policy(move(lever, requiredProtection[lever])).cost <=
          initial.capacity,
      ),
    );
    assert.doesNotMatch(
      scene.dialogue + scene.place + parcel.name,
      /Salmah|Arab Street|batik|Bussorah/,
    );
  }
  assert.match(
    getScenario('cannot-relearn', initial, 'chinatown').dialogue,
    /broken/,
  );
});
test('Chinatown record replays a complete programme without changing old district results', () => {
  const record = {
    v: 3,
    district: 'chinatown',
    weights: [3, 3, 2, 2],
    rounds: [
      programme([
        move('rent_covenant', 'compensation_fund'),
        move('cooling_retrofit'),
      ]),
      programme([
        move('trade_grant'),
        move('visitor_levy', 'sunset_10y'),
        move('pedestrianise', 'loading_window'),
      ]),
      programme([move('land_trust'), move('visitor_levy', 'sunset_10y')]),
    ],
  };
  assert.equal(decode(encode(record)).district, 'chinatown');
  const result = run(record);
  assert.deepEqual(result, run(decode(encode(record))));
  assert.equal(result.at(-1).year, 2126);
  const clip = recordedTestimony(record, result.at(-1));
  assert.match(clip.text, /Chinatown/);
  assert.doesNotMatch(clip.text, /Salmah|Arab Street|batik/);
  assert.equal(clip.audio, null);
  const { district, ...legacy } = record;
  assert.deepEqual(run(legacy), result);
  assert.equal(decode(encode(legacy)).district, undefined);
  assert.throws(() => encode({ ...record, district: 'unknown' }));
});
