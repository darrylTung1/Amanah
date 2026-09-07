'use client';
import { useEffect, useState } from 'react';
import SingaporeMap from '@/components/SingaporeMap';
import CouncilGame from '@/components/CouncilGame';
import AgentActions from '@/components/AgentActions';

export default function Home() {
  const [district, setDistrict] = useState(false);
  useEffect(() => {
    setDistrict(
      new URLSearchParams(location.search).get('district') === 'kampong-glam',
    );
  }, []);
  useEffect(() => {
    document
      .getElementById(district ? 'district-entry' : 'singapore-marker')
      ?.focus({ preventScroll: true });
  }, [district]);
  return (
    <div className="shell game-shell">
      <AgentActions />
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setDistrict(false);
          }}
        >
          <span className="brandmark">✳</span>Sociopoly
        </a>
        <div className="toplinks">
          {district && (
            <button
              id="district-entry"
              className="text-action"
              onClick={() => setDistrict(false)}
            >
              ← Singapore
            </button>
          )}
          <span className="tag">
            {district ? 'Kampong Glam' : 'Singapore, 2026'}
          </span>
        </div>
      </header>
      <div className="home-scenes">
        <div
          className={`home-scene home-scene-map${district ? ' home-scene-inactive' : ''}`}
          inert={district}
          aria-hidden={district}
        >
          <SingaporeMap active={!district} onEnter={() => setDistrict(true)} />
        </div>
        <div
          className={district ? 'home-scene' : 'home-scene home-scene-inactive'}
          inert={!district}
          aria-hidden={!district}
        >
          <CouncilGame embedded />
        </div>
      </div>
    </div>
  );
}
