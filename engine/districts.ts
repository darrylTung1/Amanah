import { people, type DistrictId } from './model.ts';

export const districtNames: Record<DistrictId, string> = {
  'kampong-glam': 'Kampong Glam',
  chinatown: 'Chinatown',
  'little-india': 'Little India',
};
const chinatownPeople = [
  {
    name: 'Mr Tan',
    initials: 'MT',
    role: 'Independent repair-shop tenant',
    evidence:
      'A fictional Pagoda Street trader balancing rent, customers and teaching time.',
    concern: 'Give an independent shop a future worth learning.',
  },
  {
    name: 'Mei',
    initials: 'M',
    role: 'Youth community organiser',
    evidence:
      'A fictional organiser making space for neighbours and young participants.',
    concern: 'The neighbourhood must be affordable to participate in.',
  },
  {
    name: 'Mr Goh',
    initials: 'MG',
    role: 'Arts mentor and community archivist',
    evidence:
      'A fictional mentor supporting rehearsal, records and the transmission of skills.',
    concern: 'Keep the practice alive alongside the records.',
  },
  {
    name: 'Mdm Lim',
    initials: 'ML',
    role: 'Family property owner',
    evidence:
      'A fictional owner balancing building upkeep and long-term tenancy commitments.',
    concern: 'A lasting rent promise needs a funded compensation agreement.',
  },
  {
    name: 'Priya',
    initials: 'P',
    role: 'Food business and walking-tour operator',
    evidence:
      'A fictional operator balancing staff livelihoods, visitors and daily access.',
    concern: 'The streets must work for staff, deliveries and neighbours.',
  },
];
const littleIndiaPeople = [
  {
    name: 'Kavitha',
    initials: 'K',
    role: 'Independent textile-shop tenant',
    evidence:
      'A fictional Little India Arcade trader balancing rent, regular customers and teaching time.',
    concern:
      'Keep an independent shop affordable enough to pass on its skills.',
  },
  {
    name: 'Arun',
    initials: 'A',
    role: 'Neighbourhood volunteer',
    evidence:
      'A fictional volunteer advocating for residents, young people and workers who gather here on their days off.',
    concern:
      'A welcoming district needs places to rest without having to spend.',
  },
  {
    name: 'Mdm Devi',
    initials: 'MD',
    role: 'Craft mentor and oral-history collector',
    evidence:
      'A fictional mentor supporting flower-garland teaching and community memories.',
    concern: 'An archive needs living teachers beside it.',
  },
  {
    name: 'Mr Menon',
    initials: 'MM',
    role: 'Family property owner',
    evidence:
      'A fictional shophouse owner balancing maintenance and long-term tenancy commitments.',
    concern: 'A lasting rent promise needs a funded compensation agreement.',
  },
  {
    name: 'Farah',
    initials: 'F',
    role: 'Food business operator',
    evidence:
      'A fictional operator balancing staff livelihoods, customer access and deliveries.',
    concern: 'Keep the streets usable for staff, suppliers and neighbours.',
  },
];
export function districtPeople(district: DistrictId = 'kampong-glam') {
  const local =
    district === 'little-india'
      ? littleIndiaPeople
      : district === 'chinatown'
        ? chinatownPeople
        : null;
  return local ? people.map((p, i) => ({ ...p, ...local[i] })) : people;
}
