'use client';
import { useEffect, useState } from 'react';
import { testimony } from '@/content/narration';
import { encode, type State, type DecisionRecord } from '@/engine/model';
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
  const fallback = testimony(state);
  const [text, setText] = useState(fallback.text);
  const [audio, setAudio] = useState<string | null>(null);
  const [status, setStatus] = useState(
    demo ? 'Rehearsal testimony' : 'Preparing testimony…',
  );
  useEffect(() => {
    const controller = new AbortController();
    if (demo) {
      fetch('/audio/precached/manifest.json', { signal: controller.signal })
        .then((r) =>
          r.ok
            ? (r.json() as Promise<
                Record<string, { audio: string; text: string }>
              >)
            : {},
        )
        .then((m) => {
          const item = (
            m as Record<
              string,
              { audio: string; text: string; source?: string }
            >
          )[encode(record) + '|' + state.year];
          if (item) {
            setAudio(item.audio);
            setText(item.text);
            setStatus(
              item.source === 'elevenlabs'
                ? 'Recorded ElevenLabs rehearsal'
                : 'Recorded device-voice rehearsal',
            );
          }
        })
        .catch(() => {});
      return () => {
        controller.abort();
        window.speechSynthesis?.cancel();
      };
    }
    fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record, year: state.year }),
      signal: controller.signal,
    })
      .then((r) => r.json() as Promise<{ text?: string; audio?: string }>)
      .then((data) => {
        if (data.text) setText(data.text);
        if (data.audio) setAudio(data.audio);
        setStatus(
          data.audio
            ? 'Generated future testimony'
            : 'Written testimony · voice unavailable',
        );
      })
      .catch(() => setStatus('Written testimony · connection unavailable'));
    return () => {
      controller.abort();
      window.speechSynthesis?.cancel();
    };
  }, [record, state.year, demo]);
  function speak() {
    if (!('speechSynthesis' in window)) {
      setStatus('Read the testimony below; this browser has no speech reader.');
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    u.lang = 'en-SG';
    speechSynthesis.speak(u);
    setStatus('Device voice · not ElevenLabs');
  }
  return (
    <section className="testimony">
      <p className="eyebrow">
        A voice from {state.year} · {fallback.persona}
      </p>
      <h1>
        The future
        <br />
        <span className="gold">speaks back.</span>
      </h1>
      <p className="quote">“{text}”</p>
      {audio && (
        <audio className="narration-audio" autoPlay controls src={audio} />
      )}
      <div className="actions">
        {!audio && (
          <Button className="secondary" onClick={speak}>
            Listen with device voice
          </Button>
        )}
        <Button
          className="primary"
          onClick={() => {
            window.speechSynthesis?.cancel();
            onContinue();
          }}
        >
          {state.year === 2126
            ? 'Open your legacy receipt'
            : 'Return to the council'}{' '}
          ↗
        </Button>
      </div>
      <p className="small muted" role="status" style={{ marginTop: 16 }}>
        {status}
      </p>
    </section>
  );
}
