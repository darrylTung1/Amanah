import { flagText, keys, type State } from '../engine/model.ts';
export function testimony(s: State) {
  const persona =
    s.year === 2126
      ? 'An archivist, 2126'
      : s.year === 2050
        ? s.affordability >= 0.4
          ? 'Salmah’s granddaughter, 2050'
          : 'A new tenant, 2050'
        : 'A neighbour, 2036';
  const opening =
    s.year === 2126
      ? 'I am reading the record of Arab Street. Salmah’s name sits beside a folded piece of batik.'
      : s.year === 2050
        ? s.affordability >= 0.4
          ? 'My grandmother Salmah taught me to recognise a cloth by its weight. I still think of her when I walk along Arab Street.'
          : 'I know Salmah through the stories people tell about this unit on Arab Street. I keep a piece of batik beside the doorway.'
        : 'I pass Salmah’s shop on Arab Street and look at the batik in the window. Ten years have changed the street around it.';
  const lines = [
    opening,
    s.affordability < 0.4
      ? 'Staying here has become difficult for the people who made this place their home.'
      : s.affordability < 0.65
        ? 'There is still room for people to stay, but it takes effort to hold that room open.'
        : 'The people already here have more room to stay.',
    s.continuity < 0.4
      ? 'The old trades have thinned; keeping a building does not keep a skill alive.'
      : s.continuity < 0.65
        ? 'The old trades are still practised, though their future remains fragile.'
        : 'The old trades remain a living practice.',
    s.vitality < 0.4
      ? 'The street’s economy has faded.'
      : s.vitality < 0.65
        ? 'The street still works, without the old rush.'
        : 'Visitors and commerce keep the street busy.',
    s.equity < 0.4
      ? 'The gains have not reached the community fairly.'
      : 'Some of the gains reach the people who live and work here.',
    s.habitability < 0.35
      ? 'The heat makes everyday life harder.'
      : 'The street is still a place people can use.',
    s.flags.includes('LINEAGE_BROKEN')
      ? 'Some knowledge in this record cannot simply be taught again.'
      : 'What happens next will depend on who keeps showing up.',
  ];
  return { persona, text: lines.join(' ') };
}
export function digest(s: State) {
  return {
    year: s.year,
    persona: testimony(s).persona,
    conditions: Object.fromEntries(
      keys.map((k) => [
        k,
        s[k] < 0.4 ? 'low' : s[k] < 0.65 ? 'moderate' : 'high',
      ]),
    ),
    irreversible: s.flags.map((f) => flagText[f]),
  };
}
