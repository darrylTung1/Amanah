'use client';
import { useEffect, useRef, useState } from 'react';
import type { State } from '@/engine/model';
import { Button } from '@/components/ui/button';
import { parcels } from './district/parcels';
import type { DistrictView } from './district/scene';
export default function Cloth({
  state,
  compact = false,
}: {
  state: State;
  compact?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<DistrictView | null>(null);
  const current = useRef(state);
  current.current = state;
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  );
  useEffect(() => {
    let cancelled = false;
    import('./district/scene')
      .then(({ createDistrict }) => {
        if (cancelled || !host.current) return;
        try {
          view.current = createDistrict(
            host.current,
            current.current,
            setSelected,
          );
          setStatus('ready');
        } catch {
          setStatus('unavailable');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
      view.current?.dispose();
      view.current = null;
    };
  }, []);
  useEffect(() => {
    view.current?.update(state);
  }, [
    state.year,
    state.affordability,
    state.continuity,
    state.vitality,
    state.equity,
    state.habitability,
  ]);
  function select(i: number) {
    setSelected(i);
    view.current?.select(i);
  }
  const parcel = parcels[selected];
  const value = Math.round(state[parcel.metric] * 100);
  return (
    <div
      className={`clothframe district3d ${compact ? 'district3d-compact' : ''}`}
    >
      <div className="maphead">
        <span>Kampong Gelam · interactive district</span>
        <span>{state.year}</span>
      </div>
      <div className="district3d-stage">
        <div
          className="district3d-canvas"
          ref={host}
          role="region"
          aria-label="Interactive 3D district. Drag to rotate, scroll or pinch to zoom. Arrow keys rotate, plus and minus zoom, Home resets."
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              view.current?.rotate(e.key === 'ArrowLeft' ? -0.2 : 0.2);
            }
            if (e.key === '+' || e.key === '=' || e.key === '-') {
              e.preventDefault();
              view.current?.zoom(e.key === '-' ? 1.15 : 0.87);
            }
            if (e.key === 'Home') {
              e.preventDefault();
              view.current?.reset();
            }
          }}
        />
        {status !== 'ready' && (
          <div className="district3d-message" role="status">
            {status === 'loading'
              ? 'Building the district…'
              : '3D is unavailable on this device. Explore every parcel below.'}
          </div>
        )}
        <div className="district3d-toolbar">
          <Button
            className="secondary"
            aria-label="Zoom in"
            disabled={status !== 'ready'}
            onClick={() => view.current?.zoom(0.85)}
          >
            +
          </Button>
          <Button
            className="secondary"
            aria-label="Zoom out"
            disabled={status !== 'ready'}
            onClick={() => view.current?.zoom(1.18)}
          >
            −
          </Button>
          <Button
            className="secondary"
            disabled={status !== 'ready'}
            onClick={() => view.current?.reset()}
          >
            Reset view
          </Button>
        </div>
        <span className="district3d-caption">
          Drag to orbit · Pinch or scroll to zoom
        </span>
      </div>
      <div className="district3d-inspector" aria-live="polite">
        <div>
          <p>{parcel.name}</p>
          <small>
            {parcel.metric[0].toUpperCase() + parcel.metric.slice(1)}
          </small>
        </div>
        <strong className={value < 40 ? 'warning' : 'gold'}>
          {value}
          <small> /100</small>
        </strong>
      </div>
      {!compact && <p className="district3d-detail">{parcel.detail}</p>}
      <div
        className="district3d-parcels"
        aria-label="Inspect a district parcel"
      >
        {parcels.map((p, i) => (
          <button
            key={p.id}
            aria-pressed={selected === i}
            className={selected === i ? 'selected' : ''}
            onClick={() => select(i)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="mapfoot">
        <span>Conceptual model · not a surveyed map</span>
        <span>Eight interwoven futures</span>
      </div>
    </div>
  );
}
