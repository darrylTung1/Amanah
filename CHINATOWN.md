# Chinatown

## Illustrated district view

Chinatown now uses the supplied artwork in `public/images/chinatown/` instead of the generated Three.js board. The starting Chinatown overview has buttons for Sri Mariamman Temple, Duxton Road and Maxwell Food Centre. Selecting a location zooms toward it and reveals its illustration; District view returns to the overview. These controls also open the existing commons, tenancy and food scenarios respectively. The map placements are illustrative.

Location images use the existing overall district rating (the rounded average of all five conditions). Before 2060 they use `start`; from 2060 they use `2060`, with bad variants below 50. From the game's 2093 council onward they use the supplied `2094` folder, with bad variants below 50 and very bad variants below 25. Scores of exactly 50 use normal art; exactly 25 use bad art. The latest variants continue through the 2126 receipt. Only one overview was supplied, so it remains the navigation image for every period. This changes presentation only, not simulation equations or receipt versions.

Playable as a separate district from the Singapore map. Returning to the map and switching districts preserves each mounted council's draft and progress within the page. Shared receipts encode the district; legacy links without a district continue to mean Kampong Glam.

Eight conceptual locations: Kreta Ayer arts workshop, Telok Ayer shared courtyard, Ann Siang walking route, Pagoda Street shophouses, Bukit Pasoh association spaces, Trengganu Street visitors, Chinatown Complex community, and Smith Street food businesses. The board is a conceptual composition, not a surveyed street layout or a replica of any monument. The Singapore marker approximates the Chinatown centre.

Five fictional stakeholders: Mr Tan (repair-shop tenant), Mei (youth organiser), Mr Goh (arts mentor), Mdm Lim (property owner), Priya (food and walking-tour operator). Internal role IDs are shared with the original engine so negotiation authority and stakeholder weights remain compatible. Display names, concerns, scenes and future testimony are district-specific.

Both districts use the same illustrative starting conditions and policy equations. These are game balance values, not measured local data. Chinatown uses the current three-period schedule, 2026 / 2060 / 2093, ending in 2126. Existing versioned receipts retain their schedules.

## Recording later

The eight scenes and full dialogue are in `content/chinatown-scenarios.json`. Scene clip keys are `chinatown|scene|<id>`; the later tenancy variant is `chinatown|scene|six-weeks|later`. Negotiation keys use `chinatown|<role-id>|<policy>|<hold-or-rider>`. Add pregenerated files to the existing dialogue manifest. Future recordings require an exact encoded district decision record plus horizon, as before. Until recordings are supplied, all dialogue and testimony remain readable; no live voice API is used.

## Place research

- URA, Chinatown historic district trail: https://www.roots.gov.sg/-/media/Roots/Files/ura-chinatown-trail/urachinatowntrail17_brochure.pdf
- URA, Telok Ayer conservation area: https://www.ura.gov.sg/conservation/find-a-building/conservation-portal/tkay/
- NHB, Kreta Ayer Heritage Gallery: https://www.roots.gov.sg/stories-landing/stories/Kreta-Ayer-Heritage-Gallery/

These sources ground the location names and heritage themes. They do not describe the fictional stakeholders, invented lease problems, game policies or simulated futures.
