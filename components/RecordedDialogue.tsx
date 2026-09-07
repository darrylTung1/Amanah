'use client';
import { useState } from 'react';
import manifest from '@/public/audio/dialogue/manifest.json';
export default function RecordedDialogue({
  clipKey,
  text,
}: {
  clipKey: string;
  text: string;
}) {
  const clip = (manifest as Record<string, { audio: string; text: string }>)[
    clipKey
  ];
  const [failed, setFailed] = useState(false);
  return (
    <div className="scene-dialogue">
      <p className="quote">“{clip?.text ?? text}”</p>
      {clip && !failed && (
        <audio
          className="narration-audio"
          controls
          preload="none"
          src={clip.audio}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <small role="status">
          Audio unavailable. Read the dialogue above to continue.
        </small>
      )}
    </div>
  );
}
