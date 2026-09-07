import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { people, levers, riders } from '../engine/model.ts';
const tool = {
  type: 'client',
  name: 'resolve_position',
  description:
    'Record your final stance on the current proposal. Only one valid rider is allowed. Call after discussing the proposal.',
  expects_response: true,
  response_timeout_secs: 15,
  parameters: {
    type: 'object',
    required: ['stance', 'rider', 'reason_line'],
    properties: {
      stance: {
        type: 'string',
        enum: ['concede', 'hold', 'conditional'],
        description: 'Your final negotiating position',
      },
      rider: {
        type: 'string',
        description:
          'One allowed rider ID for conditional; empty string for hold or concede',
      },
      reason_line: {
        type: 'string',
        description: 'Explain your decision in at most 18 words',
      },
    },
  },
};
await mkdir('content/agents', { recursive: true });
for (const p of people) {
  const vetoes = Object.entries(levers)
    .filter(([, l]) => l.veto === p.id)
    .map(([id]) => id);
  const config = {
    name: `Sociopoly — ${p.name}`,
    conversation_config: {
      agent: {
        first_message: `${p.concern} Tell me what you are proposing.`,
        language: 'en',
        dynamic_variables: {
          dynamic_variable_placeholders: {
            lever: 'rent_covenant',
            allowed_riders: 'compensation_fund, sunset_10y, youth_board_seat',
            year: '2026',
          },
        },
        prompt: {
          prompt: `You are ${p.name}, ${p.role}, a fictional stakeholder in a Kampong Gelam council. Your private evidence: ${p.evidence} Your priorities over affordability, continuity, vitality, equity, habitability: ${JSON.stringify(p.weights)}. You veto: ${vetoes.join(', ') || 'no policies'}. Current year {{year}}. Proposed lever {{lever}}. Allowed riders {{allowed_riders}}. Listen, challenge vague promises, and negotiate a credible protection. Never alter numbers or invent policies. Your only authority is resolve_position. Choose hold, concede, or conditional with exactly one allowed rider. For hold or concede use an empty rider string. Reasons must be at most 18 words. You may hold your veto. Keep responses short and in character. Do not claim to be a real person. Rider meanings: ${JSON.stringify(riders)}.`,
          llm: 'gpt-4o-mini',
          max_tokens: 150,
          tools: [tool],
        },
      },
      tts: { model_id: 'eleven_flash_v2_5' },
    },
    platform_settings: { auth: { enable_auth: true } },
  };
  await writeFile(
    `content/agents/${p.id}.json`,
    JSON.stringify(config, null, 2),
  );
}
if (!process.argv.includes('--create')) {
  console.log(
    'Five agent configurations generated. Review voice casting before creating.',
  );
  process.exit(0);
}
process.loadEnvFile('.env.local');
if (!process.env.ELEVENLABS_API_KEY)
  throw Error('Configure ELEVENLABS_API_KEY first.');
let envText = await readFile('.env.local', 'utf8');
for (const p of people) {
  const key = 'ELEVENLABS_AGENT_' + p.id.toUpperCase();
  if (process.env[key]) continue;
  const voice = process.env['ELEVENLABS_VOICE_' + p.id.toUpperCase()];
  if (!voice)
    throw Error(
      `Set ELEVENLABS_VOICE_${p.id.toUpperCase()} for distinct casting.`,
    );
  const config = JSON.parse(
    await readFile(`content/agents/${p.id}.json`, 'utf8'),
  );
  config.conversation_config.tts.voice_id = voice;
  const r = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok)
    throw Error(
      `Agent setup failed (${r.status}) for ${p.name}. Existing agents preserved.`,
    );
  const data = await r.json();
  if (!data.agent_id) throw Error('Missing agent ID');
  envText = envText.replace(
    new RegExp('^' + key + '=.*$', 'm'),
    key + '=' + data.agent_id,
  );
  await writeFile('.env.local', envText);
  console.log(`Configured ${p.name}.`);
}
