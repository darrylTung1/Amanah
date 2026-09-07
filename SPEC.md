# Sociopoly: Voices of the Next Hundred Years
## Design + technical specification + Codex build plan

**Event:** CloudHacks 2026, Advanced division. Submissions close 10:00, Tue 8 Sept.
**Working time from now (~12:00 Mon):** roughly 20 hours including sleep.
**Target awards:** Overall Advanced, ElevenLabs Best Project.

---

## 0. Scope decisions before anything is written

The pitch as conceived lists multiplayer state, agent negotiation, a scenario engine, 3D/map UI, speech in and out, and consequence simulation. That is a four-week build. What follows keeps the *experience* intact and cuts the engineering that does not appear on stage.

**Cut, and what replaces it**

| Cut | Replacement | Why |
|---|---|---|
| Real-time multiplayer | Single device, one human convener; the five stakeholders are the other "players" | Sync, rooms and presence eat 6+ hours and are invisible in a 5-minute pitch |
| 3D district | Layered 2D SVG board with era transitions | Same visual payoff, a tenth of the cost, no asset pipeline |
| Database / accounts | Decision record encoded in the URL; the engine is deterministic, so the receipt recomputes from the URL alone | No persistence layer at all. This is a *feature* to say out loud in the pitch |
| Four agents talking at once | Turn-taking council: one live agent at a time | ElevenLabs concurrency limits on Creator tier will bite you, and overlapping voices are unintelligible anyway |
| Open-ended agent authority | Agents emit an enum + a rider ID from a fixed list; a pure TypeScript engine computes every number | This is the answer to "isn't this a ChatGPT wrapper?" |

**Non-negotiables** (these are the scoring surface):

1. The deterministic simulation engine, unit-tested, with visible second-order effects and irreversible tipping points.
2. One voice negotiation that works reliably on venue wifi.
3. The era jump with a generated future voice.
4. The Legacy Receipt.

If at 21:00 tonight any of those four is not working, the remaining three are what you ship.

---

## 1. The experience

### 1.1 Loop

```
DECLARE INTENT → CONVENE COUNCIL → NEGOTIATE → COMMIT ONE MOVE → JUMP FORWARD → HEAR THE CONSEQUENCE
   (weights)      (5 stakeholders)  (voice)     (lever + riders)   (10-14 yrs)     (a voice from that year)
        ↑                                                                                  |
        └──────────────────────────── 3 rounds: 2026 → 2036 → 2050 ────────────────────────┘
                                                                                           ↓
                                                                            2126 · LEGACY RECEIPT
```

Three council rounds, one major move each. Round 3 is the first thing to cut if you are behind at 21:00 — two rounds still produce a complete arc.

### 1.2 Declare intent

Before the first council, the player distributes 10 points across four values:

- **Affordability** — can the people who are here now afford to stay
- **Continuity** — do the lineage trades survive as living practice
- **Vitality** — is the district economically alive
- **Equity** — who captures the gains

This is the mechanism that makes the Legacy Receipt land. The receipt compares what they *said* they valued against what the simulation actually delivered. Nobody scores well on all four; the gap is the point.

### 1.3 The pressure

Round 1 opens on the concrete case: a heritage textile tenant on Arab Street receives a lease renewal at 2.1× the current rent. Twenty-eight years of trade. Six weeks to decide.

Rounds 2 and 3 draw their pressure from whatever the simulation state has become — crowding, heat, monoculture, or exodus — so no two playthroughs open the same way.

### 1.4 The council

Five stakeholders, each with a private objective function, evidence the others do not have, and a veto over specific moves.

| ID | Persona | Holds | Vetoes |
|---|---|---|---|
| `tenant_salmah` | Mdm Salmah, third-generation textile trader | The lease letter, supplier ledger | Night-economy expansion |
| `youth_faiz` | Faiz, youth arts organiser | Programme attendance, who has left | — |
| `custodian_rahim` | Ustaz Rahim, heritage custodian and archivist | Trade lineage records | Adaptive-reuse zoning |
| `landlord_teo` | Mr Teo, family property trust | Valuation, refinancing terms | Rent covenant, land-trust buyback |
| `operator_jo` | Jo, F&B and tour operator | Footfall data, staffing costs | Pedestrianisation, visitor levy |

