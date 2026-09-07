'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Cloth from '@/components/Cloth';
import DistrictRating from '@/components/DistrictRating';
import { Button } from '@/components/ui/button';
import {
  roundMoves,
  decode,
  encode,
  run,
  initial,
  keys,
  utilities,
  flagText,
  levers,
  riders,
  type DecisionRecord,
} from '@/engine/model';
export default function Receipt() {
  const [record, setRecord] = useState<DecisionRecord | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  useEffect(() => {
    try {
      const r = decode(new URLSearchParams(location.search).get('d') ?? '');
      if (r.rounds.length !== 3) throw Error();
      run(r);
      setRecord(r);
    } catch {
      setError('This receipt needs a valid, completed three-round council.');
    }
  }, []);
  if (!record)
    return (
      <div className="shell">
        <Header />
        <main className="errorpage">
          <h1>{error ? 'A thread is missing.' : 'Unfolding your legacy…'}</h1>
          {error && (
            <>
              <p>{error}</p>
              <a href="/">Start a council →</a>
            </>
          )}
        </main>
      </div>
    );
  const timeline = run(record);
  const final = timeline.at(-1)!;
  const baseline = run({ ...record, rounds: [] }).at(-1)!;
  const harms = final.flags.filter((f) => f !== 'TRUST_DIVIDEND');
  return (
    <div className="shell">
      <Header />
      <main className="receipt">
        <p className="eyebrow">2126 · The record of your council</p>
        <h1>
          Your <span className="gold">legacy receipt.</span>
        </h1>
        <p className="muted">
          What you chose. What the district inherited. What cannot be undone.
        </p>
        <DistrictRating state={final} previous={initial} />
        <div className="actions">
          <Button
            className="primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  location.origin + '/receipt?d=' + encode(record),
                );
                setCopied('Receipt link copied.');
              } catch {
                setCopied(
                  'Copy the URL from your address bar to share this receipt.',
                );
              }
            }}
          >
            Copy the receipt link ↗
          </Button>
          <Button className="secondary" onClick={() => window.print()}>
            Print decision brief
          </Button>
          <a href="/">Convene again →</a>
          <span className="status" role="status">
            {copied}
          </span>
        </div>
        <div className="receiptgrid">
          <section className="receiptcard">
            <h2>Priorities and outcomes.</h2>
            <p className="small muted">
              Gold: starting priority /10 · Green: achieved condition /100.
              These measure different things; compare the pattern, not the
              units.
            </p>
            {keys.slice(0, 4).map((k, i) => (
              <div className="barrow" key={k}>
                <div className="row">
                  <span>{k[0].toUpperCase() + k.slice(1)}</span>
                  <span>
                    {record.weights[i]}/10 → {Math.round(final[k] * 100)}/100
                  </span>
                </div>
                <div className="track">
                  <span style={{ width: record.weights[i] * 10 + '%' }} />
                </div>
                <div className="track">
                  <span
                    className="outcome"
                    style={{ width: final[k] * 100 + '%' }}
                  />
                </div>
              </div>
            ))}
            <p className="small muted">
              At 2126, affordability is{' '}
              {Math.round((final.affordability - baseline.affordability) * 100)}{' '}
              points above the do-nothing trajectory.{' '}
              {record.v === 2
                ? 'Ongoing policies are maintained from annual capacity.'
                : 'A century without renewed policy can erase early gains.'}
            </p>
          </section>
          <section className="receiptcard">
            <h2>Who gained. Who lost.</h2>
            <p className="small muted">
              Utility change from 2026, using each stakeholder’s priorities.
            </p>
            {utilities(final).map((p) => (
              <div className="winner" key={p.id}>
                <div>
                  <p>{p.name}</p>
                  <small>{p.reason}</small>
                </div>
                <strong className={p.change >= 0 ? 'status' : 'warning'}>
                  {p.change >= 0 ? '+' : ''}
                  {(p.change * 100).toFixed(1)}
                </strong>
              </div>
            ))}
          </section>
        </div>
        <section className="receiptcard">
          <h2>The marks that remain.</h2>
          {harms.length ? (
            harms.map((f) => (
              <p className="harm" key={f}>
                <strong>
                  {timeline.find((s) => s.flags.includes(f))?.year}
                </strong>{' '}
                · {flagText[f]}
              </p>
            ))
          ) : (
            <p>No irreversible harm threshold was crossed.</p>
          )}
          {final.flags.includes('TRUST_DIVIDEND') && (
            <p className="status">{flagText.TRUST_DIVIDEND}</p>
          )}
        </section>
        <div className="receiptgrid">
          <section className="receiptcard">
            <h2>Your programmes. A century.</h2>
            {record.rounds.map((d, i) => (
              <div className="winner" key={i}>
                <span className="gold">{[2026, 2036, 2050][i]}</span>
                <div style={{ flex: 1 }}>
                  <p>
                    {roundMoves(d)
                      .map((m) => levers[m.lever].name)
                      .join(' + ')}
                  </p>
                  <small>
                    {roundMoves(d).some((m) => m.riders.length)
                      ? roundMoves(d)
                          .flatMap((m) => m.riders)
                          .map((r) => riders[r])
                          .join(', ')
                      : 'No attached conditions'}
                  </small>
                </div>
              </div>
            ))}
          </section>
          <section className="receiptcard">
            <h2>The years in between.</h2>
            <table className="history">
              <caption className="small muted" style={{ textAlign: 'left' }}>
                Annual engine, sampled at council horizons. All indices /100.
              </caption>
              <thead>
                <tr>
                  <th>Year</th>
                  {keys.map((k) => (
                    <th key={k} title={k}>
                      {k[0].toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[2026, 2036, 2050, 2075, 2100, 2126].map((y) => {
                  const s = timeline.find((s) => s.year === y)!;
                  return (
                    <tr key={y}>
                      <td>{y}</td>
                      {keys.map((k) => (
                        <td key={k}>{Math.round(s[k] * 100)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="small muted" style={{ marginTop: 10 }}>
              A affordability · C continuity · V vitality · E equity · H
              habitability. Council-year values include that year’s immediate
              policy effects.
            </p>
          </section>
        </div>
        <section className="receiptcard">
          <h2>The district, then and now.</h2>
          <div className="receiptboards">
            <Cloth state={initial} compact />
            <Cloth state={final} compact />
          </div>
        </section>
        <p className="small muted" style={{ marginTop: 25 }}>
          Model v{record.v} · Coefficients are calibrated for legibility, not
          forecasting. Characters and testimony are fictional. A shared URL
          reproduces the decisions and all outcomes; it is not a verified
          transcript of the negotiation.
        </p>
      </main>
      <footer className="footer">
        <span>Sociopoly · Voices of the next hundred years</span>
        <span>CloudHacks 2026</span>
      </footer>
    </div>
  );
}
