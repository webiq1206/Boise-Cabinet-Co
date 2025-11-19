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
  },
  {
    slug: 'hedge-trimming',
    name: 'Hedge & Shrub Trimming',
    category: 'lawn-care',
    shortDescription: 'Professional hedge and shrub trimming to maintain shape, promote healthy growth, and enhance curb appeal',
    longDescription: 'Well-maintained hedges and shrubs are essential to a polished landscape. Our professional hedge and shrub trimming service keeps your plants healthy, shapely, and beautiful year-round. We use commercial-grade equipment and proper pruning techniques to ensure clean cuts that promote vigorous new growth. Whether you need formal hedges precisely shaped or natural shrubs lightly trimmed, our experienced team delivers results that enhance your property\'s appearance and plant health.',
    benefits: [
      'Promotes dense, healthy growth patterns',
      'Maintains desired size and shape',
      'Enhances curb appeal and property value',
      'Prevents overgrowth from blocking windows or walkways',
      'Encourages flowering on flowering shrubs',
      'Removes dead or diseased branches',
      'Commercial-grade equipment for clean, precise cuts',
      'Saves you time and eliminates physical strain'
    ],
    process: [
      { step: 1, title: 'Property Walk-Through', description: 'We assess all hedges, shrubs, and ornamental plants, noting their type, current condition, and your desired maintenance goals.' },
      { step: 2, title: 'Trimming Plan Development', description: 'Based on plant species and your preferences, we determine appropriate trim heights and shapes. Different plants require different timing and techniques.' },
      { step: 3, title: 'Precise Trimming & Shaping', description: 'Using professional hedge trimmers and hand shears, we carefully trim each plant to the appropriate height and shape, following natural growth patterns.' },
      { step: 4, title: 'Selective Pruning', description: 'We remove dead, diseased, or crossing branches, opening the plant canopy for better air circulation and light penetration.' },
      { step: 5, title: 'Cleanup & Debris Removal', description: 'All clippings and debris are removed from your property. We blow off surrounding hardscapes to leave everything looking pristine.' },
      { step: 6, title: 'Care Recommendations', description: 'We provide guidance on watering and timing for the next trimming service based on growth rate and plant type.' }
    ],
    faqs: [
      {
        question: 'How often should hedges be trimmed in Idaho?',
        answer: 'Most hedges benefit from trimming 2-3 times per growing season. Fast-growing hedges like privet may need trimming every 6-8 weeks during summer. Slow-growing evergreens may only need annual trimming. We can recommend the ideal schedule based on your specific plants.'
      },
      {
        question: 'When is the best time to trim shrubs?',
        answer: 'Timing depends on the shrub type. Spring-flowering shrubs (like lilac) should be trimmed right after flowering. Summer-flowering shrubs can be trimmed in early spring. Evergreens are best trimmed in late spring or early summer. We can manage the timing for you based on your specific landscape.'
      },
      {
        question: 'Will trimming damage my plants?',
        answer: 'No, proper trimming actually promotes healthier, denser growth. We use sharp, professional equipment and correct techniques that minimize stress on plants. Overgrown plants often benefit significantly from strategic trimming.'
      },
      {
        question: 'Can you trim very tall hedges?',
        answer: 'Yes, we have the equipment and experience to safely trim hedges up to 12-15 feet tall. For extremely tall or wide hedges, we may need to bring specialized equipment, which could affect pricing.'
      },
      {
        question: 'Do you shape topiaries or do specialized trimming?',
        answer: 'Absolutely! We can maintain formal shapes, create topiary forms, and handle specialized ornamental trimming. Let us know your vision and we\'ll make it happen.'
      },
      {
        question: 'What if I want my hedges reduced in size?',
        answer: 'We can carefully reduce hedge size over time. Dramatic size reduction should be done gradually to avoid stressing plants. We\'ll develop a plan to achieve your desired size while maintaining plant health.'
      }
    ],
    relatedServices: ['lawn-mowing', 'seasonal-cleanup', 'tree-trimming', 'mulch-installation'],
    pricingGuidance: 'Hedge trimming starts at $75-150 for typical residential properties. Pricing depends on hedge size, density, and number of plants. Formal hedges requiring precise shaping may cost more. Free estimates provided.',
    seasonality: 'May through September for most plants. Some species benefit from dormant-season pruning (late winter).'
  },
  {
    slug: 'seasonal-cleanup',
    name: 'Spring & Fall Cleanup',
    category: 'lawn-care',
    shortDescription: 'Comprehensive spring and fall yard cleanup services to prepare your landscape for the season ahead',
    longDescription: 'Seasonal transitions require special landscape attention in Idaho. Our spring and fall cleanup services prepare your yard for the growing season or winter dormancy. Spring cleanup removes winter debris, prepares beds, and refreshes your landscape for summer growth. Fall cleanup clears leaves, prepares your yard for winter, and protects plants from cold damage. Both services are essential for maintaining a healthy, attractive landscape year-round.',
    benefits: [
      'Removes leaves, debris, and winter damage',
      'Prepares landscape for optimal seasonal performance',
      'Prevents mold, disease, and pest issues',
      'Enhances curb appeal for spring or winter',
      'Identifies problems early (dead plants, irrigation issues)',
      'Protects plants from seasonal temperature extremes',
      'Comprehensive service saves you entire weekends',
      'Professional equipment gets the job done faster'
    ],
    process: [
      { step: 1, title: 'Initial Property Assessment', description: 'We walk your property to identify all cleanup needs: leaf piles, debris, dead plants, storm damage, and areas requiring special attention.' },
      { step: 2, title: 'Leaf & Debris Removal', description: 'All leaves, twigs, and organic debris are removed from lawns, beds, and hard surfaces using commercial blowers and rakes.' },
      { step: 3, title: 'Bed Edging & Weeding', description: 'Flower beds and landscape areas are edged, weeded, and cleared of unwanted growth to create clean, defined lines.' },
      { step: 4, title: 'Pruning & Plant Care', description: 'Dead plant material is removed. In spring, we cut back perennials and ornamental grasses. In fall, we prepare plants for winter dormancy.' },
      { step: 5, title: 'Final Cleanup & Hauling', description: 'All debris is collected, loaded, and hauled away. We blow off all hard surfaces and leave your property looking fresh and ready for the season.' },
      { step: 6, title: 'Service Recommendations', description: 'We provide recommendations for next steps like mulch, fertilization, or irrigation adjustments to keep your landscape thriving.' }
    ],
    faqs: [
      {
        question: 'What\'s included in spring cleanup?',
        answer: 'Spring cleanup includes: removing winter debris and dead plant material, cutting back ornamental grasses and perennials, edging beds, removing leaves from beds, light pruning, and preparing your landscape for the growing season. Additional services like mulch or fertilizer can be added.'
      },
      {
        question: 'What\'s included in fall cleanup?',
        answer: 'Fall cleanup includes: removing leaves from lawn and beds, cutting back perennials, removing annual flowers, clearing flower pots, blowing gutters (if requested), and preparing beds for winter. This sets your property up for a strong start next spring.'
      },
      {
        question: 'When should I schedule spring cleanup?',
        answer: 'March-April is ideal for spring cleanup in Idaho, after the last hard freeze but before new growth begins. We get very busy during this window, so booking in February ensures you get your preferred timing.'
      },
      {
        question: 'When should I schedule fall cleanup?',
        answer: 'Late October through November is perfect for fall cleanup in Idaho - after most leaves have fallen but before winter weather makes outdoor work difficult. This timing protects your landscape while preparing for spring.'
      },
      {
        question: 'Do you haul away all the debris?',
        answer: 'Yes! All leaves, twigs, and debris are loaded and hauled away as part of our service. You don\'t need to worry about disposal - we handle everything from start to finish.'
      },
      {
        question: 'Can you add mulch during cleanup?',
        answer: 'Absolutely! Many clients add fresh mulch during spring cleanup to refresh bed appearance and suppress weeds. We can provide a quote for mulch installation along with your cleanup service.'
      }
    ],
    relatedServices: ['mulch-installation', 'hedge-trimming', 'lawn-mowing', 'gutter-cleaning'],
    pricingGuidance: 'Seasonal cleanup typically ranges from $200-600 depending on property size and debris volume. Larger properties or heavily wooded lots may cost more. Free estimates provided.',
    seasonality: 'Spring cleanup: March-April. Fall cleanup: October-November. Both are high-demand periods - book early.'
  },
  {
    slug: 'sprinkler-blowout',
    name: 'Sprinkler System Winterization',
    category: 'landscaping-irrigation',
    shortDescription: 'Professional sprinkler blowout service to protect your irrigation system from winter freeze damage',
    longDescription: 'Idaho\'s freezing winters can destroy sprinkler systems if water is left in pipes and components. Our professional sprinkler winterization (blowout) service uses high-volume compressed air to completely evacuate water from your entire irrigation system. This critical annual service prevents thousands of dollars in freeze damage including cracked pipes, broken valves, and damaged sprinkler heads. Don\'t risk your investment - protect your system before the first hard freeze.',
    benefits: [
      'Prevents costly freeze damage to pipes and components',
      'Protects sprinkler heads, valves, and backflow devices',
      'Extends the life of your irrigation system',
      'Maintains manufacturer warranties (many require winterization)',
      'Professional-grade compressor ensures complete water removal',
      'Fast service - typically 20-30 minutes per system',
      'Peace of mind all winter long',
      'Much less expensive than spring repairs'
    ],
    process: [
      { step: 1, title: 'System Shutdown', description: 'We turn off the water supply to your irrigation system at the main shutoff valve and drain the backflow preventer.' },
      { step: 2, title: 'Compressor Connection', description: 'Our high-volume compressor (80-120 CFM) is connected to your system through a dedicated blowout port or mainline connection.' },
      { step: 3, title: 'Zone-by-Zone Blowout', description: 'Each irrigation zone is activated individually. Compressed air forces all water out through sprinkler heads until only dry air flows.' },
      { step: 4, title: 'Component Check', description: 'As we blow out each zone, we verify all heads are functioning and note any needed repairs for spring service.' },
      { step: 5, title: 'Final System Prep', description: 'Controller is shut off or set to rain mode. All manual drain valves are opened. Backflow device is left open to prevent freeze damage.' },
      { step: 6, title: 'Service Documentation', description: 'We provide a checklist of work completed and any concerns noted for spring service.' }
    ],
    faqs: [
      {
        question: 'When should I winterize my sprinkler system in Idaho?',
        answer: 'October is the ideal month for sprinkler winterization in Idaho. You want to complete the blowout after you\'re done watering for the season but before the first hard freeze (typically late October to early November). We get extremely busy in October, so schedule early.'
      },
      {
        question: 'What happens if I don\'t winterize my sprinklers?',
        answer: 'Water left in pipes can freeze and expand, causing pipes to crack, valves to break, and sprinkler heads to shatter. Repair costs can easily run $500-2000+ in the spring. Winterization at $75-125 is cheap insurance against expensive damage.'
      },
      {
        question: 'Can I winterize the system myself?',
        answer: 'While possible, we don\'t recommend it. Improper air pressure can damage components, and inadequate volume may leave water in the system. Professional equipment (80+ CFM compressor) ensures complete water removal that small residential compressors can\'t achieve.'
      },
      {
        question: 'Do you drain the backflow preventer?',
        answer: 'Yes! We drain and open backflow preventers as part of every winterization. This is critical - backflow devices are expensive (many cost $200-400) and must be drained to prevent freeze damage.'
      },
      {
        question: 'What if I need repairs found during blowout?',
        answer: 'We note all issues discovered during winterization and provide recommendations. Minor repairs like sprinkler head replacement can often be done during the blowout. Major repairs are typically scheduled for spring when parts can be properly tested.'
      },
      {
        question: 'When do I turn the system back on in spring?',
        answer: 'Wait until nighttime temperatures consistently stay above freezing (typically late March to April in Idaho). We offer spring startup services to check for winter damage, adjust sprinkler heads, and optimize your system for the new season.'
      }
    ],
    relatedServices: ['irrigation-repair', 'spring-startup', 'sprinkler-system-installation', 'irrigation-maintenance'],
    pricingGuidance: 'Sprinkler winterization typically costs $75-125 for residential systems. Pricing depends on system size (number of zones), accessibility, and system complexity. Commercial systems quoted individually.',
    seasonality: 'October only - extremely high demand period. Book in September for guaranteed service before freeze.'
  },
  {
    slug: 'dethatching',
    name: 'Lawn Dethatching',
    category: 'lawn-care',
    shortDescription: 'Professional dethatching service to remove dead grass buildup and revitalize your lawn',
    longDescription: 'Thatch is a layer of dead grass, roots, and organic matter that accumulates between living grass and soil. When thatch exceeds 1/2 inch thick, it prevents water, nutrients, and air from reaching grass roots, creating a weak, unhealthy lawn. Our professional dethatching service uses commercial power rakes to remove excessive thatch buildup, allowing your lawn to breathe and thrive again. Combined with aeration and overseeding, dethatching transforms thin, struggling lawns into thick, lush carpets of green.',
    benefits: [
      'Removes dead grass buildup choking your lawn',
      'Improves water and nutrient penetration to roots',
      'Enhances fertilizer effectiveness significantly',
      'Reduces lawn disease and pest problems',
      'Prepares lawn perfectly for overseeding',
      'Promotes new grass growth and thickness',
      'Helps eliminate brown patches and thin areas',
      'Extends lawn life and reduces replacement costs'
    ],
    process: [
      { step: 1, title: 'Thatch Layer Assessment', description: 'We check thatch depth in multiple lawn areas by pulling back grass to expose the layer between grass blades and soil. Thatch over 1/2 inch requires dethatching.' },
      { step: 2, title: 'Pre-Service Preparation', description: 'Your lawn is mowed to 2 inches, and sprinkler heads are flagged to prevent damage during power raking.' },
      { step: 3, title: 'Power Raking', description: 'Our commercial dethatcher uses vertical blades to slice through thatch, pulling dead material to the surface while leaving healthy grass intact.' },
      { step: 4, title: 'Multi-Pass Treatment', description: 'We make 2-3 passes in different directions to ensure thorough thatch removal throughout your entire lawn.' },
      { step: 5, title: 'Debris Collection & Removal', description: 'All removed thatch is raked, collected, and hauled away. This often fills multiple bags or even a trailer for severely thatched lawns.' },
      { step: 6, title: 'Follow-Up Recommendations', description: 'We provide guidance on watering and timing for aeration, overseeding, or fertilization to maximize your lawn\'s recovery and growth.' }
    ],
    faqs: [
      {
        question: 'How do I know if my lawn needs dethatching?',
        answer: 'Pull back grass in several spots and look at the layer between grass blades and soil. If this brown layer is over 1/2 inch thick, your lawn needs dethatching. Other signs include spongy feeling underfoot, water pooling or running off, and poor response to fertilizer.'
      },
      {
        question: 'When should I dethatch my lawn in Idaho?',
        answer: 'Early spring (April) or early fall (September) are ideal for dethatching in Idaho. Avoid dethatching during summer heat stress or when lawn is dormant. Fall dethatching is perfect when combined with aeration and overseeding.'
      },
      {
        question: 'Will dethatching damage my lawn?',
        answer: 'Dethatching is aggressive and your lawn will look rough for 1-2 weeks afterward. This is normal and temporary. The lawn recovers quickly and grows much healthier. Think of it like a deep cleaning - messy during the process but much better afterward.'
      },
      {
        question: 'How is dethatching different from aeration?',
        answer: 'Dethatching removes dead organic buildup on the soil surface. Aeration makes holes in the soil to relieve compaction. Both address different problems. Many lawns benefit from both services - dethatch first, then aerate 1-2 weeks later.'
      },
      {
        question: 'Can I prevent thatch buildup?',
        answer: 'Yes! Regular practices help: mow frequently (never removing more than 1/3 of blade), avoid over-fertilizing, aerate annually, and ensure proper drainage. Some grass types (like Kentucky bluegrass) naturally produce more thatch and may need periodic dethatching despite good practices.'
      },
      {
        question: 'Should I overseed after dethatching?',
        answer: 'Absolutely! Dethatching creates an ideal seedbed with excellent seed-to-soil contact. Fall dethatching followed immediately by overseeding produces exceptional results. This combination is one of the best ways to thicken thin lawns.'
      }
    ],
    relatedServices: ['aeration', 'overseeding', 'fertilization', 'lawn-mowing'],
    pricingGuidance: 'Dethatching typically costs $100-200 for residential lawns depending on size and thatch severity. Often bundled with aeration and overseeding for maximum results at discounted pricing.',
    seasonality: 'Best in early spring (April) or early fall (September). Peak demand is September when combined with overseeding.'
  },
  {
    slug: 'overseeding',
    name: 'Lawn Overseeding',
    category: 'lawn-care',
    shortDescription: 'Professional overseeding to fill thin areas, improve density, and create a lush, thick lawn',
    longDescription: 'Overseeding introduces new grass seed into existing lawns without tearing up the turf. This process fills in thin areas, improves lawn density, enhances color, and introduces improved grass varieties that resist disease and drought better than older grass. Our professional overseeding service includes premium grass seed selected specifically for Idaho\'s climate, proper seedbed preparation, and detailed care instructions to ensure maximum germination and establishment.',
    benefits: [
      'Fills thin and bare spots throughout lawn',
      'Increases overall lawn density and thickness',
      'Introduces disease-resistant grass varieties',
      'Improves drought tolerance with newer cultivars',
      'Enhances lawn color and uniformity',
      'Reduces weed invasion through thick growth',
      'Extends lawn life by 10+ years',
      'More affordable than complete lawn renovation'
    ],
    process: [
      { step: 1, title: 'Lawn Preparation', description: 'Your lawn is mowed short (2 inches) and dethatched or aerated to create optimal seed-to-soil contact. This step is critical for germination success.' },
      { step: 2, title: 'Premium Seed Selection', description: 'We use high-quality grass seed blends specifically formulated for Idaho\'s climate - typically perennial ryegrass and fine fescue mixes for sun, or shade-tolerant blends for shaded areas.' },
      { step: 3, title: 'Professional Application', description: 'Seed is broadcast evenly using commercial spreaders, ensuring proper coverage rate (5-8 lbs per 1000 sq ft depending on lawn condition).' },
      { step: 4, title: 'Seed-to-Soil Contact', description: 'Light raking or dragging works seed into aeration holes and thatch layer, ensuring contact with soil for germination.' },
      { step: 5, title: 'Starter Fertilizer Application', description: 'We apply starter fertilizer high in phosphorus to promote rapid root development and strong seedling establishment.' },
      { step: 6, title: 'Watering Instructions & Follow-Up', description: 'Detailed watering schedule provided (light frequent watering for 3-4 weeks). We check back after germination to assess success and address any concerns.' }
    ],
    faqs: [
      {
        question: 'When is the best time to overseed in Idaho?',
        answer: 'Fall (late August through September) is ideal for overseeding in Idaho. Warm soil and cooler air temperatures create perfect conditions for germination. Spring (April-May) is the second-best window. Avoid overseeding in summer heat.'
      },
      {
        question: 'How soon will I see results?',
        answer: 'Grass seed typically germinates in 7-14 days in fall, or 14-21 days in cooler spring weather. You\'ll see noticeable improvement in lawn thickness by 4-6 weeks. Full results are visible the following spring after grass matures over winter.'
      },
      {
        question: 'Do I need to keep off the lawn after overseeding?',
        answer: 'Light foot traffic is fine, but avoid heavy use for 3-4 weeks until new grass is established. Don\'t mow until new grass reaches 3-4 inches height (typically 3-4 weeks after germination).'
      },
      {
        question: 'How often should I water after overseeding?',
        answer: 'Water lightly 2-3 times per day for the first 2-3 weeks to keep the top inch of soil moist. Once grass germinates, reduce frequency but water deeper. After 3-4 weeks, return to normal watering schedule. Consistency is critical!'
      },
      {
        question: 'Can I apply weed killer after overseeding?',
        answer: 'No! Wait at least 4-6 weeks after overseeding before applying any weed control products. Weed killers prevent grass seed germination. Some pre-emergent products can be used with overseeding - we can recommend safe options.'
      },
      {
        question: 'Should I overseed every year?',
        answer: 'Thin lawns benefit from annual overseeding. Healthy, thick lawns may only need overseeding every 2-3 years. We assess your lawn and recommend an appropriate schedule based on density and performance.'
      }
    ],
    relatedServices: ['aeration', 'dethatching', 'fertilization', 'lawn-renovation'],
    pricingGuidance: 'Overseeding costs $150-300 for residential lawns including premium seed and starter fertilizer. Best results when combined with aeration ($75-150). Package deals available for fall aeration + overseed combo.',
    seasonality: 'Fall (late August-September) is prime season. Spring overseeding (April-May) also available. Summer overseeding not recommended.'
  },
  {
    slug: 'mulch-installation',
    name: 'Mulch Installation',
    category: 'landscaping-softscape',
    shortDescription: 'Professional mulch delivery and installation for garden beds, trees, and landscaped areas',
    longDescription: 'Fresh mulch instantly transforms your landscape\'s appearance while providing essential benefits to plant health. Our professional mulch installation service includes delivery of premium mulch (your choice of cedar, hardwood bark, or decorative rock), proper bed preparation, and expert application at the correct depth. Mulch suppresses weeds, retains moisture, moderates soil temperature, prevents erosion, and gives your property a polished, well-maintained appearance that boosts curb appeal dramatically.',
    benefits: [
      'Instantly enhances curb appeal and property value',
      'Suppresses weed growth by blocking sunlight',
      'Retains soil moisture reducing watering needs by 25%+',
      'Moderates soil temperature protecting plant roots',
      'Prevents soil erosion during Idaho\'s spring runoff',
      'Adds organic matter as mulch decomposes',
      'Protects plants from lawnmower and trimmer damage',
      'Long-lasting - quality mulch lasts 2-3 years'
    ],
    process: [
      { step: 1, title: 'Site Assessment & Material Selection', description: 'We evaluate your beds and discuss mulch options: cedar (aromatic, insect-repelling), hardwood bark (rich color, long-lasting), or decorative rock (permanent, low-maintenance). We calculate quantity needed.' },
      { step: 2, title: 'Bed Preparation & Edging', description: 'Existing beds are weeded and edged for clean lines. Old mulch is fluffed or removed if excessively decomposed. Bed edges are redefined for crisp, professional appearance.' },
      { step: 3, title: 'Mulch Delivery', description: 'Fresh mulch is delivered to your property and staged conveniently. We use bulk mulch (not bagged) for better value and quality.' },
      { step: 4, title: 'Professional Application', description: 'Mulch is spread evenly at proper depth (2-4 inches) throughout all beds. We keep mulch away from plant stems and tree trunks to prevent rot and disease.' },
      { step: 5, title: 'Final Detailing', description: 'Beds are hand-raked smooth, edges are cleaned, and any mulch on hardscapes is blown away. The result is a perfect, uniform appearance.' },
      { step: 6, title: 'Cleanup & Disposal', description: 'All debris and excess material is removed from your property, leaving a clean, beautiful landscape ready to enjoy.' }
    ],
    faqs: [
      {
        question: 'What type of mulch is best for Idaho?',
        answer: 'Cedar and hardwood bark mulches are most popular in Idaho. Cedar smells great and repels insects. Hardwood bark lasts longer and enriches soil as it decomposes. For decorative areas, natural stone or black mulch works well. We help you choose based on your plants, budget, and aesthetic goals.'
      },
      {
        question: 'How much mulch do I need?',
        answer: 'For 2-3 inch depth, you need about 1 cubic yard per 100 square feet. We measure your beds and calculate exact quantity needed. Most residential properties need 3-8 cubic yards for complete coverage of all landscaped areas.'
      },
      {
        question: 'How often should mulch be replaced?',
        answer: 'Top-dress mulch annually with 1-2 inches of fresh material to maintain appearance and benefits. Complete replacement every 2-3 years is typical. Well-maintained beds with annual touch-ups can go 3-4 years between full replacements.'
      },
      {
        question: 'Will mulch attract termites?',
        answer: 'Mulch doesn\'t attract termites, but they may nest in it if they\'re already present. Keep mulch 6 inches away from home foundations and wood siding. Cedar mulch naturally repels many insects. Proper application and maintenance pose minimal termite risk.'
      },
      {
        question: 'Can you install mulch in winter?',
        answer: 'We install mulch April through November when ground isn\'t frozen. Spring (April-May) is peak season as fresh mulch gives maximum benefit through the growing season. Fall mulch installation (September-October) protects plants over winter.'
      },
      {
        question: 'Is rock mulch better than organic mulch?',
        answer: 'Both have advantages. Organic mulch (wood) improves soil, requires periodic replacement, and works well around plants. Rock is permanent, low-maintenance, and works well in modern designs or xeric landscapes. We can help you decide what\'s best for each area.'
      }
    ],
    relatedServices: ['seasonal-cleanup', 'landscape-design', 'bed-edging', 'weed-barrier-installation'],
    pricingGuidance: 'Mulch installation: $75-150 per cubic yard installed including delivery, bed prep, and application. Typical residential properties run $300-800 total. Rock mulch costs more ($150-250/cubic yard installed). Free quotes provided.',
    seasonality: 'April through November. Peak demand is April-May (spring refresh) and September (fall prep). Book early for spring service.'
  },
  {
    slug: 'retaining-walls',
    name: 'Retaining Wall Construction',
    category: 'landscaping-hardscape',
    shortDescription: 'Custom retaining wall installation for slope stabilization, terraced gardens, and landscape elevation changes',
    longDescription: 'Retaining walls solve drainage problems, prevent erosion, create usable yard space on slopes, and add stunning visual appeal to Idaho landscapes. Our professional retaining wall construction service handles everything from design through installation using quality materials like interlocking blocks, natural stone, or timber. We ensure proper engineering with adequate drainage, solid base preparation, and construction that will last decades. Whether you need a small garden border or a major slope stabilization project, we have the expertise to build it right.',
    benefits: [
      'Prevents soil erosion and slope failure',
      'Creates usable flat space on sloped properties',
      'Improves drainage and water management',
      'Adds significant property value and curb appeal',
      'Enables terraced gardens and planting areas',
      'Protects foundations and hardscapes from soil movement',
      'Long-lasting when properly constructed (30-50+ years)',
      'Transforms unusable slopes into beautiful landscapes'
    ],
    process: [
      { step: 1, title: 'Site Evaluation & Design', description: 'We assess slope, soil type, drainage patterns, and intended use. Design is created considering wall height, length, material options, and building codes. Permits are identified if needed.' },
      { step: 2, title: 'Excavation & Base Preparation', description: 'Area is excavated to proper depth. A compacted gravel base (6-8 inches minimum) is installed to provide drainage and stability - critical for Idaho\'s freeze-thaw cycles.' },
      { step: 3, title: 'First Course Installation', description: 'The first row of blocks or stones is set perfectly level on the base. This critical step determines the quality of the entire wall.' },
      { step: 4, title: 'Wall Construction', description: 'Subsequent courses are installed with proper setback (typically 3/4 inch per foot of height). Drainage pipe and gravel backfill are installed behind wall as construction progresses.' },
      { step: 5, title: 'Capping & Finishing', description: 'Cap blocks are glued in place for a finished look. Backfill is compacted in lifts behind the wall. Any disturbed areas are graded and prepared for planting.' },
      { step: 6, title: 'Final Grading & Cleanup', description: 'Final grading ensures proper drainage away from wall. Site is cleaned of all construction debris. You receive care instructions and warranty information.' }
    ],
    faqs: [
      {
        question: 'Do I need a permit for a retaining wall in Idaho?',
        answer: 'Walls over 4 feet high typically require permits and engineering in most Idaho cities. Walls under 4 feet usually don\'t need permits but check local codes. Walls near property lines may have additional requirements. We can advise based on your specific project and location.'
      },
      {
        question: 'What material is best for retaining walls?',
        answer: 'Interlocking concrete blocks (like Allan Block) are most popular in Idaho - affordable, durable, and DIY-friendly for smaller walls. Natural stone looks beautiful but costs more. Timber is economical but has shorter lifespan (15-20 years vs. 50+ for concrete/stone). We recommend based on your budget, aesthetic, and wall height.'
      },
      {
        question: 'How long do retaining walls last?',
        answer: 'Properly built concrete block walls last 50-75 years. Natural stone can last 75-100+ years. Timber walls last 15-25 years depending on wood treatment. The key is proper base preparation, drainage, and construction techniques - not just material choice.'
      },
      {
        question: 'What causes retaining walls to fail?',
        answer: 'Poor drainage is the #1 cause of retaining wall failure. Water pressure builds behind walls without proper drainage, causing bulging, cracking, and collapse. Other causes: inadequate base, wrong material for wall height, and freeze-thaw damage. We prevent these issues through proper engineering and construction.'
      },
      {
        question: 'Can you build curved retaining walls?',
        answer: 'Yes! Many interlocking block systems are designed for curves and radius walls. Curved walls often look more natural and can be stronger than straight walls. We can create custom curves to match your landscape vision.'
      }
    ],
    relatedServices: ['patio-installation', 'landscape-design', 'french-drain-installation', 'terraced-gardens'],
    pricingGuidance: 'Retaining walls: $35-75 per square foot for concrete blocks, $75-150/sq ft for natural stone. A typical 3-foot-high, 20-foot-long wall runs $2,500-5,000. Taller walls cost more due to engineering requirements.',
    seasonality: 'April through October. Cannot pour concrete bases or work frozen ground in winter. Spring-summer is ideal for completion before fall.'
  },
  {
    slug: 'fire-pit-installation',
    name: 'Fire Pit Installation',
    category: 'landscaping-fire',
    shortDescription: 'Custom fire pit design and installation for outdoor entertainment and year-round enjoyment',
    longDescription: 'A fire pit transforms your backyard into an inviting gathering space for family and friends. Our professional fire pit installation service creates custom outdoor fire features using your choice of materials - from rustic stone to modern gas-powered designs. We handle complete installation including proper location selection, gas line running (for gas pits), fire-safe construction, surrounding seating areas, and compliance with local fire codes. Enjoy Idaho evenings around a beautiful, safely-built fire feature that adds both function and value to your property.',
    benefits: [
      'Creates focal point for outdoor entertainment',
      'Extends outdoor living season into cool evenings',
      'Adds significant property value and appeal',
      'Available in wood-burning or convenient gas options',
      'Custom designs match your landscape style',
      'Built to local fire codes and safety standards',
      'Includes surrounding patio or seating area options',
      'Professional gas line installation (licensed and permitted)'
    ],
    process: [
      { step: 1, title: 'Design Consultation & Site Selection', description: 'We discuss your vision, budget, and usage. Site is selected considering safety distances from structures, prevailing winds, and integration with existing landscape features.' },
      { step: 2, title: 'Material Selection', description: 'Choose from natural stone, concrete block, poured concrete, or prefabricated steel fire pits. Select wood-burning (traditional) or gas-powered (convenient) fuel type.' },
      { step: 3, title: 'Excavation & Base Prep', description: 'Area is excavated and leveled. Gravel base is installed for drainage and stability. Gas lines are trenched and installed if building gas fire pit.' },
      { step: 4, title: 'Fire Pit Construction', description: 'Fire pit is built using fire-rated materials and proper construction techniques. Fire ring or burner is installed. Gas connections are made and tested for leaks.' },
      { step: 5, title: 'Surrounding Area Completion', description: 'Seating walls, patio area, or gravel surround is installed as designed. Landscape integration ensures fire pit feels like a natural part of your yard.' },
      { step: 6, title: 'Final Inspection & Instructions', description: 'Final inspection ensures proper operation and safety. We provide operation instructions, safety guidelines, and maintenance recommendations.' }
    ],
    faqs: [
      {
        question: 'Wood-burning or gas - which is better?',
        answer: 'Wood-burning offers authentic campfire experience, crackling sounds, and traditional appeal but requires wood storage and ash cleanup. Gas fire pits offer instant on/off control, consistent flame, no smoke, and zero cleanup but cost more upfront and require gas line installation. Most clients choose based on priority: ambiance (wood) or convenience (gas).'
      },
      {
        question: 'Do I need a permit for a fire pit?',
        answer: 'Requirements vary by city. Permanent built-in fire pits usually require permits in Idaho cities. Gas line installation requires licensed plumber and permit. Portable fire pits typically don\'t need permits. We handle all permitting as part of installation.'
      },
      {
        question: 'How far from my house should a fire pit be?',
        answer: 'Most codes require 10-25 feet from structures depending on fire pit type and local regulations. We select locations that meet code, avoid smoke problems, and integrate well with your landscape and seating areas.'
      },
      {
        question: 'Can you convert an existing fire pit to gas?',
        answer: 'Yes! We can retrofit wood-burning fire pits with gas burners. This involves running gas line, installing burner and controls, and adding fire glass or lava rock. It\'s a popular upgrade that adds convenience while maintaining your existing hardscape.'
      },
      {
        question: 'What materials work best in Idaho winters?',
        answer: 'Natural stone and quality concrete products handle freeze-thaw cycles best. We build with proper drainage to prevent water accumulation that causes cracking. Fire-rated materials ensure safety and longevity. Avoid cheap pavers or bricks not rated for fire exposure.'
      }
    ],
    relatedServices: ['patio-installation', 'outdoor-fireplace', 'landscape-lighting', 'seating-walls'],
    pricingGuidance: 'Fire pits: $2,500-6,000 for basic wood-burning stone pits. Gas fire pits: $4,000-10,000+ including gas line. Elaborate custom designs with seating walls and patios: $10,000-25,000+. Free design consultations.',
    seasonality: 'Installed April through October. High demand in spring for summer completion. Gas line work must be done before ground freezes.'
  },
  {
    slug: 'landscape-lighting',
    name: 'Landscape Lighting',
    category: 'landscaping-lighting',
    shortDescription: 'Professional landscape lighting design and installation for beauty, safety, and security',
    longDescription: 'Professional landscape lighting transforms your property after dark, highlighting architectural features, illuminating walkways for safety, and creating dramatic nighttime appeal. Our landscape lighting service includes custom design, quality LED fixtures, professional installation with concealed wiring, and transformer setup. We use low-voltage systems that are energy-efficient, safe, and easily expandable. Properly designed landscape lighting enhances security, extends outdoor living hours, and showcases your investment in landscaping 24/7.',
    benefits: [
      'Dramatic nighttime curb appeal and beauty',
      'Enhanced security through strategic illumination',
      'Safe navigation of walkways and stairs',
      'Highlights landscape features and architecture',
      'Extends outdoor living into evening hours',
      'Energy-efficient LED fixtures (low operating cost)',
      'Increases property value significantly',
      'Professional design creates balanced lighting'
    ],
    process: [
      { step: 1, title: 'Nighttime Design Consultation', description: 'We meet after dark to discuss your goals and vision. We identify features to highlight: trees, walkways, architecture, water features, and seating areas.' },
      { step: 2, title: 'Custom Lighting Plan', description: 'We create a lighting plan showing fixture locations, types, and beam angles. Design balances aesthetics, functionality, and budget while avoiding over-lighting.' },
      { step: 3, title: 'Fixture Selection', description: 'You choose from quality LED fixtures in various styles: path lights, spotlights, well lights, and specialty fixtures. We recommend fixtures appropriate for each application.' },
      { step: 4, title: 'Installation & Wiring', description: 'Low-voltage transformer is installed and wired. Fixtures are positioned and wired with buried cable. All connections are waterproofed and protected.' },
      { step: 5, title: 'Aiming & Adjustment', description: 'Each fixture is carefully aimed to achieve the designed effect. Brightness levels are adjusted for perfect balance. Wiring is concealed and landscape is restored.' },
      { step: 6, title: 'Timer Programming & Training', description: 'Automatic timer or smart controls are programmed. You receive operation training and maintenance guidance.' }
    ],
    faqs: [
      {
        question: 'LED vs. halogen landscape lights - which is better?',
        answer: 'LED is superior in every way: 75% less energy use, 25-year lifespan (vs. 2 years for halogen), cooler operation, and better light quality. LEDs cost more initially but save significantly over time. We exclusively install LED systems.'
      },
      {
        question: 'How much does landscape lighting cost?',
        answer: 'Typical residential systems: $2,500-7,500 for 12-20 fixtures covering front yard, walkways, and key features. Larger estates: $10,000-25,000+. Monthly operating cost with LED: $3-8 depending on hours used. ROI is immediate through increased security and enjoyment.'
      },
      {
        question: 'Can I add more lights later?',
        answer: 'Yes! We size transformers with expansion capacity. Low-voltage systems are easy to expand - we can add fixtures anytime without major rewiring. This allows phased installation as budget allows.'
      },
      {
        question: 'Do landscape lights work in winter?',
        answer: 'Yes, quality LED fixtures work perfectly in Idaho winters. We bury wiring below frost line. Snow may cover some low fixtures but lights still illuminate. Many clients enjoy landscape lighting even more in winter months.'
      },
      {
        question: 'What maintenance do landscape lights need?',
        answer: 'Minimal maintenance required. Clean fixture lenses annually. Trim plants that grow to block lights. Adjust aims as plants mature. LED bulbs last 15-25 years - you may never replace them. We offer maintenance packages for worry-free operation.'
      }
    ],
    relatedServices: ['patio-installation', 'pathway-lighting', 'security-lighting', 'landscape-design'],
    pricingGuidance: 'Professional landscape lighting: $150-400 per fixture installed. Typical systems: $2,500-7,500. Includes design, quality LED fixtures, installation, transformer, timer/controls. Free design consultations.',
    seasonality: 'Installed year-round. Spring and fall are most popular. Installation easier when ground is soft. Winter installations possible but may cost more.'
  },
  {
    slug: 'sprinkler-system-installation',
    name: 'Sprinkler System Installation',
    category: 'landscaping-irrigation',
    shortDescription: 'Professional sprinkler system design and installation for automated lawn and landscape watering',
    longDescription: 'A professionally designed sprinkler system saves water, time, and money while ensuring your lawn and landscape stay healthy and green. Our irrigation installation service includes custom system design, quality components (Rain Bird, Hunter, or Toro), proper zone layout for coverage, underground installation, controller programming, and startup. We design systems for Idaho\'s climate considering water pressure, coverage needs, plant types, and future expansion. A quality irrigation system is one of the best investments you can make in your landscape.',
    benefits: [
      'Automated watering saves hours every week',
      'Precise water delivery reduces waste by 30-50%',
      'Consistent watering produces healthier, greener lawns',
      'Smart controllers adjust for weather automatically',
      'Increases property value significantly',
      'Separate zones for lawns, shrubs, and gardens',
      'Morning watering schedules reduce disease',
      'ROI through water savings and lawn health'
    ],
    process: [
      { step: 1, title: 'Design Consultation & Site Survey', description: 'We measure your property, note sun/shade areas, identify plant zones, check water pressure and flow rate, and discuss your watering goals and budget.' },
      { step: 2, title: 'Custom System Design', description: 'We create a detailed irrigation plan showing head locations, zones, pipe routing, and controller location. Design ensures proper coverage and water pressure throughout.' },
      { step: 3, title: 'Trenching & Pipe Installation', description: 'Trenches (6-8 inches deep) are cut for mainline and lateral pipes. PVC pipe is installed and glued. Backflow preventer is installed per code requirements.' },
      { step: 4, title: 'Sprinkler Head Installation', description: 'Spray heads, rotors, and drip irrigation are installed per design. Each zone is tested for coverage and pressure. Adjustments ensure uniform water distribution.' },
      { step: 5, title: 'Controller Installation & Programming', description: 'Irrigation controller is installed and wired to valves. System is programmed with appropriate run times and schedule for each zone based on plant needs.' },
      { step: 6, title: 'System Testing & Landscape Restoration', description: 'Complete system test ensures all zones function properly. Trenches are backfilled and landscape is restored. You receive operation training and zone map.' }
    ],
    faqs: [
      {
        question: 'How much does a sprinkler system cost?',
        answer: 'Typical residential systems: $2,500-5,000 for quarter-acre lots. Half-acre: $4,000-7,000. Cost varies with property size, zones needed, and features like smart controllers. A quality system pays for itself in 5-10 years through water savings and lawn health.'
      },
      {
        question: 'What is a smart sprinkler controller?',
        answer: 'Smart controllers (like Rachio or Rain Bird WiFi) use local weather data to automatically adjust watering. They skip cycles when it rains, reduce watering in cool weather, and can be controlled via smartphone. They save 30-50% more water than standard timers and often qualify for utility rebates.'
      },
      {
        question: 'How long does installation take?',
        answer: 'Typical residential installations: 2-4 days depending on property size and complexity. We complete all work including trenching, installation, testing, and restoration. Lawn trenches heal in 2-3 weeks with proper watering.'
      },
      {
        question: 'Can you install a system in an existing lawn?',
        answer: 'Absolutely! Most installations are in existing landscapes. We use specialized trenching equipment that minimizes lawn damage. Trenches are narrow (1-2 inches) and heal quickly. The benefits far outweigh temporary installation impact.'
      },
      {
        question: 'Do I still need to water manually?',
        answer: 'Not once the system is installed and programmed! The controller automatically waters on your chosen schedule. You may want to adjust seasonally or for weather events, but day-to-day watering is fully automated.'
      }
    ],
    relatedServices: ['irrigation-maintenance', 'sprinkler-blowout', 'smart-controller-upgrade', 'drip-irrigation'],
    pricingGuidance: 'Sprinkler system installation: $2,500-7,000 for most residential properties depending on size and zones. Smart controller upgrades add $200-400. Free design consultations and accurate quotes.',
    seasonality: 'Installed April through October. Spring installation (March-May) most popular for summer use. Fall installation possible if completed before freeze.'
  },
  {
    slug: 'irrigation-repair',
    name: 'Sprinkler System Repair',
    category: 'landscaping-irrigation',
    shortDescription: 'Fast, professional sprinkler repair for broken heads, leaking valves, and irrigation system problems',
    longDescription: 'Irrigation problems waste water, kill grass, and cost money every day they go unfixed. Our sprinkler repair service quickly diagnoses and fixes all irrigation issues: broken sprinkler heads, leaking valves, cut pipes, controller malfunctions, and poor coverage. We repair all major brands (Rain Bird, Hunter, Toro, Orbit) and offer emergency service for major leaks. Most repairs are completed same-day so your system is running efficiently again immediately. Don\'t let sprinkler problems damage your lawn or waste hundreds of gallons - call for professional repair.',
    benefits: [
      'Fast diagnosis and same-day repairs',
      'Stops water waste saving money immediately',
      'Prevents brown spots and overwatered areas',
      'Expert repair of all irrigation brands',
      'Warranty on parts and labor',
      'Emergency service available for major leaks',
      'System optimization while onsite',
      'Much less expensive than system replacement'
    ],
    process: [
      { step: 1, title: 'Problem Diagnosis', description: 'We run your system zone-by-zone to identify all issues: broken heads, leaks, valve problems, coverage gaps, controller errors, and pressure issues.' },
      { step: 2, title: 'Repair Recommendation', description: 'We explain all problems found and provide upfront pricing for repairs. You approve work before we proceed. For complex issues, we offer multiple solution options.' },
      { step: 3, title: 'Component Replacement', description: 'Broken sprinkler heads, valves, or pipe sections are replaced with quality parts. We stock common parts on our trucks for immediate repair.' },
      { step: 4, title: 'System Adjustments', description: 'Sprinkler heads are adjusted for proper coverage. Run times are reviewed and optimized. Any additional issues are addressed.' },
      { step: 5, title: 'Complete System Test', description: 'Entire system is run through to verify all repairs function properly. We check for any remaining leaks or coverage problems.' },
      { step: 6, title: 'Maintenance Recommendations', description: 'We provide guidance on preventing future problems and recommend any long-term improvements to enhance system performance.' }
    ],
    faqs: [
      {
        question: 'What are signs I need sprinkler repair?',
        answer: 'Common signs: brown spots in lawn, soggy/flooded areas, hissing sounds, visible geysers or spraying water, sprinklers not popping up, controller errors, unusually high water bills, or uneven coverage. If you notice any of these, schedule a repair inspection.'
      },
      {
        question: 'How much do sprinkler repairs cost?',
        answer: 'Service call: $75-125 includes diagnosis and minor adjustments. Replacing 1-5 sprinkler heads: $100-250. Valve replacement: $150-300. Major repairs (mainline breaks): $300-800. We provide upfront pricing before proceeding with any repair.'
      },
      {
        question: 'Can you find underground leaks?',
        answer: 'Yes! We locate underground leaks by monitoring water flow, checking for soggy areas, and using pressure testing. Once located, we excavate minimally to access and repair the leak. Most underground repairs are completed same-day.'
      },
      {
        question: 'Do you service all sprinkler brands?',
        answer: 'We repair all major brands: Rain Bird, Hunter, Toro, Orbit, Irritrol, and generic systems. We stock common parts and can source specialty components within 1-2 days for unusual brands.'
      },
      {
        question: 'Should I repair or replace my old system?',
        answer: 'If your system needs one or two repairs, fix it. If you\'re having multiple problems every season and the system is 20+ years old, replacement may be more economical long-term. We provide honest recommendations based on system condition.'
      }
    ],
    relatedServices: ['sprinkler-blowout', 'irrigation-maintenance', 'sprinkler-system-installation', 'smart-controller-upgrade'],
    pricingGuidance: 'Service call: $75-125. Head replacement: $15-25 each. Valve repair: $150-300. Pipe repairs: $100-400 depending on location and length. Emergency service available.',
    seasonality: 'Repairs needed April through October (operating season). Highest demand May-July when problems are discovered. Emergency service available for major leaks.'
  },
  {
    slug: 'irrigation-maintenance',
    name: 'Irrigation System Maintenance',
    category: 'landscaping-irrigation',
    shortDescription: 'Seasonal sprinkler system maintenance to optimize performance and prevent costly breakdowns',
    longDescription: 'Regular irrigation maintenance ensures your sprinkler system runs efficiently, saving water and money while protecting your landscape investment. Our comprehensive irrigation maintenance service includes spring startup, mid-season checkup, and fall winterization. We inspect all components, adjust heads for optimal coverage, replace worn parts, program controllers for seasonal needs, and identify problems before they become expensive repairs. Proper maintenance extends system life, prevents water waste, and ensures a healthy, green lawn all season.',
    benefits: [
      'Prevents expensive repairs through early problem detection',
      'Optimizes water efficiency reducing bills by 20-40%',
      'Ensures uniform coverage for healthier lawn',
      'Extends irrigation system lifespan by years',
      'Seasonal programming adjustments save water',
      'Peace of mind knowing system is professionally maintained',
      'Priority service for plan members',
      'Comprehensive service covers all system needs'
    ],
    process: [
      { step: 1, title: 'Spring Startup (March-April)', description: 'System is turned on and checked for winter damage. All zones are tested, heads are adjusted, and controller is programmed for spring watering needs.' },
      { step: 2, title: 'Complete System Inspection', description: 'Every sprinkler head, valve, pipe connection, and controller function is inspected. Leaks, broken heads, and coverage problems are identified and repaired.' },
      { step: 3, title: 'Component Replacement', description: 'Worn or damaged parts are replaced: broken heads, clogged nozzles, faulty valves, damaged wiring. We stock common parts for immediate replacement.' },
      { step: 4, title: 'Coverage Optimization', description: 'Each sprinkler head is cleaned, adjusted, and tested for proper coverage. We ensure uniform water distribution across all zones eliminating dry or overwatered spots.' },
      { step: 5, title: 'Controller Programming', description: 'Run times are optimized for current season, weather, and plant needs. Smart controller features are utilized for maximum efficiency.' },
      { step: 6, title: 'Detailed Service Report', description: 'You receive a report documenting all work performed, parts replaced, and any recommendations for future improvements or budget planning.' }
    ],
    faqs: [
      {
        question: 'How often should my irrigation system be serviced?',
        answer: 'Minimum: spring startup and fall winterization annually. Optimal: add mid-season checkup (July) to catch problems early and optimize for peak water season. Commercial properties benefit from monthly monitoring during irrigation season.'
      },
      {
        question: 'What\'s included in irrigation maintenance?',
        answer: 'Complete system inspection, sprinkler head adjustment and replacement (up to 5 heads), minor repairs, controller programming, backflow testing, system optimization, and detailed service report. Major repairs quoted separately.'
      },
      {
        question: 'Do you offer maintenance plans?',
        answer: 'Yes! Annual maintenance plans include spring startup, mid-season checkup, fall winterization, priority emergency service, and discounts on repairs. Plans cost $300-500 annually (saves money vs. paying per service) and ensure your system is always in top condition.'
      },
      {
        question: 'Can maintenance prevent all repairs?',
        answer: 'Not entirely - accidents (lawnmowers hitting heads) and age-related wear still occur. However, regular maintenance catches 70-80% of problems before they become expensive repairs and extends system life significantly.'
      },
      {
        question: 'When should I schedule spring startup?',
        answer: 'March-April in Idaho, after last freeze but before you need regular watering. We get very busy in April - schedule in March for best timing. Fall winterization should be completed by late October.'
      }
    ],
    relatedServices: ['sprinkler-blowout', 'irrigation-repair', 'smart-controller-upgrade', 'sprinkler-system-installation'],
    pricingGuidance: 'Individual services: Spring startup $100-150, Mid-season checkup $75-125, Fall winterization $75-125. Annual maintenance plans: $300-500 covering all seasonal services.',
    seasonality: 'Spring startup (March-April), Mid-season service (June-July), Fall winterization (October). Plan members get priority scheduling.'
  },
  {
    slug: 'tree-trimming',
    name: 'Tree Trimming & Pruning',
    category: 'landscaping-specialty',
    shortDescription: 'Professional tree trimming and pruning services for health, safety, and aesthetic enhancement',
    longDescription: 'Proper tree trimming enhances tree health, improves safety, and maintains the beauty of your landscape. Our certified arborists provide expert tree trimming and pruning services including deadwood removal, canopy thinning, crown reduction, clearance pruning, and structural correction. We use proper pruning techniques that promote healthy growth while maintaining natural tree form. Whether you need routine maintenance, storm damage cleanup, or major tree reshaping, our experienced team delivers professional results that protect your investment in mature trees.',
    benefits: [
      'Removes dead, diseased, and hazardous branches',
      'Improves tree health and longevity',
      'Enhances property safety and reduces liability',
      'Maintains natural tree shape and beauty',
      'Prevents branches from touching roof or power lines',
      'Allows better light penetration to lawn below',
      'Reduces wind resistance preventing storm damage',
      'Certified arborists ensure proper technique'
    ],
    process: [
      { step: 1, title: 'Tree Assessment', description: 'Our arborist evaluates tree health, structure, and hazards. We discuss your goals: safety clearance, view enhancement, health improvement, or aesthetic shaping.' },
      { step: 2, title: 'Pruning Plan Development', description: 'We create a pruning strategy appropriate for tree species, age, and condition. Plan includes which branches to remove and proper pruning points to promote healthy regrowth.' },
      { step: 3, title: 'Safe Tree Access', description: 'Our climbers safely access the tree using ropes and harnesses (bucket trucks for accessible trees). All safety protocols and equipment are OSHA-compliant.' },
      { step: 4, title: 'Precision Pruning', description: 'Branches are pruned using proper three-cut technique to prevent bark tearing. Cuts are made at branch collar for optimal healing. We never top trees or leave ugly stubs.' },
      { step: 5, title: 'Branch Removal & Cleanup', description: 'All cut branches are removed from your property. Large wood can be cut into firewood rounds if desired. Smaller branches are chipped or hauled away.' },
      { step: 6, title: 'Final Inspection & Care Advice', description: 'Final walk-through ensures all work meets standards. We provide guidance on tree care, watering, and timing for next service.' }
    ],
    faqs: [
      {
        question: 'When is the best time to trim trees in Idaho?',
        answer: 'Late winter to early spring (February-April) is ideal for most trees - trees are dormant and disease/pest risk is lowest. Summer pruning is okay for light trimming. Avoid fall pruning as it stimulates growth that won\'t harden before winter. Deadwood can be removed anytime.'
      },
      {
        question: 'How much does tree trimming cost?',
        answer: 'Small trees (under 25 ft): $150-400. Medium trees (25-50 ft): $400-900. Large trees (50+ ft): $900-2000+. Cost depends on tree size, access difficulty, and amount of trimming needed. We provide free estimates with no obligation.'
      },
      {
        question: 'Will trimming damage my tree?',
        answer: 'Not when done properly! Our certified arborists use correct techniques that promote healing and healthy growth. We never remove more than 25% of canopy in one season and make cuts at proper locations. Poor pruning (like topping) causes permanent damage - proper pruning enhances health.'
      },
      {
        question: 'Can you trim trees near power lines?',
        answer: 'For utility company power lines, contact your utility - they provide free trimming near their lines. For private service lines to your house, we can safely trim with proper clearances and techniques. Safety is always our top priority.'
      },
      {
        question: 'Do you remove trees or just trim them?',
        answer: 'We offer both services. Trimming maintains healthy trees. Removal is recommended for dead, dying, hazardous, or unwanted trees. During our assessment, we advise whether trimming or removal is the better option for each tree.'
      }
    ],
    relatedServices: ['tree-removal', 'stump-grinding', 'hedge-trimming', 'storm-damage-cleanup'],
    pricingGuidance: 'Tree trimming: $150-2000+ depending on size and scope. Average residential service: $400-700. Volume discounts for multiple trees. Emergency storm damage service available.',
    seasonality: 'Best: Late winter to early spring (February-April). Available year-round except during severe weather. High demand in spring and after summer storms.'
  },
  {
    slug: 'lawn-edging',
    name: 'Lawn Edging & Bed Borders',
    category: 'lawn-care',
    shortDescription: 'Professional lawn edging and bed border installation for crisp, defined landscape lines',
    longDescription: 'Clean, defined edges between lawn and flower beds dramatically improve your landscape\'s appearance and make maintenance easier. Our professional edging service includes bed redefinition, installation of permanent edging materials (steel, plastic, stone, or brick), and creation of crisp borders that prevent grass invasion into beds. Proper edging provides a polished, professional look while creating a barrier that keeps mulch in place and grass out of beds. It\'s one of the highest-impact improvements you can make for relatively low cost.',
    benefits: [
      'Creates crisp, professional landscape definition',
      'Prevents grass from invading flower beds',
      'Keeps mulch and soil contained in beds',
      'Makes mowing and trimming much easier',
      'Reduces landscape maintenance time significantly',
      'Enhances overall property appearance instantly',
      'Permanent edging lasts 15-30 years',
      'Adds visual structure to landscape design'
    ],
    process: [
      { step: 1, title: 'Bed Layout & Design', description: 'We assess existing beds and discuss desired edge style. New bed lines can be created for better flow and proportion. Design considers mowing patterns and plant spacing.' },
      { step: 2, title: 'Edge Trenching', description: 'Using power edgers or trenching tools, we cut clean trenches along bed lines. Depth and width are appropriate for chosen edging material (typically 4-6 inches deep).' },
      { step: 3, title: 'Edging Material Installation', description: 'Your chosen edging is installed: steel landscape edging (sleek, modern), plastic border (economical), stone/brick (traditional), or natural edge (budget option). Material is secured and leveled.' },
      { step: 4, title: 'Backfilling & Compaction', description: 'Soil is backfilled against edging and compacted. Inside edges are cleaned to create sharp definition. Excess soil is removed or spread evenly.' },
      { step: 5, title: 'Bed Preparation', description: 'Beds are weeded, existing mulch is fluffed or refreshed. Edging creates perfect boundary for new mulch installation if desired.' },
      { step: 6, title: 'Final Cleanup & Detailing', description: 'All debris is removed. Edges are blown clean. Final inspection ensures all lines are crisp and uniform. Result is a dramatically improved landscape appearance.' }
    ],
    faqs: [
      {
        question: 'What type of edging material is best?',
        answer: 'Steel landscape edging is most popular - sleek, permanent, and creates the cleanest lines (lasts 25-30 years). Plastic is economical but less durable (8-12 years). Stone or brick gives traditional look but costs more. Natural cut edge (no material) is cheapest but requires regular maintenance. We recommend based on your budget and aesthetic preference.'
      },
      {
        question: 'How much does lawn edging cost?',
        answer: 'Natural cut edging: $2-4 per linear foot. Plastic edging: $3-6 per foot. Steel landscape edging: $6-12 per foot. Stone/brick: $8-18 per foot. Most properties need 50-150 feet of edging. A complete front yard typically runs $300-1,200 depending on material.'
      },
      {
        question: 'How long does edging last?',
        answer: 'Steel edging: 25-30 years. Quality plastic: 8-15 years. Stone/brick: 20-40 years. Natural cut edge needs redefining every 1-2 years. Installation quality significantly affects longevity - professional installation lasts much longer than DIY.'
      },
      {
        question: 'Can you create new bed lines or just follow existing ones?',
        answer: 'We can do both! Many clients want to redesign bed shapes for better proportion and flow. We can create sweeping curves, straight lines, or geometric patterns. Good bed design makes your landscape look much more expensive than it is.'
      },
      {
        question: 'Does edging prevent all grass from getting into beds?',
        answer: 'Permanent edging (steel, plastic, stone) blocks 95% of grass invasion when properly installed. Some grass seed may still blow in but maintenance is drastically reduced. Natural cut edges need regular redefining to maintain the barrier.'
      }
    ],
    relatedServices: ['mulch-installation', 'bed-preparation', 'landscape-design', 'seasonal-cleanup'],
    pricingGuidance: 'Lawn edging installation: $2-18 per linear foot depending on material. Average front yard: $300-1,200. Free quotes with material recommendations based on budget.',
    seasonality: 'Installed April through October when ground is workable. Spring (April-May) is most popular for combination with mulch installation. Fall installation also common.'
  },
  {
    slug: 'christmas-light-installation',
    name: 'Christmas Light Installation',
    category: 'christmas-lights',
    shortDescription: 'Professional Christmas light installation and removal service for homes and businesses',
    longDescription: 'Transform your property into a winter wonderland with our professional Christmas light installation service. We handle everything from design through takedown, so you can enjoy the holidays without the hassle, danger, and frustration of DIY installation. Our experienced crews safely install premium LED lights on rooflines, trees, walkways, and landscape features. We provide all equipment, lights, and extension cords, and return after the holidays to carefully remove and store everything.',
    benefits: [
      'Professional design creates stunning displays',
      'Eliminates ladder danger and roof safety risks',
      'Premium commercial-grade LED lights provided',
      'Installation and removal both included',
      'Saves 8-12 hours of your holiday time',
      'Lights tested before installation',
      'Storm damage repair included',
      'Optional storage service available'
    ],
    process: [
      { step: 1, title: 'Design Consultation', description: 'We discuss your vision and budget. We assess your home to create a custom design that highlights your property\'s best features.' },
      { step: 2, title: 'Lighting Plan & Quote', description: 'We provide a detailed plan showing light placement and colors. Free quote includes installation, removal, and all materials.' },
      { step: 3, title: 'Professional Installation', description: 'Our insured crews safely install lights using commercial clips that don\'t damage siding. All lights are tested before installation.' },
      { step: 4, title: 'Mid-Season Service', description: 'We monitor your display and provide complimentary mid-season service if needed (repair damage, replace bulbs, fix timers).' },
      { step: 5, title: 'Post-Holiday Removal', description: 'After the holidays, we carefully remove all lights and clips. Your property is left clean and damage-free.' },
      { step: 6, title: 'Storage & Next Season', description: 'Lights are professionally stored for next year (storage fee applies) or returned to you in organized bins.' }
    ],
    faqs: [
      {
        question: 'When should I schedule Christmas light installation?',
        answer: 'We install Thanksgiving week through mid-December. Book in October for best availability - prime weeks book up fast!'
      },
      {
        question: 'How much does professional Christmas light installation cost?',
        answer: 'Typical homes: $400-1,200. Larger homes or elaborate designs: $1,200-3,500+. Cost includes equipment, lights, installation, mid-season service, and removal.'
      },
      {
        question: 'Do I need to provide the lights?',
        answer: 'No! We provide all lights, extension cords, clips, and equipment. We use commercial-grade LED lights that last 50,000+ hours.'
      },
      {
        question: 'What if lights go out during the season?',
        answer: 'We include complimentary mid-season service. If bulbs burn out or Idaho winds cause damage, just call and we\'ll fix it at no charge.'
      },
      {
        question: 'Do you take the lights down after Christmas?',
        answer: 'Yes! Removal is included. We typically remove lights in January. Everything is carefully removed and your property is left clean.'
      }
    ],
    relatedServices: ['landscape-lighting', 'outdoor-lighting', 'holiday-decor'],
    pricingGuidance: 'Residential: $400-1,200 typical. Larger homes: $1,200-3,500+. Includes installation, lights, removal, mid-season service. Storage: +$75-150/year.',
    seasonality: 'Installation: November-December (book in October). Removal: January. High demand - early booking essential.'
  },
  {
    slug: 'lawn-renovation',
    name: 'Lawn Renovation',
    category: 'lawn-care',
    shortDescription: 'Complete lawn renovation service to transform tired, thin lawns into thick, healthy turf',
    longDescription: 'If your lawn is more weeds than grass, full lawn renovation is the answer. Our comprehensive renovation service completely rebuilds your lawn without the expense of sod replacement. The process includes aggressive dethatching, core aeration, premium overseeding, starter fertilizer, and compost top-dressing. This intensive treatment gives you a lawn that looks like new sod at a fraction of the cost. Within 6-8 weeks, you\'ll have a thick, lush lawn that\'s the envy of the neighborhood.',
    benefits: [
      'Transforms weed-infested lawns into thick turf',
      'Much less expensive than sod replacement',
      'Introduces disease-resistant grass varieties',
      'Improves soil quality for long-term health',
      'Results in thicker, greener lawn',
      'Reduces future weed pressure dramatically',
      'Minimal disruption compared to replacement',
      'Long-term solution vs. temporary fixes'
    ],
    process: [
      { step: 1, title: 'Lawn Assessment & Plan', description: 'We evaluate lawn condition, soil quality, grass types, and problem areas. Custom plan addresses your specific issues.' },
      { step: 2, title: 'Aggressive Dethatching', description: 'Heavy power raking removes thatch, dead grass, and much of the existing poor-quality turf. Creates perfect seedbed.' },
      { step: 3, title: 'Core Aeration', description: 'Multiple aeration passes relieve severe compaction. Soil cores provide perfect pockets for seed germination.' },
      { step: 4, title: 'Premium Overseeding', description: 'High-quality grass seed (selected for Idaho climate) is broadcast at heavy rate (8-10 lbs per 1000 sq ft).' },
      { step: 5, title: 'Soil Amendment & Fertilizer', description: 'Compost top-dressing improves soil structure. Starter fertilizer promotes rapid root development.' },
      { step: 6, title: 'Watering Plan & Follow-Up', description: 'Detailed watering schedule provided. We check back at 2-3 weeks to assess germination and address concerns.' }
    ],
    faqs: [
      {
        question: 'How is lawn renovation different from overseeding?',
        answer: 'Renovation is much more aggressive. We remove much of the old grass through dethatching, heavily aerate, seed at triple the normal rate, and amend soil. It\'s a complete transformation vs. simple improvement.'
      },
      {
        question: 'When should I renovate my lawn in Idaho?',
        answer: 'Fall (late August through mid-September) is ideal. Warm soil, cooler air, and fall moisture create perfect germination conditions. Spring works but competes with weeds.'
      },
      {
        question: 'How long until my lawn looks good?',
        answer: 'Visible germination: 7-14 days. Noticeable improvement: 3-4 weeks. Thick lawn: 6-8 weeks. Full maturity: Following spring. Results are dramatic - like getting a new lawn for half the cost of sod.'
      },
      {
        question: 'Can I walk on the lawn during recovery?',
        answer: 'Minimize traffic for first 3-4 weeks. Light foot traffic okay after 2 weeks. Avoid heavy use until grass reaches 3 inches (typically 4-6 weeks).'
      },
      {
        question: 'How much does renovation cost compared to new sod?',
        answer: 'Renovation: $0.40-0.75 per sq ft. New sod: $1.00-2.00 per sq ft. For 5,000 sq ft: Renovation = $2,000-3,750. Sod = $5,000-10,000. You save 50-70%.'
      }
    ],
    relatedServices: ['aeration', 'overseeding', 'dethatching', 'sod-installation'],
    pricingGuidance: 'Lawn renovation: $0.40-0.75 per sq ft. Typical 5,000 sq ft lawn: $2,000-3,750 all-in. Much less than sod replacement.',
    seasonality: 'Best: Late August to mid-September. Spring: April-May. Peak demand in fall - book by July for September service.'
  },
  {
    slug: 'tree-removal',
    name: 'Tree Removal',
    category: 'landscaping-specialty',
    shortDescription: 'Professional tree removal service for dead, dying, hazardous, or unwanted trees',
    longDescription: 'Professional tree removal is essential when trees become hazardous, diseased, or interfere with structures. Our certified arborists and experienced crews safely remove trees of any size using specialized equipment and industry-standard techniques. We handle everything from small ornamental trees to massive pines and cottonwoods. Complete cleanup and stump grinding available. Licensed, insured, and equipped to handle even the most challenging removals near buildings, power lines, and tight spaces.',
    benefits: [
      'Eliminates hazardous or dead trees safely',
      'Licensed and fully insured crews',
      'Specialized equipment for safe removal',
      'Complete cleanup and haul-away included',
      'Stump grinding available',
      'Protects structures and utility lines',
      'Fast emergency storm damage response',
      'Free estimates with no obligation'
    ],
    process: [
      { step: 1, title: 'Tree Assessment', description: 'Our arborist evaluates tree condition, hazards, and removal challenges. We assess proximity to structures, power lines, and plan safest removal approach.' },
      { step: 2, title: 'Removal Plan & Quote', description: 'We create detailed removal plan including equipment needs, crew size, and timeline. Free written estimate provided with no pressure.' },
      { step: 3, title: 'Site Preparation', description: 'Area is cleared and access routes established. Nearby plants and structures are protected. Safety perimeter is established.' },
      { step: 4, title: 'Tree Removal', description: 'Using ropes, harnesses, cranes, or bucket trucks as needed, tree is systematically dismantled from top down. Each piece is carefully lowered and removed.' },
      { step: 5, title: 'Cleanup & Disposal', description: 'All branches, trunk sections, and debris are removed from property. Wood can be cut into firewood if desired. Site is left clean.' },
      { step: 6, title: 'Stump Grinding (Optional)', description: 'If requested, stump is ground 6-12 inches below grade and wood chips removed or spread. Area is ready for replanting or sod.' }
    ],
    faqs: [
      {
        question: 'How much does tree removal cost?',
        answer: 'Small trees (under 30 ft): $300-800. Medium trees (30-60 ft): $800-2,000. Large trees (60+ ft): $2,000-5,000+. Factors: tree size, location difficulty, access, proximity to structures. We provide free estimates.'
      },
      {
        question: 'Do I need a permit to remove a tree?',
        answer: 'Most residential properties in Idaho don\'t require permits for tree removal on private property. However, some HOAs have restrictions and some cities have protected tree ordinances. We can advise on local requirements.'
      },
      {
        question: 'Can you remove a tree next to my house?',
        answer: 'Yes! We specialize in difficult removals near structures. Using ropes, rigging, and piece-by-piece dismantling, we can safely remove trees even in tight spaces without damaging your home.'
      },
      {
        question: 'What happens to the wood after removal?',
        answer: 'Standard service includes hauling everything away. However, if you want firewood, we can cut trunk into 16-inch rounds and stack them for you. Some woods make excellent firewood.'
      },
      {
        question: 'Do you offer emergency tree removal?',
        answer: 'Yes! We provide 24/7 emergency service for storm-damaged or fallen trees. We respond quickly to remove hazards and secure your property. Call anytime for emergency service.'
      }
    ],
    relatedServices: ['stump-grinding', 'tree-trimming', 'storm-damage-cleanup', 'emergency-tree-service'],
    pricingGuidance: 'Tree removal: $300-5,000+ depending on size and difficulty. Average: $1,200-1,800. Stump grinding: +$150-400. Emergency service: Premium rates apply.',
    seasonality: 'Year-round service. High demand after storms. Winter removal common (less landscaping damage). Book ahead for non-emergency work.'
  },
  {
    slug: 'stump-grinding',
    name: 'Stump Grinding & Removal',
    category: 'landscaping-specialty',
    shortDescription: 'Complete stump grinding and removal service to eliminate unsightly stumps from your landscape',
    longDescription: 'Stump grinding completely removes tree stumps by grinding them 6-12 inches below ground level, eliminating trip hazards and freeing up space for landscaping. Our professional stump grinders handle stumps of any size, from small shrubs to massive trees. Wood chips are removed or can be left as mulch. The ground area becomes ready for sod, planting, or hardscaping. Much faster and less disruptive than traditional stump removal.',
    benefits: [
      'Eliminates unsightly stumps completely',
      'Removes trip hazards and safety concerns',
      'Frees space for lawns or new plantings',
      'Prevents regrowth and suckers',
      'Much less expensive than excavation',
      'Minimal landscape disruption',
      'Wood chips removed or recycled as mulch',
      'Same-day service often available'
    ],
    process: [
      { step: 1, title: 'Stump Assessment', description: 'We measure stump diameter and assess access. Identify underground utilities and plan grinding approach to avoid damage.' },
      { step: 2, title: 'Site Preparation', description: 'Clear area around stump of rocks, metal, and debris that could damage grinder. Mark underground lines if present nearby.' },
      { step: 3, title: 'Stump Grinding', description: 'Using commercial stump grinder, we grind stump 6-12 inches below grade. Roots in immediate area are also ground to prevent regrowth.' },
      { step: 4, title: 'Wood Chip Removal', description: 'Wood chips are raked up and removed (or spread in beds if desired as mulch). Grinding crater is backfilled with remaining chips and topsoil.' },
      { step: 5, title: 'Site Cleanup', description: 'Area is raked smooth and cleaned. Ready for immediate sod installation, seeding, or landscaping.' },
      { step: 6, title: 'Final Check', description: 'We ensure stump is completely below grade and area is level. Provide care instructions if replanting in the area.' }
    ],
    faqs: [
      {
        question: 'How much does stump grinding cost?',
        answer: 'Pricing is typically $3-8 per inch of stump diameter. Small stumps (12-20 inches): $150-250. Medium stumps (20-36 inches): $250-400. Large stumps (36+ inches): $400-800+. Multiple stumps often get discounted rates.'
      },
      {
        question: 'How deep do you grind stumps?',
        answer: 'Standard grinding is 6-12 inches below grade - deep enough to plant grass or install sod over. If you plan to build or install hardscaping, we can grind deeper (12-18 inches) for additional fee.'
      },
      {
        question: 'What do you do with the wood chips?',
        answer: 'We remove them as part of standard service. However, if you have flower beds, we can spread the chips there as free mulch. They make excellent mulch after composting for a few months.'
      },
      {
        question: 'Can you grind stumps near fences or buildings?',
        answer: 'Yes! Our grinders can work within inches of fences, foundations, and other obstacles. We have different sized grinders to access tight spaces and challenging locations.'
      },
      {
        question: 'Will grinding damage my lawn?',
        answer: 'We minimize lawn damage by using proper access routes and protecting turf with plywood when needed. Small grinders cause minimal disruption. Any minor damage is easily repaired when we fill and grade the area.'
      }
    ],
    relatedServices: ['tree-removal', 'sod-installation', 'landscape-design', 'lawn-renovation'],
    pricingGuidance: 'Stump grinding: $3-8 per inch diameter. Typical range: $150-400 per stump. Volume discounts for multiple stumps. Deep grinding (12-18 inches): premium pricing.',
    seasonality: 'Year-round service. Spring and fall most popular for combining with landscape projects. Frozen ground can complicate winter grinding.'
  }
];

