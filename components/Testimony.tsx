'use client';
import { useEffect, useState } from 'react';
import { recordedTestimony } from '@/content/recordings';
import type { State, DecisionRecord } from '@/engine/model';
import { Button } from '@/components/ui/button';
import Cloth from '@/components/Cloth';
import DistrictRating from '@/components/DistrictRating';
import { getScenario, leadScenario } from '@/engine/scenarios';
import { keys, flagText, run, roundMoves, levers } from '@/engine/model';
export default function Testimony({
  state,
  record,
  demo,
  onContinue,
  previous,
}: {
  state: State;
  record: DecisionRecord;
  demo: boolean;
  onContinue: () => void;
  previous?: State;
}) {
  const clip = recordedTestimony(record, state, demo);
  const without = run(
    { ...record, rounds: record.rounds.slice(0, -1) },
    state.year,
  ).at(-1)!;
  const impact = keys
    .map((key) => ({
      key,
      points: Math.round(state[key] * 100) - Math.round(without[key] * 100),
    }))
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .slice(0, 2);
  const policies = roundMoves(record.rounds.at(-1)!)
    .map((d) => levers[d.lever].name)
    .join(', ');
  const [comparison, setComparison] = useState<'previous' | 'without'>(
    'previous',
  );
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [clip.audio]);
  return (
    <section className="testimony">
      <h1>
        {state.year}: <span className="gold">what changed.</span>
      </h1>
      <div
        className="stats-comparison"
        role="group"
        aria-label="Compare district conditions"
      >
        <button
          className="secondary"
          aria-pressed={comparison === 'previous'}
          onClick={() => setComparison('previous')}
        >
          Since {previous?.year ?? 2026}
        </button>
        <button
          className="secondary"
          aria-pressed={comparison === 'without'}
          onClick={() => setComparison('without')}
        >
          No new policies
        </button>
      </div>
      <DistrictRating
        state={state}
        previous={comparison === 'without' ? without : previous}
        comparisonLabel={
          comparison === 'without'
            ? `versus no new policies in this period, at ${state.year}`
            : undefined
        }
      />
      <div className="causal-summary">
        <h2>Why this future changed</h2>
        <p>{policies}.</p>
        <p>
          Compared with making no new changes in this period, your programme
          left{' '}
          {impact
            .map(
              (x) =>
                x.key +
                ' ' +
                Math.abs(x.points) +
                ' points ' +
                (x.points >= 0 ? 'higher' : 'lower'),
            )
            .join(' and ')}
          .
        </p>
        <small>
          This comparison includes indirect effects and the ongoing costs of
          your choices.
        </small>
      </div>
      <Cloth state={state} compact />
      {state.flags
        .filter((f) => !previous?.flags.includes(f))
        .map((f) => (
          <p className="consequence-flag" key={f}>
            {flagText[f]}
          </p>
        ))}
      <p className="quote">“{clip.text}”</p>
      {clip.audio && !failed && (
        <audio
          className="narration-audio"
          autoPlay
          controls
          src={clip.audio}
          onError={() => setFailed(true)}
        />
      )}
      <div className="actions">
        <Button className="primary" onClick={onContinue}>
          {state.year === 2126
            ? 'Open your legacy receipt'
            : 'Return to the council'}{' '}
          ↗
        </Button>
      </div>
      {state.year !== 2126 && (
        <p className="consequence-flag">
          Next council: {getScenario(leadScenario(state), state).title}.{' '}
          {getScenario(leadScenario(state), state).question}
        </p>
      )}
      <p className="small muted" role="status" style={{ marginTop: 16 }}>
        {failed
          ? 'Recording unavailable · the full testimony is above.'
          : clip.source === 'elevenlabs'
            ? 'Prerecorded ElevenLabs testimony'
            : clip.audio
              ? 'Recorded device-voice rehearsal'
              : 'Written future testimony'}
      </p>
    </section>
  );
}