A veto is not absolute. The player argues, by voice, with the veto-holder. The agent decides whether to release its veto, and may attach a **rider** — a named condition drawn from a fixed list — that patches the lever's coefficients. Persuasion is real, but it is bounded by a schema.

### 1.5 The jump

The player commits. The board dissolves into a dye bleed. The year counter runs. On the far side, a single voice from that future speaks for 60–90 seconds, in first person, about what the decision meant — who stayed, who left, what adapted, what became inaccessible.

The 2050 voice is Mdm Salmah's granddaughter, or the person who took over the unit, depending on what happened. The 2126 voice is an archivist reading from a record.

The reference line — *"You protected the façade, but not the family behind it"* — is exactly the register. That sentence is only earned if the engine actually produced high Continuity and low Affordability. Never let the narration contradict the numbers.

### 1.6 Legacy Receipt

- **Intent vs outcome**: the four declared weights against the achieved 2126 state, as paired bars
- **Winners and losers**: each stakeholder's utility change from 2026, ranked, with the single line that explains it
- **Unresolved harms**: every irreversible flag the run tripped, in plain language
- **The district, then and now**: the board at 2026 and 2126 side by side
- **Council decision brief**: a one-page summary, shareable by URL

---

## 2. Simulation engine

Pure TypeScript. Zero React imports. Zero randomness. This module is the technical claim of the project and it should be written first and tested.

### 2.1 State

Five indices on `[0.02, 0.98]`, one resource.

| Symbol | Field | Meaning | 2026 |
|---|---|---|---|
| A | `affordability` | Can incumbent tenants and residents stay | 0.52 |
| C | `continuity` | Lineage trades practised, not just displayed | 0.61 |
| V | `vitality` | Economic activity and footfall | 0.68 |
| E | `equity` | Share of gains reaching residents and small tenants | 0.44 |
| H | `habitability` | Thermal comfort, crowding, liveability | 0.49 |
| K | `capacity` | Fiscal and institutional capacity, 0–100 | 60 |

### 2.2 Annual update

Simulate **every year** between council rounds; sample the state at horizon years for display. One year is:

```
1. compute exogenous drift
2. compute endogenous couplings from state at t
3. add active policy terms (with decay)
4. apply tipping-point modifiers
5. clamp
6. evaluate tipping-point triggers on the new state
```

**Exogenous drift** — the do-nothing trajectory, so inaction has stakes:

```
dA = -0.008    dC = -0.006    dV = +0.004    dE = -0.005    dH = -0.004
```

**Endogenous couplings**, all computed from the state at t:

```
dA += -0.030 * max(0, V - 0.60)          // a hot district pushes rents up
dC += -0.070 * max(0, 0.50 - A)          // unaffordability closes lineage trades
dC += +0.020 * max(0, A - 0.65)          // slack lets them recover
dV += +0.045 * (C - 0.50)                // authenticity sustains real vitality
dV += -0.025 * max(0, 0.40 - H)          // heat and crowding suppress activity
dE += +0.050 * (A - 0.50)
dE += -0.030 * max(0, V - 0.70)          // boom captured by owners
dH += -0.020 * max(0, V - 0.65)          // crowding
dK  = +1.2 + 6.0 * max(0, V - 0.50)      // the visitor economy funds the treasury
```

Read the loop out loud in the pitch: high vitality raises rent, rent kills the lineage trades, and the lineage trades were what made it worth visiting. Vitality eats its own base. That is the whole game in one sentence.

**Policy decay**: a lever enacted at year `t0` contributes `annual[x] * decay^(t - t0)` each year.

### 2.3 Tipping points

Evaluated after clamping. Irreversible unless stated.

