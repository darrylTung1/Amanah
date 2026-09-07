import type { Metric, State } from '../../engine/model';
export const parcels = [
  {
    id: 'trades',
    name: 'Lineage trades',
    metric: 'continuity',
    x: -3.5,
    z: -2.5,
    width: 2.6,
    depth: 1.8,
    color: '#bf884e',
    kind: 'shops',
    detail: 'Living trades and apprenticeships, rather than preserved façades.',
  },
  {
    id: 'commons',
    name: 'Community courtyard',
    metric: 'equity',
    x: 0,
    z: -2.5,
    width: 2.6,
    depth: 1.8,
    color: '#70a994',
    kind: 'landmark',
    detail:
      'Shared space represents who can participate in the district’s future.',
  },
  {
    id: 'shade',
    name: 'Shade corridor',
    metric: 'habitability',
    x: 3.5,
    z: -2.5,
    width: 2.6,
    depth: 1.8,
    color: '#8cb69d',
    kind: 'park',
    detail: 'Tree cover and cooler gathering space respond to habitability.',
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
    name: 'Visitor economy',
    metric: 'vitality',
    x: 3.5,
    z: 0.1,
    width: 2.6,
    depth: 1.8,
    color: '#d2a332',
    kind: 'shops',
    detail:
      'Activity and lit storefronts rise and fall with economic vitality.',
  },
  {
    id: 'makers',
    name: 'Residents & makers',
    metric: 'equity',
    x: -2.6,
    z: 2.8,
    width: 4.2,
    depth: 1.8,
    color: '#559b91',
    kind: 'shops',
    detail:
      'The share of gains reaching residents and small tenants shapes this block.',
  },
  {
    id: 'food',
    name: 'Food & gathering',
    metric: 'vitality',
    x: 2.6,
    z: 2.8,
    width: 4.2,
    depth: 1.8,
    color: '#bf7753',
    kind: 'shops',
    detail:
      'A working food and visitor economy supports the district’s everyday life.',
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
