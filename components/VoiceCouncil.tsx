'use client';
import { useState } from 'react';
import manifest from '@/public/audio/dialogue/manifest.json';
import type { LeverId } from '@/engine/model';
import type { Position } from '@/engine/negotiation';

export default function VoiceCouncil({
  person,
  lever,
  position,
}: {
  person: string;
  lever: LeverId;
  position: Position | null;
}) {
  const [failed, setFailed] = useState(false);
  const clips = manifest as Record<string, { audio: string; text: string }>;
  const key = position
    ? `${person}|${lever}|${position.rider ?? position.stance}`
    : `${person}|intro`;
  const clip = clips[key];
  if (!clip) return null;
  return (
    <div className="negotiation">
      <small>Recorded dialogue</small>
      <p className="quote">“{clip.text}”</p>
      {!failed && (
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
          Recording unavailable. You can continue using the dialogue above.
        </small>
      )}
    </div>
  );
}
