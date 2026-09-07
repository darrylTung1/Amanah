'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Cloth from '@/components/Cloth';
import Testimony from '@/components/Testimony';
import RecordedDialogue from '@/components/RecordedDialogue';
import { Button } from '@/components/ui/button';
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
import { scriptedPosition } from '@/engine/negotiation';
import {
  leadScenario,
  getScenario,
  parcelScenario,
  sceneParcel,
  requiredProtection,
  policyExplanation,
  policyOwner,
} from '@/engine/scenarios';
import scripts from '@/content/council-recording-scripts.json';
const base: DecisionRecord = { v: 1, weights: [3, 3, 2, 2], rounds: [] };
export default function CouncilGame({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [record, setRecord] = useState<DecisionRecord | null>(null);
  const [error, setError] = useState('');
  const [demo, setDemo] = useState(false);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [lever, setLever] = useState<LeverId | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [future, setFuture] = useState<State | null>(null);
  const [previous, setPrevious] = useState<State | null>(null);
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search);
      const r = q.has('d') ? decode(q.get('d')!) : base;
      run(r);
      setRecord(r);
      setDemo(q.get('demo') === '1');
    } catch {
      setError('This council link is invalid. Start a new game to continue.');
    }
  }, []);
  if (error)
    return (
      <main className="errorpage">
        <h1>That link is incomplete.</h1>
        <p>{error}</p>
        <a href="/">Start a new game →</a>
      </main>
    );
  if (!record) return <p style={{ padding: 40 }}>Opening the district…</p>;
  if (record.rounds.length === 3 && !future)
    return (
      <main className="errorpage">
        <h1>Your council has concluded.</h1>
        <a href={'/receipt?d=' + encode(record)}>Open your legacy receipt →</a>
      </main>
    );
  const year = [2026, 2036, 2050][record.rounds.length] ?? 2126;
  const state = run(record, year).at(-1)!;
  const scene = getScenario(sceneId ?? leadScenario(state), state);
  const speaker = people.find((p) => p.id === scene.speaker)!;
  const owner = lever ? policyOwner(lever) : null;
  const previouslyCleared =
    owner === 'landlord_teo' &&
    record.rounds.some((d) => d.riders.includes('compensation_fund'));
  const protection =
    lever && !previouslyCleared ? requiredProtection[lever] : undefined;
  const decision = lever
    ? { lever, riders: accepted && protection ? [protection] : [] }
    : null;
  const selected = decision ? policy(decision) : null;
  const cleared = !owner || previouslyCleared || accepted;
  const counterpart = people.find((p) => p.id === owner);
  const responseKey =
    owner && lever ? `${owner}|${lever}|${accepted ? protection : 'hold'}` : '';
  const response = scripts.find((x) => x.key === responseKey);
  function choose(id: LeverId) {
    setLever(id);
    setAccepted(false);
  }
  function selectPlace(id: string) {
    setSceneId(parcelScenario(id, state));
    setLever(null);
    setAccepted(false);
  }
  function costFor(id: LeverId) {
    const waived =
      policyOwner(id) === 'landlord_teo' &&
      record!.rounds.some((d) => d.riders.includes('compensation_fund'));
    const condition = waived ? undefined : requiredProtection[id];
    return policy({ lever: id, riders: condition ? [condition] : [] }).cost;
  }
  function offer() {
    if (!lever || !owner || !protection) return;
    const p = scriptedPosition(lever, owner, protection.replaceAll('_', ' '));
    setAccepted(p.stance === 'conditional' && p.rider === protection);
  }
  function commit() {
    if (
      !record ||
      !decision ||
      !selected ||
      !cleared ||
      selected.cost > state.capacity
    )
      return;
    const next = { ...record, rounds: [...record.rounds, decision] };
    const target = [2036, 2050, 2126][record.rounds.length];
    const result = run(next, target).at(-1)!;
    if (!embedded)
      history.replaceState(
        null,
        '',
        '/council?d=' + encode(next) + (demo ? '&demo=1' : ''),
      );
    setPrevious(state);
    setRecord(next);
    setFuture(result);
    setSceneId(null);
    setLever(null);
    setAccepted(false);
  }
  function choice(id: LeverId, description: string) {
    const cost = costFor(id);
    return (
      <button
        key={id}
        className={`policy-choice ${lever === id ? 'selected' : ''}`}
        aria-pressed={lever === id}
        onClick={() => choose(id)}
      >
        <span>
          <strong>{levers[id].name}</strong>
          <small>{description}</small>
        </span>
        <span className="policy-cost">
          {cost < 0 ? '+' : '−'}
          {Math.abs(cost)}
          <small>capacity</small>
        </span>
      </button>
    );
  }
  return (
    <div className={embedded ? 'embedded-council' : 'shell'}>
      {!embedded && <Header demo={demo} />}
      {future ? (
        <Testimony
          state={future}
          previous={previous ?? undefined}
          record={record}
          demo={demo}
          onContinue={() => {
            if (future.year === 2126)
              location.href = '/receipt?d=' + encode(record);
            else setFuture(null);
          }}
        />
      ) : (
        <main className="scenario-game">
          <div className="councilhead">
            <div>
              <p className="eyebrow">
                {year} · Decision {record.rounds.length + 1} of 3
              </p>
              <h1>{scene.title}</h1>
            </div>
            <p className="capacity">
              Available capacity <strong>{Math.floor(state.capacity)}</strong>
              <small> /100</small>
            </p>
          </div>
          <div className="councilgrid">
            <section className="district">
              <Cloth
                state={state}
                onParcel={selectPlace}
                selectedParcel={sceneParcel(scene.id)}
              />
              <p className="small muted scene-map-help">
                Select a place to explore its dilemma. You can make one decision
                this round.
              </p>
              <details className="district-conditions">
                <summary>District conditions</summary>
                <div className="metrics">
                  {keys.map((k) => (
                    <div className="metric" key={k}>
                      <label>{k}</label>
                      <strong>
                        {Math.round(state[k] * 100)}
                        <small> /100</small>
                      </strong>
                    </div>
                  ))}
                </div>
              </details>
            </section>
            <aside className="councilpanel" aria-label="Scenario and choices">
              <div className="personhead">
                <span className="avatar">{speaker.initials}</span>
                <div>
                  <h2>{speaker.name}</h2>
                  <small>{scene.place}</small>
                </div>
              </div>
              <RecordedDialogue
                key={scene.id + year}
                clipKey={
                  'scene|' +
                  scene.id +
                  (scene.id === 'six-weeks' && year !== 2026 ? '|later' : '')
                }
                text={scene.dialogue}
              />
              <div className="scene-choices">
                <h3>{scene.question}</h3>
                {scene.options.map(([id, description]) =>
                  choice(id, description),
                )}
                <details className="other-policies">
                  <summary>Other policies</summary>
                  {Object.keys(levers)
                    .filter(
                      (id) => !scene.options.some(([option]) => option === id),
                    )
                    .map((id) =>
                      choice(id as LeverId, policyExplanation[id as LeverId]),
                    )}
                </details>
                <small>Costs include required protections.</small>
              </div>
              {lever && selected && (
                <section
                  className="decision-review"
                  aria-label="Review decision"
                >
                  <h3>{levers[lever].name}</h3>
                  <p>{policyExplanation[lever]}</p>
                  {counterpart && protection && (
                    <div className="protection-offer">
                      <p className="small">
                        <strong>{counterpart.name}</strong> ·{' '}
                        {accepted
                          ? 'Agreement reached'
                          : 'Requires an agreement'}
                      </p>
                      <RecordedDialogue
                        key={responseKey}
                        clipKey={responseKey}
                        text={response?.text ?? counterpart.concern}
                      />
                      {!accepted ? (
                        <Button className="secondary" onClick={offer}>
                          Offer: {riders[protection]}
                        </Button>
                      ) : (
                        <button
                          className="text-action"
                          onClick={() => setAccepted(false)}
                        >
                          Withdraw this offer
                        </button>
                      )}
                    </div>
                  )}
                  {previouslyCleared && (
                    <p className="small">
                      The earlier owner compensation agreement already covers
                      this proposal.
                    </p>
                  )}
                  <p className="small">
                    Immediate effect:{' '}
                    {Object.entries(selected.immediate)
                      .map(
                        ([k, v]) =>
                          `${k} ${v > 0 ? '+' : ''}${Math.round(v * 100)}`,
                      )
                      .join(' · ')}
                  </p>
                  {selected.cost > state.capacity && (
                    <p role="status" className="warning">
                      Not enough capacity. Choose a cheaper policy or raise
                      funds with the visitor levy.
                    </p>
                  )}
                  <Button
                    className="primary"
                    disabled={!cleared || selected.cost > state.capacity}
                    onClick={commit}
                  >
                    Commit · {selected.cost < 0 ? 'raise' : 'spend'}{' '}
                    {Math.abs(selected.cost)} →{' '}
                    {[2036, 2050, 2126][record.rounds.length]}
                  </Button>
                </section>
              )}
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}
