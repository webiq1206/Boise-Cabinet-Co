// Content Data for Boise Cabinet Co
// Serves the Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton

export interface ServiceData {
  slug: string;
  name: string;
  shortDescription: string;
  /** Canonical live route for this offering (used by Organization/Offer schema). */
  url: string;
}

export interface CityData {
  slug: string;
  name: string;
  county: 'ada' | 'canyon';
  isPrimary: boolean;
}

/** Legacy service slugs retained for redirects and existing SEO URLs */
export const SERVICES: ServiceData[] = [
  {
    slug: 'kitchen-remodel',
    name: 'Kitchen Cabinets',
    shortDescription: 'Custom kitchen cabinets from layout design through installation, frameless Euro construction, 299 finishes.',
    url: '/cabinets/kitchen',
  },
  {
    slug: 'bathroom-remodel',
    name: 'Bathroom Vanities',
    shortDescription: 'Vanity cabinets, linen towers, and bath storage designed for your space and style.',
    url: '/cabinets/bathroom',
  },
  {
    slug: 'whole-home-remodel',
    name: 'Whole-Home Cabinetry',
    shortDescription: 'Coordinated cabinet packages across kitchen, bath, laundry, mudroom, and built-ins.',
    url: '/catalog',
  },
  {
    slug: 'room-addition',
    name: 'Built-In Storage',
    shortDescription: 'Custom built-ins, entertainment centers, and specialty storage for any room.',
    url: '/cabinets/built-ins',
  },
  {
    slug: 'adu',
    name: 'Closet & Garage Storage',
    shortDescription: 'Closet systems, garage storage, and organizational solutions built to last.',
    url: '/cabinets/closet',
  },
];

/** Alias for internal linking, SEO routes, and legacy imports */
export const PRIORITY_SERVICES = SERVICES;

export const CABINET_ROOM_SLUGS = [
  'kitchen',
  'bathroom',
  'laundry',
  'mudroom',
  'home-office',
  'entertainment',
  'built-ins',
  'pantry',
  'closet',
  'garage',
] as const;

export const CITIES: CityData[] = [
  { slug: 'boise', name: 'Boise', county: 'ada', isPrimary: true },
  { slug: 'meridian', name: 'Meridian', county: 'ada', isPrimary: false },
  { slug: 'eagle', name: 'Eagle', county: 'ada', isPrimary: false },
  { slug: 'nampa', name: 'Nampa', county: 'canyon', isPrimary: false },
  { slug: 'kuna', name: 'Kuna', county: 'ada', isPrimary: false },
  { slug: 'star', name: 'Star', county: 'ada', isPrimary: false },
  { slug: 'middleton', name: 'Middleton', county: 'canyon', isPrimary: false },
  { slug: 'caldwell', name: 'Caldwell', county: 'canyon', isPrimary: false },
];

export const TREASURE_VALLEY_CITIES = CITIES.map((c) => c.name).join(', ');

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getCountyLabel(county: CityData['county']): string {
  return county === 'ada' ? 'Ada County' : 'Canyon County';
}

export function locationPath(citySlug: string): string {
  return `/locations/${citySlug}`;
}