| Flag | Trigger | Effect |
|---|---|---|
| `LINEAGE_BROKEN` | C < 0.30 for 5 consecutive years | dC capped at +0.003/yr forever. The knowledge is gone |
| `MONOCULTURE` | V > 0.80 and C < 0.45 | Rent coupling doubles to −0.060 |
| `EXODUS` | E < 0.25 for 3 consecutive years | E ceiling drops to 0.50 |
| `HEAT_LOCK` | H < 0.35 | dV −0.010/yr; H recovery halved |
| `TRUST_DIVIDEND` | E > 0.65 and C > 0.60 for 5 years | K +3/yr, dC +0.004/yr |

These flags are the "unresolved harms" section of the receipt. They are also what makes a run feel like it has a history rather than a score.

### 2.4 Levers

Eight. One per round. `cost` is K; negative cost raises capacity.

| ID | Name | Cost | Immediate | Annual | Decay | Veto |
|---|---|---|---|---|---|---|
| `rent_covenant` | Rent covenant on lineage shophouses | 22 | A +0.10 | A +0.012, C +0.006, V −0.004 | 0.97 | `landlord_teo` |
| `trade_grant` | Heritage trade grant and apprenticeship | 18 | C +0.08 | C +0.010, E +0.004 | 0.95 | — |
| `pedestrianise` | Pedestrianise Bussorah, add shade corridor | 26 | H +0.10, V +0.05 | H +0.006, V +0.004, A −0.003 | 0.98 | `operator_jo` |
| `visitor_levy` | Visitor levy into a community fund | −15 | V −0.04, E +0.06 | E +0.006, V −0.003 | 0.99 | `operator_jo` |
| `land_trust` | Community land trust buys two units | 40 | A +0.06, C +0.04, E +0.08 | A +0.008, E +0.006 | 0.99 | `landlord_teo` |
| `adaptive_reuse` | Adaptive-reuse zoning for upper floors | 14 | V +0.06, E +0.03 | V +0.005, A −0.004 | 0.98 | `custodian_rahim` |
| `cooling_retrofit` | Cooling retrofit and water features | 24 | H +0.12 | H +0.008 | 0.96 | — |
| `night_economy` | Expand night-economy licensing | 8 | V +0.10 | V +0.008, H −0.006, E −0.004, C −0.005 | 0.99 | `tenant_salmah` |

### 2.5 Riders

The only thing an agent may grant. Fixed list, each a coefficient patch. An agent picks at most one, or none.

| ID | Attaches to | Effect |
|---|---|---|
| `sunset_10y` | any | decay drops to 0.80 after year 10 |
| `compensation_fund` | `rent_covenant`, `land_trust` | cost +12, permanently clears `landlord_teo`'s veto |
| `lineage_only` | `rent_covenant`, `trade_grant` | all magnitudes ×0.7, C annual +0.004 |
| `loading_window` | `pedestrianise` | clears `operator_jo`'s veto, H annual −0.002 |
| `youth_board_seat` | any | E annual +0.003 |
| `noise_curfew` | `night_economy` | H and E penalties halved, immediate V ×0.7 |
| `archive_clause` | `adaptive_reuse` | clears `custodian_rahim`'s veto, cost +6, C immediate +0.02 |

### 2.6 Winners and losers

Each stakeholder has a weight vector over (A, C, V, E, H). Utility is the dot product; the reported figure is the change from 2026, normalised by the sum of absolute weights.

```
tenant_salmah    A  0.38   C  0.27   V  0.05   E  0.20   H  0.10
youth_faiz       A  0.10   C  0.18   V  0.14   E  0.34   H  0.24
custodian_rahim  A  0.16   C  0.52   V  0.10   E  0.14   H  0.08
landlord_teo     A -0.32   C  0.08   V  0.52   E -0.04   H  0.12
operator_jo      A -0.08   C  0.18   V  0.48   E  0.04   H  0.22
```

The landlord's negative weight on affordability is the honest part of the model. Do not soften it.

