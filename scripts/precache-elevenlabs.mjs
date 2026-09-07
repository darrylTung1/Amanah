import { readFile, writeFile } from 'node:fs/promises';
process.loadEnvFile('.env.local');
if (!process.env.ELEVENLABS_API_KEY)
  throw Error('Configure ELEVENLABS_API_KEY in .env.local first.');
const entries = JSON.parse(
  await readFile('public/audio/precached/scripts.json', 'utf8'),
);
const manifest = {};
for (const entry of entries) {
  const voice =
    process.env['ELEVENLABS_VOICE_' + entry.year] ||
    process.env.ELEVENLABS_NARRATOR_VOICE_ID;
  if (!voice) throw Error('Configure a narrator voice ID.');
  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voice),
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: entry.text, model_id: 'eleven_flash_v2_5' }),
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok)
    throw Error(
      `TTS failed (${response.status}); existing manifest preserved.`,
    );
  await writeFile(
    `public/audio/precached/${entry.file}.mp3`,
    Buffer.from(await response.arrayBuffer()),
  );
  manifest[entry.key] = {
    text: entry.text,
    audio: `/audio/precached/${entry.file}.mp3`,
    source: 'elevenlabs',
    persona: entry.persona,
  };
}
await writeFile(
  'public/audio/precached/manifest.json',
  JSON.stringify(manifest, null, 2),
);
console.log('ElevenLabs demo narration saved. Rebuild before deploying.');
