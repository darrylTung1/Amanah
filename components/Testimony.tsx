'use client';
import { useEffect, useState } from 'react';
import { testimony } from '@/content/narration';
import { recordedTestimony } from '@/content/recordings';
import type { State, DecisionRecord } from '@/engine/model';
import { Button } from '@/components/ui/button';
export default function Testimony({
  state,
  record,
  demo,
  onContinue,
}: {
  state: State;
  record: DecisionRecord;
  demo: boolean;
  onContinue: () => void;
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
        The future
        <br />
        <span className="gold">speaks back.</span>
      </h1>
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