### 2.7 Outcome signature

Narration is cached against a discrete signature, which is why the demo never stalls on a cache hit.

```
band(x) = x < 0.40 ? "L" : x < 0.65 ? "M" : "H"
signature = `${year}|A${band(A)}C${band(C)}V${band(V)}E${band(E)}|${sortedFlags.join(",")}`
```

Example: `2050|AMCLVHEM|LINEAGE_BROKEN,MONOCULTURE`

### 2.8 Decision record and URL codec

Everything needed to reproduce a run:

```ts
type DecisionRecord = {
  v: 1;
  weights: [number, number, number, number];      // A, C, V, E — sums to 10
  rounds: Array<{ lever: LeverId; riders: RiderId[] }>;
};
```

Serialise compactly, base64url it, put it in `?d=`. `/receipt?d=…` re-runs the engine and renders. No database, no session, no auth. Shareable by copy-paste.

---

## 3. Voice architecture

Two entirely different voice paths. Do not conflate them.

### 3.1 Live negotiation — ElevenLabs Agents (conversational)

Duplex, real-time, one agent live at a time.

- Client: `@elevenlabs/react`, the `useConversation` hook. Mic in, agent audio out, handled by the SDK.
- Auth: never expose the API key. A server route mints a signed URL per session:
  `GET https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=…` with the `xi-api-key` header.
- Five agents configured in the ElevenLabs dashboard, one per stakeholder, each with a distinct voice and a system prompt carrying its objective function, its private evidence, and its veto.

**The bridge to the engine is a client tool.** Declare on each agent a tool named `resolve_position`, and let the agent call it when it reaches a decision:

```ts
{
  stance: "concede" | "hold" | "conditional",
  rider: RiderId | null,          // must be from the fixed list for this lever
  reason_line: string             // <= 18 words, shown on the receipt
}
```

Validate `rider` against the allowed set for the current lever server-side. If the agent returns anything else, treat it as `hold`. The LLM chooses; the engine computes. Say that on stage.

**Concurrency:** Creator tier caps simultaneous conversations low. One live agent at a time is both a UX decision and a rate-limit necessity. Tear down each session on stakeholder switch.

**Latency budget:** target under 1.2s to first audio. Keep agent system prompts short, cap `max_tokens`, and pre-warm the connection when the player hovers a stakeholder card.

### 3.2 Future testimony — text generation then TTS

Not conversational. A monologue, generated then spoken.

```
engine outcome digest
   → OpenAI (you have US$50 in API credits) generates 90–120 words, first person, fixed persona, fixed year
   → ElevenLabs TTS: POST /v1/text-to-speech/{voice_id}, model eleven_flash_v2_5 for latency
   → cache by outcomeSignature, serve MP3
```

**The narration prompt must be constrained.** Pass the digest as data and forbid invention:

```
You are {persona}, speaking in {year} about Kampong Gelam.
These facts are fixed and you may not contradict them:
  affordability {A_label}, continuity {C_label}, vitality {V_label}, equity {E_label}
  irreversible outcomes: {flags_in_plain_language}
  who gained: {winners}   who lost: {losers}
Speak 90-120 words, first person, plain and specific. Name one person, one place, one object.
Do not moralise. Do not mention numbers, indices or policy names.
```

The "name one person, one place, one object" instruction is what stops the output sounding like a press release. It is the highest-leverage line in the whole prompt.

**Caching is what makes the demo safe.** The signature space is small and most runs land in a dozen buckets. Pre-generate the buckets your demo path hits, commit the MP3s to `public/audio/precached/`, and have the route check disk before hitting either API.

### 3.3 Voice casting

Give each stakeholder a clearly distinguishable voice — different age, pace and warmth, Singaporean or regionally plausible where the library allows. The future personas get *related but aged* voices: the 2050 speaker should be recognisably the granddaughter of the 2026 tenant. Judges notice this.

---

## 4. Visual design

### 4.1 Direction

