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
  const [backgrounds, setBackgrounds] = useState<Record<string, string>>({});
  const src = selected ? artwork(state, selected) : '';
  const closeupReady = !!selected && loaded === src && zoomDone;
  function matchBackground(image: HTMLImageElement, path: string) {
    // Read only the empty corners so buildings do not tint the surrounding space.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    try {
      context.drawImage(image, 0, 0, 16, 16);
      const corners = [[0, 0], [15, 0], [0, 15], [15, 15]].map(([x, y]) => {
        const [r, g, b] = context.getImageData(x, y, 1, 1).data;
        return `rgb(${r} ${g} ${b})`;
      });
      const background = `radial-gradient(ellipse at top left, ${corners[0]}, transparent 70%), radial-gradient(ellipse at top right, ${corners[1]}, transparent 70%), linear-gradient(to right, ${corners[2]}, ${corners[3]})`;
      setBackgrounds((previous) => ({ ...previous, [path]: background }));
    } catch { /* Keep the neutral background if pixel access is unavailable. */ }
  }
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
      <div className="chinatown-art-stage" style={{ background: backgrounds[closeupReady ? src : overview] }}>
        <div className="chinatown-art-square">
          {/* Remove the overview before fading in the masked closeup, so its edges cannot show through. */}
          {!revealed && !closeupReady && <m.img
            className="chinatown-overview"
            src={overview}
            onLoad={(event) => matchBackground(event.currentTarget, overview)}
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
              onLoad={(event) => { matchBackground(event.currentTarget, src); setLoaded(src); setFailed(''); }}
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