// Export all services and cities for dynamic routing
export const ALL_SERVICES = PRIORITY_SERVICES;
export const ALL_CITIES = CITIES;

// Create lookup maps for O(1) access
export const SERVICE_SLUG_MAP = new Map(
  PRIORITY_SERVICES.map(service => [service.slug, service])
);

export const CITY_SLUG_MAP = new Map(
  CITIES.map(city => [city.slug, city])
);

// Helper function to get service by slug
export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICE_SLUG_MAP.get(slug);
}

// Helper function to get city by slug
export function getCityBySlug(slug: string): CityData | undefined {
  return CITY_SLUG_MAP.get(slug);
}

// Helper to get primary city slug (for canonical URLs)
export function getPrimaryCitySlug(): string {
  return 'kuna';
}

// Helper to validate service/city combination
export function getCityServiceCombo(serviceSlug: string, citySlug?: string): {
  service?: ServiceData;
  city?: CityData;
  isValid: boolean;
} {
  const service = getServiceBySlug(serviceSlug);
  const city = citySlug ? getCityBySlug(citySlug) : undefined;
  
  return {
    service,
    city,
    isValid: !!service && (!citySlug || !!city)
  };
}

// This will be expanded to include ALL 92+ services
// For now, we start with priority services and expand incrementally