The obvious move for a Kampong Gelam heritage project is cream paper, a high-contrast serif, and a terracotta accent. Every generated heritage page looks like that. Reject it.

**The metaphor is batik.** The central stakeholder is a textile trader; the district's craft is wax-resist dyeing. So: the board is a length of cloth stretched on a frame. Districts are resist-outlined blocks. Each era is another dye bath — colour saturates, bleeds past its outline, or leaches out where something was lost. The 2126 board is the finished cloth, and you can read the whole history in it.

This is cheap to build (SVG paths, CSS filters, one keyframed bleed) and it is not a look anyone else will bring.

### 4.2 Tokens

```css
--indigo-vat:  #16233F;   /* the dye bath — page field */
--indigo-deep: #0E1729;   /* recessed panels */
--resist:      #EDE4D2;   /* undyed cloth — primary type */
--turmeric:    #D9A323;   /* gains, vitality, the live-mic state */
--madder:      #A6352B;   /* harm, veto, loss */
--soga:        #8A6234;   /* soga brown — continuity, heritage */
--verdigris:   #3E7C6E;   /* equity, habitability */
```

Dark field, cloth-coloured type. The cream is the ink, not the page — which is what keeps it off the default.

### 4.3 Type

- **Bricolage Grotesque** (variable, Google Fonts) — interface, headings, the board. Slightly irregular, has a point of view.
- **Newsreader** (Google Fonts) — the future testimony only. When a voice from 2050 speaks, the transcript sets in a text face at generous line-height, and it reads like a document rather than UI.

Two families, doing two clearly separate jobs. Sentence case throughout. No tracked-out capitals.

### 4.4 Layout

```
┌─────────────────────────────────────────────────────┐
│  2026 · round 1 of 3            capacity ████░░ 60  │
├───────────────────────────────┬─────────────────────┤
│                               │  Mdm Salmah         │
│      THE CLOTH                │  textile, 3rd gen   │
│      (isometric SVG board,    │  ◉ speaking         │
│       resist outlines,        │                     │
│       dye fills by index)     │  [ live transcript ]│
│                               │                     │
│                               │  vetoes: night      │
├───────────────────────────────┤  economy            │
│ ○ Salmah ○ Faiz ○ Rahim       │                     │
│ ○ Teo    ○ Jo                 │  [ hold the mic ]   │
├───────────────────────────────┴─────────────────────┤
│  your move:  [ rent covenant ▾ ]   riders: none     │
│                              [ commit and move on ] │
└─────────────────────────────────────────────────────┘
```

Left-aligned. The board is the hero and the only saturated thing on screen; everything else is quiet.

### 4.5 Motion

Spend it all in one place: the era jump. A dye bleed washes across the cloth, the year counter runs, indices resettle. Two to three seconds, once per round. Nothing else animates except direct responses to clicks. Respect `prefers-reduced-motion` with a cross-fade.

---

## 5. Stack and repository

Next.js 15 App Router, TypeScript strict, Tailwind, deployed on Vercel, pointed at a free `.xyz` domain (promo `CLD26`).

```
/engine                       ← pure TS, no React, fully unit-tested
  types.ts                    State, DecisionRecord, Flag, LeverId, RiderId
  levers.ts                   the table from §2.4 as data
  riders.ts                   the table from §2.5 as coefficient patches
  stakeholders.ts             weight vectors, vetoes, evidence blurbs
  simulate.ts                 annual step, tipping points, run(record) → Timeline
  utility.ts                  winners and losers
  signature.ts                banding and cache keys
  codec.ts                    DecisionRecord ⇄ base64url
  __tests__/simulate.test.ts

/app
  page.tsx                    landing, declare intent
  council/page.tsx            the council room
  receipt/page.tsx            reads ?d=, recomputes, renders
  api/agent-url/route.ts      mints ElevenLabs signed URL
  api/narrate/route.ts        digest → text → TTS → cached MP3
  api/resolve/route.ts        validates a client-tool payload against the rider whitelist

/components
  Cloth.tsx                   the SVG board, props: State + era
  EraBleed.tsx                the one animation
  CouncilRail.tsx             five stakeholder cards
  VoiceOrb.tsx                mic state, live transcript
  MovePicker.tsx              lever + attached riders
  Testimony.tsx               future voice, transcript in Newsreader
  Receipt.tsx                 intent vs outcome, winners/losers, harms

/content
  personas.ts                 agent IDs, voice IDs, bios
  narration.ts                the prompt template from §3.2

/public/audio/precached/*.mp3
```

