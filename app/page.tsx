'use client';
import { useEffect, useState } from 'react';
import SingaporeMap from '@/components/SingaporeMap';
import { Button } from '@/components/ui/button';
import Cloth from '@/components/Cloth';
import AgentActions from '@/components/AgentActions';
import { initial, encode, type DecisionRecord } from '@/engine/model';
export default function Home() {
  const [district, setDistrict] = useState(false);
  useEffect(() => {
    const sync = () =>
      setDistrict(
        new URLSearchParams(location.search).get('district') === 'kampong-glam',
      );
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    if (district) document.getElementById('district-title')?.focus();
  }, [district]);
  function navigateDistrict(open: boolean) {
    const url = new URL(location.href);
    if (open) url.searchParams.set('district', 'kampong-glam');
    else url.searchParams.delete('district');
    history.pushState(null, '', url);
    setDistrict(open);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const [weights, setWeights] = useState<[number, number, number, number]>([
    3, 3, 2, 2,
  ]);
  const total = weights.reduce((a, b) => a + b, 0);
  return (
    <div className="shell">
      <AgentActions />
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brandmark">✳</span>Sociopoly
        </a>
        <div className="toplinks">
          <span className="muted small">Voices of the next hundred years</span>
          <span className="tag">
            {district ? 'Kampong Glam, 2026' : 'Singapore, 2026'}
          </span>
        </div>
      </header>
      {!district ? (
        <SingaporeMap onEnter={() => navigateDistrict(true)} />
      ) : (
        <>
          <button
            className="island-back"
            onClick={() => navigateDistrict(false)}
          >
            ← Back to Singapore
          </button>
          <main className="introgrid district-arrival">
            <section className="intro">
              <p className="eyebrow">A district is more than its buildings.</p>
              <h1 id="district-title" tabIndex={-1}>
                What will
                <br />
                they <span className="gold">inherit?</span>
              </h1>
              <p className="lead">
                Five voices. Three decisions. A hundred years of consequences.
                You have a seat at the council.
              </p>
              <div className="case">
                <small>The first pressure</small>
                <p>
                  A textile trader’s rent just became{' '}
                  <span className="gold">2.1× higher.</span>
                </p>
                <small>
                  Twenty-eight years on Arab Street. Six weeks to decide.
                </small>
              </div>
              <div className="values">
                <div className="maphead">
                  <span>First, declare what matters to you.</span>
                  <span>{10 - total} points left</span>
                </div>
                {['Affordability', 'Continuity', 'Vitality', 'Equity'].map(
                  (name, i) => (
                    <div className="value" key={name}>
                      <span>{name}</span>
                      <div className="allocation">
                        <button
                          aria-label={`Decrease ${name}`}
                          disabled={weights[i] === 0}
                          onClick={() =>
                            setWeights(
                              (w) =>
                                w.map((n, j) =>
                                  j === i ? n - 1 : n,
                                ) as typeof weights,
                            )
                          }
                        >
                          −
                        </button>
                        <strong>{weights[i]}</strong>
                        <button
                          aria-label={`Increase ${name}`}
                          disabled={total === 10}
                          onClick={() =>
                            setWeights(
                              (w) =>
                                w.map((n, j) =>
                                  j === i ? n + 1 : n,
                                ) as typeof weights,
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ),
                )}
                <div className="actions">
                  <Button
                    className="primary"
                    disabled={total !== 10}
                    onClick={() => {
                      const r: DecisionRecord = { v: 1, weights, rounds: [] };
                      window.location.href =
                        '/council?d=' +
                        encode(r) +
                        (new URLSearchParams(location.search).get('demo') ===
                        '1'
                          ? '&demo=1'
                          : '');
                    }}
                  >
                    Convene the council <span aria-hidden>↗</span>
                  </Button>
                  <small>About 8 minutes · Sound on</small>
                </div>
              </div>
            </section>
            <section>
              <Cloth state={initial} />
              <p className="small muted" style={{ marginTop: 18 }}>
                Kampong Glam · Explore the district in 3D, then declare what
                matters to you.
              </p>
            </section>
          </main>
        </>
      )}
      <footer className="footer">
        <span>A fictional council grounded in real trade-offs.</span>
        <span>
          Illustrative simulation, not an urban forecast. · CloudHacks 2026
        </span>
      </footer>
    </div>
  );
}
