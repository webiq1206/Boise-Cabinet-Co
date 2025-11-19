// Content Data for All Services and Cities
// This centralized data drives both service detail pages and geo-targeted pages

export interface ServiceData {
  slug: string;
  name: string;
  category: 'lawn-care' | 'landscaping-softscape' | 'landscaping-hardscape' | 'landscaping-water' | 'landscaping-fire' | 'landscaping-structures' | 'landscaping-lighting' | 'landscaping-irrigation' | 'landscaping-rock' | 'landscaping-specialty' | 'christmas-lights' | 'commercial';
  shortDescription: string;
  longDescription: string;
  benefits: string[];
  process: Array<{step: number; title: string; description: string}>;
  faqs: Array<{question: string; answer: string}>;
  relatedServices: string[]; // slugs of related services
  pricingGuidance?: string;
  seasonality?: string;
  materialOptions?: string[];
}

export interface CityData {
  slug: string;
  name: string;
  isPrimary: boolean; // Kuna is primary
  population?: string;
  zipCodes?: string[];
  neighborhoods?: string[];
  localFactors: {
    climate: string;
    soil: string;
    commonNeeds: string[];
  };
}

// Cities we serve
export const CITIES: CityData[] = [
  {
    slug: 'kuna',
    name: 'Kuna',
    isPrimary: true,
    population: '25,000+',
    zipCodes: ['83634'],
    neighborhoods: ['Teed Farms', 'Swan Falls', 'Crimson Point', 'Indian Creek'],
    localFactors: {
      climate: 'Semi-arid with cold winters and hot, dry summers. USDA Zone 6a.',
      soil: 'Predominantly clay soil requiring amendments for optimal lawn and plant growth.',
      commonNeeds: ['Clay soil management', 'Drought-resistant landscaping', 'Irrigation system maintenance', 'Winter freeze protection']
    }
  },
  {
    slug: 'boise',
    name: 'Boise',
    isPrimary: false,
    population: '230,000+',
    zipCodes: ['83702', '83703', '83704', '83705', '83706', '83709', '83712', '83713', '83714', '83716'],
    neighborhoods: ['North End', 'Bench', 'Southwest Boise', 'Southeast Boise', 'Harris Ranch', 'Barber Valley'],
    localFactors: {
      climate: 'Four distinct seasons with hot summers (90-100°F) and cold winters (freezing). USDA Zone 6b-7a.',
      soil: 'Varied - clay-based in most areas, some areas with better drainage.',
      commonNeeds: ['HOA-compliant landscaping', 'Water-wise irrigation', 'Seasonal maintenance', 'Commercial property upkeep']
    }
  },
  {
    slug: 'meridian',
    name: 'Meridian',
    isPrimary: false,
    population: '130,000+',
    zipCodes: ['83642', '83646'],
    neighborhoods: ['Meridian Ranch', 'Tuscany', 'Paramount', 'Lochsa Falls', 'Discovery Park'],
    localFactors: {
      climate: 'Similar to Boise - hot, dry summers and cold winters. USDA Zone 6b.',
      soil: 'Clay soil prevalent, requiring proper drainage solutions.',
      commonNeeds: ['New construction landscaping', 'Subdivision lawn care', 'HOA maintenance', 'Modern landscape design']
    }
  },
  {
    slug: 'nampa',
    name: 'Nampa',
    isPrimary: false,
    population: '100,000+',
    zipCodes: ['83651', '83686', '83687'],
    neighborhoods: ['Centennial', 'South Nampa', 'West Nampa', 'Deer Flat'],
    localFactors: {
      climate: 'Hot summers and cold winters. USDA Zone 6a-6b.',
      soil: 'Heavy clay soil common, benefits from organic amendments.',
      commonNeeds: ['Affordable lawn maintenance', 'Clay soil solutions', 'Sprinkler repair', 'Yard cleanup services']
    }
  },
  {
    slug: 'caldwell',
    name: 'Caldwell',
    isPrimary: false,
    population: '60,000+',
    zipCodes: ['83605', '83607'],
    neighborhoods: ['Ustick', 'Farmway', 'Purple Sage'],
    localFactors: {
      climate: 'Semi-arid climate with temperature extremes. USDA Zone 6a.',
      soil: 'Clay-heavy soil requiring proper preparation.',
      commonNeeds: ['Basic lawn care', 'Irrigation winterization', 'Tree and shrub trimming', 'Spring cleanup']
    }
  },
  {
    slug: 'eagle',
    name: 'Eagle',
    isPrimary: false,
    population: '35,000+',
    zipCodes: ['83616', '83646'],
    neighborhoods: ['Eagle Hills', 'Banbury', 'Silver Wing', 'Floating Feather'],
    localFactors: {
      climate: 'Similar to Boise with slightly warmer winters near foothills. USDA Zone 6b-7a.',
      soil: 'Variable - some areas rocky, others clay-based.',
      commonNeeds: ['High-end landscaping', 'Premium lawn care', 'Outdoor living spaces', 'Estate property maintenance']
    }
  }
];

