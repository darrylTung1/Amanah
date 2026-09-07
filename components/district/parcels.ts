import type { Metric, State, DistrictId } from '../../engine/model';
export const parcels = [
  {
    id: 'trades',
    name: 'Kandahar Street',
    metric: 'continuity',
    x: -3.5,
    z: -2.5,
    width: 2.6,
    depth: 1.8,
    color: '#bf884e',
    kind: 'shops',
    detail:
      'Kandahar Street connects the district’s cultural memory with living skills.',
  },
  {
    id: 'commons',
    name: 'Sultan Mosque',
    metric: 'equity',
    x: 0,
    z: -2.5,
    width: 2.6,
    depth: 1.8,
    color: '#70a994',
    kind: 'landmark',
    detail:
      'Access and shared benefits in the streets surrounding Sultan Mosque.',
  },
  {
    id: 'shade',
    name: 'Malay Heritage Centre',
    metric: 'habitability',
    x: 3.5,
    z: -2.5,
    width: 2.6,
    depth: 1.8,
    color: '#8cb69d',
    kind: 'park',
    detail:
      'Comfortable walking and gathering around the former Istana at Sultan Gate.',
  },
  {
    id: 'arab',
    name: 'Arab Street shophouses',
    metric: 'affordability',
    x: -3.5,
    z: 0.1,
    width: 2.6,
    depth: 1.8,
    color: '#d3a653',
    kind: 'shops',
    detail:
      'Occupied storefronts represent the ability of incumbent tenants to stay.',
  },
  {
    id: 'bussorah',
    name: 'Bussorah Street',
    metric: 'continuity',
    x: 0,
    z: 0.1,
    width: 2.6,
    depth: 1.8,
    color: '#ac7654',
    kind: 'shops',
    detail:
      'Colour and open shutters reflect the continuity of heritage practices.',
  },
  {
    id: 'visitors',
    name: 'Haji Lane',
    metric: 'vitality',
    x: 3.5,
    z: 0.1,
    width: 2.6,
    depth: 1.8,
    color: '#d2a332',
    kind: 'shops',
    detail: 'Independent shops and visitor activity along Haji Lane.',
  },
  {
    id: 'makers',
    name: 'Aliwal Arts Centre',
    metric: 'equity',
    x: -2.6,
    z: 2.8,
    width: 4.2,
    depth: 1.8,
    color: '#559b91',
    kind: 'shops',
    detail:
      'Room for artists, young people and local participation around Aliwal Arts Centre.',
  },
  {
    id: 'food',
    name: 'North Bridge Road',
    metric: 'vitality',
    x: 2.6,
    z: 2.8,
    width: 4.2,
    depth: 1.8,
    color: '#bf7753',
    kind: 'shops',
    detail:
      'Food businesses along North Bridge Road balance livelihoods and neighbourhood comfort.',
  },
] as const satisfies readonly {
  id: string;
  name: string;
  metric: Metric;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  kind: string;
  detail: string;
}[];
export const parcelCondition = (state: State, index: number) =>
  state[parcels[index].metric];

const chinatownPlaces = [
  [
    'Kreta Ayer Heritage Gallery',
    'Rehearsal, mentoring and living cultural practice.',
    '#bb6b58',
  ],
  [
    'Thian Hock Keng',
    'The streets around this temple connect worshippers, neighbours and visitors.',
    '#77998d',
  ],
  [
    'Ann Siang Hill',
    'Shade and places to pause support everyday journeys.',
    '#8ab17f',
  ],
  [
    'Pagoda Street shophouses',
    'Independent tenants need affordable premises and regular customers.',
    '#cf7055',
  ],
  [
    'Chinatown Heritage Centre',
    'Remembering migrant lives while keeping space for living trades nearby.',
    '#b8a47b',
  ],
  [
    'Smith Street',
    'Visitor activity brings trade, alongside pressure on everyday uses.',
    '#b79050',
  ],
  [
    'Chinatown Complex',
    'A market and food centre where everyday meals and neighbourhood life meet.',
    '#83a3aa',
  ],
  [
    'Maxwell Food Centre',
    'Hawker livelihoods, evening trade and comfortable access around the food centre.',
    '#c47752',
  ],
];
const littleIndiaPlaces = [
  [
    'Campbell Lane',
    'Flower garlands, teaching time and the future of living crafts.',
    '#cb6598',
  ],
  [
    'Sri Veeramakaliamman Temple',
    'Welcoming, accessible surrounding streets that respect worship and everyday life.',
    '#b891db',
  ],
  [
    'Former House of Tan Teng Niah',
    'Shade and places to pause around the colourful heritage house on Kerbau Road.',
    '#76b59a',
  ],
  [
    'Little India Arcade',
    'Independent shops need affordable premises and regular customers.',
    '#dfa351',
  ],
  [
    'Indian Heritage Centre',
    'Community memories and living practices around Campbell Lane.',
    '#6cbdc2',
  ],
  [
    'Mustafa Centre',
    'Busy shopping routes around the centre must also work for neighbouring businesses and workers.',
    '#d48c62',
  ],
  [
    'Farrer Park',
    'Space to rest, meet and take part without needing to buy something.',
    '#8daf74',
  ],
  [
    'Tekka Centre',
    'Everyday meals, market livelihoods and comfortable access for shoppers and suppliers.',
    '#deba55',
  ],
];
export function districtParcels(district: DistrictId = 'kampong-glam') {
  const local =
    district === 'little-india'
      ? littleIndiaPlaces
      : district === 'chinatown'
        ? chinatownPlaces
        : null;
  return local
    ? parcels.map((p, i) => ({
        ...p,
        name: local[i][0],
        detail: local[i][1],
        color: local[i][2],
      }))
    : parcels;
}
