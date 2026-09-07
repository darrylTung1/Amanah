import { mkdir, writeFile } from 'node:fs/promises';
import { run, encode } from '../engine/model.ts';
import { testimony } from '../content/narration.ts';
const decisions = [
  { lever: 'rent_covenant', riders: ['compensation_fund'] },
  { lever: 'trade_grant', riders: [] },
  { lever: 'cooling_retrofit', riders: [] },
];
const entries = [];
for (let i = 1; i <= 3; i++) {
  const record = { v: 1, weights: [3, 3, 2, 2], rounds: decisions.slice(0, i) };
  const year = [2036, 2050, 2126][i - 1];
  const s = run(record, year).at(-1);
  entries.push({
    key: encode(record) + '|' + year,
    year,
    ...testimony(s),
    file: `demo-${year}`,
  });
}
await mkdir('public/audio/precached', { recursive: true });
await writeFile(
  'public/audio/precached/scripts.json',
  JSON.stringify(entries, null, 2),
);
console.log('Prepared three deterministic demo testimonies.');
