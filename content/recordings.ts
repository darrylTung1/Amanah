import manifest from '../public/audio/precached/manifest.json' with { type: 'json' };
import { encode, type DecisionRecord, type State } from '../engine/model.ts';
import { testimony } from './narration.ts';

export function recordedTestimony(
  record: DecisionRecord,
  state: State,
  rehearsal = false,
) {
  const clip = (
    manifest as Record<string, { text: string; audio: string; source: string }>
  )[encode(record) + '|' + state.year];
  // Exact decision records prevent a recording describing a different future.
  if (clip && (clip.source === 'elevenlabs' || rehearsal)) return clip;
  return {
    text: testimony(state, record.district).text,
    audio: null,
    source: 'written',
  };
}
