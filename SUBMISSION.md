# CloudHacks submission materials

## Project title

Sociopoly: Voices of the next hundred years

## Short description

Five stakeholders negotiate three choices for a heritage district. A deterministic simulation reveals who benefits, what breaks, and what the next century inherits.

## Devpost draft

### Inspiration

Consultation often asks people to choose between values they support equally: keep a district affordable, preserve living trades, bring in visitors, share the gains. We wanted people to experience the conflict before the real hearing.

Our fictional case begins with a textile trader on Arab Street facing a lease renewal at 2.1 times her rent. The player has six weeks and one major move.

### What it does

Players declare their priorities, convene five stakeholders, negotiate conditions, and make three decisions spanning 2026, 2036 and 2050. The district advances to 2126. A legacy receipt compares declared priorities with achieved conditions, ranks stakeholder utility changes, and records irreversible harms with the years they first appeared.

An interactive 3D district shows changing storefronts, trees and street activity as the simulation evolves.

### How we built it

The core is a pure TypeScript simulation with annual updates, five coupled indices, fiscal capacity, eight policy levers, seven bounded riders and five irreversible thresholds. The model is deterministic. A URL contains the complete decision record, so receipts need no accounts or database.

Dialogue uses pregenerated audio files with exact transcripts. Rule-based negotiation selects valid conditions; the deterministic engine computes consequences. Future recordings are matched to decision paths. The app makes no live ElevenLabs or OpenAI API calls.

**Before submitting:** add and verify the supplied ElevenLabs recordings. The bundled Windows rehearsal voices are not ElevenLabs-generated.

### Challenges and what we learned

We separated persuasive language from numerical authority. We also discovered that the original coefficients drive many long-horizon runs toward decline after interventions stop. We preserved the equations, exposed intermediate years, and described the model as an illustration rather than a forecast.

### What’s next

Facilitator-led calibration with local stakeholders, testing whether participants understand the trade-offs, additional districts with explicit coefficient provenance, and policy renewal beyond the three-round prototype.

## 3½-minute pitch + 1½-minute questions

**0:00–0:25** — “A textile trader on Arab Street gets a renewal at 2.1 times her rent. Twenty-eight years in the same unit. Six weeks to decide. You are convening the council.”

**0:25–1:20** — Show the declared priorities. Select rent covenant. Negotiate with Mr Teo. Offer a compensation fund. Let his response be heard. Explain that dialogue is prerecorded and agreements follow the game rules.

**1:20–1:55** — Commit and hear 2036. Show that affordability remains above .50 on the compensated covenant path through 2050. Explain that it bought time, not a permanent solution.

**1:55–2:30** — Make the trade grant and cooling retrofit moves. Open the 2126 receipt. Read the actual first-trigger years displayed. Do not reuse invented departure dates from an example script.

**2:30–3:05** — “High vitality raises rent. Unaffordability closes lineage trades. Those trades helped sustain vitality. Five coupled indices, annual steps, irreversible thresholds. The council negotiates; the engine computes.”

**3:05–3:30** — “The whole run is in the URL. It is for classrooms, community groups and facilitators who want people to feel a trade-off before a real consultation.”

### Questions

- **Where did the coefficients come from?** The supplied design model; calibrated for legibility, not a prediction of Kampong Gelam. Community calibration would be the next research step.
- **Is this an AI wrapper?** The simulation, constraints, replay and receipts work without an LLM. Voice negotiates bounded conditions and communicates computed consequences.
- **Can the agent invent an advantage?** Unknown riders, wrong authorities and malformed positions hold the veto. The pure engine owns every numeric change.
- **Why do outcomes still decline?** Policies decay and the last intervention occurs in 2050. The long horizon makes sustained stewardship visible as an unresolved limitation of one-off action.
- **What data is stored?** The app has no user database. The decision URL contains priorities, moves and riders. Audio plays from bundled files; the app does not capture microphone audio.

## 90-second video shot list

0–15s: opening case and priority allocation. 15–40s: one negotiation with prerecorded dialogue. 40–55s: era jump and future testimony. 55–75s: receipt and irreversible trigger dates. 75–90s: show engine source and URL replay.

No demo video has been recorded by this build script. Capture the actual app and identify the dialogue as prerecorded.

## Submission readiness

- [x] Three-round application and standalone URL receipt implemented
- [x] Deterministic engine acceptance tests
- [x] Scripted rehearsal and bundled device-voice recordings
- [x] Prerecorded dialogue playback and transcript fallback implemented
- [ ] Supplied ElevenLabs dialogue files added and playback verified
- [ ] Offline browser rehearsal verified after cache readiness
- [ ] Public judging URL and `.xyz` domain verified on mobile data
- [ ] 90-second demo recorded
- [ ] Devpost submitted before 10:00 Singapore time, 8 September 2026

The hackathon brief says finalists have five minutes including Q&A and must be ready immediately after shortlisting. Keep the tested rehearsal URL open at the table.