Environment: `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_DEMO=0|1`. Server-only keys stay in route handlers.

---

## 6. Codex task plan

Give Codex one task at a time. Each has a hard acceptance test. Do not let it touch `/engine` after T3 passes.

**T1 · Scaffold** — Next.js 15 + TS strict + Tailwind, fonts wired, tokens from §4.2 as CSS variables, empty routes for `/`, `/council`, `/receipt`. *Accept:* builds clean, all three routes render a heading.

**T2 · Engine types and data** — Transcribe §2.1, §2.4, §2.5, §2.6 into `types.ts`, `levers.ts`, `riders.ts`, `stakeholders.ts`. Data only, no logic. *Accept:* `tsc` passes; every table row present with exact coefficients.

**T3 · Engine core** — Implement §2.2 and §2.3 in `simulate.ts`, plus `utility.ts`, `signature.ts`, `codec.ts`. Write vitest cases: (a) do-nothing 2026→2126 trips `LINEAGE_BROKEN`; (b) `rent_covenant` + `compensation_fund` keeps A above 0.50 at 2050; (c) `night_economy` three times trips `MONOCULTURE` and `EXODUS`; (d) same record encodes/decodes/re-simulates identically. *Accept:* all four pass. **This is the gate. Nothing else starts until it is green.**

**T4 · The cloth** — `Cloth.tsx`: isometric SVG, eight resist-outlined parcels, fill saturation driven by the state vector, `EraBleed` transition. *Accept:* passing three different states renders three visibly different boards.

**T5 · Council shell** — Intent allocation on `/`, council rail, move picker, round advance, full loop playable with a *stub* negotiation (buttons: concede / hold / conditional). *Accept:* three rounds playable end to end with no voice at all. **Ship-ready fallback reached here.**

**T6 · One live agent** — `/api/agent-url` signed URL route; `useConversation` wired into `VoiceOrb` for `tenant_salmah` only; `resolve_position` client tool validated by `/api/resolve` against the rider whitelist. *Accept:* you speak, she answers, and a concession visibly changes the committed lever.

**T7 · Remaining four agents** — Same pattern, driven from `personas.ts`. Session torn down on switch. *Accept:* switching stakeholders mid-round never leaves two sessions open.

**T8 · Narration pipeline** — `/api/narrate`: digest → OpenAI text → ElevenLabs TTS → disk cache keyed by signature. `Testimony.tsx` plays audio with the transcript. *Accept:* two different runs produce two clearly different monologues; a repeat run serves from cache in under 200ms.

**T9 · Legacy Receipt** — Intent-vs-outcome bars, ranked winners and losers with `reason_line`, plain-language harms, 2026/2126 boards side by side, copy-link button. `/receipt?d=` renders standalone. *Accept:* paste the URL into a fresh browser and get an identical receipt.

**T10 · Demo mode** — `?demo=1` short-circuits both APIs to precached audio and a scripted concession. *Accept:* works with wifi switched off.

**T11 · Deploy** — Vercel, `.xyz` domain, OG image, README.

**T12 (only if time)** — Round 3, second and third pressure scenarios, keyboard focus pass, reduced-motion.

---

## 7. Timeline