// High-Priority Services (build these first)
export const PRIORITY_SERVICES: ServiceData[] = [
  // LAWN CARE SERVICES
  {
    slug: 'lawn-mowing',
    name: 'Lawn Mowing',
    category: 'lawn-care',
    shortDescription: 'Professional weekly and bi-weekly lawn mowing services for residential and commercial properties',
    longDescription: 'Keep your lawn looking its best with our professional mowing services. We provide reliable, consistent lawn cutting on weekly or bi-weekly schedules throughout the growing season. Our experienced crews use commercial-grade equipment to deliver a precise, even cut that promotes healthy grass growth. We edge all borders, blow off hard surfaces, and leave your property looking immaculate.',
    benefits: [
      'Consistent, professional cut every time',
      'Promotes healthy, thick lawn growth',
      'Prevents weed invasion through regular maintenance',
      'Saves you 2-3 hours every week',
      'Commercial-grade equipment for superior results',
      'Fully insured and experienced crews',
      'Flexible scheduling - weekly or bi-weekly',
      'Competitive pricing with no hidden fees'
    ],
    process: [
      { step: 1, title: 'Schedule Your Service', description: 'Choose weekly or bi-weekly mowing based on your lawn\'s needs and your budget. We\'ll assign you to a regular day of the week.' },
      { step: 2, title: 'Pre-Mow Inspection', description: 'Our crew walks your property to identify any obstacles, pet waste, or areas needing special attention before starting.' },
      { step: 3, title: 'Precision Mowing', description: 'We mow in a consistent pattern at the optimal height for Idaho grass types (typically 3-3.5 inches), never removing more than 1/3 of blade length.' },
      { step: 4, title: 'Edging & Trimming', description: 'All sidewalks, driveways, flower beds, and fence lines are edged and trimmed for crisp, clean borders.' },
      { step: 5, title: 'Cleanup & Final Touches', description: 'We blow off all hard surfaces (sidewalks, driveways, patios) to leave your property looking pristine.' },
      { step: 6, title: 'Quality Check', description: 'A final walk-through ensures everything meets our high standards before we move to the next property.' }
    ],
    faqs: [
      {
        question: 'How often should I mow my lawn in Idaho?',
        answer: 'During peak growing season (May-July), weekly mowing is recommended for most Idaho lawns. In spring and fall, bi-weekly service is usually sufficient as grass grows more slowly. We can adjust your schedule based on growth rates and weather conditions.'
      },
      {
        question: 'What height do you cut the grass?',
        answer: 'We typically maintain lawns at 3 to 3.5 inches in Idaho. This height promotes deep root growth, shades out weeds, and helps lawns withstand our hot, dry summers. Taller grass stays greener longer and requires less watering.'
      },
      {
        question: 'Do you bag the clippings or leave them?',
        answer: 'We recommend mulching clippings back into the lawn (grasscycling). This returns nutrients to the soil, reduces watering needs, and is better for your lawn. If you prefer bagging, we can accommodate that for an additional fee.'
      },
      {
        question: 'What if it rains on my scheduled day?',
        answer: 'We\'ll reschedule your service to the next available day when conditions allow safe mowing. Wet lawns can be damaged by mower traffic, and our crews prioritize lawn health over strict schedules.'
      },
      {
        question: 'Can you work around my sprinkler schedule?',
        answer: 'Absolutely. Let us know your sprinkler times and we\'ll schedule your mowing service accordingly. Ideally, we mow when grass is dry for the cleanest cut and healthiest results.'
      },
      {
        question: 'Do you mow commercial properties?',
        answer: 'Yes! We provide commercial lawn mowing for office buildings, retail centers, HOAs, apartment complexes, and more. We offer flexible scheduling, including early morning or weekend service to minimize disruption.'
      }
    ],
    relatedServices: ['lawn-maintenance', 'hedge-trimming', 'fertilization', 'weed-control', 'seasonal-cleanup'],
    pricingGuidance: 'Lawn mowing typically ranges from $35-65 for residential properties depending on lot size. Commercial properties are quoted based on square footage and frequency. All quotes are free with no obligation.',
    seasonality: 'April through October in Idaho (growing season). Service frequency varies by season.'
  },
  // Add more services here...
];

// This will be expanded to include ALL 92+ services
// For now, we start with priority services and expand incrementally
