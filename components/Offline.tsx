'use client';
import { useEffect, useState } from 'react';
export default function Offline() {
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('demo')) return;
    if (!('serviceWorker' in navigator)) {
      setStatus('Offline caching is unavailable in this browser.');
      return;
    }
    setStatus('Preparing offline rehearsal…');
    let alive = true;
    fetch('/offline-assets.json')
      .then(async (r) => {
        if (!r.ok) throw Error();
        const registration = await navigator.serviceWorker.register('/sw.js');
        const worker = registration.installing || registration.waiting;
        if (worker) {
          worker.addEventListener('statechange', () => {
            if (alive && worker.state === 'activated')
              setStatus('Offline rehearsal ready · standard demo path');
            if (alive && worker.state === 'redundant')
              setStatus('Offline cache failed. Keep this connection open.');
          });
        } else if (alive)
          setStatus('Offline rehearsal ready · standard demo path');
      })
      .catch(() => {
        if (alive)
          setStatus('Offline rehearsal requires the production build.');
      });
    return () => {
      alive = false;
    };
  }, []);
  return status ? (
    <div className="offlinestatus" role="status">
      {status}
    </div>
  ) : null;
}
