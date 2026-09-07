'use client';
import { useState } from 'react';
import type { State } from '@/engine/model';
import { characterMood, type Agreement } from '@/engine/character-mood';

// Explicit casting of the supplied expression sets, shared across councils.
const portraits: Record<string, string> = {
  'Mdm Salmah': 'mdm-salmah',
  Faiz: 'faiz',
  'Ustaz Rahim': 'ustaz-rahim',
  'Mr Teo': 'mr-teo',
  Jo: 'jo',
  'Mr Tan': 'mr-tan',
  Mei: 'mei',
  'Mr Goh': 'mr-goh',
  'Mdm Lim': 'mdm-lim',
  Priya: 'priya',
  Kavitha: 'kavitha',
  Arun: 'arun',
  'Mdm Devi': 'mdm-devi',
  'Mr Menon': 'mr-menon',
  Farah: 'farah',
};

export default function CharacterPortrait({ name, initials, state, weights, agreement = 'none' }: { name: string; initials: string; state: State; weights: readonly number[]; agreement?: Agreement }) {
  const [failed, setFailed] = useState('');
  const mood = characterMood(state, weights, agreement);
  const base = portraits[name];
  const file = base ? base + (mood === 'neutral' ? '' : `-${mood}`) : undefined;
  return file && failed !== file ? (
    <img className="avatar character-portrait" src={`/images/characters/${file}.png`}
      alt={`${name}, ${mood}`} title={`${name} · ${mood}`} width={64} height={64}
      onError={() => setFailed(file)} />
  ) : <span className="avatar" aria-label={name}>{initials}</span>;
}
