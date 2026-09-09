# Amanah

> **Winning project of CloudHacks 2026.**

Amanah is an interactive civic simulation about the choices that shape Singapore's neighbourhoods across a century. Convene five community voices, negotiate public policy, and see how today's decisions change Kampong Glam, Chinatown, or Little India from 2026 to 2126.

[Play Amanah](https://amanah.royalslyer.chatgpt.site/)

![Amanah's Singapore district selection screen](public/images/frontpage-dusk.png)

## What you do

- Choose a district and explore its interactive 3D streetscape.
- Meet residents and stakeholders with competing priorities.
- Build a three-policy programme in each of three decision periods.
- Follow the effects on affordability, cultural continuity, vitality, equity, and habitability.
- Share a URL-encoded receipt that can reproduce the complete outcome.

The simulation is deterministic: the same starting priorities and policy choices always produce the same result. Its coefficients are illustrative, not calibrated forecasts of real neighbourhoods.

## Why Amanah

Urban policy rarely has a single winner. Amanah makes those trade-offs tangible by connecting policy choices to community testimony, long-term consequences, and irreversible risks. It is designed to prompt discussion about stewardship: what we inherit, what we change, and what we leave behind.

## Run locally

Requires Node.js 22.13 or later; Node.js 24 is recommended.

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal.

Useful checks:

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

## How it works

- **Frontend:** React, TypeScript, Tailwind CSS, Three.js, and the Next App Router API through Vinext
- **Hosting:** Cloudflare Workers via OpenAI Sites
- **Simulation:** a pure, deterministic engine with no network, database, clock, or randomness dependency
- **Dialogue:** local prerecorded audio with written fallbacks; no microphone or API key is required for playback
- **Offline support:** production assets and recordings are cached after the first online visit

New councils make decisions in 2026, 2060, and 2093, then see the district in 2126. Each outcome tracks five conditions and capacity, with transparent yearly updates and persistent consequences. The engine lives in [`engine/model.ts`](engine/model.ts), separate from the interface.

## Important limits

Amanah is a conversation tool, not an urban forecast. Its people are fictional, its visual encodings are illustrative, and its policy coefficients are not based on surveyed or predictive data. The interface exposes intermediate outcomes and irreversible flags so that players can inspect the model's reasoning instead of treating a final score as fact.

[Source and map attribution](ATTRIBUTION.md)
