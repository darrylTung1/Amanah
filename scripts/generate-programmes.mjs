import { readFile, writeFile } from 'node:fs/promises';
import {
  run,
  programme,
  encode,
  keys,
  levers,
  policy,
} from '../engine/model.ts';
import { testimony } from '../content/narration.ts';
const d = (lever, rider) => ({ lever, riders: rider ? [rider] : [] });
const paths = [
  {
    id: 'shared-stewardship',
    title: 'Shared stewardship',
    rounds: [
      [d('rent_covenant', 'compensation_fund'), d('cooling_retrofit')],
      [
        d('trade_grant'),
        d('visitor_levy', 'sunset_10y'),
        d('pedestrianise', 'loading_window'),
      ],
      [d('land_trust')],
    ],
  },
  {
    id: 'visitor-boom',
    title: 'Visitor boom',
    rounds: [
      [
        d('night_economy', 'noise_curfew'),
        d('adaptive_reuse', 'archive_clause'),
      ],
      [
        d('night_economy', 'noise_curfew'),
        d('pedestrianise', 'loading_window'),
      ],
      [
        d('night_economy', 'noise_curfew'),
        d('adaptive_reuse', 'archive_clause'),
      ],
    ],
  },
  {
    id: 'skills-first',
    title: 'Skills first',
    rounds: [
      [d('trade_grant'), d('cooling_retrofit')],
      [d('trade_grant'), d('rent_covenant', 'compensation_fund')],
      [d('trade_grant'), d('cooling_retrofit')],
    ],
  },
];
let report =
  '# Current programmes — model v2\n\nThree periods, up to three policies each. These are fictional scenarios computed by the game, not forecasts. Existing v1 links use the previous engine. All policy costs, conditions and final values below are computed from source.\n\n';
report +=
  '## How the game plays\n\nEnter Kampong Glam without navigation. Meet Salmah or click a parcel, choose a policy, agree to any required protection, and add it to the programme. The board previews the immediate changes and capacity remaining. Add up to three different policies, then advance to 2036, 2050 or 2126. Renewals replace earlier policies; they do not stack. Undoing an earlier draft item removes later items as well, avoiding unfunded or unauthorized dependent agreements.\n\n';
report +=
  '## Balance rules\n\nNew periods add 20 capacity. Annual capacity can fund upkeep at 1.2% of each policy’s positive upfront cost, retaining at least 60% of its annual strength. Positive policy effects are multiplied by (1 − the current index), so higher conditions have diminishing returns. Renewals have half the immediate effect and replace the old policy. Sunset policies keep their specified decay and receive no maintenance floor. Version 2 has gentler baseline drift and couplings; the exact coefficients are in engine/model.ts. The five irreversible thresholds remain.\n\n';
const scripts = [],
  outcomes = [];
for (const p of paths) {
  const record = {
    v: 2,
    weights: [3, 3, 2, 2],
    rounds: p.rounds.map(programme),
  };
  const t = run(record);
  report +=
    '## ' +
    p.title +
    '\n\n| Period | Programme | Upfront cost | Horizon | A | C | V | E | H |\n|---|---|---:|---:|---:|---:|---:|---:|---:|\n';
  for (let i = 0; i < 3; i++) {
    const prefix = { ...record, rounds: record.rounds.slice(0, i + 1) },
      year = [2036, 2050, 2126][i];
    const state = run(prefix, year).at(-1);
    report +=
      '| ' +
      [2026, 2036, 2050][i] +
      ' | ' +
      p.rounds[i].map((m) => levers[m.lever].name).join(' + ') +
      ' | ' +
      p.rounds[i].reduce((n, m) => n + policy(m).cost, 0) +
      ' | ' +
      year +
      ' | ' +
      keys.map((k) => Math.round(state[k] * 100)).join(' | ') +
      ' |\n';
    scripts.push({
      kind: 'future',
      key: encode(prefix) + '|' + year,
      filename: p.id + '-' + year + '.mp3',
      path: p.id,
      year,
      ...testimony(state),
      source: 'script-only',
      record: prefix,
    });
  }
  const final = t.at(-1);
  const entry = {
    id: p.id,
    record,
    final: Object.fromEntries(keys.map((k) => [k, Math.round(final[k] * 100)])),
    firstFlags: Object.fromEntries(
      final.flags.map((f) => [f, t.find((s) => s.flags.includes(f)).year]),
    ),
  };
  outcomes.push(entry);
  report +=
    '\nFlags: ' +
    JSON.stringify(entry.firstFlags) +
    '.\n\n[Completed receipt](https://sociopoly-voices.qisheng370.chatgpt.site/receipt?d=' +
    encode(record) +
    ')\n\n';
}
report +=
  '## Validation\n\nThe automated checks cover programme size, duplicate and nested actions, shared budget accounting, old receipt compatibility, deterministic replay, preserved irreversible flags, and distinct viable/risky endings. A 390×844 browser playthrough completed the shared-stewardship programme and reached its receipt without horizontal overflow in the checked views. This is viewport testing, not a physical-phone hardware or offline-browser certification.\n';
await writeFile('PROGRAMMES.md', report);
await writeFile(
  'content/future-recording-scripts.json',
  JSON.stringify(scripts, null, 2),
);
await writeFile(
  'content/playthrough-outcomes.json',
  JSON.stringify(outcomes, null, 2),
);
const council = JSON.parse(
  await readFile('content/council-recording-scripts.json', 'utf8'),
);
const scenes = JSON.parse(await readFile('content/scenarios.json', 'utf8'));
let text =
  '# Current recording scripts — model v2\n\nWritten scripts only; no generated audio. Match each filename and key to its exact scene or decision record. Old v1 recordings are never reused for new v2 outcomes.\n\n';
for (const clip of council)
  text +=
    '## ' +
    clip.filename +
    '\n\nKey: ' +
    clip.key +
    '\n\n> ' +
    clip.text +
    '\n\n';
for (const s of scenes)
  text +=
    '## scene-' +
    s.id +
    '.mp3\n\nKey: scene|' +
    s.id +
    ' · Speaker: ' +
    s.speaker +
    '\n\n> ' +
    s.dialogue +
    '\n\n';
text +=
  '## scene-six-weeks-later.mp3\n\nKey: scene|six-weeks|later · Speaker: tenant_salmah\n\n> Keeping a trade alive means keeping room for the people who practise it. Each decision changes what staying here requires. What will make room for the next generation?\n\n';
for (const clip of scripts)
  text +=
    '## ' +
    clip.filename +
    '\n\nVoice: ' +
    clip.persona +
    '\n\n> ' +
    clip.text +
    '\n\n';
await writeFile('RECORDING-SCRIPTS.md', text);
console.log(
  JSON.stringify(outcomes.map((x) => ({ id: x.id, final: x.final }))),
);
