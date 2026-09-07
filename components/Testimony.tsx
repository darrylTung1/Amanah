'use client';
import { useEffect, useState } from 'react';
import { testimony } from '@/content/narration';
import { recordedTestimony } from '@/content/recordings';
import type { State, DecisionRecord } from '@/engine/model';
import { Button } from '@/components/ui/button';
import Cloth from '@/components/Cloth';
import { keys, flagText } from '@/engine/model';
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
