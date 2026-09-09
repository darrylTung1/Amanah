# Amanah

> **Winning project of CloudHacks 2026.**

Amanah is an interactive civic simulation about stewardship, trade-offs, and the future of Singapore's heritage districts. Listen to community voices, negotiate the conditions attached to public policy, and see what each district inherits over the next hundred years.

[Play Amanah](https://amanah.royalslyer.chatgpt.site/)

![Amanah's heritage district artwork at dusk](public/images/frontpage-dusk.png)

## Explore three districts

- **Kampong Glam:** Sultan Mosque, Arab Street, and Haji Lane
- **Chinatown:** Sri Mariamman Temple, Duxton Road, and Maxwell Food Centre
- **Little India:** Sri Veeramakaliamman Temple, the Former House of Tan Teng Niah, and the Indian Heritage Centre

Each district has its own illustrated locations, fictional stakeholders, concerns, and future testimony. Progress is saved locally in the browser, and each district can be played independently.

## How it plays

1. Enter a district and explore its landmarks and community stories.
2. Build a three-policy programme for 2026, 2060, and 2093.
3. Negotiate required protections—such as an owner compensation fund, noise curfew, or policy sunset—to earn stakeholder agreement.
4. Preview how each choice changes affordability, cultural continuity, vitality, equity, habitability, and shared capacity.
5. Advance through time to 2126 and compare the result with the previous period or with taking no new action.

Illustrations, testimony, and scenarios change as the district evolves. Policies can be renewed, agreements can carry forward, and some long-term thresholds cannot be undone.

## The legacy receipt

Every completed council produces a shareable, URL-encoded legacy receipt. It records:

- The district's final rating and five conditions
- Starting priorities compared with achieved outcomes
- Which stakeholders gained or lost
- Irreversible thresholds crossed during the century
- All three policy programmes and their negotiated conditions
- Annual condition history and before-and-after district illustrations

The receipt can be copied as a link or printed as a decision brief. Because the simulation is deterministic, the same encoded decisions reproduce the same outcome without an account or server-side save.

## Run locally

Requires Node.js 22.13 or later; Node.js 24 is recommended.

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal.

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

## Built with

- React and TypeScript
- Tailwind CSS
- Vinext and the Next App Router API
- Cloudflare Workers via OpenAI Sites
- A pure deterministic simulation engine separated from the interface
- Prerecorded stakeholder audio with written transcript fallbacks

## Model boundaries

Amanah is a conversation tool, not an urban forecast. Its characters and testimony are fictional, its district views are illustrative, and its coefficients are calibrated for legibility rather than prediction. A shared receipt reproduces the selected decisions and computed outcomes; it is not a verified transcript of a real negotiation.

[Source and map attribution](ATTRIBUTION.md)
