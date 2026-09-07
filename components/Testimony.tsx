'use client';
import { useEffect, useState } from 'react';
import { testimony } from '@/content/narration';
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
      points: Math.round((state[key] - without[key]) * 100),
    }))
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .slice(0, 2);
  const policies = roundMoves(record.rounds.at(-1)!)
    .map((d) => levers[d.lever].name)
    .join(', ');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [clip.audio]);
  return (
    <section className="testimony">
      <p className="eyebrow">
        A voice from {state.year} · {testimony(state).persona}
      </p>
      <h1>
        {state.year}: <span className="gold">what changed.</span>
      </h1>
      <DistrictRating state={state} previous={previous} />
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
      {previous && (
        <div
          className="consequence-changes"
          aria-label="Changes since your decision"
        >
          {keys.map((k) => {
            const delta =
              Math.round(state[k] * 100) - Math.round(previous[k] * 100);
            return (
              <div key={k}>
                <small>{k}</small>
                <strong>
                  {Math.round(previous[k] * 100)} → {Math.round(state[k] * 100)}
                </strong>
                <span className={delta < 0 ? 'warning' : 'gold'}>
                  {delta > 0 ? '+' : ''}
                  {delta} points
                </span>
              </div>
            );
          })}
        </div>
      )}
      <p className="small muted">
        Changes include your policy and the district’s evolution over time.
      </p>
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
