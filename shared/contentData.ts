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
  {
    slug: 'aeration',
    name: 'Lawn Aeration',
    category: 'lawn-care',
    shortDescription: 'Core aeration services to relieve soil compaction and promote healthy root growth',
    longDescription: 'Lawn aeration is one of the most beneficial services for Idaho lawns, especially those with heavy clay soil. Our core aeration service removes small plugs of soil, allowing air, water, and nutrients to penetrate deep into the root zone. This process relieves compaction, encourages deeper root growth, and creates a healthier, more resilient lawn that can better withstand Idaho\'s hot, dry summers.',
    benefits: [
      'Relieves soil compaction in clay soils',
      'Improves water and nutrient absorption',
      'Promotes deeper, stronger root systems',
      'Reduces water runoff and pooling',
      'Enhances fertilizer effectiveness',
      'Prepares lawn for successful overseeding',
      'Reduces thatch buildup',
      'Creates thicker, healthier turf'
    ],
    process: [
      { step: 1, title: 'Property Assessment', description: 'We evaluate your lawn\'s soil condition, compaction level, and overall health to determine the best aeration pattern.' },
      { step: 2, title: 'Marking Sprinkler Heads', description: 'All sprinkler heads, valve boxes, and shallow utilities are marked with flags to prevent damage during aeration.' },
      { step: 3, title: 'Core Aeration', description: 'Using professional-grade core aerators, we make multiple passes removing 2-3 inch soil plugs spaced 3-4 inches apart across your entire lawn.' },
      { step: 4, title: 'Targeted Problem Areas', description: 'Heavily compacted areas receive extra passes to ensure adequate soil relief and improvement.' },
      { step: 5, title: 'Core Breakdown', description: 'The removed soil cores are left on the lawn to break down naturally, returning nutrients and microorganisms to the soil.' },
      { step: 6, title: 'Post-Aeration Care Recommendations', description: 'We provide guidance on watering and any follow-up services like overseeding or fertilization for maximum benefit.' }
    ],
    faqs: [
      {
        question: 'When is the best time to aerate my lawn in Idaho?',
        answer: 'Fall (September-October) is the ideal time for aeration in Idaho. The soil is still warm enough for root growth, but cooler temperatures reduce stress on the grass. Spring aeration (April-May) is also beneficial but avoid aerating during hot summer months or when soil is frozen.'
      },
      {
        question: 'How often should I aerate my lawn?',
        answer: 'Most Idaho lawns benefit from annual aeration, especially those with clay soil or heavy foot traffic. High-traffic areas or lawns with severe compaction may benefit from twice-yearly aeration (spring and fall).'
      },
      {
        question: 'Will aeration damage my lawn?',
        answer: 'No, aeration is beneficial and causes no lasting damage. Your lawn may look a bit messy for 1-2 weeks as the soil cores break down, but the long-term benefits far outweigh the temporary appearance. Most lawns show noticeable improvement within 2-3 weeks.'
      },
      {
        question: 'Should I water before or after aeration?',
        answer: 'Water your lawn 1-2 days before aeration to soften the soil - this allows the aerator to pull deeper cores. After aeration, continue regular watering to help the lawn recover and promote root growth into the newly opened channels.'
      },
      {
        question: 'Can you aerate and overseed at the same time?',
        answer: 'Yes! Fall aeration combined with overseeding is the perfect combination for Idaho lawns. The aeration holes provide ideal spots for grass seed to germinate, leading to much better results than overseeding alone.'
      }
    ],
    relatedServices: ['overseeding', 'fertilization', 'dethatching', 'lawn-mowing'],
    pricingGuidance: 'Aeration typically costs $75-150 for residential properties depending on lawn size. Larger properties and commercial jobs are quoted individually. Discounts available when combined with overseeding.',
    seasonality: 'Best performed in fall (September-October) or spring (April-May). Most popular service period is September.'
  },
  {
    slug: 'fertilization',
    name: 'Lawn Fertilization',
    category: 'lawn-care',
    shortDescription: 'Custom fertilization programs to keep your lawn green, healthy, and thriving',
    longDescription: 'A properly fertilized lawn is greener, thicker, and more resistant to weeds, disease, and drought. Our fertilization programs are customized for Idaho\'s unique climate and soil conditions. We use professional-grade fertilizers with the right balance of nutrients to promote healthy growth without burning or over-stimulating your lawn. Regular fertilization is the foundation of a beautiful, low-maintenance lawn.',
    benefits: [
      'Promotes thick, lush green growth',
      'Strengthens grass against drought stress',
      'Crowds out weeds naturally',
      'Improves disease resistance',
      'Addresses Idaho clay soil deficiencies',
      'Timed for optimal seasonal growth',
      'Professional-grade products',
      'Safe for kids and pets when dry'
    ],
    process: [
      { step: 1, title: 'Soil Analysis', description: 'We assess your lawn\'s current health and nutrient needs based on grass type, soil conditions, and visible deficiencies.' },
      { step: 2, title: 'Custom Program Design', description: 'Based on your lawn\'s needs, we create a fertilization schedule with the right products for each season.' },
      { step: 3, title: 'Professional Application', description: 'Using calibrated spreaders, we apply fertilizer evenly across your lawn at the correct rate to avoid burning.' },
      { step: 4, title: 'Watering Instructions', description: 'We provide specific watering guidelines to help the fertilizer activate and penetrate the soil effectively.' },
      { step: 5, title: 'Progress Monitoring', description: 'We track your lawn\'s response and adjust future applications as needed for optimal results.' }
    ],
    faqs: [
      {
        question: 'How many times per year should I fertilize my lawn in Idaho?',
        answer: 'We recommend 4-5 fertilizer applications per year for Idaho lawns: early spring, late spring, summer, early fall, and late fall. This schedule provides consistent nutrition through the growing season and prepares the lawn for winter.'
      },
      {
        question: 'Is fertilizer safe for my kids and pets?',
        answer: 'Yes, when applied correctly. We use professional products that are safe once dry (typically 2-4 hours after application). We recommend keeping kids and pets off the lawn until the fertilizer has been watered in and the grass is dry.'
      },
      {
        question: 'Why is my lawn still yellow after fertilizing?',
        answer: 'Lawns may take 7-14 days to show greening after fertilization. Yellow lawns can also indicate iron deficiency (common in Idaho), watering issues, or disease - not just nutrient deficiency. We can assess and address the specific cause.'
      },
      {
        question: 'Can I fertilize my own lawn?',
        answer: 'Yes, but professional fertilization ensures even coverage, proper rates, and the right products for each season. Over-fertilizing can burn your lawn, while under-fertilizing wastes money with poor results. Our calibrated equipment and expertise deliver optimal results.'
      }
    ],
    relatedServices: ['weed-control', 'aeration', 'lawn-mowing', 'seasonal-cleanup'],
    pricingGuidance: 'Fertilization programs typically cost $40-80 per application for residential lawns. Season-long programs (4-5 applications) are available at discounted rates.',
    seasonality: 'Year-round program with applications in spring, summer, and fall. Most critical applications are April, September, and November.'
  },
  {
    slug: 'weed-control',
    name: 'Weed Control',
    category: 'lawn-care',
    shortDescription: 'Professional weed control to eliminate dandelions, crabgrass, and broadleaf weeds',
    longDescription: 'Keep your lawn weed-free with our targeted weed control programs. We use professional-grade herbicides that effectively eliminate common Idaho weeds like dandelions, clover, thistle, and crabgrass while being safe for your grass. Our selective treatments target weeds without harming your desirable turf, giving you a thick, uniform lawn that\'s the envy of the neighborhood.',
    benefits: [
      'Eliminates dandelions, clover, and thistle',
      'Prevents crabgrass and annual weeds',
      'Selective treatment - won\'t harm grass',
      'Creates thick, weed-free lawn',
      'Reduces need for manual weeding',
      'Professional-grade products',
      'Seasonal programs available',
      'Safe for established lawns'
    ],
    process: [
      { step: 1, title: 'Weed Identification', description: 'We identify the specific weed types in your lawn to select the most effective treatment approach.' },
      { step: 2, title: 'Treatment Selection', description: 'Based on weed types, we choose selective herbicides that target weeds while protecting your grass.' },
      { step: 3, title: 'Precise Application', description: 'We apply herbicide evenly across the lawn or spot-treat problem areas, depending on weed distribution.' },
      { step: 4, title: 'Follow-Up Assessment', description: 'After 2-3 weeks, we assess results and schedule additional treatments if needed for stubborn weeds.' },
      { step: 5, title: 'Prevention Program', description: 'We recommend pre-emergent treatments and lawn health practices to prevent future weed invasions.' }
    ],
    faqs: [
      {
        question: 'When is the best time to treat weeds in Idaho?',
        answer: 'Spring (April-May) and fall (September-October) are the most effective times for broadleaf weed control. Pre-emergent crabgrass control should be applied in early spring before soil temperatures reach 55°F. Post-emergent treatments work best when weeds are actively growing.'
      },
      {
        question: 'How long until I see results?',
        answer: 'Broadleaf weeds like dandelions typically show signs of dying within 7-14 days. Complete elimination may take 3-4 weeks. Crabgrass and grassy weeds can take longer. Some stubborn weeds may require multiple applications.'
      },
      {
        question: 'Will weed control harm my grass?',
        answer: 'No, we use selective herbicides specifically designed to target weeds while being safe for established grass. However, newly seeded lawns should wait until after 3-4 mowings before herbicide application.'
      },
      {
        question: 'Why do weeds keep coming back?',
        answer: 'Weeds return when lawns are thin, stressed, or improperly maintained. The best long-term weed control combines herbicide treatments with good lawn care: proper mowing height, adequate fertilization, correct watering, and aeration. A thick, healthy lawn naturally crowds out weeds.'
      }
    ],
    relatedServices: ['fertilization', 'aeration', 'lawn-mowing', 'overseeding'],
    pricingGuidance: 'Weed control applications typically cost $45-85 per treatment. Season-long programs with multiple applications are available at discounted rates.',
    seasonality: 'Pre-emergent in early spring (March-April), post-emergent treatments spring and fall (April-May, September-October).'
  },
  {
    slug: 'sod-installation',
    name: 'Sod Installation',
    category: 'landscaping-softscape',
    shortDescription: 'Professional sod installation for instant, beautiful lawns',
    longDescription: 'Get an instant lawn with our professional sod installation service. Perfect for new construction, lawn renovation, or repairing damaged areas, sod provides immediate results with a lush, green lawn you can enjoy in weeks instead of months. We handle everything from soil preparation to sod selection and installation, ensuring your new lawn establishes quickly and thrives for years to come.',
    benefits: [
      'Instant results - green lawn immediately',
      'Prevents soil erosion',
      'Weed-free from the start',
      'Usable in 2-3 weeks',
      'Professional installation ensures success',
      'Ideal for Idaho climate',
      'Increases property value',
      'Year-round installation possible (spring-fall)'
    ],
    process: [
      { step: 1, title: 'Site Assessment & Measurement', description: 'We evaluate your property, measure the area, and determine the best sod type for your location and use.' },
      { step: 2, title: 'Soil Preparation', description: 'We remove old grass/weeds, till the soil, add amendments for Idaho clay soil, grade for proper drainage, and level the surface.' },
      { step: 3, title: 'Fresh Sod Delivery', description: 'We source fresh, locally-grown sod and schedule delivery to coincide with installation for maximum freshness.' },
      { step: 4, title: 'Professional Installation', description: 'Sod is laid in a brick pattern with tight seams, ensuring no gaps. Edges are trimmed precisely around landscaping and hardscaping.' },
      { step: 5, title: 'Initial Watering', description: 'We water the newly installed sod thoroughly to establish good soil contact and begin the rooting process.' },
      { step: 6, title: 'Care Instructions', description: 'We provide detailed watering and maintenance schedules to ensure successful establishment over the first 2-3 weeks.' }
    ],
    faqs: [
      {
        question: 'How long before I can walk on new sod?',
        answer: 'Light foot traffic is okay after 1-2 weeks, but avoid heavy use for at least 3 weeks. Wait 4-6 weeks before allowing pets or heavy play. The sod needs time to root into the soil before it can handle stress.'
      },
      {
        question: 'When is the best time to install sod in Idaho?',
        answer: 'Spring (April-May) and fall (September-October) are ideal in Idaho. Summer installation is possible but requires more intensive watering. Avoid installing when temperatures exceed 90°F or when ground is frozen.'
      },
      {
        question: 'How often should I water new sod?',
        answer: 'For the first 2 weeks, water 2-3 times daily to keep sod and soil consistently moist. Weeks 3-4, reduce to once daily. After 4 weeks, transition to your normal irrigation schedule. Proper watering is critical for successful establishment.'
      },
      {
        question: 'What type of sod is best for Idaho?',
        answer: 'Kentucky bluegrass is the most popular choice in Idaho for its dark green color, durability, and cold tolerance. Tall fescue is another excellent option for low-maintenance areas. We recommend the best variety based on your specific needs and sun exposure.'
      },
      {
        question: 'How much does sod installation cost?',
        answer: 'Sod installation typically costs $1.50-3.00 per square foot installed, depending on site preparation needs, access, and sod variety. This includes soil prep, sod, labor, and initial watering. We provide free detailed estimates.'
      }
    ],
    relatedServices: ['lawn-mowing', 'irrigation-installation', 'fertilization', 'aeration'],
    pricingGuidance: 'Sod installation ranges from $1.50-3.00 per square foot including materials and labor. Minimum project size typically 500 sq ft. Free estimates provided.',
    seasonality: 'Best installed April-May and September-October. Summer installation possible with intensive watering.'
  },
  {
    slug: 'patio-installation',
    name: 'Patio Installation',
    category: 'landscaping-hardscape',
    shortDescription: 'Custom patio design and installation using pavers, stamped concrete, and natural stone',
    longDescription: 'Transform your backyard into an outdoor oasis with a professionally installed patio. Whether you envision a cozy space for morning coffee or an expansive entertainment area, we design and build custom patios that enhance your lifestyle and increase your property value. We specialize in paver patios, stamped concrete, and natural stone installations that are built to last through Idaho\'s harsh winters and hot summers.',
    benefits: [
      'Expands outdoor living space',
      'Increases home value significantly',
      'Durable - lasts 20-30+ years',
      'Low maintenance',
      'Custom design to match your style',
      'Built for Idaho climate extremes',
      'Professional craftsmanship',
      'Wide variety of materials and patterns'
    ],
    process: [
      { step: 1, title: 'Design Consultation', description: 'We discuss your vision, budget, and how you\'ll use the space. We measure the area and discuss material options (pavers, stamped concrete, natural stone).' },
      { step: 2, title: 'Site Preparation & Excavation', description: 'We excavate to proper depth (typically 8-12 inches), ensuring proper slope for drainage away from your home.' },
      { step: 3, title: 'Base Installation', description: 'We install compacted gravel base (4-6 inches) for stability and drainage, critical for Idaho\'s freeze-thaw cycles.' },
      { step: 4, title: 'Sand Layer & Leveling', description: 'A 1-inch sand layer is screeded perfectly level to ensure a smooth, even patio surface.' },
      { step: 5, title: 'Paver/Stone Installation', description: 'Pavers or stones are laid in your chosen pattern with precise spacing and alignment. Edges are secured with restraints.' },
      { step: 6, title: 'Joint Sand & Sealing', description: 'Polymeric sand is swept into joints and activated. Optional sealer protects pavers and enhances color.' }
    ],
    faqs: [
      {
        question: 'How much does a patio cost in Idaho?',
        answer: 'Patio costs vary by material and size. Basic concrete patios: $8-15/sq ft. Stamped concrete: $12-20/sq ft. Paver patios: $15-30/sq ft. Natural stone: $20-40/sq ft. A typical 300 sq ft paver patio costs $4,500-9,000 installed.'
      },
      {
        question: 'Pavers vs. stamped concrete - which is better?',
        answer: 'Pavers are more durable, easier to repair (replace individual pavers), and handle freeze-thaw better - ideal for Idaho. Stamped concrete is less expensive upfront but can crack and is harder to repair. We typically recommend pavers for Idaho\'s climate.'
      },
      {
        question: 'How long do patios last?',
        answer: 'Properly installed paver patios last 25-30+ years with minimal maintenance. Concrete patios last 15-25 years. Natural stone can last 50+ years. The key is proper base preparation and drainage, which we ensure on every installation.'
      },
      {
        question: 'Can you install a patio in winter?',
        answer: 'We install patios spring through fall (April-October). Winter installation is not recommended as frozen ground prevents proper excavation and compaction. We begin booking spring projects in February.'
      },
      {
        question: 'Do I need a permit for a patio?',
        answer: 'Most cities in Idaho don\'t require permits for ground-level patios, but requirements vary by location. Elevated patios or those attached to the house may require permits. We can advise based on your specific city\'s regulations.'
      }
    ],
    relatedServices: ['fire-pit-installation', 'outdoor-fireplace', 'pergola-installation', 'landscape-lighting'],
    pricingGuidance: 'Paver patios: $15-30/sq ft installed. Stamped concrete: $12-20/sq ft. Natural stone: $20-40/sq ft. Minimum project typically $3,000. Free estimates provided.',
    seasonality: 'Installed April through October. Best to book in late winter/early spring for summer completion.'
  }
];

// Helper function to get service by slug
export function getServiceBySlug(slug: string): ServiceData | undefined {
  return PRIORITY_SERVICES.find(s => s.slug === slug);
}

// Helper function to get city by slug
export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find(c => c.slug === slug);
}

// This will be expanded to include ALL 92+ services
// For now, we start with priority services and expand incrementally
