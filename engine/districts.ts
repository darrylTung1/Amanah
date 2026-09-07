import { people, type DistrictId } from './model.ts';

export const districtNames: Record<DistrictId, string> = {
  'kampong-glam': 'Kampong Glam',
  chinatown: 'Chinatown',
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
export function districtPeople(district: DistrictId = 'kampong-glam') {
  return district === 'chinatown'
    ? people.map((p, i) => ({ ...p, ...chinatownPeople[i] }))
    : people;
}
