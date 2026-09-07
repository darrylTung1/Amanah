# Sociopoly: Voices of the next hundred years

A deterministic district simulation in which five fictional stakeholders negotiate three decisions for Kampong Gelam. The council can negotiate a condition; it cannot change a single simulation coefficient. Every annual outcome can be reconstructed from a URL.

Built for CloudHacks 2026, Advanced division. Repository name: Amanah.

## Run

Node 24 recommended (22.13+ supported by the application tooling).

```sh
npm ci
npm run dev
```

Open the printed local URL. Allocate ten points, convene the council, negotiate or choose an unrestricted policy, and make three moves. The horizons are 2026 → 2036 → 2050 → 2126. The last move is enacted in 2050; policies then decay over the long final horizon.

```sh
npm test
npm run typecheck
npm run build
npm start
```

This project uses the Next App Router API through Vinext, React, strict TypeScript, Tailwind and the supplied accessible Base UI/Shadcn components. Sites deploys the resulting Cloudflare Worker. It differs from the spec’s suggested Next 15/Vercel deployment stack; the game and engine remain portable, but the current Worker deployment is not a Vercel build.

## Live voice setup

The game is playable without credentials, using an explicitly labelled written, rule-based negotiation. That fallback is not an LLM conversation.

1. Copy `.env.example` to `.env.local` if that file does not already exist. Keep API keys out of source control and chat.
2. Set `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, five stakeholder voice IDs and the narrator voice IDs. The account’s actual voice library determines available casting. Choose distinct voices and listen before the pitch.
3. `node scripts/agents.mjs` generates five reviewable configurations in `content/agents/`.
4. `node scripts/agents.mjs --create` creates missing agents and writes their IDs to `.env.local`. It skips configured IDs and preserves completed work if a later creation fails. This command makes account changes and requires valid ElevenLabs permissions. Alternatively import/configure the agents manually and set the five IDs.
5. Each agent uses an authenticated signed URL, three dynamic variables (`lever`, `allowed_riders`, `year`) and the blocking client tool `resolve_position`. The setup files include the tool schema, persona, evidence and priorities.
6. Restart the local server after changing credentials. Hosted secrets must also be configured separately; `.env.local` is never uploaded.

The current SDK requires `ConversationProvider`; the voice component wraps its hooks accordingly. Switching people or policies is disabled while connecting/connected. Ending a call releases the session; unmounting also tears it down. The written fallback remains available after a connection failure.

`resolve_position` is checked on the server for stakeholder authority, stance, one compatible rider and an explanation of at most 18 words. Empty rider strings from the SDK’s string schema normalize to `null`. Invalid combinations hold the veto. This is a schema boundary, not cryptographic proof that a URL was produced by a particular conversation. Receipts encode policy decisions, not authenticated conversation transcripts.

OpenAI generates constrained testimony from an engine-derived digest. ElevenLabs Flash v2.5 produces speech. Service failures retain deterministic written testimony. A bounded, in-memory insertion-order cache retains twelve recent narrations per Worker isolate; it is not a durable cross-instance cache. Pre-generated ElevenLabs audio is served from the bundled manifest. Narration cache keys also distinguish policy history so a coarse outcome bucket cannot accidentally reuse testimony from a different run. Generated language is prompt-constrained, not a verified forecast or factual historical record.

API references: [ElevenLabs React SDK](https://elevenlabs.io/docs/eleven-agents/libraries/react), [signed URLs](https://elevenlabs.io/docs/api-reference/conversations/get-signed-url), [agent creation](https://elevenlabs.io/docs/api-reference/agents/create), [TTS](https://elevenlabs.io/docs/api-reference/text-to-speech/convert), [OpenAI Responses](https://developers.openai.com/api/reference/resources/responses/methods/create).

## Offline rehearsal

Open `/?demo=1` on the **production build**, while online. Wait for “Offline rehearsal ready” before disconnecting. The service worker caches route shells, JavaScript, CSS, local fonts and recordings. A first-ever offline visit cannot work because no app has yet been downloaded.

The recorded path uses default weights `[3,3,2,2]`:

1. 2026: Rent covenant. Tell Mr Teo “We will provide a compensation fund.” Commit with compensation.
2. 2036: Trade & apprenticeship grant, no rider.
3. 2050: Cooling retrofit, no rider.

The repository initially includes clearly labelled **Windows device-voice recordings**, not ElevenLabs output. To replace them with ElevenLabs audio after configuring the account:

```sh
node scripts/prepare-demo.mjs
node scripts/precache-elevenlabs.mjs
npm run build
```

Other decision paths always retain written testimony; optional browser speech depends on the device having an offline voice. The existing recordings are specific to the standard rehearsal path. The service worker deliberately never caches API responses or signed voice URLs.

## The deterministic engine

`engine/model.ts` has no React, network, clock, randomness or database dependency. The initial values are A=.52, C=.61, V=.68, E=.44, H=.49, K=60. Indices clamp to [.02,.98], capacity to [0,100]. Utility weights, eight levers and seven rider definitions are literal data transcribed from the supplied spec.

Each year computes drift and couplings from the same pre-update state, adds decaying active policies, applies already-active tipping modifiers, clamps, then evaluates new flags. A newly triggered flag takes effect on the next annual update.

```text
dA = -.008 - .030 max(0,V-.60)
dC = -.006 - .070 max(0,.50-A) + .020 max(0,A-.65)
dV =  .004 + .045(C-.50) - .025 max(0,.40-H)
dE = -.005 + .050(A-.50) - .030 max(0,V-.70)
dH = -.004 - .020 max(0,V-.65)
dK =  1.2  + 6 max(0,V-.50)
```

Every enacted policy adds `annual × decay^(year − enactmentYear)`. The first annual interval uses exponent zero. Immediate effects and capacity costs apply at the enactment year. Policy-year snapshots include immediate effects. A sunset rider preserves the first ten years of decay, then multiplies by .80 each later year. “Lineage only” scales immediate/annual effect magnitudes; fiscal cost is unchanged. Compensation permanently clears the landlord’s veto for subsequent council rounds. Neither agents nor narration choose numbers.

Irreversible flags:

| Flag           | Trigger                                     | Subsequent effect                                 |
| -------------- | ------------------------------------------- | ------------------------------------------------- |
| LINEAGE_BROKEN | C < .30 for 5 consecutive years             | Annual continuity recovery capped at .003         |
| MONOCULTURE    | V > .80 and C < .45                         | Rent pressure coupling doubles                    |
| EXODUS         | E < .25 for 3 consecutive years             | Equity ceiling .50                                |
| HEAT_LOCK      | H < .35                                     | Annual vitality −.010; positive H recovery halved |
| TRUST_DIVIDEND | E > .65 and C > .60 for 5 consecutive years | Annual capacity +3, continuity +.004              |

Trust dividend is a beneficial legacy, not listed as an unresolved harm. Utilities are weighted deltas from 2026, normalized by absolute weight sums. The landlord’s affordability weight is negative, as specified.

### Model limits worth explaining to judges

The coefficients are illustrative, not calibrated urban forecasts. With three interventions ending in 2050, many trajectories converge to severe decline by 2126. This is an outcome of the supplied equations and long horizon, not hidden balancing. Intermediate-year tables and first-trigger dates expose differences that a final score alone would hide. A higher utility than another stakeholder does not necessarily mean an absolute gain.

Intent weights are priorities out of ten; outcome indices are conditions out of a hundred. The paired receipt bars deliberately label those different units. They should not be interpreted as a numerical promise-fulfilment score.

The original spec contains a contradictory “three rounds”/“round 3 optional” schedule. This implementation includes all three rounds. It does not fabricate the pitch’s example departure year or claim a flag triggered in 2041 unless the actual run produces that year.

## Tests and delivery boundaries

The tests cover the four requested acceptance cases, all compatible single-policy/rider bounds, irreversible history, invalid URL records, capacity accounting, and negotiation authority. `scripts/smoke.mjs` checks real HTTP routes and valid/invalid resolution and narration requests against a running server.

Live microphone, account-side agent creation, real model/TTS latency, mobile-data access and full offline browser operation require testing with the configured accounts/browser. Do not describe those as verified merely because unit tests or a production build pass. The optional WebMCP start-council action is feature-detected; normal controls do not depend on it.

Submission materials are in `SUBMISSION.md`. A public judging URL, custom `.xyz` domain, Devpost submission and captured demo video require the final account/domain details; private hosting is a review surface until public access is configured.
