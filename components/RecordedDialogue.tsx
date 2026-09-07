'use client';
import { useEffect, useRef, useState } from 'react';
import manifest from '@/public/audio/dialogue/manifest.json';
export default function RecordedDialogue({
  clipKey,
  text,
  active = false,
}: {
  clipKey: string;
  text: string;
  active?: boolean;
}) {
  const candidate = (manifest as Record<string, { audio: string; text: string }>)[
    clipKey
  ];
  // Never play a stale script over a newer concern.
  const clip = candidate?.text === text ? candidate : undefined;
  const audio = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    setFailed(false);
    setBlocked(false);
  }, [clipKey, clip?.audio]);
  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    let cancelled = false;
    if (active) {
      element.currentTime = 0;
      void element.play().catch(() => { if (!cancelled) setBlocked(true); });
    } else {
      element.pause();
      element.currentTime = 0;
    }
    return () => { cancelled = true; element.pause(); };
  }, [active, clipKey, clip?.audio]);
  return (
    <div className="scene-dialogue">
      <p className="quote">“{text}”</p>
      {clip && !failed && (
        <audio
          ref={audio}
          className="narration-audio"
          controls
          preload="metadata"
          src={clip.audio}
          onPlay={() => {
            setBlocked(false);
            document.querySelectorAll('audio').forEach((other) => {
              if (other !== audio.current) other.pause();
            });
          }}
          onError={() => setFailed(true)}
        />
      )}
      {blocked && !failed && <small role="status">Press play to hear this concern.</small>}
      {failed && (
        <small role="status">
          Audio unavailable. Read the dialogue above to continue.
        </small>
      )}
    </div>
  );
}