| Time | Work | Gate |
|---|---|---|
| 12:00–12:45 | T1 scaffold, ElevenLabs dashboard: create 5 agents, pick voices | agents exist |
| 12:45–14:15 | T2 + T3 engine and tests | **tests green or stop and fix** |
| 14:15–15:15 | T4 the cloth | three states look different |
| 15:15–16:15 | T5 council shell | **playable without voice — fallback secured** |
| 16:15–17:45 | T6 one live agent | Salmah talks back |
| 17:45–18:30 | Break. Write the pitch. Do not code | — |
| 18:30–19:30 | T7 remaining agents | switching is clean |
| 19:30–21:00 | T8 narration pipeline | a future voice speaks |
| 21:00 | **Feature freeze.** Anything not started is cut | — |
| 21:00–22:30 | T9 receipt | share URL round-trips |
| 22:30–23:30 | T10 demo mode, precache the demo path audio | works offline |
| 23:30 | Stop. Sleep | — |
| 08:00–09:15 | T11 deploy, Devpost writeup, 90s video | — |
| 09:15–09:50 | Rehearse the pitch twice, on venue wifi, out loud | — |
| 10:00 | Submit | — |

---

## 8. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Venue wifi drops mid-demo | High | `?demo=1` with precached audio. Rehearse *in demo mode* |
| ElevenLabs concurrency or quota limit | Medium | One session at a time, hard teardown, quota checked before you leave tonight |
| Mic permissions fail on the demo machine | Medium | Test on the exact machine and browser you will pitch from. Have a wired headset |
| Agent rambles past the 60s the pitch allows | High | Cap agent output length in the system prompt; add a visible 45s round timer |
| Narration contradicts the numbers | Medium | Digest passes labels not numbers, with an explicit non-contradiction instruction. Read three outputs before you trust it |
| Engine produces flat or absurd trajectories | Medium | T3 tests exist precisely to catch this. If the do-nothing run does not feel like decline, tune the exogenous drift, not the couplings |
| You spend the evening on the board's beauty | High | This is the real one. 21:00 freeze, no exceptions |

---

## 9. Pitch, 5 minutes including Q&A

Budget 3:30 of talking, 1:30 of questions.

**0:00 – 0:25 · The case.** "A textile trader on Arab Street, twenty-eight years in the same unit, gets a lease renewal at 2.1 times. You have six weeks and one move." No product framing yet.

**0:25 – 1:35 · Live negotiation.** Open the council. Talk to Mr Teo on stage. Argue. Get the covenant through with a compensation rider. This is the demo — do not narrate over it, let the judges hear a voice refuse you.

**1:35 – 2:05 · The jump.** Commit. Dye bleed. 2050. Let the future voice play uninterrupted. Say nothing.

**2:05 – 2:45 · The receipt.** "You said you cared about continuity and affordability equally. You bought continuity and paid for it in affordability. Mr Teo gained. Salmah's family left in 2038. That is not reversible in this model — the lineage flag tripped in 2041."

**2:45 – 3:15 · What is underneath.** "The agents never touch the numbers. They negotiate, and they emit one enum and one rider from a fixed list. A deterministic engine does the rest — five coupled indices, annual steps, irreversible thresholds. Which is also why there is no database: the whole run is in the URL."

**3:15 – 3:30 · Who it is for.** Schools, community groups, and consultation facilitators who need people to feel a trade-off before the real hearing, not after.

Questions to have an answer ready for: where the coefficients came from (say plainly that they are calibrated for legibility, not forecasting — do not oversell); what stops the agents lying; how it generalises to another district.

---

## 10. Submission checklist

- [ ] Deployed URL live on the `.xyz` domain, tested from a phone on mobile data
- [ ] `?demo=1` verified with wifi off
- [ ] 90-second video: the case, one negotiation, the jump, the receipt
- [ ] Devpost writeup leads with the deterministic-engine claim, not the AI
- [ ] Repo public, README with the engine's equations in it — judges who read code will find §2.2 and that is the good impression
- [ ] Note the ElevenLabs usage explicitly for the Best Project award: five negotiating agents plus generated future testimony, both structural
- [ ] Team is standing at the table by 10:00 ready to pitch cold — no prep time after the shortlist
