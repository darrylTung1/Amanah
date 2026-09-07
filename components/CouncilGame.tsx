'use client';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Cloth from '@/components/Cloth';
import DistrictRating from '@/components/DistrictRating';
import { districtRating } from '@/engine/rating';
import Testimony from '@/components/Testimony';
import RecordedDialogue from '@/components/RecordedDialogue';
import { Button } from '@/components/ui/button';
import {
  allMoves,
  councilYears,
  outcomeYears,
  programme,
  type Decision,
  decode,
  encode,
  run,
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
const base: DecisionRecord = { v: 3, weights: [3, 3, 2, 2], rounds: [] };
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
  const [draft, setDraft] = useState<Decision[]>([]);
  const [notice, setNotice] = useState('');
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
  const year = councilYears(record)[record.rounds.length] ?? 2126;
  const original = run(record, year).at(-1)!;
  const previewRecord = draft.length
    ? { ...record, rounds: [...record.rounds, programme(draft)] }
    : record;
  const state = run(previewRecord, year).at(-1)!;
  const minPolicies = record.v >= 2 ? 2 : 1;
  const maxPolicies = record.v >= 2 ? 3 : 1;
  const scene = getScenario(sceneId ?? leadScenario(original), state);
  const speaker = people.find((p) => p.id === scene.speaker)!;
  const owner = lever ? policyOwner(lever) : null;
  const previouslyCleared =
    owner === 'landlord_teo' &&
    allMoves(previewRecord).some((d) => d.riders.includes('compensation_fund'));
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
    document.getElementById('scene-story')?.scrollTo({ top: 0 });
  }
  function selectPlace(id: string) {
    setNotice('');
    setSceneId(parcelScenario(id, state));
    document.getElementById('scene-story')?.scrollTo({ top: 0 });
    setLever(null);
    setAccepted(false);
  }
  function costFor(id: LeverId) {
    const added = draft.find((d) => d.lever === id);
    if (added) return policy(added).cost;
    const waived =
      policyOwner(id) === 'landlord_teo' &&
      allMoves(previewRecord).some((d) =>
        d.riders.includes('compensation_fund'),
      );
    const condition = waived ? undefined : requiredProtection[id];
    return policy({ lever: id, riders: condition ? [condition] : [] }).cost;
  }
  function offer() {
    if (!lever || !owner || !protection) return;
    const p = scriptedPosition(lever, owner, protection.replaceAll('_', ' '));
    setAccepted(p.stance === 'conditional' && p.rider === protection);
  }
  function addPolicy() {
    if (
      !decision ||
      !selected ||
      !cleared ||
      draft.length >= maxPolicies ||
      draft.some((d) => d.lever === decision.lever) ||
      selected.cost > state.capacity
    )
      return;
    setDraft([...draft, decision]);
    setNotice(
      `${levers[decision.lever].name} added. ${draft.length + 1 < minPolicies ? 'Choose a second policy before advancing.' : draft.length + 1 < maxPolicies ? 'Ready. Add an optional third policy or advance time.' : 'Programme complete. Advance time when ready.'}`,
    );
    requestAnimationFrame(() => {
      const node = document.getElementById('programme-next');
      node?.scrollIntoView({ block: 'center' });
      node?.focus({ preventScroll: true });
    });
    setLever(null);
    setAccepted(false);
  }
  function removePolicy(index: number) {
    if (index < 0 || index >= draft.length) return;
    setDraft(draft.slice(0, index));
    setNotice(
      `${levers[draft[index].lever].name}${index < draft.length - 1 ? ' and later additions' : ''} undone. Capacity restored.`,
    );
    setLever(null);
    setAccepted(false);
  }
  function commit() {
    if (!record || draft.length < minPolicies) return;
    const next = { ...record, rounds: [...record.rounds, programme(draft)] };
    const target = outcomeYears(record)[record.rounds.length];
    const result = run(next, target).at(-1)!;
    if (!embedded)
      history.replaceState(
        null,
        '',
        '/council?d=' + encode(next) + (demo ? '&demo=1' : ''),
      );
    setNotice('');
    setPrevious(original);
    setDraft([]);
    setRecord(next);
    setFuture(result);
    requestAnimationFrame(() => window.scrollTo({ top: 0 }));
    setSceneId(null);
    setLever(null);
    setAccepted(false);
  }
  function choice(id: LeverId, description: string) {
    const cost = costFor(id);
    return (
      <m.button
        key={id}
        className={`policy-choice ${lever === id ? 'selected' : ''}`}
        initial={false}
        animate={{ x: lever === id ? 3 : 0 }}
        whileTap={
          draft.some((d) => d.lever === id) || draft.length >= maxPolicies
            ? undefined
            : { scale: 0.99 }
        }
        aria-pressed={lever === id}
        disabled={
          draft.some((d) => d.lever === id) || draft.length >= maxPolicies
        }
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
      </m.button>
    );
  }
  return (
    <div className={embedded ? 'embedded-council' : 'shell game-shell'}>
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
            else {
              setFuture(null);
              window.scrollTo({ top: 0 });
            }
          }}
        />
      ) : (
        <main className="scenario-game">
          <div className="councilhead">
            <div>
              <p className="eyebrow">
                {year} · Period {record.rounds.length + 1} of 3
              </p>
              <h1>{scene.title}</h1>
            </div>
          </div>
          <div className="councilgrid">
            <section className="district">
              <Cloth
                state={state}
                onParcel={selectPlace}
                selectedParcel={sceneParcel(scene.id)}
              />
              <details className="game-rating">
                <summary>
                  District rating{' '}
                  <strong>{districtRating(state).score}/100</strong> · View
                  categories
                </summary>
                <DistrictRating
                  state={state}
                  previous={draft.length ? original : undefined}
                  preview={draft.length > 0}
                />
              </details>
            </section>
            <aside
              id="scene-story"
              tabIndex={-1}
              className="councilpanel"
              aria-label="Scenario and choices"
            >
              <div id="programme-next" tabIndex={-1} className="programme-next">
                {notice && <p role="status">{notice}</p>}
              </div>
              <div className="personhead">
                <span className="avatar">{speaker.initials}</span>
                <div>
                  <h2>{speaker.name}</h2>
                  <small>{scene.place}</small>
                </div>
              </div>
              <details className="scene-voice">
                <summary>Their concern</summary>
                <RecordedDialogue
                  key={scene.id + year}
                  clipKey={
                    'scene|' +
                    scene.id +
                    (scene.id === 'six-weeks' && year !== 2026 ? '|later' : '')
                  }
                  text={scene.dialogue}
                />
              </details>
              <div className="scene-choices" hidden={!!lever}>
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
                <m.section
                  key={lever}
                  initial={{ opacity: 0.7, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="decision-review"
                  aria-label="Review decision"
                >
                  <button
                    className="text-action"
                    onClick={() => {
                      setLever(null);
                      setAccepted(false);
                    }}
                  >
                    ← All choices
                  </button>
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
                    {record.v >= 2 &&
                    allMoves(record).some((d) => d.lever === lever)
                      ? 'Renewal replaces the earlier policy; immediate effect is halved: '
                      : 'Immediate effect: '}{' '}
                    {Object.entries(selected.immediate)
                      .map(
                        ([k, v]) =>
                          `${k} ${v > 0 ? '+' : ''}${Math.round(v * 100 * (record.v >= 2 && allMoves(record).some((d) => d.lever === lever) ? 0.5 : 1))}`,
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
                    disabled={
                      !cleared ||
                      selected.cost > state.capacity ||
                      draft.length >= maxPolicies ||
                      draft.some((d) => d.lever === lever)
                    }
                    onClick={addPolicy}
                  >
                    Add to programme · {selected.cost < 0 ? 'raise' : 'spend'}{' '}
                    {Math.abs(selected.cost)} capacity
                  </Button>
                </m.section>
              )}
            </aside>
          </div>
          <div className="programme-dock" aria-label="Programme progress">
            <details className="programme-menu">
              <summary>
                Programme {draft.length}/{maxPolicies}
              </summary>
              <div className="programme-popover">
                <ol>
                  {draft.map((d, i) => (
                    <li key={d.lever}>
                      <span>{levers[d.lever].name}</span>
                      <button
                        className="text-action"
                        onClick={() => removePolicy(i)}
                        aria-label={
                          'Undo ' +
                          levers[d.lever].name +
                          ' and later additions'
                        }
                      >
                        Undo{i < draft.length - 1 ? ' from here' : ''}
                      </button>
                    </li>
                  ))}
                </ol>
                <p className="small">
                  Choose {minPolicies}–{maxPolicies} different policies. Undo
                  removes that policy and later additions. New periods add 20
                  capacity; renewals replace earlier policies.
                </p>
              </div>
            </details>
            <div>
              <strong> {Math.floor(state.capacity)} capacity</strong>
              <button
                className="text-action programme-undo"
                disabled={draft.length === 0}
                onClick={() => removePolicy(draft.length - 1)}
                title={
                  draft.length
                    ? `Undo ${levers[draft[draft.length - 1].lever].name}`
                    : 'Add a policy to undo it'
                }
              >
                ↶ Undo last policy
              </button>
              <p className="small">
                {draft.length < minPolicies
                  ? `Add ${minPolicies - draft.length} more to complete this period`
                  : draft.length < maxPolicies
                    ? 'Ready to advance · third policy optional'
                    : 'Programme complete'}
              </p>
            </div>
            <Button
              className="primary"
              disabled={draft.length < minPolicies}
              onClick={commit}
            >
              Advance to {outcomeYears(record)[record.rounds.length]} →
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}
