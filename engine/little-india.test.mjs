import test from 'node:test';
import assert from 'node:assert/strict';
import {
  districtIds,
  resolveDistrict,
  isDistrictId,
  initial,
  encode,
  decode,
  run,
  programme,
  policy,
} from './model.ts';
import { districtNames, districtPeople } from './districts.ts';
import { districtParcels } from '../components/district/parcels.ts';
import {
  getScenario,
  parcelScenario,
  sceneParcel,
  requiredProtection,
} from './scenarios.ts';
import { recordedTestimony } from '../content/recordings.ts';

test('all three districts have distinct playable stops and matching selection', () => {
  assert.equal(districtIds.length, 3);
  for (const district of districtIds) {
    assert.ok(districtNames[district]);
    assert.equal(resolveDistrict(district), district);
    const roster = districtPeople(district);
    assert.equal(new Set(roster.map((p) => p.name)).size, 5);
    const parcels = districtParcels(district);
    assert.equal(new Set(parcels.map((p) => p.name)).size, 8);
    for (const parcel of parcels) {
      const id = parcelScenario(parcel.id, initial);
      const scene = getScenario(id, initial, district);
      assert.equal(sceneParcel(id), parcel.id);
      assert.ok(scene.place.startsWith(parcel.name));
      assert.ok(roster.some((p) => p.id === scene.speaker));
      assert.ok(
        scene.options.some(
          ([lever]) =>
            policy({
              lever,
              riders: requiredProtection[lever]
                ? [requiredProtection[lever]]
                : [],
            }).cost <= initial.capacity,
        ),
      );
      if (district === 'little-india')
        assert.doesNotMatch(
          scene.dialogue + scene.place,
          /Chinatown|Pagoda|Salmah|Arab Street|Mr Tan|Mr Goh|Bussorah/,
        );
    }
  }
  assert.equal(isDistrictId('unknown'), false);
  assert.equal(resolveDistrict(null), 'kampong-glam');
});

test('Little India plays to 2126 and retains its district and local testimony in receipts', () => {
  const move = (lever, rider) => ({ lever, riders: rider ? [rider] : [] });
  const record = {
    v: 3,
    district: 'little-india',
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
  assert.deepEqual(decode(encode(record)), record);
  const states = run(record);
  assert.equal(states.at(-1).year, 2126);
  for (const state of states.filter((s) =>
    [2060, 2093, 2126].includes(s.year),
  )) {
    const clip = recordedTestimony(record, state);
    assert.match(clip.text, /Little India/);
    assert.doesNotMatch(clip.text, /Salmah|Chinatown|Mr Tan|Arab Street/);
    assert.equal(clip.audio, null);
  }
  const broken = { ...initial, flags: ['LINEAGE_BROKEN'] };
  assert.match(
    getScenario(parcelScenario('trades', broken), broken, 'little-india')
      .dialogue,
    /broken/,
  );
  assert.equal(
    getScenario('six-weeks', { ...initial, year: 2060 }, 'little-india').title,
    'Keeping a place in Little India',
  );
});
