import { loadEnvFile } from 'node:process';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { initial } from '../engine/model.ts';
import { getScenario } from '../engine/scenarios.ts';
import { districtPeople } from '../engine/districts.ts';

try { loadEnvFile('.env.local'); } catch { /* Environment variables also supported. */ }
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw Error('Set ELEVENLABS_API_KEY in .env.local before generating recordings.');
const model = 'eleven_multilingual_v2';
const voices = {
  chineseFemale: 'OkUTswg9GJbpA1rRSovW',
  chineseMale: '2iz7QMSyagQNkSdLwewp',
  indianFemale: 'zl8erCWL6xVcWgMnd11c',
  indianMale: 'B3BDA9stcRPo06xNKneN',
  malayFemale: 'eK3wlgmpYx5IkCGQIyQ4',
  malayMale: 'NeOlp8LJc5MlFVUDFJRH',
};
const cast = {
  'Mdm Salmah': voices.malayFemale, Faiz: voices.malayMale,
  'Ustaz Rahim': voices.malayMale, 'Mr Teo': voices.chineseMale,
  // Jo retains the Chinese female casting until a dedicated voice is available.
  Jo: voices.chineseFemale,
  'Mr Tan': voices.chineseMale, Mei: voices.chineseFemale,
  'Mr Goh': voices.chineseMale, 'Mdm Lim': voices.chineseFemale,
  Priya: voices.indianFemale, Kavitha: voices.indianFemale,
  Arun: voices.indianMale, 'Mdm Devi': voices.indianFemale,
  'Mr Menon': voices.indianMale, Farah: voices.malayFemale,
};
const sources = { 'kampong-glam': 'scenarios.json', chinatown: 'chinatown-scenarios.json', 'little-india': 'little-india-scenarios.json' };
const manifestPath = 'public/audio/dialogue/manifest.json';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
await mkdir('public/audio/dialogue/concerns', { recursive: true });
const jobs = [];
for (const [district, source] of Object.entries(sources)) {
  const scenes = JSON.parse(await readFile(`content/${source}`, 'utf8'));
  for (const item of scenes) {
    for (const year of item.id === 'six-weeks' ? [2026, 2060] : [2026]) {
      const scene = getScenario(item.id, { ...initial, year }, district);
      const person = districtPeople(district).find(p => p.id === scene.speaker);
      if (!person) throw Error(`Unknown speaker in ${district}/${item.id}`);
      const voice = cast[person.name];
      if (!voice) throw Error(`No voice assigned to ${person.name}`);
      const clipKey = `${district === 'kampong-glam' ? '' : district + '|'}scene|${scene.id}${year !== 2026 ? '|later' : ''}`;
      const hash = createHash('sha256').update(JSON.stringify([scene.dialogue, voice, model])).digest('hex').slice(0, 20);
      jobs.push({ clipKey, text: scene.dialogue, voice, audio: `/audio/dialogue/concerns/${hash}.mp3`, person: person.name });
    }
  }
}
console.log(`${jobs.length} concern entries; ${jobs.reduce((n, j) => n + j.text.length, 0)} text characters before cache reuse.`);
let generated = 0;
for (const job of jobs) {
  const file = `public${job.audio}`;
  let exists = false;
  try { await access(file); exists = true; } catch {}
  if (!exists) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${job.voice}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: job.text, model_id: model, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) {
      // Do not dump provider payloads or credentials into logs.
      throw Error(`Speech generation failed with HTTP ${response.status} for ${job.clipKey}. Completed recordings are saved; rerun to resume.`);
    }
    if (!response.headers.get('content-type')?.startsWith('audio/')) throw Error('Expected an audio response');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000) throw Error('Audio response was unexpectedly short');
    await writeFile(file, bytes);
    generated++;
  }
  manifest[job.clipKey] = { audio: job.audio, text: job.text, source: 'elevenlabs', voice_id: job.voice, model_id: model };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${exists ? 'Reused' : 'Generated'}: ${job.person} / ${job.clipKey}`);
}
console.log(`Finished: ${generated} new recordings; ${jobs.length} concern entries ready.`);
