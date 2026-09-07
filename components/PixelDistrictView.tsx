'use client';
import { useState } from 'react';
import * as m from 'motion/react-m';
import type { State } from '@/engine/model';
import { districtRating } from '@/engine/rating';
import { chinatownArtwork, chinatownLocations } from '@/engine/chinatown-art';
import { kampongGlamArtwork, kampongGlamLocations } from '@/engine/kampong-glam-art';
import { Button } from '@/components/ui/button';
import './ChinatownView.css';

type ArtLocation = { id: string; name: string; parcel: string; x: number; y: number; start: string; future: string };

export default function PixelDistrictView({ state, compact = false, onParcel, district = 'chinatown' }: {
  district?: 'chinatown' | 'kampong-glam';
  state: State;
  compact?: boolean;
  onParcel?: (id: string) => void;
}) {
  const name = district === 'chinatown' ? 'Chinatown' : 'Kampong Glam';
  const locations = district === 'chinatown' ? chinatownLocations : kampongGlamLocations;
  const artwork = district === 'chinatown' ? chinatownArtwork : kampongGlamArtwork;
  const overview = district === 'chinatown' ? '/images/chinatown/start/chinatown.png' : kampongGlamArtwork(state);
  const [selected, setSelected] = useState<ArtLocation | null>(null);
  const [loaded, setLoaded] = useState('');
  const [failed, setFailed] = useState('');
  const [zoomDone, setZoomDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const src = selected ? artwork(state, selected) : '';
  function select(location: ArtLocation) {
    setZoomDone(selected !== null);
    setRevealed(selected !== null);
    setSelected(location);
    onParcel?.(location.parcel);
  }
  function showDistrict() {
    setSelected(null);
    setZoomDone(false);
    setRevealed(false);
  }
  return (
    <div className={`clothframe chinatown-art ${compact ? 'chinatown-art-compact' : ''}`}>
      <div className="chinatown-art-stage">
        <div className="chinatown-art-square">
          {!revealed && <m.img
            className="chinatown-overview"
            src={overview}
            alt={`Illustrated ${name} district, ${state.year}`}
            style={{ transformOrigin: selected ? `${selected.x}% ${selected.y}%` : '50% 50%' }}
            initial={false}
            animate={{ scale: selected ? 2.2 : 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => { if (selected) setZoomDone(true); }}
          />}
          {!selected && locations.map((location) => (
            <button key={location.id} className={`chinatown-location-pin chinatown-location-${location.id}`}
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onClick={() => select(location)} aria-label={`Explore ${location.name}`}>
              <span aria-hidden="true" className="chinatown-location-dot" />
              <span>{location.name} ↗</span>
            </button>
          ))}
          {selected && (
            <m.img key={src} className="chinatown-closeup" src={src}
              alt={`${selected.name}, ${state.year}. ${name} district rating ${districtRating(state).score} out of 100.`}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: loaded === src && zoomDone ? 1 : 0, scale: loaded === src && zoomDone ? 1 : 1.06 }}
              transition={{ opacity: { duration: 0.65, ease: 'easeInOut' }, scale: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } }}
              onAnimationComplete={() => { if (loaded === src && zoomDone) setRevealed(true); }}
              onLoad={() => { setLoaded(src); setFailed(''); }}
              onError={() => setFailed(src)} />
          )}
        </div>
        {selected && loaded !== src && <p className="chinatown-image-status" role="status">
          {failed === src ? 'This image could not load. Choose another location or return to the district.' : 'Opening location…'}
        </p>}
      </div>
      <div className="chinatown-view-heading">
        <span>{selected?.name ?? name} · {state.year}</span>
        <div className="chinatown-view-actions">
          {selected && <Button className="secondary" onClick={showDistrict}>← District view</Button>}
        </div>
      </div>
      <nav className="chinatown-location-nav" aria-label={`${name} locations`}>
        {locations.map((location) => <button key={location.id}
          aria-pressed={selected?.id === location.id} onClick={() => select(location)}>{location.name}</button>)}
      </nav>
    </div>
  );
}
