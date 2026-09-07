# Sociopoly: Voices of the next hundred years

A deterministic district simulation in which five fictional stakeholders negotiate three decisions for Kampong Gelam. The council can negotiate a condition; it cannot change a single simulation coefficient. Every annual outcome can be reconstructed from a URL.

Built for CloudHacks 2026, Advanced division. Repository name: Amanah.

## Run

Node 24 recommended (22.13+ supported by the application tooling).

```sh
npm ci
npm run dev
```

Open the printed local URL. Click Kampong Glam on the Singapore map to enter the playable council immediately. There is no introduction or allocation screen; starting priorities default to [3,3,2,2]. Negotiate or choose an unrestricted policy and make three moves. The island and council stay mounted, so returning to the map preserves the game and camera without navigation. The horizons are 2026 → 2036 → 2050 → 2126. The last move is enacted in 2050; policies then decay over the long final horizon.

```sh
npm test
npm run typecheck
npm run build
npm start
```

This project uses the Next App Router API through Vinext, React, strict TypeScript, Tailwind and the supplied accessible Base UI/Shadcn components. Sites deploys the resulting Cloudflare Worker. It differs from the spec’s suggested Next 15/Vercel deployment stack; the game and engine remain portable, but the current Worker deployment is not a Vercel build.

## Prerecorded dialogue

The application uses local audio files and rule-based negotiation. It makes no ElevenLabs or OpenAI API calls and needs no API keys or microphone permissions. The live SDK, signed-session route and API generation scripts have been removed.

Place supplied MP3, WAV or OGG files in `public/audio/dialogue/`. Add their exact transcripts to `public/audio/dialogue/manifest.json`:

```json
{
  "landlord_teo|intro": {
    "audio": "/audio/dialogue/teo-intro.mp3",
    "text": "Exact transcript of the recording."
  },
  "landlord_teo|rent_covenant|compensation_fund": {
    "audio": "/audio/dialogue/teo-compensation.mp3",
    "text": "Exact transcript of this agreement recording."
  }
}
```

Council keys are `person|intro` for opening dialogue and `person|lever|rider` for conditional responses, or `person|lever|hold` for refusals. Person and policy IDs are in `engine/model.ts`. The engine decides the agreement; playing audio does not grant a policy or clear a veto.

Future recordings use `public/audio/precached/manifest.json`, keyed by `encode(record) + "|" + year`, with `audio`, exact `text` and `source: "elevenlabs"`. This prevents a recording from describing a different decision path. Generate the standard path transcripts with `node scripts/prepare-demo.mjs`; record those scripts in ElevenLabs separately and update the manifest.

Only supplied, matched recordings play. Missing or failed audio preserves written dialogue and game progression. The existing device-voice clips remain clearly labelled and limited to rehearsal mode. Actual ElevenLabs files still need to be supplied.

## Offline rehearsal

Open `/?demo=1` on the **production build**, while online. Wait for “Offline rehearsal ready” before disconnecting. The service worker caches route shells, JavaScript, CSS, local fonts and recordings. A first-ever offline visit cannot work because no app has yet been downloaded.

The recorded path uses default weights `[3,3,2,2]`:

1. 2026: Rent covenant. Tell Mr Teo “We will provide a compensation fund.” Commit with compensation.
2. 2036: Trade & apprenticeship grant, no rider.
3. 2050: Cooling retrofit, no rider.

The bundled recordings are labelled Windows device-voice rehearsal audio. Replace them with your pregenerated ElevenLabs files using the manifest above. Other decision paths retain written testimony. Rebuild after adding recordings so the service worker includes them; API responses are never cached.

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

Every enacted policy adds `annual × decay^(year − enactmentYear)`. The first annual interval uses exponent zero. Immediate effects and capacity costs apply at the enactment year. Policy-year snapshots include immediate effects. A sunset rider preserves the first ten years of decay, then multiplies by .80 each later year. “Lineage only” scales immediate/annual effect magnitudes; fiscal cost is unchanged. Compensation permanently clears the landlord’s veto for subsequent council rounds. Neither dialogue nor narration chooses numbers.

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

Supplied recording playback, mobile-data access and full offline browser operation require browser testing. Do not describe those as verified merely because unit tests or a production build pass. The optional WebMCP start-council action is feature-detected; normal controls do not depend on it.

Submission materials are in `SUBMISSION.md`. The Sites judging URL is public. A custom domain, Devpost submission and captured demo video remain separate delivery steps.

## Interactive 3D district

The board now uses a lazy-loaded Three.js diorama instead of the original SVG. Drag to orbit, scroll/pinch or use the buttons to zoom, and click a parcel to inspect its simulation condition. Left/right arrow keys rotate the focused model; Home resets it. The parcel buttons provide keyboard-accessible inspection and remain available if WebGL is unsupported.

Shophouse colour and open storefronts reflect each parcel's index; trees reflect habitability and street activity reflects vitality. These are illustrative visual encodings, not actual counts or a surveyed model of Kampong Gelam. The model renders on changes, limits pixel density, preserves the camera when outcomes update, and disposes its graphics resources when leaving a page. Three.js is included in the production offline cache.
