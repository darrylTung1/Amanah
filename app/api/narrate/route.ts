import precachedManifest from '@/public/audio/precached/manifest.json';
import { run, validate, signature, encode } from '@/engine/model';
import { testimony, digest } from '@/content/narration';
import { runtimeEnv, readBody, sameOrigin } from '@/lib/server';
type Narration = { text: string; audio: string | null; source: string };
const cache = new Map<string, Narration>();
const pending = new Map<string, Promise<Narration>>();
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const b = await readBody(request);
    validate(b.record);
    if (
      ![2036, 2050, 2126].includes(b.year) ||
      b.record.rounds.length !== [2036, 2050, 2126].indexOf(b.year) + 1
    )
      throw Error('Invalid horizon');
    const state = run(b.record, b.year).at(-1)!;
    const precached = (
      precachedManifest as Record<
        string,
        { text: string; audio: string; source: string }
      >
    )[encode(b.record) + '|' + b.year];
    if (precached?.source === 'elevenlabs')
      return Response.json(precached, {
        headers: { 'X-Narration-Cache': 'precached' },
      });
    const key = signature(state) + '|' + JSON.stringify(b.record.rounds);
    if (cache.has(key))
      return Response.json(cache.get(key), {
        headers: { 'X-Narration-Cache': 'hit' },
      });
    if (pending.has(key)) return Response.json(await pending.get(key));
    const work = (async () => {
      const env = await runtimeEnv();
      let text = testimony(state).text;
      let source = 'written';
      if (env.OPENAI_API_KEY) {
        try {
          const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + env.OPENAI_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: env.OPENAI_MODEL || 'gpt-4.1-mini',
              store: false,
              max_output_tokens: 350,
              instructions:
                'Write 90–120 words of fictional first-person testimony from the supplied persona and year in Kampong Gelam. The supplied conditions are fixed: never contradict them. Name Salmah, Arab Street and one piece of batik. No invented precise dates, deaths, counts or documented historical claims. Do not mention numbers, indices, policy names or moralise. Plain and specific. Return only the testimony.',
              input: JSON.stringify(digest(state)),
            }),
            signal: AbortSignal.timeout(12000),
          });
          if (response.ok) {
            const data = (await response.json()) as {
              output?: { content?: { type: string; text?: string }[] }[];
            };
            const generated = data.output
              ?.flatMap((x) => x.content ?? [])
              .filter((x) => x.type === 'output_text')
              .map((x) => x.text ?? '')
              .join('')
              .trim();
            if (generated && generated.length < 1500) {
              text = generated;
              source = 'generated';
            }
          }
        } catch {
          /* Deterministic testimony remains available. */
        }
      }
      let audio: string | null = null;
      const voice =
        env['ELEVENLABS_VOICE_' + state.year] ||
        env.ELEVENLABS_NARRATOR_VOICE_ID;
      if (env.ELEVENLABS_API_KEY && voice) {
        try {
          const r = await fetch(
            'https://api.elevenlabs.io/v1/text-to-speech/' +
              encodeURIComponent(voice),
            {
              method: 'POST',
              headers: {
                'xi-api-key': env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text, model_id: 'eleven_flash_v2_5' }),
              signal: AbortSignal.timeout(15000),
            },
          );
          if (r.ok) {
            const bytes = new Uint8Array(await r.arrayBuffer());
            if (bytes.length < 2_000_000)
              audio =
                'data:audio/mpeg;base64,' +
                Buffer.from(bytes).toString('base64');
          }
        } catch {
          /* Keep the transcript on service failure. */
        }
      }
      const result = { text, audio, source };
      if (cache.size >= 12) cache.delete(cache.keys().next().value!);
      cache.set(key, result);
      return result;
    })();
    pending.set(key, work);
    try {
      return Response.json(await work, {
        headers: { 'X-Narration-Cache': 'miss' },
      });
    } finally {
      pending.delete(key);
    }
  } catch {
    return Response.json(
      { error: 'Invalid decision record or horizon' },
      { status: 400 },
    );
  }
}
