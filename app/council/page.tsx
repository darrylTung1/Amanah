'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Cloth from '@/components/Cloth';
import Testimony from '@/components/Testimony';
import VoiceCouncil from '@/components/VoiceCouncil';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  decode,
  encode,
  run,
  keys,
  levers,
  policy,
  riders,
  people,
  type DecisionRecord,
  type LeverId,
  type State,
} from '@/engine/model';
import { scriptedPosition, type Position } from '@/engine/negotiation';
const base: DecisionRecord = { v: 1, weights: [3, 3, 2, 2], rounds: [] };
export default function Council() {
  const [record, setRecord] = useState<DecisionRecord | null>(null);
  const [error, setError] = useState('');
  const [demo, setDemo] = useState(false);
  const [person, setPerson] = useState('landlord_teo');
  const [lever, setLever] = useState<LeverId>('rent_covenant');
  const [position, setPosition] = useState<Position | null>(null);
  const [argument, setArgument] = useState('');
  const [busy, setBusy] = useState(false);
  const [future, setFuture] = useState<State | null>(null);
  const [bleed, setBleed] = useState(false);
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search);
      const r = q.has('d') ? decode(q.get('d')!) : base;
      run(r);
      setRecord(r);
      setDemo(q.get('demo') === '1');
    } catch {
      setError(
        'This council link is invalid. Start a new council to continue.',
      );
    }
  }, []);
  if (error)
    return (
      <div className="shell">
        <Header />
        <main className="errorpage">
          <h1>That thread is broken.</h1>
          <p>{error}</p>
          <a href="/">Start a new council →</a>
        </main>
      </div>
    );
  if (!record)
    return (
      <div className="shell">
        <Header />
        <p style={{ padding: 40 }}>Opening the council…</p>
      </div>
    );
  if (record.rounds.length === 3 && !future)
    return (
      <div className="shell">
        <Header />
        <main className="errorpage">
          <h1>Your council has concluded.</h1>
          <div className="actions">
            <a href={'/receipt?d=' + encode(record)}>
              Open your legacy receipt →
            </a>
          </div>
        </main>
      </div>
    );
  const year = [2026, 2036, 2050][record.rounds.length] ?? 2126;
  const state = run(record, year).at(-1)!;
  const p = people.find((p) => p.id === person)!;
  const decision = {
    lever,
    riders:
      position?.stance === 'conditional' && position.rider
        ? [position.rider]
        : [],
  };
  const selected = policy(decision);
  const veto: string | undefined = policy({ lever, riders: [] }).veto;
  const cleared =
    !veto ||
    position?.stance === 'concede' ||
    position?.stance === 'conditional' ||
    (veto === 'landlord_teo' &&
      record.rounds.some((d) => d.riders.includes('compensation_fund')));
  const pressure =
    year === 2026
      ? 'A rent renewal. Six weeks. One move.'
      : state.flags.includes('EXODUS')
        ? 'The community has begun to leave.'
        : state.habitability < 0.4
          ? 'The streets are becoming harder to live in.'
          : state.continuity < 0.45
            ? 'The trades that made this place are fading.'
            : 'Success is pushing up the price of belonging.';
  function choose(id: LeverId) {
    setLever(id);
    setPosition(null);
    setArgument('');
    const v = 'veto' in levers[id] ? levers[id].veto : null;
    if (typeof v === 'string') setPerson(v);
  }
  function commit() {
    if (!record || !cleared || selected.cost > state.capacity || busy) return;
    const next = { ...record, rounds: [...record.rounds, decision] };
    const target = [2036, 2050, 2126][record.rounds.length];
    const result = run(next, target).at(-1)!;
    history.replaceState(
      null,
      '',
      '/council?d=' + encode(next) + (demo ? '&demo=1' : ''),
    );
    setRecord(next);
    setFuture(result);
    setBleed(true);
    setTimeout(() => setBleed(false), 2100);
    setPosition(null);
  }
  return (
    <div className="shell">
      <Header demo={demo} />
      {bleed && (
        <div className="bleed" aria-hidden>
          <strong>{future?.year}</strong>
        </div>
      )}
      {future ? (
        <Testimony
          state={future}
          record={record}
          demo={demo}
          onContinue={() => {
            if (future.year === 2126)
              location.href = '/receipt?d=' + encode(record);
            else {
              setFuture(null);
              setArgument('');
            }
          }}
        />
      ) : (
        <main>
          <div className="councilhead">
            <div>
              <p className="eyebrow">
                {year} · Round {record.rounds.length + 1} of 3
              </p>
              <h1>The council is yours.</h1>
            </div>
            <div className="timeline">
              {[2026, 2036, 2050, 2126].map((y) => (
                <span className={y === year ? 'current' : ''} key={y}>
                  {y}
                </span>
              ))}
            </div>
          </div>
          <p style={{ marginBottom: 20 }}>{pressure}</p>
          <div className="councilgrid">
            <section className="district">
              <Cloth state={state} />
              <div className="metrics">
                {keys.map((k) => (
                  <div className="metric" key={k}>
                    <label>{k[0].toUpperCase() + k.slice(1)}</label>
                    <strong>
                      {Math.round(state[k] * 100)}
                      <small> /100</small>
                    </strong>
                    <div className="track">
                      <span style={{ width: state[k] * 100 + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rail" aria-label="Council members">
                {people.map((member) => (
                  <button
                    key={member.id}
                    disabled={busy}
                    className={person === member.id ? 'active' : ''}
                    aria-pressed={person === member.id}
                    onClick={() => {
                      setPerson(member.id);
                      setArgument('');
                    }}
                  >
                    <span className="avatar">{member.initials}</span>
                    {member.name
                      .replace('Mdm ', '')
                      .replace('Ustaz ', '')
                      .replace('Mr ', '')}
                  </button>
                ))}
              </div>
            </section>
            <aside className="councilpanel">
              <div className="personhead">
                <span className="avatar">{p.initials}</span>
                <div>
                  <h2>{p.name}</h2>
                  <small>{p.role}</small>
                </div>
              </div>
              <p className="quote">“{p.concern}”</p>
              <div className="evidence">
                <small>At the council table</small>
                <p>{p.evidence}</p>
              </div>
              {veto === person && !cleared && (
                <p className="warning">● Holds a veto on this proposal</p>
              )}
              {!demo && (
                <VoiceCouncil
                  key={person + lever + year}
                  person={person}
                  lever={lever}
                  record={record}
                  onPosition={setPosition}
                  onBusy={setBusy}
                />
              )}
              <div className="negotiation">
                <label htmlFor="argument" className="small">
                  {demo
                    ? 'Scripted rehearsal'
                    : 'Written fallback · scripted negotiation'}
                </label>
                <textarea
                  id="argument"
                  value={argument}
                  onChange={(e) => setArgument(e.target.value)}
                  placeholder={
                    veto === 'landlord_teo'
                      ? 'Offer a compensation fund…'
                      : lever === 'pedestrianise'
                        ? 'Offer a morning loading window…'
                        : lever === 'visitor_levy'
                          ? 'Offer a ten-year sunset review…'
                          : lever === 'adaptive_reuse'
                            ? 'Offer an archive protection clause…'
                            : 'Offer a noise curfew…'
                  }
                  maxLength={1200}
                />
                <Button
                  className="secondary"
                  disabled={
                    busy || argument.trim().length < 8 || veto !== person
                  }
                  onClick={() =>
                    setPosition(scriptedPosition(lever, person, argument))
                  }
                >
                  Put your case forward →
                </Button>
                {!veto && <small>This move needs no veto release.</small>}
                {veto && veto !== person && (
                  <small>
                    Negotiate this move with{' '}
                    {people.find((x) => x.id === veto)?.name}.
                  </small>
                )}
                {position && (
                  <p
                    role="status"
                    className={
                      position.stance === 'hold' ? 'warning' : 'status'
                    }
                  >
                    {position.reason_line}
                  </p>
                )}
              </div>
            </aside>
          </div>
          <div className="movebar">
            <div>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Your one move for this era
              </p>
              <Select
                value={lever}
                onValueChange={(id) => id && choose(id as LeverId)}
                disabled={busy}
              >
                <SelectTrigger className="select" aria-label="Choose a policy">
                  <SelectValue>{levers[lever].name}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(levers).map(([id, l]) => (
                    <SelectItem key={id} value={id}>
                      {l.name} · {l.cost < 0 ? '+' : ''}
                      {-l.cost} capacity
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="small muted" style={{ marginTop: 8 }}>
                Condition:{' '}
                {decision.riders.length ? riders[decision.riders[0]] : 'None'} ·{' '}
                {selected.cost < 0 ? 'Raises' : 'Costs'}{' '}
                {Math.abs(selected.cost)} capacity
              </p>
              <p className="small muted">
                Immediate:{' '}
                {Object.entries(selected.immediate)
                  .map(
                    ([k, v]) =>
                      `${k} ${v > 0 ? '+' : ''}${Math.round(v * 100)}`,
                  )
                  .join(' · ')}
              </p>
            </div>
            <div>
              <p className="capacity">
                Capacity <strong>{Math.floor(state.capacity)}</strong> /100
              </p>
              <div className="actions">
                <Button
                  className="primary"
                  disabled={!cleared || selected.cost > state.capacity || busy}
                  onClick={commit}
                >
                  Commit & move to {[2036, 2050, 2126][record.rounds.length]} ↗
                </Button>
              </div>
              {!cleared && (
                <p className="warning" style={{ marginTop: 8 }}>
                  Resolve the veto to commit.
                </p>
              )}
              {selected.cost > state.capacity && (
                <p className="warning">This agreement exceeds your capacity.</p>
              )}
            </div>
          </div>
        </main>
      )}
      <footer className="footer">
        <span>The council negotiates. The simulation computes.</span>
        <span>Illustrative model · Irreversible decisions</span>
      </footer>
    </div>
  );
}
