'use client';
import { useEffect, useState } from 'react';
import SingaporeMap from '@/components/SingaporeMap';
import CouncilGame from '@/components/CouncilGame';
import AgentActions from '@/components/AgentActions';
import { decode, isDistrictId, type DistrictId } from '@/engine/model';
import { districtNames } from '@/engine/districts';
export default function Home() {
  const [district, setDistrict] = useState<DistrictId | null>(null);
  const [visited, setVisited] = useState<DistrictId[]>([]);
  const [last, setLast] = useState<DistrictId>('kampong-glam');
  function enter(id: DistrictId | null) {
    setDistrict(id);
    if (id) {
      setVisited((v) => (v.includes(id) ? v : [...v, id]));
      setLast(id);
    }
    const url = new URL(location.href);
    url.searchParams.delete('d');
    if (id) url.searchParams.set('district', id);
    else url.searchParams.delete('district');
    history.replaceState(null, '', url);
  }
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    let id = q.get('district');
    if (q.has('d')) {
      try {
        id = decode(q.get('d')!).district ?? 'kampong-glam';
      } catch {
        /* Council handles invalid records. */
      }
    }
    if (isDistrictId(id)) {
      setDistrict(id);
      setLast(id);
      setVisited([id]);
    }
  }, []);
  useEffect(() => {
    if (!district && visited.length === 0) return;
    document
      .getElementById(district ? 'district-entry' : `singapore-marker-${last}`)
      ?.focus({ preventScroll: true });
  }, [district, last, visited.length]);
  return (
    <div
      className={`shell game-shell${district ? '' : ' game-shell-frontpage'}`}
    >
      <AgentActions />
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            enter(null);
          }}
        >
          <span className="brandmark">✳</span>Sociopoly
        </a>
        <div className="toplinks">
          {district && (
            <button
              id="district-entry"
              className="text-action"
              onClick={() => enter(null)}
            >
              ← Singapore
            </button>
          )}
          <span className="tag">
            {district ? districtNames[district] : 'Singapore, 2026'}
          </span>
        </div>
      </header>
      <div className="home-scenes">
        <div
          className={`home-scene home-scene-map${district ? ' home-scene-inactive' : ''}`}
          inert={!!district}
          aria-hidden={!!district}
        >
          <SingaporeMap active={!district} onEnter={enter} selected={last} />
        </div>
        {visited.map((id) => (
          <div
            key={id}
            className={`home-scene${district !== id ? ' home-scene-inactive' : ''}`}
            inert={district !== id}
            aria-hidden={district !== id}
          >
            <CouncilGame embedded districtId={id} />
          </div>
        ))}
      </div>
    </div>
  );
}
