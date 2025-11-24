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
  facts?: Array<{label: string; value: string}>;
}

export interface CityData {
  slug: string;
  name: string;
  county: 'ada' | 'canyon'; // County for assessor routing
  isPrimary: boolean; // Kuna is primary
  population?: string;
  zipCodes?: string[];
  neighborhoods?: string[];
  extendedDescription?: string; // 250-300 word SEO-rich description for geo pages
  landmarks?: string[]; // Notable local landmarks
  serviceConsiderations?: string; // City-specific lawn care considerations
  localFactors: {
    climate: string;
    soil: string;
    commonNeeds: string[];
  };
  facts?: Array<{label: string; value: string}>;
}

// Cities we serve
export const CITIES: CityData[] = [
  {
    slug: 'kuna',
    name: 'Kuna',
    county: 'ada',
    isPrimary: true,
    population: '25,000+',
    zipCodes: ['83634'],
    neighborhoods: ['Teed Farms', 'Swan Falls', 'Crimson Point', 'Indian Creek'],
    extendedDescription: 'Kuna, Idaho, known as the "Gateway to the Birds of Prey" conservation area, is a rapidly growing community in Ada County just 20 minutes southwest of Boise. With a population exceeding 25,000 residents, Kuna has evolved from its agricultural roots into a thriving suburban city while maintaining its small-town charm and community values. The city\'s semi-arid high desert climate in USDA Zone 6a presents unique challenges for lawn care and landscaping. Hot, dry summers with temperatures regularly exceeding 95°F combined with cold winters that can drop below zero create demanding conditions for turf grass. The predominant clay soil throughout Kuna neighborhoods like Crimson Point, Indian Creek, and Teed Farms requires specialized lawn care approaches including regular aeration, proper soil amendments, and carefully managed irrigation to maintain healthy lawns. Kuna residents value well-maintained properties that enhance the city\'s growing reputation as one of the Treasure Valley\'s most desirable communities. Professional lawn care services in Kuna must understand the local soil composition, adjust maintenance schedules for our distinct growing season from April through October, and implement water-wise practices that account for our limited annual rainfall of just 10-12 inches. From the established neighborhoods near Kuna Caves to the newer developments along Black Cat Road, property owners throughout Kuna trust local lawn care professionals who understand the specific needs of our community.',
    landmarks: ['Kuna Caves', 'Swan Falls Dam', 'Indian Creek Plaza', 'Kuna Aquatic Center', 'Teed Winery', 'Birds of Prey National Conservation Area'],
    serviceConsiderations: 'Kuna\'s heavy clay soil requires annual core aeration in fall, bi-annual fertilization (spring and fall), and proper irrigation management during hot summers. Most lawns are Kentucky bluegrass that benefits from maintaining 3-3.5 inch height during peak summer heat. Fall is ideal for overseeding and renovation projects. Sprinkler systems should be winterized by early November before first hard freeze. New construction areas around Teed Farms and Indian Creek often have severely compacted soil requiring additional aeration and soil amendments.',
    localFactors: {
      climate: 'Semi-arid with cold winters and hot, dry summers. USDA Zone 6a.',
      soil: 'Predominantly clay soil requiring amendments for optimal lawn and plant growth.',
      commonNeeds: ['Clay soil management', 'Drought-resistant landscaping', 'Irrigation system maintenance', 'Winter freeze protection']
    },
    facts: [
      { label: 'Average lawn size', value: '5,000 sq. ft.' },
      { label: 'Recommended watering', value: '1-2 in. / wk' },
      { label: 'Recommended grass height', value: '2.5-3 in.' },
      { label: 'When to fertilize', value: 'spring / fall' },
      { label: 'When to aerate', value: 'fall' },
      { label: 'When to overseed', value: 'fall' },
      { label: 'When to blow out sprinklers', value: 'Oct / Nov' },
      { label: 'Growing season', value: 'April - October' }
    ]
  },
  {
    slug: 'boise',
    name: 'Boise',
    county: 'ada',
    isPrimary: false,
    population: '230,000+',
    zipCodes: ['83702', '83703', '83704', '83705', '83706', '83709', '83712', '83713', '83714', '83716'],
    neighborhoods: ['North End', 'Bench', 'Southwest Boise', 'Southeast Boise', 'Harris Ranch', 'Barber Valley'],
    extendedDescription: 'Boise, Idaho\'s capital and largest city with over 230,000 residents, is consistently ranked among America\'s most livable cities thanks to its outdoor recreation opportunities, growing economy, and high quality of life. The city\'s diverse neighborhoods each present unique lawn care and landscaping needs. Historic North End properties feature mature trees and established landscapes requiring careful maintenance, while newer developments in Harris Ranch and Barber Valley often need irrigation optimization and HOA-compliant landscaping solutions. Boise\'s four-season climate in USDA Zones 6b-7a challenges lawns with hot, dry summers where temperatures routinely reach 95-100°F and cold winters with occasional heavy snowfall. The Boise Bench area experiences particularly demanding conditions with intense summer heat and clay soil that requires regular aeration and proper drainage solutions. Downtown Boise commercial properties, from Grove Street restaurants to Capitol Boulevard offices, demand professional landscape maintenance that creates inviting outdoor spaces for employees and customers. The city\'s emphasis on water conservation through programs like the Garden ChallengeIdaho promotes xeriscaping and water-wise irrigation practices. Boise homeowners increasingly seek sustainable lawn care solutions that reduce water consumption while maintaining beautiful green spaces. Professional lawn care services in Boise must navigate varying soil conditions, comply with numerous HOA requirements across subdivisions, and adapt to microclimates created by the city\'s elevation changes from the valley floor to the foothills.',
    landmarks: ['Idaho State Capitol', 'Boise River Greenbelt', 'Table Rock', 'Hyde Park', 'Boise Depot', 'Julia Davis Park', 'Bogus Basin'],
    serviceConsiderations: 'Boise lawns require HOA compliance in most subdivisions. North End historic district properties need careful maintenance around mature trees. Bench area lawns suffer from compacted clay soil and benefit from annual core aeration. Harris Ranch and newer subdivisions require irrigation audits to optimize water usage. Commercial properties need flexible scheduling (early morning or weekend service) to avoid disrupting business operations. Fall aeration and overseeding critical for maintaining thick turf. Many properties benefit from water-wise landscaping to reduce irrigation costs.',
    localFactors: {
      climate: 'Four distinct seasons with hot summers (90-100°F) and cold winters (freezing). USDA Zone 6b-7a.',
      soil: 'Varied - clay-based in most areas, some areas with better drainage.',
      commonNeeds: ['HOA-compliant landscaping', 'Water-wise irrigation', 'Seasonal maintenance', 'Commercial property upkeep']
    },
    facts: [
      { label: 'Average lawn size', value: '6,000 sq. ft.' },
      { label: 'Recommended watering', value: '1-2 in. / wk' },
      { label: 'Recommended grass height', value: '2.5-3 in.' },
      { label: 'When to fertilize', value: 'spring / fall' },
      { label: 'When to aerate', value: 'fall' },
      { label: 'When to overseed', value: 'fall' },
      { label: 'When to blow out sprinklers', value: 'Oct / Nov' },
      { label: 'Growing season', value: 'April - October' }
    ]
  },
  {
    slug: 'meridian',
    name: 'Meridian',
    county: 'ada',
    isPrimary: false,
    population: '130,000+',
    zipCodes: ['83642', '83646'],
    neighborhoods: ['Meridian Ranch', 'Tuscany', 'Paramount', 'Lochsa Falls', 'Discovery Park'],
    extendedDescription: 'Meridian is Idaho\'s second-largest city with over 130,000 residents and one of the fastest-growing communities in the United States. Located in Ada County between Boise and Nampa, Meridian has transformed from agricultural land into a modern suburban city filled with new master-planned communities, excellent schools, and abundant shopping and dining options at The Village at Meridian. The city\'s explosive growth means thousands of newly constructed homes with fresh sod installations, young landscape plantings, and newly installed irrigation systems that require specialized care during establishment phases. Meridian\'s climate in USDA Zone 6b brings hot, dry summers perfect for outdoor living but challenging for lawn maintenance. Popular subdivisions like Tuscany, Paramount, and Lochsa Falls feature strict HOA requirements for landscape maintenance, making professional lawn care essential for busy homeowners. Clay soil is prevalent throughout Meridian, especially in newer developments where construction equipment has severely compacted the ground, requiring aggressive core aeration and soil amendment programs to establish healthy root systems. Many Meridian properties feature Kentucky bluegrass lawns that demand regular fertilization, proper mowing height, and adequate irrigation during our hot July and August temperatures. The city attracts young families and professionals who value beautiful outdoor spaces but lack time for intensive yard work, creating strong demand for comprehensive lawn care services that ensure their property investment stays protected.',
    landmarks: ['The Village at Meridian', 'Kleiner Memorial Park', 'Eagle Island State Park', 'Settlers Park', 'Wahooz Family Fun Zone', 'Roaring Springs Water Park'],
    serviceConsiderations: 'Meridian\'s new construction areas require patience and intensive care during lawn establishment (first 2-3 years). Severely compacted clay soil from building activity needs multiple annual aerations. HOA requirements are strict - most subdivisions mandate weekly mowing during peak season and immediate weed control. Young trees and shrubs need careful trimming to promote proper growth structure. New sod installations common - critical first year watering and fertilization program determines long-term lawn quality. Fall overseeding and renovation work best for filling in thin areas. Spring pre-emergent weed control essential before May to prevent summer annual weeds.',
    localFactors: {
      climate: 'Similar to Boise - hot, dry summers and cold winters. USDA Zone 6b.',
      soil: 'Clay soil prevalent, requiring proper drainage solutions.',
      commonNeeds: ['New construction landscaping', 'Subdivision lawn care', 'HOA maintenance', 'Modern landscape design']
    },
    facts: [
      { label: 'Average lawn size', value: '5,500 sq. ft.' },
      { label: 'Recommended watering', value: '1-2 in. / wk' },
      { label: 'Recommended grass height', value: '2.5-3 in.' },
      { label: 'When to fertilize', value: 'spring / fall' },
      { label: 'When to aerate', value: 'fall' },
      { label: 'When to overseed', value: 'fall' },
      { label: 'When to blow out sprinklers', value: 'Oct / Nov' },
      { label: 'Growing season', value: 'April - October' }
    ]
  },
  {
    slug: 'eagle',
    name: 'Eagle',
    county: 'ada',
    isPrimary: false,
    population: '35,000+',
    zipCodes: ['83616', '83646'],
    neighborhoods: ['Eagle Hills', 'Banbury', 'Silver Wing', 'Floating Feather'],
    extendedDescription: 'Eagle is one of the Treasure Valley\'s most affluent and desirable communities, combining small-town character with upscale amenities and easy access to outdoor recreation. With over 35,000 residents in Ada County just northwest of Boise, Eagle is known for its premium real estate, excellent schools, championship golf courses, and proximity to Eagle Island State Park and the Boise River. The city\'s location near the foothills in USDA Zones 6b-7a creates a slightly milder microclimate than valley floor communities, with warmer winters and better air drainage that benefits sensitive landscape plants. Eagle properties tend toward larger lot sizes averaging 7,000+ square feet of lawn, with many estate homes on acreage requiring comprehensive landscape management programs. Soil conditions vary significantly across Eagle - some areas feature rocky foothill soil with excellent drainage, while others have typical Treasure Valley clay requiring amendment and aeration. Eagle homeowners invest heavily in outdoor living spaces including professionally designed landscapes, custom water features, outdoor kitchens, and elaborate patio systems that require specialized maintenance expertise. The community expects premium service quality, attention to detail, and landscape results that enhance substantial property investments, making Eagle the perfect market for full-service lawn care companies committed to excellence.',
    landmarks: ['Eagle Island State Park', 'Eagle Hills Golf Course', 'Heritage Park', 'Eagle Farmers Market', 'Eagle Historical Museum', 'Wildlife Reserve', 'Boise River'],
    serviceConsiderations: 'Eagle\'s affluent market demands premium service quality and attention to detail. Larger lot sizes (7,000+ sq. ft. lawns common) and estate properties require comprehensive care programs. Custom landscapes with high-end plantings, water features, and hardscaping need specialized knowledge and gentle handling. Variable soil - some rocky foothill areas, some clay valley floor - requires customized treatment approaches. Many properties feature advanced irrigation systems with smart controllers requiring tech-savvy service. Homeowners expect proactive communication, consistent results, and complete professionalism. Outdoor living spaces (patios, fire features, lighting) require careful integration with lawn care activities. Golf course-quality turf expectations mean precision mowing, fertilization, and detail work. Seasonal color programs popular for maintaining vibrant landscapes year-round.',
    localFactors: {
      climate: 'Similar to Boise with slightly warmer winters near foothills. USDA Zone 6b-7a.',
      soil: 'Variable - some areas rocky, others clay-based.',
      commonNeeds: ['High-end landscaping', 'Premium lawn care', 'Outdoor living spaces', 'Estate property maintenance']
    },
    facts: [
      { label: 'Average lawn size', value: '7,000 sq. ft.' },
      { label: 'Recommended watering', value: '1-2 in. / wk' },
      { label: 'Recommended grass height', value: '2.5-3 in.' },
      { label: 'When to fertilize', value: 'spring / fall' },
      { label: 'When to aerate', value: 'fall' },
      { label: 'When to overseed', value: 'fall' },
      { label: 'When to blow out sprinklers', value: 'Oct / Nov' },
      { label: 'Growing season', value: 'April - October' }
    ]
  },
  {
    slug: 'star',
    name: 'Star',
    county: 'ada',
    isPrimary: false,
    population: '12,000+',
    zipCodes: ['83669'],
    neighborhoods: ['Star Meadows', 'Riverside Village', 'Willow Creek', 'Pearl District'],
    extendedDescription: 'Star, Idaho is a rapidly growing small city in Ada County with over 12,000 residents, located along State Highway 44 between Eagle and Middleton. Known for its rural character and strong sense of community, Star offers residents a peaceful small-town lifestyle with convenient access to Boise metro area amenities just 20 minutes east. The city has experienced significant growth in recent years as families seeking larger lots and a more rural atmosphere discover Star\'s appeal. The community features a mix of established horse properties, newer residential subdivisions, and agricultural land transitioning to housing developments. Star\'s climate in USDA Zone 6b presents typical Treasure Valley challenges with hot, dry summers often reaching 95-100°F and cold winters with occasional heavy snow. Clay soil is prevalent throughout Star, particularly in newer developments where construction activity has compacted the ground, requiring annual core aeration and soil amendment programs for healthy lawn establishment. Many Star properties feature larger lot sizes averaging 8,000-10,000 square feet of lawn or more, with some rural properties on acreage requiring comprehensive landscape management including pasture mowing, fence line trimming, and extensive irrigation maintenance. The city\'s growing popularity among families and professionals who value space, privacy, and small-town community creates strong demand for reliable lawn care services that understand both traditional residential maintenance and rural property needs.',
    landmarks: ['Star Town Hall', 'Star Community Park', 'Riverside Park', 'Highway 44 Corridor', 'Star Elementary School', 'Pearl Street District'],
    serviceConsiderations: 'Star\'s larger lot sizes (8,000-10,000+ sq. ft. common) require efficient equipment and proper scheduling. Many properties have extensive lawns plus additional acreage needing pasture mowing or fence line trimming. Clay soil prevalent - annual fall aeration essential for lawn health. New construction areas require intensive establishment care during first 2-3 years. Rural properties may have well water systems affecting irrigation scheduling and water quality. Horse properties need careful mowing to avoid manure spreading and fence line awareness. Gravel driveways common - requires careful debris management during mowing and blowing. Many properties have mature trees and windbreaks needing specialized trimming. Fall cleanup critical for leaf removal from cottonwoods and other deciduous trees. Growing community appreciates reliable, professional service as an alternative to DIY maintenance.',
    localFactors: {
      climate: 'Hot, dry summers and cold winters typical of Treasure Valley. USDA Zone 6b.',
      soil: 'Clay soil dominant, requiring regular aeration and amendments.',
      commonNeeds: ['Large lot maintenance', 'Rural property care', 'Pasture mowing', 'Irrigation management']
    },
    facts: [
      { label: 'Average lawn size', value: '8,500 sq. ft.' },
      { label: 'Recommended watering', value: '1-2 in. / wk' },
      { label: 'Recommended grass height', value: '2.5-3 in.' },
      { label: 'When to fertilize', value: 'spring / fall' },
      { label: 'When to aerate', value: 'fall' },
      { label: 'When to overseed', value: 'fall' },
      { label: 'When to blow out sprinklers', value: 'Oct / Nov' },
      { label: 'Growing season', value: 'April - October' }
    ]
  },
  {
    slug: 'middleton',
    name: 'Middleton',
    county: 'canyon',
    isPrimary: false,
    population: '10,000+',
    zipCodes: ['83644'],
    neighborhoods: ['Heights', 'Middleton Mill', 'Ustick Corridor', 'Purple Sage'],
    extendedDescription: 'Middleton, Idaho is a charming small city in Canyon County with over 10,000 residents, strategically located between Caldwell and Star along Highway 44. This growing community offers an appealing blend of rural character, modern amenities, and affordable housing options that attract young families and professionals seeking small-town living with easy commute access to Boise, Nampa, and Caldwell. Middleton has evolved from its agricultural roots while maintaining the friendly, close-knit community atmosphere that long-time residents cherish. The city features a mix of older established neighborhoods with mature landscaping, newer subdivisions with contemporary home designs, and transitional areas where farmland is gradually converting to residential development. Middleton\'s semi-arid climate in USDA Zone 6a brings hot summers with temperatures frequently exceeding 95°F and cold winters with frost and occasional snow, creating demanding conditions for lawn maintenance throughout the year. Heavy clay soil is common across Middleton, particularly in areas near the Boise River corridor and in new construction zones where soil compaction from building equipment creates challenges for establishing healthy lawns. Property sizes in Middleton tend toward the generous side, with many homes featuring 6,000-8,000 square feet of lawn plus additional landscape beds, mature trees, and established shrubs requiring comprehensive care programs. Middleton residents value honest, reliable service at fair prices, making consistency, quality, and transparent communication essential for building lasting customer relationships.',
    landmarks: ['Middleton Place Park', 'Kleiner Park', 'Boise River Wildlife Management Area', 'Middleton Mill', 'Highway 44 Business District', 'Middleton Schools Complex'],
    serviceConsiderations: 'Middleton\'s clay soil requires annual fall core aeration and possible spring aeration for severely compacted lawns. Larger average lot sizes mean efficient mowing equipment essential for profitability. Mix of older homes with mature landscapes and newer construction requiring different service approaches. Boise River proximity in some areas creates higher humidity and fungus pressure - may need preventive fungicide for susceptible lawns. Many properties have established trees requiring regular trimming and cleanup services. Growing number of new subdivisions need sod establishment care and young landscape maintenance. Budget-conscious market values reliable service and fair pricing over premium add-ons. Spring and fall cleanup services important for leaf and debris removal. Irrigation systems range from modern to outdated - repair services often needed. Small-town atmosphere means word-of-mouth referrals critical - customer satisfaction paramount.',
    localFactors: {
      climate: 'Semi-arid with hot summers and cold winters. USDA Zone 6a.',
      soil: 'Heavy clay soil requiring amendments and regular aeration.',
      commonNeeds: ['Residential lawn care', 'Clay soil management', 'Tree and shrub maintenance', 'Seasonal cleanup']
    },
    facts: [
      { label: 'Average lawn size', value: '6,500 sq. ft.' },
      { label: 'Recommended watering', value: '1-2 in. / wk' },
      { label: 'Recommended grass height', value: '2.5-3 in.' },
      { label: 'When to fertilize', value: 'spring / fall' },
      { label: 'When to aerate', value: 'fall' },
      { label: 'When to overseed', value: 'fall' },
      { label: 'When to blow out sprinklers', value: 'Oct / Nov' },
      { label: 'Growing season', value: 'April - October' }
    ]
  }
];

// High-Priority Services (build these first)
export const PRIORITY_SERVICES: ServiceData[] = [
  // LAWN CARE SERVICES
  {
    slug: 'lawn-mowing',
    name: 'Lawn Mowing',
    category: 'lawn-care',
    shortDescription: 'Professional weekly and bi-weekly lawn mowing services with trimming, blowing, and clipping removal included',
    longDescription: 'Keep your lawn looking its best with our professional mowing services designed specifically for Idaho\'s unique climate and growing conditions. We provide reliable, consistent lawn cutting and turf maintenance on weekly or bi-weekly schedules throughout the growing season, from April through October. Our experienced crews use commercial-grade equipment including zero-turn mowers, professional trimmers, and commercial blowers to deliver a precise, even cut that promotes healthy grass growth and creates that beautiful striped appearance homeowners love. Every mowing service includes complete trimming around obstacles, professional blowing of all hard surfaces, and clipping removal—there are no hidden fees or surprise charges. Understanding Idaho\'s semi-arid climate and clay soil conditions, we adjust our mowing height seasonally to help your lawn withstand the hot, dry summers typical of the Treasure Valley. We maintain grass at 3 to 3.5 inches during peak summer heat, which promotes deeper root development, shades out weed seeds, and reduces water requirements. This proper mowing height is critical for Kentucky bluegrass and fescue varieties common in Kuna, Boise, Meridian, and surrounding areas. Every service includes precision edging along all sidewalks, driveways, flower beds, and fence lines to create crisp, clean borders that dramatically enhance your property\'s curb appeal. Our crews string-trim around obstacles, trees, and tight spaces that mowers can\'t reach, ensuring complete coverage. After mowing and trimming, we blow off all hard surfaces including sidewalks, driveways, patios, and porches, leaving your property looking immaculate and ready to enjoy. We practice grasscycling by mulching clippings back into the lawn, which returns valuable nutrients to the soil, improves moisture retention, and reduces the need for additional fertilization. This sustainable approach is better for your lawn and the environment. Our mowing service includes pre-mow inspection to identify any hazards, consistent mowing patterns that create professional striping, and a final quality check before leaving your property.',
    benefits: [
      'Consistent, professional cut every time with visible striping',
      'Trimming, blowing, and clipping removal included—no hidden fees',
      'Promotes healthy, thick lawn growth and deeper roots',
      'Prevents weed invasion through regular maintenance',
      'Saves you 2-3 hours every week for family time',
      'Commercial-grade equipment for superior results',
      'Fully insured and experienced crews',
      'Flexible scheduling - weekly or bi-weekly service',
      'Competitive pricing with no hidden fees',
      'All-inclusive service: mowing, edging, trimming, blowing, cleanup',
      'Seasonal height adjustments for optimal lawn health',
      'Protects your lawn from heat stress during Idaho summers',
      'Professional appearance boosts curb appeal and property value'
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
        answer: 'We recommend mulching clippings back into the lawn (grasscycling). This returns nutrients to the soil, reduces watering needs, and is better for your lawn. If you prefer bagging, we can accommodate that, and clipping removal and disposal are always included in our service—no additional fees.'
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
      },
      {
        question: 'How much does lawn mowing cost in Kuna and the Treasure Valley?',
        answer: 'Residential lawn mowing typically ranges from $35-65 per visit depending on lot size. Most standard subdivision lots (5,000-8,000 sq ft) average $40-50. Larger properties or those requiring extra trimming cost more. We provide free, no-obligation quotes based on your specific property.'
      },
      {
        question: 'Do I need to be home when you mow?',
        answer: 'No, you don\'t need to be home. Most of our clients prefer recurring service where we come the same day each week or every other week. We\'ll text you when we\'re on the way and when service is complete. Just ensure gates are unlocked and any obstacles are clear.'
      },
      {
        question: 'What makes your mowing better than hiring a neighborhood kid?',
        answer: 'We use commercial-grade equipment that delivers superior cut quality and consistency. Our crews are trained, insured, and reliable - no last-minute cancellations. We provide complete service including edging, trimming, and blowing off hard surfaces every visit. Professional mowing actually promotes lawn health through proper height management and regular schedule.'
      },
      {
        question: 'Can you mow if my grass is really long or overgrown?',
        answer: 'Yes! We handle overgrown lawns frequently. Very tall grass requires special techniques - we may mow at a higher setting first, then drop the height gradually over 2-3 services to avoid shocking the grass. There\'s typically an additional charge for the first service on severely overgrown properties.'
      },
      {
        question: 'Do you provide one-time mowing or only recurring service?',
        answer: 'We offer both! One-time mowing is available for property sales, special events, or seasonal needs. However, recurring service (weekly or bi-weekly during growing season) provides the best lawn health and value. Many clients start with one service to try us out, then sign up for recurring.'
      },
      {
        question: 'When does lawn mowing season start and end in Idaho?',
        answer: 'Mowing season in Idaho typically runs April through October, depending on weather. We start when grass begins actively growing in spring (usually early-mid April) and continue until the last mow before dormancy (late October). Some mild years we mow into November. Spring and fall frequency is usually bi-weekly, while peak summer is weekly.'
      }
    ],
    relatedServices: ['lawn-maintenance', 'hedge-trimming', 'fertilization', 'weed-control', 'seasonal-cleanup'],
    pricingGuidance: 'Lawn mowing typically ranges from $35-65 for residential properties depending on lot size. Commercial properties are quoted based on square footage and frequency. All quotes are free with no obligation.',
    seasonality: 'April through October in Idaho (growing season). Service frequency varies by season.',
    facts: [
      { label: 'Average mowing price', value: '$50' },
      { label: 'Ideal mowing frequency', value: 'weekly (May-July)' },
      { label: 'Service season', value: 'April - October' },
      { label: 'Optimal grass height', value: '2.5-3 in.' },
      { label: 'Typical service time', value: '20-45 min' },
      { label: 'Equipment used', value: 'commercial grade' },
      { label: 'Cleanup included', value: 'always' },
      { label: 'Edging & trimming', value: 'every visit' }
    ]
  },
  {
    slug: 'aeration',
    name: 'Lawn Aeration',
    category: 'lawn-care',
    shortDescription: 'Core aeration services to relieve soil compaction and promote healthy root growth',
    longDescription: 'Lawn aeration is one of the most beneficial and transformative services for Idaho lawns, especially those struggling with heavy clay soil common throughout the Treasure Valley. Our professional core aeration service uses specialized equipment to remove thousands of small plugs of soil and thatch from your lawn, creating channels that allow air, water, and nutrients to penetrate deep into the root zone where grass plants need them most. This process relieves soil compaction caused by foot traffic, mowing equipment, and the natural settling of clay-based soils prevalent in Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle. Compacted soil is one of the primary reasons Idaho lawns struggle - it prevents proper water infiltration leading to runoff and pooling, restricts root development keeping roots shallow and weak, and limits the effectiveness of fertilizer applications. Our commercial-grade core aerators remove plugs 2-3 inches deep and 0.5-0.75 inches in diameter, spaced 3-4 inches apart across your entire lawn. We make multiple passes in different directions to ensure comprehensive coverage, paying special attention to high-traffic areas, compacted zones near sidewalks and driveways, and problem areas where water tends to pool. The removed soil cores are left on the lawn surface where they break down naturally over 1-2 weeks, returning beneficial soil microorganisms and organic matter back to your turf. This process effectively redistributes soil and helps break down thatch accumulation. Aeration is especially critical in Idaho where clay soil compacts easily and hot, dry summer conditions stress lawns. Proper aeration can reduce watering needs by 20-30% through improved water infiltration and retention, increases fertilizer effectiveness by allowing nutrients to reach root zones, and creates conditions for new grass growth when combined with overseeding. The best time for aeration in Idaho is fall (September-October) when soil is still warm enough for root growth but cooler temperatures reduce stress on grass. Spring aeration (April-May) is also beneficial. Annual aeration is recommended for most Treasure Valley lawns, with high-traffic areas benefiting from twice-yearly service.',
    benefits: [
      'Relieves soil compaction in Idaho\'s heavy clay soils',
      'Improves water and nutrient absorption by up to 300%',
      'Promotes deeper, stronger root systems for drought resistance',
      'Reduces water runoff and pooling in low areas',
      'Enhances fertilizer effectiveness saving money',
      'Prepares lawn for successful overseeding in fall',
      'Reduces thatch buildup naturally',
      'Creates thicker, healthier turf that crowds out weeds',
      'Reduces watering needs by 20-30% through better infiltration',
      'Improves oxygen flow to root zones',
      'Helps break up hardpan clay layers',
      'Most cost-effective lawn improvement available'
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
      },
      {
        question: 'How much does lawn aeration cost in Kuna and the Treasure Valley?',
        answer: 'Residential aeration typically costs $75-150 depending on lawn size. Average 5,000-8,000 sq ft lots run $100-125. We offer discounts when combined with overseeding or fertilization. Commercial and large properties are quoted based on square footage.'
      },
      {
        question: 'Why is my lawn so compacted?',
        answer: 'Clay soil (common in Idaho) compacts naturally over time. Foot traffic, mowing equipment, and water saturation accelerate compaction. New construction sites often have severely compacted soil from heavy equipment. Even without heavy use, clay soil compacts from its own weight and settling.'
      },
      {
        question: 'Can I aerate my lawn myself?',
        answer: 'You can rent aerators, but professional service usually costs less than rental plus your time. Our commercial equipment is heavier and more effective than rental units, pulling deeper plugs with better coverage. We also know how to identify and address problem areas that DIY often misses.'
      },
      {
        question: 'What are the soil cores left on my lawn after aeration?',
        answer: 'Those are plugs of soil and thatch removed from your lawn - this is normal and expected. They break down naturally in 1-2 weeks through rain, irrigation, and mowing. The breakdown process actually helps redistribute soil and microorganisms. You can speed breakdown by mowing or lightly raking, but it\'s not necessary.'
      },
      {
        question: 'Should I fertilize before or after aeration?',
        answer: 'Fertilize after aeration for maximum effectiveness. The aeration holes allow fertilizer to reach deep into the root zone instead of sitting on the surface. This combination delivers outstanding results. We often offer combination aeration-fertilization service for convenience.'
      },
      {
        question: 'Does aeration help with water pooling and drainage problems?',
        answer: 'Yes! Aeration dramatically improves water infiltration in compacted clay soil. Water pooling is often caused by compaction preventing water from soaking in. Aeration creates channels for water to penetrate, reducing or eliminating pooling in many cases. Severe drainage issues may require additional solutions.'
      },
      {
        question: 'How long before I can walk on my lawn after aeration?',
        answer: 'You can walk on your lawn immediately after aeration - it won\'t damage anything. However, for best results, avoid heavy traffic for 1-2 weeks to allow the aeration holes to stay open and the lawn to recover. Light use is completely fine.'
      }
    ],
    relatedServices: ['overseeding', 'fertilization', 'dethatching', 'lawn-mowing'],
    pricingGuidance: 'Aeration typically costs $75-150 for residential properties depending on lawn size. Larger properties and commercial jobs are quoted individually. Discounts available when combined with overseeding.',
    seasonality: 'Best performed in fall (September-October) or spring (April-May). Most popular service period is September.',
    facts: [
      { label: 'Average cost', value: '$100-125' },
      { label: 'Best time', value: 'September-October' },
      { label: 'Frequency', value: 'annually' },
      { label: 'Core depth', value: '2-3 in.' },
      { label: 'Core spacing', value: '3-4 in. apart' },
      { label: 'Recovery time', value: '1-2 weeks' },
      { label: 'Water savings', value: '20-30%' },
      { label: 'Combines well with', value: 'overseeding' }
    ]
  },
  {
    slug: 'fertilization',
    name: 'Lawn Fertilization',
    category: 'lawn-care',
    shortDescription: 'Custom fertilization programs to keep your lawn green, healthy, and thriving',
    longDescription: 'A properly fertilized lawn is greener, thicker, and more resistant to weeds, disease, and drought - and fertilization is the single most important factor in achieving a beautiful Idaho lawn. Our comprehensive fertilization programs are customized specifically for Treasure Valley climate conditions and the nutrient deficiencies common in Idaho\'s clay-based soils. We use professional-grade, slow-release fertilizers with precisely balanced ratios of nitrogen, phosphorus, and potassium to promote healthy growth throughout the season without burning your turf or causing excessive top growth that requires extra mowing. Unlike cheap, fast-release fertilizers from big-box stores that provide a quick green-up followed by a crash, our professional products feed your lawn steadily over 6-8 weeks, providing consistent nutrition and color. Idaho\'s alkaline clay soils are notorious for locking up iron and other micronutrients, leading to yellow, weak grass even when nitrogen levels are adequate. Our fertilization programs address these specific deficiencies with iron supplements and soil amendments that help your grass access nutrients trapped in the soil. We provide 4-5 applications per year timed to match your lawn\'s natural growth cycles: early spring application provides starter nutrients as grass emerges from dormancy, late spring feeding supports rapid growth during peak season, summer application helps maintain color and health during heat stress, early fall feeding encourages root development and prepares for winter, and late fall winterizer application stores nutrients in roots for early spring green-up. Each application is calibrated for the specific needs of that season. Spring applications are higher in nitrogen to promote green-up and growth. Summer blends include iron for color and stress reducers for heat tolerance. Fall applications emphasize phosphorus and potassium for root development over top growth. We use commercial-grade spreaders calibrated to apply the correct rate uniformly across your entire lawn, eliminating the streaking and uneven growth common with consumer spreaders or broadcast application. Our technicians are trained to keep fertilizer off sidewalks, driveways, and streets where it can wash into storm drains - this protects local waterways and makes your application more effective. Proper fertilization dramatically thickens your turf, which naturally crowds out crabgrass, dandelions, and other weeds by eliminating the bare spots where weed seeds germinate. A well-fed lawn is also more drought tolerant, disease resistant, and recovers faster from stress and traffic. The investment in professional fertilization pays for itself through reduced watering needs, fewer weed control requirements, and a lawn that looks professionally maintained year-round.',
    benefits: [
      'Promotes thick, lush green growth all season',
      'Strengthens grass against drought stress and heat',
      'Crowds out weeds naturally through thick turf',
      'Improves disease resistance',
      'Addresses Idaho clay soil nutrient deficiencies',
      'Timed for optimal seasonal growth patterns',
      'Professional-grade slow-release products',
      'Safe for kids and pets when dry',
      'Reduces overall maintenance time and costs',
      'Increases property value through curb appeal',
      'Custom programs for specific lawn needs',
      'Environmentally responsible application methods'
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
      },
      {
        question: 'How much does a lawn fertilization program cost?',
        answer: 'Individual applications typically cost $40-80 for average residential lawns (5,000-8,000 sq ft). Full-season programs (4-5 applications) range from $250-400 total and offer the best value. Larger properties cost more based on square footage. We provide free quotes tailored to your specific lawn size and needs.'
      },
      {
        question: 'What is the best fertilizer for Idaho lawns?',
        answer: 'Idaho lawns need slow-release nitrogen fertilizers with iron supplements to address our alkaline clay soil. We use professional blends with N-P-K ratios customized for each season: higher nitrogen in spring for green-up, balanced blends in summer, and higher phosphorus/potassium in fall for root development. Big-box fertilizers don\'t account for Idaho\'s specific soil chemistry.'
      },
      {
        question: 'When should I fertilize my lawn in Idaho?',
        answer: 'Optimal timing: April (spring green-up), late May (peak growth), July (summer maintenance), September (fall feeding), and November (winterizer). Avoid fertilizing during extreme heat (over 90°F) or when grass is dormant. Fall fertilization is the most important application for Idaho lawns.'
      },
      {
        question: 'Will fertilizer burn my lawn?',
        answer: 'Professional application at correct rates with quality slow-release products will not burn your lawn. Burning occurs from over-application, fast-release nitrogen in hot weather, or applying to drought-stressed grass. Our calibrated equipment and trained technicians ensure safe application every time.'
      },
      {
        question: 'Do I need to water after fertilizing?',
        answer: 'Yes, watering within 24-48 hours after application is recommended to activate the fertilizer and move nutrients into the soil. About 0.25-0.5 inches of water (15-30 minutes) is sufficient. If rain is forecast within a day, watering isn\'t necessary. Avoid heavy watering that causes runoff.'
      },
      {
        question: 'Why choose professional fertilization over doing it myself?',
        answer: 'Professionals use commercial products not available in stores, apply at scientifically correct rates, time applications for optimal results, and have calibrated equipment for uniform coverage. We also adjust for Idaho\'s specific soil conditions. DIY fertilizing often results in streaking, burning, wasted product, or poor results from wrong products or timing.'
      },
      {
        question: 'Can fertilization help with my weed problem?',
        answer: 'Yes, indirectly. Thick, well-fertilized grass naturally crowds out weeds by eliminating bare spots where weed seeds germinate. However, fertilization alone won\'t eliminate existing weeds. We recommend combining fertilization with targeted weed control for best results. A comprehensive approach addresses both nutrition and weed pressure.'
      },
      {
        question: 'What if I have bare spots or thin areas?',
        answer: 'Fertilization helps existing grass thicken but won\'t fix bare spots - those need overseeding or sod repair. We often recommend combining fall fertilization with overseeding to thicken thin areas while feeding existing grass. This combination delivers dramatic improvement in lawn density.'
      }
    ],
    relatedServices: ['weed-control', 'aeration', 'lawn-mowing', 'seasonal-cleanup'],
    pricingGuidance: 'Fertilization programs typically cost $40-80 per application for residential lawns. Season-long programs (4-5 applications) are available at discounted rates.',
    seasonality: 'Year-round program with applications in spring, summer, and fall. Most critical applications are April, September, and November.',
    facts: [
      { label: 'Avg cost per application', value: '$40-80' },
      { label: 'Annual program cost', value: '$250-400' },
      { label: 'Applications per year', value: '4-5' },
      { label: 'Most important feeding', value: 'fall (Sep/Nov)' },
      { label: 'Results visible in', value: '7-14 days' },
      { label: 'Product type', value: 'slow-release' },
      { label: 'Safe for pets after', value: '2-4 hours' },
      { label: 'Best combined with', value: 'aeration' }
    ]
  },
  {
    slug: 'weed-control',
    name: 'Weed Control',
    category: 'lawn-care',
    shortDescription: 'Professional weed control to eliminate dandelions, crabgrass, and broadleaf weeds',
    longDescription: 'Keep your lawn weed-free and beautiful with our comprehensive weed control programs specifically designed for the persistent weed problems common in Treasure Valley lawns. We use professional-grade, selective herbicides that effectively eliminate dandelions, clover, thistle, crabgrass, bindweed, and dozens of other common Idaho weeds while being completely safe for your desirable turf grasses. Weeds are more than just unsightly - they compete aggressively with grass for water, nutrients, and sunlight, weakening your lawn and creating thin areas that invite more weed invasion in a vicious cycle. Professional weed control breaks this cycle. Our selective herbicide treatments target broadleaf weeds and grassy weeds without harming Kentucky bluegrass, tall fescue, or perennial ryegrass - the grass varieties common in Idaho lawns. We use both pre-emergent herbicides that prevent weed seeds from germinating and post-emergent treatments that eliminate existing weeds. Pre-emergent applications in early spring create an invisible barrier in the soil that stops crabgrass, goosegrass, and annual weed seeds from sprouting - this is the most effective crabgrass control available and must be applied before soil temperatures reach 55°F (typically late March to early April in Idaho). Post-emergent treatments applied in spring and fall target actively growing broadleaf weeds like dandelions, clover, thistle, and plantain when they\'re most vulnerable. Timing is critical for weed control effectiveness. Spring applications (April-May) target weeds emerging from winter dormancy when they\'re young and easier to control. Fall applications (September-October) are even more effective because perennial weeds are actively storing energy in roots, pulling herbicide deep into the root system for complete elimination. Many homeowners struggle with recurring dandelions because they only treat the visible leaf growth - professional herbicides with proper fall timing kill the entire taproot preventing regrowth. Idaho\'s alkaline soil and hot, dry summers create ideal conditions for drought-tolerant weeds like bindweed, spurge, and knotweed. These persistent weeds require specialized herbicides and multiple applications for effective control. We customize treatment protocols for your specific weed pressures, using the most effective products for each weed type. Weed control is most effective when combined with proper lawn care. Thick, well-maintained turf naturally resists weed invasion by leaving no bare ground for weed seeds to germinate. We often recommend combining weed control with fertilization and aeration programs for a comprehensive approach that eliminates weeds while promoting dense, healthy grass growth that prevents future weed problems.',
    benefits: [
      'Eliminates dandelions, clover, and thistle completely',
      'Prevents crabgrass and annual weeds before they emerge',
      'Selective treatment - won\'t harm desirable grass',
      'Creates thick, uniform, weed-free lawn',
      'Reduces need for manual weeding and yard work',
      'Professional-grade products not available to homeowners',
      'Seasonal programs for year-round control',
      'Safe for established lawns, kids, and pets when dry',
      'Targets persistent Idaho weeds like bindweed',
      'Prevents weed seed production for long-term control',
      'Improves lawn health by eliminating competition',
      'Much more effective than store-bought products'
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
      },
      {
        question: 'How much does weed control cost?',
        answer: 'Single weed control treatments typically cost $45-85 for average residential lawns. Season-long programs (3-4 applications) range from $200-350 total and provide better results than one-time treatments. Pre-emergent crabgrass control adds $50-75. We customize programs based on your specific weed pressures.'
      },
      {
        question: 'Can I get rid of weeds without chemicals?',
        answer: 'Manual removal and organic methods exist but are impractical for whole-lawn weed control. Hand-pulling doesn\'t eliminate taproots of perennial weeds like dandelions. Corn gluten (organic pre-emergent) is only 60-70% effective vs. 95%+ for professional products. For severe weed infestations, selective herbicides are the only practical solution. We use EPA-approved products at proper rates.'
      },
      {
        question: 'What is pre-emergent weed control?',
        answer: 'Pre-emergent herbicide creates an invisible barrier in the top inch of soil that prevents weed seeds from germinating. It\'s extremely effective for crabgrass control and must be applied in early spring (March-April) before soil reaches 55°F. Pre-emergents don\'t affect existing weeds - only seeds. This is the most cost-effective weed control available.'
      },
      {
        question: 'Will you pull weeds or just spray them?',
        answer: 'We use professional herbicides that eliminate weeds systemically - killing roots and all. This is far more effective than pulling, which often breaks off tops leaving roots to regrow. For scattered large weeds, we spot-treat. For infested lawns, blanket application is more effective and economical than manual removal.'
      },
      {
        question: 'Why are there so many weeds in my new lawn?',
        answer: 'New construction sites often have weed seed-laden topsoil. Disturbed soil exposes dormant weed seeds to light triggering germination. New lawns can\'t be treated with herbicides until after 3-4 mowings, giving weeds a head start. Once grass is established, we can implement aggressive weed control to eliminate the initial weed flush.'
      },
      {
        question: 'Can you control bindweed and thistle?',
        answer: 'Yes, but these are Idaho\'s most challenging weeds requiring persistent treatment. Bindweed has deep roots (10+ feet) requiring multiple applications over 2-3 seasons for complete elimination. Canadian thistle spreads by underground rhizomes needing special herbicides. We use proven protocols for tough weeds but set realistic expectations - these take time and persistence.'
      },
      {
        question: 'Is it safe to play on the lawn after weed control?',
        answer: 'Wait until the spray has dried (typically 2-4 hours) before allowing kids or pets on treated areas. Once dry, products bind to leaf surfaces and are safe for normal lawn use. For extra caution, wait 24 hours. We use EPA-registered products applied according to label directions for maximum safety.'
      },
      {
        question: 'Should I mow before or after weed treatment?',
        answer: 'Mow 1-2 days before application so weeds have maximum leaf surface to absorb herbicide. Don\'t mow for 2-3 days after treatment to allow complete absorption. Mowing too soon after treatment removes herbicide before it can work, reducing effectiveness significantly.'
      }
    ],
    relatedServices: ['fertilization', 'aeration', 'lawn-mowing', 'overseeding'],
    pricingGuidance: 'Weed control applications typically cost $45-85 per treatment. Season-long programs with multiple applications are available at discounted rates.',
    seasonality: 'Pre-emergent in early spring (March-April), post-emergent treatments spring and fall (April-May, September-October).',
    facts: [
      { label: 'Avg cost per treatment', value: '$45-85' },
      { label: 'Season program cost', value: '$200-350' },
      { label: 'Best treatment time', value: 'April-May, Sep-Oct' },
      { label: 'Results visible in', value: '7-14 days' },
      { label: 'Pre-emergent timing', value: 'March-April' },
      { label: 'Most common weed', value: 'dandelions' },
      { label: 'Hardest to control', value: 'bindweed' },
      { label: 'Safe for pets after', value: '2-4 hours' }
    ]
  },
  {
    slug: 'sod-installation',
    name: 'Sod Installation',
    category: 'landscaping-softscape',
    shortDescription: 'Professional sod installation for instant, beautiful lawns',
    longDescription: 'Get an instant, beautiful lawn with our professional sod installation service designed for Idaho\'s unique climate and soil conditions. Perfect for new construction homes, complete lawn renovation, backyard transformations, or repairing damaged areas from construction or pets, sod provides immediate, dramatic results with a lush, thick, green lawn you can enjoy in just weeks instead of the months required for seeding. We handle every aspect of sod installation from soil preparation and grading to sod selection and professional laying, ensuring your new lawn establishes quickly and thrives for decades. Sod installation is the fastest way to achieve a mature, healthy lawn - you go from bare dirt to a carpet of green grass literally overnight. This instant transformation is ideal for new homeowners who want an immediate outdoor living space, property sellers who need quick curb appeal, or anyone tired of looking at dead, patchy, or weed-infested turf. Professional installation is critical for sod success. Idaho\'s heavy clay soil requires proper preparation including tilling to break up compaction, amendments to improve drainage and nutrients, precise grading to prevent water pooling and direct drainage away from foundations, and careful leveling to create a smooth surface for sod contact. Poor soil preparation is the primary cause of sod failure - we never skip these essential steps. We source only fresh, locally-grown sod cut within 24 hours of installation to ensure maximum viability. Kentucky bluegrass is the premier choice for Idaho lawns - it\'s cold-hardy to survive our winters, heat-tolerant for summer, self-repairing to fill in bare spots, and provides that deep green color homeowners desire. For low-maintenance areas or partial shade, we may recommend tall fescue which requires less water and mowing. The sod variety is selected based on your property\'s sun exposure, intended use, and maintenance preferences. Installation technique matters immensely. We lay sod in a brick pattern (staggered joints) rather than grid pattern to prevent visible seams and create a seamless appearance. Each piece is carefully butted against adjacent pieces with no gaps or overlaps. Edges are precisely trimmed around landscaping beds, sprinkler heads, sidewalks, and driveways for a professional finish. After installation, we thoroughly water the sod to eliminate air pockets and establish good soil contact - proper watering in the first hour after installation is critical. During the first two weeks, the sod is rooting into your soil - this establishment period requires frequent, light watering to keep both sod and soil consistently moist. We provide detailed watering schedules tailored to the season and weather conditions. Proper establishment watering is the difference between success and failure with new sod. After 2-3 weeks when roots have penetrated the soil, you can gradually transition to a normal watering schedule. Sod is usable much faster than seed - light foot traffic is acceptable after just 1-2 weeks, with normal use resuming after 3-4 weeks once roots are established. Sod installation is possible from early spring through mid-fall in Idaho, with spring (April-May) and fall (September-October) being ideal for the easiest establishment and lowest water requirements.',
    benefits: [
      'Instant results - green lawn the same day',
      'Prevents soil erosion immediately',
      'Weed-free from day one',
      'Usable in just 2-3 weeks',
      'Professional installation ensures long-term success',
      'Cold-hardy varieties ideal for Idaho winters',
      'Increases property value significantly',
      'Matures faster than seeded lawns',
      'Solves drainage issues through proper grading',
      'Perfect for new construction or renovation',
      'No mud tracked into house',
      'Eliminates years of weed fighting required with seed'
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
      },
      {
        question: 'Sod vs. seed - which is better?',
        answer: 'Sod provides instant results, is weed-free from the start, prevents erosion immediately, and is usable in weeks. Seed is cheaper upfront but takes 3-6 months to establish, requires intensive care, fights weeds constantly, and has high failure rates. For most homeowners in Idaho, sod is worth the investment for guaranteed results and immediate enjoyment.'
      },
      {
        question: 'How do I know if my sod is rooting properly?',
        answer: 'After 7-10 days, gently lift a corner of the sod. If you feel resistance, roots are growing. By week 2-3, sod should be difficult to lift without tearing. Healthy rooting also shows as vibrant color and firm feel when walked on. Poor rooting shows as sod that lifts easily or brown, dry appearance despite watering.'
      },
      {
        question: 'Can you install sod on a slope?',
        answer: 'Yes! Sod is ideal for slopes because it prevents erosion immediately. We install sod horizontally across slopes (never vertically) and may use biodegradable stakes on steep grades to hold sod in place until rooted. Sod installation is much more successful than seeding on slopes where rain washes seed away.'
      },
      {
        question: 'Will sod installation damage my sprinklers?',
        answer: 'Not with professional installation. We carefully locate and flag all sprinkler heads and valve boxes before beginning. Sod is cut precisely around each head. We test the system after installation to verify all heads function properly. This is another reason professional installation is superior to DIY.'
      },
      {
        question: 'How long does sod last?',
        answer: 'Properly installed and maintained sod lasts indefinitely - it becomes a permanent, self-sustaining lawn. Kentucky bluegrass is perennial and self-repairing, filling in damaged areas naturally. With basic care (mowing, watering, occasional fertilization), your sod lawn will last for decades, potentially longer than you own the home.'
      },
      {
        question: 'What happens if my sod dies or doesn\'t establish?',
        answer: 'Sod failure is rare with professional installation and proper watering. Most failures are caused by inadequate watering in the first 2 weeks. We provide detailed establishment instructions and are available to answer questions. For warranty details and our satisfaction guarantee, ask during your consultation.'
      },
      {
        question: 'Do I need to remove my old lawn before installing sod?',
        answer: 'Yes, old grass and weeds must be removed and soil properly prepared. Simply laying sod over existing lawn causes poor root contact, uneven surface, and establishment failure. We handle complete removal, tilling, grading, and leveling as part of our installation service - proper preparation is not optional.'
      }
    ],
    relatedServices: ['lawn-mowing', 'irrigation-installation', 'fertilization', 'aeration'],
    pricingGuidance: 'Sod installation ranges from $1.50-3.00 per square foot including materials and labor. Minimum project size typically 500 sq ft. Free estimates provided.',
    seasonality: 'Best installed April-May and September-October. Summer installation possible with intensive watering.',
    facts: [
      { label: 'Average cost', value: '$1.50-3.00/sq ft' },
      { label: 'Best time to install', value: 'April-May, Sep-Oct' },
      { label: 'Usable after', value: '2-3 weeks' },
      { label: 'Full establishment', value: '4-6 weeks' },
      { label: 'Watering (first 2 weeks)', value: '2-3x daily' },
      { label: 'Best variety for Idaho', value: 'Kentucky bluegrass' },
      { label: 'Sod cut freshness', value: 'within 24 hours' },
      { label: 'Lifespan', value: 'permanent (decades)' }
    ]
  },
  {
    slug: 'patio-installation',
    name: 'Patio Installation',
    category: 'landscaping-hardscape',
    shortDescription: 'Custom patio design and installation using pavers, stamped concrete, and natural stone',
    longDescription: 'Transform your backyard into an outdoor living oasis with a professionally designed and installed patio that expands your living space and dramatically increases your property value. Whether you envision a cozy intimate space for morning coffee and quiet evenings or an expansive entertainment area for family gatherings and summer barbecues, we design and build custom patios that perfectly match your lifestyle, budget, and aesthetic preferences. We specialize in paver patios, stamped concrete patios, and natural stone installations engineered to withstand Idaho\'s harsh winters with freeze-thaw cycles and hot, dry summers. A professionally installed patio is one of the highest-ROI home improvements, typically returning 50-80% of investment at resale while providing years of enjoyment and outdoor living space. Idaho\'s extreme weather demands proper installation - our patios are built on deep, compacted gravel bases (4-6 inches minimum) that prevent frost heaving and settling that plague poorly installed DIY patios. We excavate to proper depth (8-12 inches total), establish correct slope for drainage away from your foundation (critical in Idaho where spring snowmelt can cause foundation issues), and use commercial compaction equipment to create a rock-solid base that won\'t shift or settle over time. Paver patios are our most popular option and the best choice for Idaho climate. Individual pavers handle freeze-thaw cycles better than solid concrete because they can move microscopically without cracking. If a paver ever chips or stains, it can be replaced individually - impossible with stamped concrete which cracks irreparably. We offer hundreds of paver styles, colors, and patterns from leading manufacturers: traditional red brick for classic appeal, modern gray tones for contemporary designs, tumbled pavers for rustic charm, or multicolor blends for visual interest. Paver installation is an art - we lay each paver in your chosen pattern (herringbone, running bond, basketweave, circular, or custom designs) with precise spacing and alignment. Edges are critical: we install rigid edge restraints to prevent paver shifting and maintain clean, professional borders. Polymeric sand swept into joints locks pavers together while allowing flexibility and preventing weed growth. Stamped concrete offers the look of stone, brick, or slate at lower cost than pavers. We create custom patterns and colors limited only by imagination. However, concrete can crack in Idaho\'s climate and requires sealing every 2-3 years for best appearance. Natural stone (flagstone, bluestone, slate) provides unmatched luxury and uniqueness - no two stone patios are identical. Stone requires skilled installation to create stable, level surfaces from irregular materials. Stone lasts 50+ years with minimal maintenance. We guide material selection based on your priorities: budget, maintenance preferences, aesthetic goals, and how you\'ll use the space. Proper patio drainage is non-negotiable in Idaho. We grade patios to slope away from structures (minimum 2% grade) and ensure water drains to appropriate areas, never pooling on the patio or flowing toward foundations. French drains or channel drains are added when needed for complex drainage scenarios.',
    benefits: [
      'Expands outdoor living space dramatically',
      'Increases home value 50-80% of investment',
      'Durable - lasts 25-50+ years depending on material',
      'Low maintenance after installation',
      'Custom design to match your exact style',
      'Built to withstand Idaho freeze-thaw cycles',
      'Professional craftsmanship and warranties',
      'Wide variety of materials, colors, and patterns',
      'Creates outdoor entertaining space',
      'Improves drainage and eliminates mud',
      'Adds usable square footage to property',
      'Cooler than decks in summer heat'
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
      },
      {
        question: 'What size patio do I need?',
        answer: 'Minimum 10x10 ft (100 sq ft) for a small bistro set. 12x12 to 12x16 ft (144-192 sq ft) accommodates typical dining sets. 16x20 ft+ (320+ sq ft) handles full outdoor kitchens and entertaining. We help determine the right size based on your furniture, grill, and how you\'ll use the space.'
      },
      {
        question: 'Will my patio crack or sink over time?',
        answer: 'Not with proper installation. We excavate deep, install 4-6 inches of compacted gravel base, and ensure proper drainage. This prevents frost heaving, settling, and water damage that cause cracking and sinking in poorly installed patios. Paver patios are especially resistant to cracking vs. concrete.'
      },
      {
        question: 'Can you match my patio to my home\'s style?',
        answer: 'Absolutely! We offer hundreds of paver colors, styles, and patterns to complement any architectural style. Traditional homes pair well with tumbled brick or classic patterns. Contemporary homes look stunning with sleek gray pavers in modern layouts. We help select materials that enhance your home\'s aesthetic and value.'
      },
      {
        question: 'How long does patio installation take?',
        answer: 'Most residential paver patios (200-400 sq ft) take 3-5 days from excavation to completion. Larger or more complex projects with curves, multiple levels, or integrated fire pits take 1-2 weeks. Weather and material availability can affect timelines. We provide accurate schedules during consultation.'
      },
      {
        question: 'Should I seal my paver patio?',
        answer: 'Sealing is optional but recommended. Sealer enhances color, protects against stains and fading, makes cleaning easier, and helps prevent weed growth in joints. We recommend sealing within 6-12 months after installation, then resealing every 3-5 years. Not all pavers require sealing - we advise based on your specific material.'
      },
      {
        question: 'Can you add a fire pit or outdoor kitchen to my patio?',
        answer: 'Yes! We design integrated outdoor living spaces combining patios with fire pits, outdoor fireplaces, built-in grills, kitchen islands, seating walls, and more. Combining these features in initial design is more cost-effective than adding later. We handle everything from concept to completion.'
      },
      {
        question: 'What maintenance does a patio require?',
        answer: 'Paver patios are very low-maintenance: sweep regularly, rinse occasionally with hose, resand joints every few years if needed, optional re-sealing every 3-5 years. Remove weeds if they appear (rare with polymeric sand). That\'s it! Far less maintenance than wood decks which require annual staining and regular board replacement.'
      }
    ],
    relatedServices: ['fire-pit-installation', 'outdoor-fireplace', 'pergola-installation', 'landscape-lighting'],
    pricingGuidance: 'Paver patios: $15-30/sq ft installed. Stamped concrete: $12-20/sq ft. Natural stone: $20-40/sq ft. Minimum project typically $3,000. Free estimates provided.',
    seasonality: 'Installed April through October. Best to book in late winter/early spring for summer completion.',
    facts: [
      { label: 'Paver patio cost', value: '$15-30/sq ft' },
      { label: 'Typical project', value: '$4,500-9,000' },
      { label: 'Installation time', value: '3-5 days' },
      { label: 'Lifespan (pavers)', value: '25-30+ years' },
      { label: 'ROI at resale', value: '50-80%' },
      { label: 'Best season', value: 'April-October' },
      { label: 'Base depth required', value: '8-12 inches' },
      { label: 'Most popular material', value: 'pavers' }
    ]
  },
  {
    slug: 'hedge-trimming',
    name: 'Hedge & Shrub Trimming',
    category: 'lawn-care',
    shortDescription: 'Professional hedge and shrub trimming to maintain shape, promote healthy growth, and enhance curb appeal',
    longDescription: 'Well-maintained hedges and shrubs are the framework of a polished, professional landscape - and regular professional trimming is essential for keeping them healthy, shapely, and beautiful throughout Idaho\'s growing season. Our expert hedge and shrub trimming service combines horticultural knowledge with commercial-grade equipment and precise techniques to deliver results that dramatically enhance your property\'s curb appeal and plant vitality. Whether you need formal boxwood hedges trimmed to architectural perfection, privacy hedges maintained at optimal height and density, or flowering shrubs strategically pruned to maximize blooms, our experienced team has the expertise to handle every species and style in your landscape. Proper hedge trimming is both an art and a science. Unlike simple mowing where one technique works for all grass, different shrub species require specific timing, tools, and techniques for optimal results. Spring-flowering shrubs like lilacs, forsythia, and mockorange must be trimmed immediately after flowering or you\'ll remove next year\'s blooms. Summer-flowering shrubs like roses and butterfly bushes are pruned in early spring before growth begins. Evergreen hedges like arborvitae, juniper, and boxwood are best shaped in late spring after the first flush of growth, then touched up mid-summer if needed for dense growth. We track the timing for each plant type to optimize health and appearance. Equipment matters significantly. Consumer-grade hedge trimmers and dull blades create ragged cuts that turn brown, invite disease, and slow plant recovery. Our commercial gas-powered hedge trimmers with razor-sharp blades make clean, precise cuts that heal quickly and promote vigorous new growth. For delicate flowering shrubs or detail work, we use professional bypass hand pruners that cut like surgical instruments rather than crushing stems. Proper trimming technique promotes dense, healthy growth. We trim hedges slightly narrower at the top than the bottom, allowing sunlight to reach lower branches and preventing the bare, sparse bottom growth common with improper shaping. We remove dead, diseased, or crossing branches that waste energy and invite pest problems. We thin overcrowded canopies to improve air circulation, reducing fungal disease pressure in Idaho\'s irrigation-wet summers. These professional practices create healthier plants that resist stress, disease, and environmental challenges. Regular maintenance is far more effective and affordable than rescue pruning of severely overgrown shrubs. Neglected hedges can grow so large they block windows, encroach on walkways, overtake neighboring plants, or simply look unkempt and detract from property value. When shrubs become severely overgrown, restoring them to manageable size requires severe pruning that stresses plants and can take 2-3 seasons to fully recover. Regular trimming (2-3 times per growing season for fast-growing species, annually for slow-growers) maintains size and shape without shock, keeps plants healthy and vigorous, and ensures your landscape always looks professionally maintained.',
    benefits: [
      'Promotes dense, healthy growth patterns',
      'Maintains desired size and shape all season',
      'Enhances curb appeal and property value significantly',
      'Prevents overgrowth from blocking windows or walkways',
      'Encourages abundant flowering on flowering shrubs',
      'Removes dead or diseased branches preventing spread',
      'Commercial-grade equipment for clean, precise cuts',
      'Saves you time and eliminates physical strain',
      'Improves plant health through proper timing',
      'Creates privacy screens with dense growth',
      'Reduces pest and disease problems',
      'Professional results unachievable with consumer tools'
    ],
    process: [
      { step: 1, title: 'Property Walk-Through', description: 'We assess all hedges, shrubs, and ornamental plants, noting their type, current condition, and your desired maintenance goals.' },
      { step: 2, title: 'Trimming Plan Development', description: 'Based on plant species and your preferences, we determine appropriate trim heights and shapes. Different plants require different timing and techniques.' },
      { step: 3, title: 'Precise Trimming & Shaping', description: 'Using professional hedge trimmers and hand shears, we carefully trim each plant to the appropriate height and shape, following natural growth patterns.' },
      { step: 4, title: 'Selective Pruning', description: 'We remove dead, diseased, or crossing branches, opening the plant canopy for better air circulation and light penetration.' },
      { step: 5, title: 'Cleanup & Debris Removal', description: 'All clippings and debris are removed and disposed of—disposal always included. We blow off surrounding hardscapes to leave everything looking pristine.' },
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
      },
      {
        question: 'How much does hedge trimming cost?',
        answer: 'Hedge trimming typically costs $75-150 for average residential properties with standard hedges. Larger properties, tall hedges (over 8 feet), or dense formal hedges requiring precision shaping cost $150-300+. Pricing depends on linear footage, height, density, and accessibility. We provide free estimates after seeing your specific hedges.'
      },
      {
        question: 'Do you remove the clippings?',
        answer: 'Yes! All hedge and shrub clippings are collected, loaded, and hauled away as part of our service. We also blow off driveways, sidewalks, and patios to leave your property looking immaculate. You don\'t touch a thing - we handle complete cleanup.'
      },
      {
        question: 'Can you make my overgrown shrubs smaller without killing them?',
        answer: 'Yes, but it requires a strategic multi-season approach for severely overgrown shrubs. We can reduce size by 1/3 annually without excessive stress. Some species tolerate aggressive reduction better than others. We assess your specific plants and create a renovation plan that achieves your goals while protecting plant health.'
      },
      {
        question: 'Will you trim around power lines or near my roof?',
        answer: 'We trim near structures and obstacles but do NOT trim around power lines - that requires a licensed electrician or utility company for safety. For shrubs near rooflines, gutters, or structures, we take extra care to protect both plants and your property with proper equipment and technique.'
      },
      {
        question: 'My shrubs are different species - can you handle that?',
        answer: 'Absolutely! Most properties have diverse plant palettes requiring different approaches. We identify each species and apply appropriate timing and technique. Lilacs get post-flowering pruning. Evergreens get light shearing. Roses get strategic pruning. Spirea gets renovation cutting. We handle it all correctly based on plant biology.'
      },
      {
        question: 'What\'s the difference between trimming and pruning?',
        answer: 'Trimming typically refers to shearing hedges and formal shapes for size and appearance control. Pruning is more selective, removing specific branches to improve structure, health, flowering, and air circulation. We provide both services - formal hedge shearing and selective shrub pruning - customized to each plant\'s needs.'
      }
    ],
    relatedServices: ['lawn-mowing', 'seasonal-cleanup', 'tree-trimming', 'mulch-installation'],
    pricingGuidance: 'Hedge trimming starts at $75-150 for typical residential properties. Pricing depends on hedge size, density, and number of plants. Formal hedges requiring precise shaping may cost more. Free estimates provided.',
    seasonality: 'May through September for most plants. Some species benefit from dormant-season pruning (late winter).',
    facts: [
      { label: 'Typical cost', value: '$75-150' },
      { label: 'Trimming frequency', value: '2-3x per season' },
      { label: 'Best time (evergreens)', value: 'late spring' },
      { label: 'Best time (spring bloomers)', value: 'after flowering' },
      { label: 'Equipment', value: 'commercial gas trimmers' },
      { label: 'Maximum height', value: '12-15 feet' },
      { label: 'Clippings', value: 'hauled away' },
      { label: 'Growth promotion', value: 'denser branching' }
    ]
  },
  {
    slug: 'seasonal-cleanup',
    name: 'Spring & Fall Cleanup',
    category: 'lawn-care',
    shortDescription: 'Comprehensive spring and fall yard cleanup services to prepare your landscape for the season ahead',
    longDescription: 'Seasonal transitions demand dedicated landscape attention in Idaho where extreme weather swings - from harsh winters with heavy snow to hot, dry summers - create unique cleanup needs that directly impact your landscape\'s health and appearance throughout the year. Our comprehensive spring and fall cleanup services are essential seasonal maintenance that prepares your yard for optimal performance in the upcoming season while addressing damage and debris from the season just ended. Spring cleanup is your landscape\'s fresh start after Idaho\'s harsh winter. We remove accumulated winter debris including dead leaves trapped under snow, broken branches from ice and wind damage, dead perennial growth that protected roots through winter, salt and gravel tracked onto lawns from winter maintenance, and the general mess that emerges as snow melts. We cut back ornamental grasses and perennials to make room for new growth, edge landscape beds to create clean definition, remove winter-damaged plant material, and prepare beds for mulch refresh. Spring cleanup reveals winter damage that needs repair - broken sprinkler heads from freeze, dead sections of plants that didn\'t survive cold, areas of lawn killed by snow mold or ice damage, and drainage problems exposed by snowmelt. Identifying these issues early allows correction before the growing season begins. Fall cleanup protects your investment as winter approaches. Idaho\'s deciduous trees drop massive quantities of leaves in October-November that smother lawns if left in place. Thick leaf layers block sunlight, trap moisture creating fungal disease, provide habitat for voles and other pests, and kill grass outright if left through winter. We remove all leaves from lawns and beds using commercial backpack blowers that dramatically outperform homeowner equipment, cut back perennials that have finished their season, remove dead annual flowers and vegetables from beds and containers, clean out gutters if requested, and prepare your entire property for winter. Fall cleanup also includes cutting back perennials at the right time - not too early (which wastes winter protection) and not too late (which leaves a messy spring start). Professional timing and technique matter for both seasons. Spring cleanup done too early risks frost damage to newly exposed plants. Done too late, you miss the narrow window before rapid spring growth begins. Fall cleanup done too early removes plant material still protecting roots. Done too late, frozen ground and snow complicate work. We track Idaho\'s seasonal progression and schedule services for optimal timing. Both seasonal cleanups save homeowners entire weekends of back-breaking labor. Raking leaves, hauling debris, cutting back plants, and edging beds are time-consuming, physically demanding tasks that consume beautiful spring and fall weekends better spent enjoying your yard. Professional equipment completes in hours what takes homeowners days, and we haul away all debris - you never touch a wheelbarrow.',
    benefits: [
      'Removes leaves, debris, and winter damage completely',
      'Prepares landscape for optimal seasonal performance',
      'Prevents mold, disease, and pest issues from debris',
      'Enhances curb appeal for spring growth or winter',
      'Identifies problems early (dead plants, irrigation leaks)',
      'Protects plants from seasonal temperature extremes',
      'Comprehensive service saves entire weekends',
      'Professional equipment completes work in hours',
      'Prevents snow mold and fungal diseases',
      'Eliminates pest habitat in debris',
      'Removes vole and rodent hiding places',
      'Prepares beds perfectly for mulch or planting'
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
      },
      {
        question: 'How much does seasonal cleanup cost?',
        answer: 'Spring or fall cleanup typically costs $200-400 for average residential properties (quarter-acre lots with moderate landscaping). Larger properties, heavily wooded lots with extensive leaves, or properties needing significant perennial cutting cost $400-800+. We provide free estimates after seeing your specific property and cleanup needs.'
      },
      {
        question: 'How long does cleanup take?',
        answer: 'Most residential properties take 2-6 hours depending on size, debris volume, and landscape complexity. Small yards with minimal beds may take just 2 hours. Large, heavily landscaped properties can take a full day or more. We provide time estimates with your quote.'
      },
      {
        question: 'What if leaves keep falling after fall cleanup?',
        answer: 'Idaho\'s leaf drop typically finishes by early November. We schedule fall cleanup for late October/early November to capture most leaves in one service. If significant leaves fall after cleanup, we can return for a touch-up visit (additional charge) or you can wait until spring cleanup when we remove any remaining debris.'
      },
      {
        question: 'Will you damage my sprinkler system during cleanup?',
        answer: 'We take great care around irrigation systems. Our team is trained to identify and avoid sprinkler heads, valves, and lines. We use proper raking and blowing techniques that don\'t damage shallow irrigation components. If your system is properly winterized (fall) or activated (spring), damage is extremely rare.'
      },
      {
        question: 'Can cleanup be done if there\'s snow?',
        answer: 'Light snow doesn\'t prevent cleanup, but heavy snow cover makes thorough work impossible. For spring cleanup, we wait until most snow melts. For fall cleanup, we aim to complete before first major snowfall. If unexpected early snow arrives, we can return when it melts to finish work.'
      },
      {
        question: 'Do you clean gutters as part of seasonal cleanup?',
        answer: 'Gutter cleaning can be added to fall cleanup service for an additional fee. We blow out leaves and debris from gutters and downspouts, preventing ice dams and water damage. Many clients bundle gutter cleaning with fall cleanup for convenience and cost savings.'
      }
    ],
    relatedServices: ['mulch-installation', 'hedge-trimming', 'lawn-mowing', 'gutter-cleaning'],
    pricingGuidance: 'Seasonal cleanup typically ranges from $200-600 depending on property size and debris volume. Larger properties or heavily wooded lots may cost more. Free estimates provided.',
    seasonality: 'Spring cleanup: March-April. Fall cleanup: October-November. Both are high-demand periods - book early.',
    facts: [
      { label: 'Typical cost', value: '$200-400' },
      { label: 'Time required', value: '2-6 hours' },
      { label: 'Spring timing', value: 'March-April' },
      { label: 'Fall timing', value: 'Oct-Nov' },
      { label: 'Debris removal', value: 'included' },
      { label: 'Booking window', value: 'book 4-6 weeks early' },
      { label: 'Add-on service', value: 'mulch installation' },
      { label: 'Prevents', value: 'snow mold, voles' }
    ]
  },
  {
    slug: 'sprinkler-blowout',
    name: 'Sprinkler System Winterization',
    category: 'landscaping-irrigation',
    shortDescription: 'Professional sprinkler blowout service to protect your irrigation system from winter freeze damage',
    longDescription: 'Idaho\'s harsh winter freezes are devastating to sprinkler systems, with temperatures regularly dropping into single digits and below zero throughout the Treasure Valley. Water left in irrigation pipes, valves, and sprinkler heads expands when frozen, causing catastrophic damage that can cost thousands to repair come spring. Our professional sprinkler winterization service - commonly called a "blowout" - uses commercial-grade, high-volume compressed air equipment to completely evacuate every drop of water from your entire irrigation system before the first hard freeze arrives. This essential annual service is the single best investment you can make to protect your irrigation system investment, typically preventing $500-3000+ in freeze damage repairs for a service that costs just $75-125. Idaho\'s freeze-thaw cycles are particularly destructive - daytime temperatures in late fall and early spring can climb above freezing while nights drop well below, creating repeated expansion and contraction that can crack even properly winterized components if any water remains. Our technicians use professional compressors delivering 80-120 CFM (cubic feet per minute) of airflow - far more volume than homeowner equipment can provide - ensuring complete water removal from mainlines, lateral lines, valve boxes, sprinkler heads, and backflow preventers. We\'ve winterized thousands of systems throughout Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle, and understand the specific challenges Idaho weather presents. Timing is critical: winterize too early (while you still need to water) and your lawn suffers; wait too long and an unexpected hard freeze destroys your system overnight. October is the ideal month in Idaho, after watering season ends but before temperatures plummet. Our schedule fills completely every October - homeowners who wait until late October often face 2-3 week wait times, risking freeze damage. We recommend scheduling in September for guaranteed October service. The winterization process is quick - typically 20-30 minutes for residential systems - but requires specialized knowledge and equipment. Our technicians know the proper air pressure for each zone (typically 40-80 PSI depending on system type), understand backflow preventer drainage requirements, and can identify potential problems before they become expensive spring repairs. Many manufacturer warranties require professional winterization - DIY attempts may void coverage. Proper winterization isn\'t just about protecting pipes - it\'s about protecting backflow preventers (which alone can cost $300-600 to replace), valve assemblies, controller wiring, and the hundreds or thousands you\'ve invested in a quality irrigation system. The peace of mind knowing your system is properly protected through Idaho\'s brutal winters is invaluable.',
    benefits: [
      'Prevents costly freeze damage to pipes and components',
      'Protects sprinkler heads, valves, and backflow devices',
      'Extends the life of your irrigation system by years',
      'Maintains manufacturer warranties (many require winterization)',
      'Professional-grade compressor ensures complete water removal',
      'Fast service - typically 20-30 minutes per system',
      'Peace of mind all winter long knowing system is protected',
      'Much less expensive than $500-3000 spring repairs',
      'Protects expensive backflow preventers ($300-600 value)',
      'Identifies potential problems before they become costly',
      'Proper air pressure prevents component damage',
      'Priority scheduling for spring startup service'
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
      },
      {
        question: 'How much does sprinkler winterization cost in Kuna and Boise?',
        answer: 'Residential sprinkler winterization typically costs $75-125 depending on system size. Small systems (3-5 zones): $75-90. Medium systems (6-8 zones): $90-110. Large systems (9+ zones): $110-125. Additional zones beyond 12 are $10-15 each. This cost is minimal compared to $500-3000+ in potential freeze damage repairs.'
      },
      {
        question: 'Do you winterize drip irrigation systems?',
        answer: 'Yes! Drip systems also need winterization, though they\'re less susceptible to freeze damage than spray systems. We blow out drip zones and ensure all water is evacuated from mainlines, filters, and pressure regulators. Some drip components may need to be brought indoors if they\'re above ground.'
      },
      {
        question: 'What if I forget to winterize and it freezes?',
        answer: 'Contact us immediately for emergency service. Sometimes a light freeze won\'t cause damage, but hard freezes (below 25°F) for extended periods usually crack pipes and break components. We can assess damage and provide repair estimates. Unfortunately, freeze damage repairs are typically expensive - prevention through timely winterization is always cheaper.'
      },
      {
        question: 'Can you winterize if my system has leaks or problems?',
        answer: 'Yes, we can still winterize systems with minor issues. However, we\'ll note all problems and recommend repairs for spring. For major leaks or valve failures, we may recommend emergency repairs before winterization to prevent water waste and ensure complete blowout is possible.'
      },
      {
        question: 'Do I need to be home during winterization?',
        answer: 'No, you don\'t need to be home as long as we have access to your system components. We need access to the backflow preventer (often in basement or garage) and outdoor valve boxes. Most winterizations take just 20-30 minutes and we text you when complete.'
      },
      {
        question: 'Will winterization damage my landscaping or lawn?',
        answer: 'No, winterization causes no damage. We walk your property to locate all sprinkler zones and are careful around landscaping. The blowout process simply runs your system with air instead of water - sprinkler heads pop up normally and no digging or disruption occurs.'
      }
    ],
    relatedServices: ['irrigation-repair', 'spring-startup', 'sprinkler-system-installation', 'irrigation-maintenance'],
    pricingGuidance: 'Sprinkler winterization typically costs $75-125 for residential systems. Pricing depends on system size (number of zones), accessibility, and system complexity. Commercial systems quoted individually.',
    seasonality: 'October only - extremely high demand period. Book in September for guaranteed service before freeze.',
    facts: [
      { label: 'Typical cost', value: '$75-125' },
      { label: 'Service time', value: '20-30 min' },
      { label: 'Best timing', value: 'October' },
      { label: 'Compressor size', value: '80-120 CFM' },
      { label: 'Prevents damage', value: '$500-3000+' },
      { label: 'Book by', value: 'September' },
      { label: 'System types', value: 'spray & drip' },
      { label: 'Spring startup', value: 'March-April' }
    ]
  },
  {
    slug: 'dethatching',
    name: 'Lawn Dethatching',
    category: 'lawn-care',
    shortDescription: 'Professional dethatching service to remove dead grass buildup and revitalize your lawn',
    longDescription: 'Thatch is a layer of dead grass stems, roots, stolons, and other organic matter that accumulates between the green grass blades you see and the soil surface beneath. While a thin thatch layer (under 1/2 inch) is actually beneficial, providing insulation and cushioning, excessive thatch buildup creates a dense, water-repellent barrier that prevents moisture, nutrients, and oxygen from reaching grass roots where they\'re needed. This suffocates your lawn from the surface down. Idaho lawns, particularly those dominated by Kentucky bluegrass and fine fescues, are especially prone to thatch buildup due to these grass varieties\' aggressive growth habits and our region\'s clay soils that decompose organic matter slowly. Our professional dethatching service - also called power raking or vertical mowing - uses specialized commercial equipment with vertical steel blades that slice through thatch layers, pulling dead material to the lawn surface for removal while leaving healthy grass crowns and roots intact. This aggressive mechanical process literally strips away the suffocating layer that\'s preventing your lawn from thriving. Thatch problems manifest in several ways that frustrate Idaho homeowners: lawns feel spongy underfoot like walking on a mattress, water pools or runs off instead of soaking in, fertilizer applications seem to have no effect, brown patches appear despite adequate watering, and the lawn struggles even with professional care. These symptoms all point to one issue - the thick thatch barrier preventing everything your lawn needs from reaching the root zone. Dethatching solves this problem dramatically and immediately. The process looks destructive (and your lawn will look rough for 1-2 weeks), but it\'s exactly what thatched lawns need to rejuvenate. We\'ve dethatched thousands of struggling Treasure Valley lawns, often removing trailer loads of dead material from lawns that appeared healthy from above but were suffocating underneath. After recovery, these lawns transform into thick, green carpets because water and nutrients finally reach roots again. Dethatching is particularly effective when combined with core aeration and overseeding in a complete lawn renovation program - this "triple threat" approach transforms the most challenged lawns in just one season. Timing is critical for Idaho lawns: early spring (April) allows recovery before summer heat, while early fall (September) is ideal when combined with overseeding programs. Avoid dethatching during summer stress periods or in winter dormancy. Heavy thatch buildup (over 1 inch) may require professional evaluation - extremely thick thatch sometimes indicates underlying problems like poor soil drainage, over-fertilization, or improper watering that need addressing. Our service includes not just thatch removal but also recommendations for preventing future buildup through proper lawn care practices.',
    benefits: [
      'Removes dead grass buildup suffocating your lawn',
      'Improves water and nutrient penetration to roots by 200%+',
      'Enhances fertilizer effectiveness dramatically',
      'Reduces lawn disease, fungus, and pest problems',
      'Prepares lawn perfectly for overseeding success',
      'Promotes vigorous new grass growth and thickness',
      'Helps eliminate stubborn brown patches and thin areas',
      'Extends lawn life by 5-10 years, avoiding replacement',
      'Allows oxygen to reach root zones again',
      'Eliminates spongy, unhealthy lawn feel',
      'Much more cost-effective than lawn replacement',
      'Creates ideal conditions for lawn recovery and renewal'
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
      },
      {
        question: 'How much does dethatching cost in Kuna and Boise?',
        answer: 'Residential dethatching typically costs $100-200 depending on lawn size and thatch severity. Average 5,000-8,000 sq ft lawns run $125-150. Heavily thatched lawns requiring extra passes may cost more. We offer package pricing when combined with aeration ($75-125) and overseeding ($150-250) for maximum results and savings.'
      },
      {
        question: 'Can I dethatch my lawn myself?',
        answer: 'You can rent dethatchers, but they\'re difficult to use and rental costs approach professional service costs. Our commercial equipment is more powerful and efficient than rental units. More importantly, we know proper technique - incorrect dethatching depth or pattern can damage grass crowns. Professional service typically costs less than rental plus your time and effort.'
      },
      {
        question: 'How often should my lawn be dethatched?',
        answer: 'Most Idaho lawns need dethatching every 2-3 years if properly maintained. Kentucky bluegrass lawns may need annual dethatching. Lawns with annual aeration typically need less frequent dethatching. Over-fertilized lawns build thatch faster. Check thatch depth annually - if over 1/2 inch, it\'s time to dethatch.'
      },
      {
        question: 'Will dethatching remove my sprinkler heads?',
        answer: 'No, but we flag all sprinkler heads before dethatching to prevent damage. Our operators avoid heads carefully. Properly installed heads are below the dethatcher\'s cutting depth. Shallow or broken heads should be repaired before dethatching. We note any irrigation concerns during service.'
      },
      {
        question: 'What causes excessive thatch buildup?',
        answer: 'Several factors cause thatch: Kentucky bluegrass naturally produces more thatch than other grasses, over-fertilization stimulates excessive growth, infrequent mowing creates more dead material, poor soil conditions slow decomposition, and compacted clay soils (common in Idaho) reduce organic matter breakdown. Proper lawn care practices minimize but don\'t eliminate thatch formation.'
      },
      {
        question: 'How long until my lawn recovers after dethatching?',
        answer: 'Your lawn will look rough and brown for 7-14 days after dethatching - this is completely normal. New growth appears within 2-3 weeks as grass responds to improved water and nutrient access. Full recovery takes 4-6 weeks. Fall dethatching recovers faster than spring. Proper watering and fertilization speed recovery significantly.'
      }
    ],
    relatedServices: ['aeration', 'overseeding', 'fertilization', 'lawn-mowing'],
    pricingGuidance: 'Dethatching typically costs $100-200 for residential lawns depending on size and thatch severity. Often bundled with aeration and overseeding for maximum results at discounted pricing.',
    seasonality: 'Best in early spring (April) or early fall (September). Peak demand is September when combined with overseeding.',
    facts: [
      { label: 'Typical cost', value: '$125-150' },
      { label: 'Thatch threshold', value: 'over 1/2 in.' },
      { label: 'Best timing', value: 'April or September' },
      { label: 'Recovery time', value: '2-3 weeks' },
      { label: 'Frequency needed', value: 'every 2-3 years' },
      { label: 'Debris removed', value: 'trailer loads' },
      { label: 'Combines with', value: 'overseeding' },
      { label: 'Lawn improvement', value: 'dramatic' }
    ]
  },
  {
    slug: 'overseeding',
    name: 'Lawn Overseeding',
    category: 'lawn-care',
    shortDescription: 'Professional overseeding to fill thin areas, improve density, and create a lush, thick lawn',
    longDescription: 'Overseeding is the process of broadcasting grass seed directly into existing lawns without tearing up or replacing the turf - it\'s one of the most effective and affordable ways to transform thin, struggling lawns into thick, lush carpets of green. This technique fills in bare spots, increases overall turf density, improves lawn color and uniformity, and introduces newer, improved grass cultivars that offer superior disease resistance, drought tolerance, and overall performance compared to the older grass varieties already in your lawn. For Idaho homeowners battling thin lawns, persistent weeds, or simply wanting that golf-course quality thickness, overseeding delivers remarkable results at a fraction of the cost of complete lawn renovation or sod replacement. Our professional overseeding service goes far beyond simply throwing seed on your lawn. We start with proper seedbed preparation - this is critical and separates successful overseeding from wasted seed and money. Preparation typically involves core aeration to create thousands of perfect seed pockets with excellent seed-to-soil contact, or dethatching to expose soil and eliminate the thatch barrier that prevents seed germination. Without this preparation, most seed sits on the surface, gets eaten by birds, or washes away with irrigation before ever germinating. We use only premium grass seed specifically selected for Idaho\'s climate and your specific conditions. For sunny areas, we use elite Kentucky bluegrass and perennial ryegrass blends featuring the newest cultivars with improved disease resistance, drought tolerance, and darker green color. Shaded areas receive specialized shade-tolerant blends dominated by fine fescues that thrive where bluegrass fails. These aren\'t the cheap, generic seed blends from big-box stores filled with nurse grass and weed seeds - we use professional, certified seed that costs more but delivers superior results that last. Application rate matters tremendously. New construction or renovation seeding requires 6-10 pounds per 1,000 square feet for thick establishment. Overseeding existing lawns needs 4-6 pounds per 1,000 square feet to fill in without overwhelming existing grass. Our commercial spreaders ensure even, consistent coverage at optimal rates. After seeding, we apply starter fertilizer rich in phosphorus to promote rapid root development and strong seedling establishment - this gives new grass the energy boost it needs to germinate quickly and compete with existing turf. Timing is everything for Idaho overseeding success. Fall (late August through mid-September) is the absolute best time - soil temperatures are still warm (55-65°F) promoting fast germination, while cooler air temperatures reduce heat stress on new seedlings. Fall also brings more consistent moisture and allows grass to establish before winter. New grass that survives Idaho winters emerges in spring incredibly thick and established. Spring overseeding (April-May) is the second-best window, though it competes with weed germination and requires more vigilant watering through summer heat. Never overseed during summer - high heat and water stress kill most new seedlings. Aftercare is critical and where many DIY attempts fail. New seed requires light, frequent watering (2-3 times daily) for the first 2-3 weeks to keep the top inch of soil consistently moist. Miss a day and germinating seeds die. Once grass emerges, gradually reduce frequency while watering deeper. Proper watering makes or breaks overseeding success - we provide detailed watering schedules customized to your sprinkler system and zones.',
    benefits: [
      'Fills thin spots and bare patches throughout lawn',
      'Dramatically increases overall lawn density and thickness',
      'Introduces newer, disease-resistant grass varieties',
      'Improves drought tolerance with modern cultivars',
      'Enhances lawn color, creating deeper green uniformity',
      'Reduces weed invasion through thick, competitive growth',
      'Extends lawn life by 10-15 years',
      'Much more affordable than complete lawn renovation ($4,000+)',
      'Improves turf quality without disturbing existing grass',
      'Introduces improved grass genetics for better performance',
      'Creates professional, golf-course quality appearance',
      'Rapid results visible within 4-6 weeks'
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
      },
      {
        question: 'How much does overseeding cost in Kuna and the Treasure Valley?',
        answer: 'Professional overseeding typically costs $150-300 for residential lawns including premium seed and starter fertilizer. Average 5,000-8,000 sq ft lawns run $175-225. Cost varies with lawn size and seed type. Package pricing available when combined with aeration ($75-125) - most clients save $50-100 with combo service. Premium shade blends cost slightly more than sun seed.'
      },
      {
        question: 'Can I just buy seed and do it myself?',
        answer: 'You can, but professional results require more than seed. Success depends on proper seedbed preparation (aeration or dethatching), correct seed selection for your conditions, precise application rate, and perfect watering schedule. DIY attempts often fail due to inadequate preparation, wrong seed type, or inconsistent watering. Professional service typically costs less than quality seed plus equipment rental, with much better results.'
      },
      {
        question: 'What grass seed is best for Idaho lawns?',
        answer: 'For sunny areas: elite Kentucky bluegrass blends or bluegrass/perennial ryegrass mixes provide best performance. For shade: fine fescue blends dominate (creeping red fescue, chewings fescue). For high-traffic: perennial ryegrass for durability. We use certified, professional-grade seed with improved disease resistance and drought tolerance - not cheap box store blends with filler and weed seeds.'
      },
      {
        question: 'Will birds eat all my grass seed?',
        answer: 'Birds do eat some exposed seed, but proper seedbed preparation (aeration) puts most seed into soil pockets where birds can\'t reach it. We seed at high enough rates to account for bird predation. Watering immediately after seeding also helps secure seed. Bird predation is rarely significant with professional overseeding using proper techniques.'
      },
      {
        question: 'How long before I can mow after overseeding?',
        answer: 'Wait until new grass reaches 3-4 inches tall before first mowing (typically 3-4 weeks after germination). Set mower to highest setting and remove only 1/3 of blade height. Ensure soil is dry enough that mower doesn\'t tear up soft seedbed. After first mowing, gradually lower height over several mowings to normal 3 inch height.'
      },
      {
        question: 'Why is my overseeding not growing well?',
        answer: 'Common failures: inconsistent watering (most common - seed must stay moist), inadequate seedbed preparation (seed on thatch doesn\'t germinate), wrong timing (spring overseeding competes with weeds and heat), cheap seed (poor germination rates), or herbicide contamination. Professional overseeding with proper preparation and aftercare instructions prevents these problems.'
      }
    ],
    relatedServices: ['aeration', 'dethatching', 'fertilization', 'lawn-renovation'],
    pricingGuidance: 'Overseeding costs $150-300 for residential lawns including premium seed and starter fertilizer. Best results when combined with aeration ($75-150). Package deals available for fall aeration + overseed combo.',
    seasonality: 'Fall (late August-September) is prime season. Spring overseeding (April-May) also available. Summer overseeding not recommended.',
    facts: [
      { label: 'Typical cost', value: '$175-225' },
      { label: 'Best timing', value: 'late Aug-Sept' },
      { label: 'Germination time', value: '7-14 days' },
      { label: 'Seed rate', value: '4-6 lbs / 1000 sq ft' },
      { label: 'Watering needed', value: '2-3x daily' },
      { label: 'Full results', value: '4-6 weeks' },
      { label: 'Combines with', value: 'aeration' },
      { label: 'Lawn improvement', value: 'dramatic' }
    ]
  },
  {
    slug: 'mulch-installation',
    name: 'Mulch Installation',
    category: 'landscaping-softscape',
    shortDescription: 'Professional mulch delivery and installation for garden beds, trees, and landscaped areas',
    longDescription: 'Fresh, professionally installed mulch is one of the fastest, most affordable ways to dramatically enhance your property\'s curb appeal while simultaneously providing crucial benefits to plant health and garden bed maintenance. A fresh mulch application instantly transforms tired, weedy beds into polished, professional landscaping that looks like you hired a grounds crew - because you did. Beyond aesthetics, quality mulch acts as a protective blanket for your soil and plants, suppressing weed germination by blocking sunlight, retaining precious moisture in Idaho\'s semi-arid climate (reducing watering needs by 25% or more), moderating soil temperature extremes that stress plant roots, preventing erosion during spring runoff and summer thunderstorms, and slowly decomposing to add valuable organic matter to our alkaline clay soils. Our comprehensive mulch installation service handles everything from material selection and delivery to expert bed preparation and precise application, leaving you with beautiful, weed-free beds that require minimal maintenance throughout the season. We offer several premium mulch options to match your aesthetic preferences and functional needs. Cedar mulch is aromatic with natural insect-repelling properties and a beautiful reddish color that weathers to silvery gray. Hardwood bark mulch offers rich, dark brown tones, lasts longer than cedar (3-4 years vs. 2-3 years), and provides excellent weed suppression. For decorative beds and high-visibility areas, colored mulch (black, brown, red) maintains vibrant color for years. Rock and stone mulches - including river rock, lava rock, and decorative aggregates - are permanent solutions requiring zero replacement. We help you choose the right material for each area based on your plants, traffic patterns, slope, and budget. Mulch installation sounds simple, but professional results require proper technique and bed preparation. We edge all beds for crisp, defined lines, remove existing weeds (surface weeding or complete removal with landscape fabric for problem areas), fluff or remove decomposed old mulch, and apply new material at the correct depth (2-4 inches for organic mulches). Too thin and weeds break through; too deep and you suffocate plant roots and create habitat for pests and disease. We\'re meticulous about keeping mulch away from plant stems and tree trunks - mulch piled against bark creates moisture retention that causes rot, disease, and provides perfect habitat for insects and rodents. Mulch "volcanoes" around trees are a common mistake that kills more trees than pests or disease. We install properly: creating a "donut" with space around the trunk. Proper installation makes all the difference. Idaho\'s climate and soil present specific challenges that quality mulching addresses. Our alkaline soils (pH 7.5-8.5) benefit tremendously from organic mulches that gradually acidify soil as they decompose. Our hot, dry summers evaporate soil moisture rapidly - mulch dramatically reduces evaporation, allowing plants to thrive with less water. Spring runoff and summer thunderstorms erode unprotected beds - mulch absorbs water and prevents erosion. We source quality bulk mulch, not bagged products from big-box stores. Bulk material offers better value, more consistent quality, and fresher product. Bagged mulch often sits in warehouses for months, drying out and losing beneficial properties.',
    benefits: [
      'Instantly transforms landscape appearance and curb appeal',
      'Suppresses weed growth by 80-90% blocking sunlight',
      'Retains soil moisture reducing watering needs by 25-40%',
      'Moderates soil temperature protecting sensitive plant roots',
      'Prevents soil erosion during Idaho\'s intense spring runoff',
      'Adds valuable organic matter as mulch slowly decomposes',
      'Protects plants from lawnmower and string trimmer damage',
      'Long-lasting - quality hardwood mulch lasts 2-4 years',
      'Improves soil structure and health over time',
      'Defines clean, professional bed edges and boundaries',
      'Reduces mud splashing on siding, windows, and foundations',
      'Much more affordable than other landscape upgrades'
    ],
    process: [
      { step: 1, title: 'Site Assessment & Material Selection', description: 'We evaluate your beds and discuss mulch options: cedar (aromatic, insect-repelling), hardwood bark (rich color, long-lasting), or decorative rock (permanent, low-maintenance). We calculate quantity needed.' },
      { step: 2, title: 'Bed Preparation & Edging', description: 'Existing beds are weeded and edged for clean lines. Old mulch is fluffed or removed if excessively decomposed. Bed edges are redefined for crisp, professional appearance.' },
      { step: 3, title: 'Mulch Delivery', description: 'Fresh mulch is delivered to your property and staged conveniently. We use bulk mulch (not bagged) for better value and quality.' },
      { step: 4, title: 'Professional Application', description: 'Mulch is spread evenly at proper depth (2-4 inches) throughout all beds. We keep mulch away from plant stems and tree trunks to prevent rot and disease.' },
      { step: 5, title: 'Final Detailing', description: 'Beds are hand-raked smooth, edges are cleaned, and any mulch on hardscapes is blown away. The result is a perfect, uniform appearance.' },
      { step: 6, title: 'Cleanup & Disposal', description: 'All debris and excess material is removed and disposed of—disposal included with no additional fees. Your property is left clean and beautiful, ready to enjoy.' }
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
    seasonality: 'April through November. Peak demand is April-May (spring refresh) and September (fall prep). Book early for spring service.',
    facts: [
      { label: 'Cost per yard', value: '$75-150' },
      { label: 'Typical project', value: '$300-800' },
      { label: 'Coverage depth', value: '2-4 inches' },
      { label: 'Mulch longevity', value: '2-4 years' },
      { label: 'Water savings', value: '25-40%' },
      { label: 'Weed reduction', value: '80-90%' },
      { label: 'Best timing', value: 'April-May' },
      { label: 'Cubic yard covers', value: '~100 sq ft' }
    ]
  },
  {
    slug: 'retaining-walls',
    name: 'Retaining Wall Construction',
    category: 'landscaping-hardscape',
    shortDescription: 'Custom retaining wall installation for slope stabilization, terraced gardens, and landscape elevation changes',
    longDescription: 'Retaining walls are essential landscape structures that solve multiple problems while dramatically improving property aesthetics and usability throughout the Treasure Valley. Our professional retaining wall construction service transforms sloped, unusable yards into terraced gardens, level patios, and stunning multi-dimensional landscapes while preventing erosion and protecting your investment. Idaho properties, particularly those in newer developments in Kuna, Meridian, Eagle, and the Boise foothills, often feature challenging slopes that limit yard usability and create drainage problems during spring runoff and heavy rains. A properly engineered retaining wall system converts these problematic slopes into valuable, functional outdoor living spaces. We specialize in custom retaining wall design and installation using the highest quality materials suited to Idaho\'s unique climate challenges including freeze-thaw cycles, clay soil expansion, and seismic considerations. Our team handles everything from initial site evaluation and engineering through final construction and landscaping integration. We work with premium interlocking concrete block systems like Allan Block, Versa-Lok, and Keystone that offer exceptional strength, longevity, and design flexibility. For clients seeking natural aesthetics, we build stunning stacked stone walls using Idaho quartzite, basalt, and other regional materials that blend beautifully with Treasure Valley landscapes. Each wall we construct features critical engineering elements often overlooked by less experienced contractors: proper base excavation and compaction (typically 6-8 inches of crushed gravel), drainage systems with perforated pipe and drain rock to relieve water pressure, appropriate wall batter (setback) for stability, geogrid reinforcement when needed for taller walls, and quality backfill compacted in lifts to prevent settling. These elements are non-negotiable for walls that will withstand Idaho winters and decades of use. Our retaining wall services solve numerous property challenges: creating level lawn and patio areas on slopes, preventing soil erosion that threatens foundations and landscapes, managing water runoff and drainage problems, enabling terraced vegetable or flower gardens, building raised planters and landscape beds, and adding dramatic visual interest with multi-level designs. We handle walls from simple garden borders (12-18 inches high) to major structural projects (6+ feet requiring engineering stamps). Every project begins with careful site analysis considering slope angle, soil type, drainage patterns, existing utilities, property lines, and your functional goals. We provide detailed proposals showing wall layout, material selections, and realistic timelines.',
    benefits: [
      'Prevents soil erosion and slope failure on Idaho properties',
      'Creates usable flat space increasing property value 10-20%',
      'Improves drainage and eliminates water runoff problems',
      'Adds significant curb appeal with professional hardscaping',
      'Enables terraced gardens and multi-level planting areas',
      'Protects foundations and structures from soil movement',
      'Long-lasting construction withstands 50-75 years when properly built',
      'Transforms unusable slopes into beautiful functional landscapes',
      'Reduces lawn maintenance on steep areas',
      'Solves drainage issues that damage lawns and foundations',
      'Increases usable yard space for entertaining and activities',
      'Professional engineering ensures safety and code compliance'
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
      },
      {
        question: 'How much does a retaining wall cost in Kuna and the Treasure Valley?',
        answer: 'Retaining wall costs vary significantly by height, length, and material. Concrete block walls run $35-75 per square foot installed. Natural stone costs $75-150 per square foot. A typical 3-foot-high, 20-foot-long wall (60 sq ft) costs $2,500-5,000 including excavation, base, drainage, and installation. Taller walls (4+ feet) require engineering and cost more. We provide detailed free estimates.'
      },
      {
        question: 'Can I build my own retaining wall?',
        answer: 'DIY is possible for small walls under 2 feet high using interlocking blocks. However, taller walls require proper engineering, drainage installation, and construction techniques that most homeowners lack. Mistakes lead to wall failure costing far more to repair than professional installation upfront. We see failed DIY walls regularly and recommend professional installation for anything over 18-24 inches or on slopes.'
      },
      {
        question: 'How do you prevent water from building up behind retaining walls?',
        answer: 'Proper drainage is critical. We install perforated drain pipe at the base behind every wall, surrounded by drain rock. The pipe outlets to daylight or a drainage system. We backfill with free-draining gravel for the first 12 inches behind the wall. This system relieves hydrostatic pressure preventing wall failure, bulging, and collapse.'
      },
      {
        question: 'Can retaining walls be built in winter in Idaho?',
        answer: 'No. Frozen ground cannot be excavated properly, and concrete bases cannot cure in freezing temperatures. We build retaining walls April through October when ground is workable and conditions allow proper installation. Plan retaining wall projects for spring through early fall completion.'
      },
      {
        question: 'What is geogrid and when is it needed?',
        answer: 'Geogrid is a fabric reinforcement placed between wall courses that extends back into the soil, essentially anchoring the wall to the hillside. It\'s required for walls over 3-4 feet high or those retaining significant loads. Geogrid dramatically increases wall strength and stability. We use it on all taller walls and as recommended by wall manufacturers.'
      },
      {
        question: 'How do you handle corners and terraced retaining walls?',
        answer: 'Corners require special corner blocks or careful stone placement to maintain structural integrity. Terraced walls (multiple walls stacked up a slope) require proper spacing - typically the lower wall height equals the distance between walls. Terracing is often better than one tall wall aesthetically and structurally. We design terraced systems for maximum effect.'
      },
      {
        question: 'Will a retaining wall solve my drainage problems?',
        answer: 'Retaining walls with proper drainage systems solve many drainage issues by redirecting water, preventing erosion, and managing slope runoff. However, severe drainage problems may require additional solutions like French drains, dry wells, or regrading. We assess your specific situation and recommend the complete solution needed.'
      }
    ],
    relatedServices: ['patio-installation', 'landscape-design', 'french-drain-installation', 'terraced-gardens'],
    pricingGuidance: 'Retaining walls: $35-75 per square foot for concrete blocks, $75-150/sq ft for natural stone. A typical 3-foot-high, 20-foot-long wall runs $2,500-5,000. Taller walls cost more due to engineering requirements.',
    seasonality: 'April through October. Cannot pour concrete bases or work frozen ground in winter. Spring-summer is ideal for completion before fall.',
    facts: [
      { label: 'Block wall cost', value: '$35-75/sq ft' },
      { label: 'Stone wall cost', value: '$75-150/sq ft' },
      { label: 'Typical project cost', value: '$2,500-5,000' },
      { label: 'Block wall lifespan', value: '50-75 years' },
      { label: 'Stone wall lifespan', value: '75-100+ years' },
      { label: 'Permit height threshold', value: '4 feet' },
      { label: 'Base depth required', value: '6-8 inches' },
      { label: 'Construction season', value: 'April-October' }
    ]
  },
  {
    slug: 'fire-pit-installation',
    name: 'Fire Pit Installation',
    category: 'landscaping-fire',
    shortDescription: 'Custom fire pit design and installation for outdoor entertainment and year-round enjoyment',
    longDescription: 'A custom fire pit transforms your Idaho backyard into an inviting outdoor gathering space that extends your living area and creates memorable moments with family and friends throughout the year. Our professional fire pit installation service brings together expert design, quality materials, and precise construction to create stunning outdoor fire features that become the centerpiece of your landscape and the heart of outdoor entertaining. Idaho\'s climate is perfect for outdoor fire features - cool spring evenings, pleasant summer nights, crisp fall gatherings, and even winter warmth make fire pits among the most-used landscape features in the Treasure Valley. Whether you envision cozy family s\'mores sessions, adult entertaining around flickering flames, or simply relaxing under the stars with a glass of wine, a professionally built fire pit delivers year-round enjoyment. We create custom fire pit designs ranging from rustic natural stone circles that blend seamlessly into natural landscapes to sleek modern concrete and steel designs that complement contemporary homes. Our installations include everything from initial concept and design through final construction and landscaping integration. We handle site selection considering safety distances from structures (typically 10-25 feet required by code), prevailing wind patterns to avoid smoke problems, views and vistas from the fire pit seating area, integration with existing patios and landscape features, and accessibility from your home. You choose between traditional wood-burning fire pits that offer authentic campfire ambiance with crackling sounds and traditional appeal, or modern gas-powered fire pits providing instant on/off convenience, consistent flames, zero smoke, and no cleanup. For gas fire pits, our licensed professionals handle complete gas line installation from your home\'s gas meter to the fire pit location, including proper sizing, trenching, pipe installation, pressure testing, and permitting. We use only fire-rated materials designed to withstand extreme heat: refractory firebrick for fire pit interiors, natural stone that won\'t crack from heat exposure, concrete products rated for high temperatures, and steel fire rings built for wood-burning applications. Most fire pit projects include surrounding elements that enhance functionality and beauty: built-in stone or block seating walls at comfortable heights (16-18 inches), paver or flagstone patio areas for stable seating, gravel or decomposed granite surrounds for rustic appeal, and landscape lighting to illuminate the area for safety and ambiance. Our installations comply with all local fire codes and HOA requirements. We obtain necessary permits and inspections ensuring your fire feature is legal, safe, and properly insured.',
    benefits: [
      'Creates stunning focal point for outdoor entertainment year-round',
      'Extends outdoor living season into cool spring and fall evenings',
      'Adds significant property value increasing resale appeal 8-12%',
      'Available in wood-burning for ambiance or gas for convenience',
      'Custom designs perfectly match your landscape style and home',
      'Built to local fire codes and HOA safety standards',
      'Includes surrounding patio or built-in seating area options',
      'Professional licensed gas line installation with permits',
      'Uses fire-rated materials that withstand decades of use',
      'Provides warmth for comfortable outdoor dining in cooler months',
      'Creates memorable gathering space for family traditions',
      'Professionally designed for proper smoke management and safety'
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
      },
      {
        question: 'How much does a fire pit cost in Kuna and the Treasure Valley?',
        answer: 'Basic wood-burning stone fire pits: $2,500-6,000 including excavation, base, fire ring, and stone construction. Gas fire pits: $4,000-10,000+ including gas line installation, burner system, and materials. Custom designs with built-in seating walls, surrounding patios, and premium materials: $10,000-25,000+. Costs vary by size, materials, complexity, and gas line distance. Free consultations and detailed estimates provided.'
      },
      {
        question: 'What size fire pit should I build?',
        answer: 'Most residential fire pits are 36-48 inches interior diameter - large enough for good fires but not overwhelming. Smaller (30-36 inch) works for intimate settings. Larger (48-60 inch) suits estates or regular large gatherings. We help size appropriately for your space and intended use.'
      },
      {
        question: 'Can I use my fire pit year-round in Idaho?',
        answer: 'Absolutely! Fire pits are especially enjoyable in spring, fall, and winter. They provide warmth for outdoor use in cooler months. Many Idaho homeowners use fire pits October through April more than summer. Just clear snow from area for safe access. Gas pits work even in winter.'
      },
      {
        question: 'How long does fire pit installation take?',
        answer: 'Simple wood-burning fire pits: 1-3 days depending on size and complexity. Gas fire pits: 3-7 days including gas line trenching, installation, and surrounding work. Projects with extensive patios or seating walls: 1-3 weeks. Weather and material availability affect timelines.'
      },
      {
        question: 'Do you provide fire pit seating and patio areas?',
        answer: 'Yes! Most fire pits include surrounding elements. We build stone or block seating walls at comfortable heights (16-18 inches), install paver or flagstone patios for stable seating areas, create gravel surrounds for easy maintenance, and integrate landscape lighting. Complete outdoor living spaces are our specialty.'
      },
      {
        question: 'What\'s the difference between fire pits and fire tables?',
        answer: 'Fire pits are in-ground or raised circular features primarily for ambiance and warmth. Fire tables are elevated (table height) gas features with surrounding counter space for food and drinks - combining fire feature with entertaining surface. Tables are more expensive but extremely functional for outdoor dining and parties.'
      },
      {
        question: 'Are there restrictions on fire pits in Idaho cities and HOAs?',
        answer: 'Yes. Most cities have setback requirements (10-25 feet from structures). Some limit fire pit size or fuel type. HOAs often have additional restrictions on materials, design, and placement. Check burn bans during dry summers. We research restrictions for your specific location and design compliant fire features. Permits are obtained as needed.'
      }
    ],
    relatedServices: ['patio-installation', 'outdoor-fireplace', 'landscape-lighting', 'seating-walls'],
    pricingGuidance: 'Fire pits: $2,500-6,000 for basic wood-burning stone pits. Gas fire pits: $4,000-10,000+ including gas line. Elaborate custom designs with seating walls and patios: $10,000-25,000+. Free design consultations.',
    seasonality: 'Installed April through October. High demand in spring for summer completion. Gas line work must be done before ground freezes.',
    facts: [
      { label: 'Wood-burning cost', value: '$2,500-6,000' },
      { label: 'Gas fire pit cost', value: '$4,000-10,000+' },
      { label: 'Typical diameter', value: '36-48 inches' },
      { label: 'Required distance from house', value: '10-25 feet' },
      { label: 'Installation time', value: '1-7 days' },
      { label: 'Seating wall height', value: '16-18 inches' },
      { label: 'Construction season', value: 'April-October' },
      { label: 'Property value increase', value: '8-12%' }
    ]
  },
  {
    slug: 'landscape-lighting',
    name: 'Landscape Lighting',
    category: 'landscaping-lighting',
    shortDescription: 'Professional landscape lighting design and installation for beauty, safety, and security',
    longDescription: 'Professional landscape lighting transforms ordinary Idaho properties into stunning nighttime showcases that enhance beauty, safety, and security while extending outdoor living hours and protecting your landscaping investment 24/7. Our comprehensive landscape lighting service combines expert design principles, premium LED fixtures, precision installation, and smart control systems to create outdoor lighting that dramatically improves your property after dark. Idaho homeowners invest thousands in beautiful landscaping - quality trees, manicured lawns, colorful gardens, and hardscaping features - yet these investments disappear into darkness every evening. Professional landscape lighting ensures your property looks stunning day and night, showcases architectural features, creates safe pathways, and provides welcoming illumination for guests. We specialize in low-voltage LED lighting systems that deliver exceptional beauty and performance while using minimal electricity - typically just $3-8 per month to operate an entire system. Our design process begins with a nighttime consultation where we evaluate your property after dark, discuss your goals and priorities, identify features worth highlighting (specimen trees, architectural elements, pathways, water features), assess current lighting gaps and dark areas, and develop a custom lighting plan balancing aesthetics, functionality, and budget. We use proven design techniques including uplighting to dramatically illuminate trees and architectural features, downlighting to create moonlight effects through tree canopies, path lighting for safe navigation of walkways and stairs, accent lighting to showcase focal points and plantings, and silhouette lighting to create dramatic backlit effects. Every installation uses premium commercial-grade LED fixtures from manufacturers like FX Luminaire, Kichler, and Volt that withstand Idaho winters and deliver consistent performance for decades. LED technology provides multiple advantages over older halogen systems: 75% lower energy consumption reducing operating costs, 25-year lifespan meaning you may never replace bulbs, cool operation preventing plant damage and burn hazards, superior light quality with excellent color rendering, and dimming capability for ambiance control. We install professional low-voltage systems (12V or 15V) that are safe, code-compliant, and easily expandable as your landscape matures. Installation includes transformer sizing and placement, buried wiring below frost line using direct-burial cable, fixture positioning and aiming for optimal effect, waterproof connections at every junction, and concealed wire routing that disappears into landscaping. Modern control options include traditional timers, astronomical timers that adjust for sunset times, and smart WiFi systems controllable via smartphone with features like dimming, scheduling, and integration with home automation.',
    benefits: [
      'Dramatic nighttime curb appeal increases perceived home value 15-20%',
      'Enhanced security through strategic illumination deters intruders',
      'Safe navigation of walkways, stairs, and dark areas prevents falls',
      'Highlights landscape features, architecture, and focal points beautifully',
      'Extends outdoor living into evening hours for year-round enjoyment',
      'Energy-efficient LED fixtures cost only $3-8 monthly to operate',
      'Increases actual property value and marketability significantly',
      'Professional design creates balanced lighting avoiding harsh glare',
      'Showcases your landscaping investment 24/7 instead of only daylight',
      'Low-voltage systems are safe and meet all electrical codes',
      'Easily expandable as landscape matures and needs change',
      'Minimal maintenance with 25-year LED lifespan'
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
      },
      {
        question: 'How much does landscape lighting cost in Kuna and the Treasure Valley?',
        answer: 'Professional LED landscape lighting runs $150-400 per fixture installed including design, fixtures, wiring, and installation. Typical front yard systems (12-20 fixtures): $2,500-7,500. Whole-property lighting for larger estates: $10,000-25,000+. Monthly operating cost with LED: $3-8. ROI is immediate through enhanced security, safety, and enjoyment. Free design consultations with detailed estimates provided.'
      },
      {
        question: 'Can landscape lighting be installed in winter?',
        answer: 'Yes! We install landscape lighting year-round. Winter installations are possible though slightly more challenging if ground is frozen - may require specialized equipment. Spring and fall are most popular when ground is soft. Summer works great. Plan ahead for holiday season lighting - book by September for December installation.'
      },
      {
        question: 'Do I need to replace bulbs in LED landscape lights?',
        answer: 'Rarely. Quality LED fixtures last 25,000-50,000 hours (20-25+ years of typical use). Most homeowners never replace LED bulbs - the fixture itself may need replacement before the LED fails. This is a huge advantage over halogen systems requiring bulb replacement every 1-2 years.'
      },
      {
        question: 'Will landscape lights damage my lawn or plants?',
        answer: 'No. We bury wiring 6-8 inches deep - well below mowing depth. LED fixtures stay cool (unlike hot halogens) so they won\'t burn plants. Path lights and uplights are positioned to avoid mowing obstacles. Trenches heal completely in 2-3 weeks with proper watering. Professional installation preserves your landscape.'
      },
      {
        question: 'What is the difference between line voltage and low voltage lighting?',
        answer: 'Line voltage (120V) uses standard household current - requires electrician and conduit, more expensive, less forgiving of mistakes. Low voltage (12V or 15V) uses transformer to step down power - safer, easier to expand, DIY-friendly for simple systems, and less expensive to install. We install low-voltage systems for residential properties - they\'re safer, more versatile, and meet all codes.'
      },
      {
        question: 'Should I get a smart WiFi controller for my landscape lights?',
        answer: 'Highly recommended! Smart controllers (like Lux controllers) allow smartphone control, scheduling, dimming, and integration with home automation. They cost $150-400 more than basic timers but add tremendous convenience and flexibility. You can adjust lighting from your phone, create custom schedules, and dim for ambiance. Most clients love this upgrade.'
      },
      {
        question: 'Can you work around existing sprinkler systems when installing lights?',
        answer: 'Absolutely. We locate all sprinkler lines before trenching. We work carefully to avoid damaging irrigation systems. Our crews are experienced with both lighting and irrigation - we understand how to integrate systems safely. If we encounter sprinkler lines, we route around them or repair any accidental damage at no charge.'
      }
    ],
    relatedServices: ['patio-installation', 'pathway-lighting', 'security-lighting', 'landscape-design'],
    pricingGuidance: 'Professional landscape lighting: $150-400 per fixture installed. Typical systems: $2,500-7,500. Includes design, quality LED fixtures, installation, transformer, timer/controls. Free design consultations.',
    seasonality: 'Installed year-round. Spring and fall are most popular. Installation easier when ground is soft. Winter installations possible but may cost more.',
    facts: [
      { label: 'Cost per fixture', value: '$150-400' },
      { label: 'Typical system cost', value: '$2,500-7,500' },
      { label: 'Monthly operating cost', value: '$3-8' },
      { label: 'LED lifespan', value: '20-25+ years' },
      { label: 'Energy savings vs halogen', value: '75%' },
      { label: 'Installation time', value: '1-3 days' },
      { label: 'System voltage', value: '12V low-voltage' },
      { label: 'Value increase', value: '15-20%' }
    ]
  },
  {
    slug: 'sprinkler-system-installation',
    name: 'Sprinkler System Installation',
    category: 'landscaping-irrigation',
    shortDescription: 'Professional sprinkler system design and installation for automated lawn and landscape watering',
    longDescription: 'A professionally designed and installed sprinkler system is one of the smartest investments Idaho homeowners make - saving water, time, and money while ensuring consistently healthy, green lawns and thriving landscapes throughout the challenging Treasure Valley growing season. Our comprehensive irrigation installation service transforms manual watering routines into fully automated precision systems that deliver exactly the right amount of water to every area of your property at optimal times. Idaho\'s semi-arid climate with hot, dry summers (often 90-100°F) and limited rainfall makes consistent watering absolutely critical for lawn and landscape health. Manual watering is time-consuming (2-3 hours per session), wasteful (50-70% water waste through runoff, evaporation, and uneven coverage), and inconsistent (missed days, forgotten zones, vacation gaps). Professional sprinkler systems solve all these problems through precision engineering and automation. We design custom irrigation systems specifically for Idaho conditions considering clay soil that requires slow application rates to prevent runoff, low humidity that increases evaporation requiring strategic timing, varying sun exposure creating different watering zones, water pressure limitations common in subdivisions, and local water restrictions and odd-even watering schedules. Every system we install uses premium components from industry leaders Rain Bird, Hunter, or Toro - manufacturers known for durability, performance, and serviceability. Our installations feature spray heads for small lawn areas and planting beds delivering 1-1.5 inches per hour, rotor heads for larger turf areas providing 0.5-0.75 inches per hour with 15-50 foot radius coverage, drip irrigation for shrubs, trees, and gardens delivering water directly to root zones with 90-95% efficiency, and pressure-regulated heads ensuring uniform coverage regardless of pressure variations. The design process begins with comprehensive site analysis including property measurement and mapping, soil type evaluation, sun and shade pattern assessment, existing plant types and their water needs, water source evaluation (pressure and flow testing), and future expansion planning. We create detailed irrigation plans showing precise head placement ensuring 100% coverage with proper overlap, zone layouts separating turf from shrubs and sunny areas from shade, pipe sizing and routing for adequate pressure and flow, controller location for accessibility and weather protection, and backflow prevention placement meeting code requirements. Idaho requires backflow preventers on all irrigation systems to protect drinking water - we handle permitting and inspection. Installation quality separates professional systems from DIY failures. We excavate trenches 6-8 inches deep (below mowing and frost depth), install schedule 40 PVC pipe properly glued and pressure-tested, use commercial-grade fittings and connections, install each head level and properly spaced per design, wire all valves with direct-burial wire, program smart controllers with optimal run times per zone, and completely restore landscaping after installation. Lawn trenches heal completely in 2-3 weeks with proper watering.',
    benefits: [
      'Automated watering saves 2-3 hours weekly eliminating manual effort',
      'Precise water delivery reduces waste by 30-50% lowering bills',
      'Consistent watering produces healthier, greener lawns year-round',
      'Smart controllers adjust for weather automatically preventing overwatering',
      'Increases property value 5-15% and appeals to buyers',
      'Separate zones for lawns, shrubs, and gardens optimize water use',
      'Morning watering schedules (4-8am) reduce disease and evaporation',
      'ROI in 5-10 years through water savings and lawn health',
      'Never worry about vacation watering or forgotten zones',
      'Proper coverage eliminates brown spots and overwatered areas',
      'Smart systems qualify for local utility rebates ($100-300)',
      'Professional installation includes warranties and ongoing support'
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
      },
      {
        question: 'How much does a sprinkler system cost in Kuna and the Treasure Valley?',
        answer: 'Typical residential sprinkler systems cost $2,500-5,000 for quarter-acre lots (5,000-10,000 sq ft), $4,000-7,000 for half-acre properties, and $7,000-12,000+ for acre+ properties. Costs vary based on property size, number of zones needed, head types, drip irrigation areas, smart controller selection, and site challenges. ROI is 5-10 years through water savings and lawn health. Free design consultations and detailed estimates provided.'
      },
      {
        question: 'What is the difference between spray heads and rotor heads?',
        answer: 'Spray heads have fixed spray patterns, deliver 1-1.5 inches per hour, cover 5-15 foot radius, and are best for small lawns and planting beds. Rotor heads rotate, deliver 0.5-0.75 inches per hour, cover 15-50 foot radius, and are ideal for larger lawn areas. Proper system design uses both types strategically for optimal coverage and water efficiency.'
      },
      {
        question: 'Do you need a permit for sprinkler system installation in Idaho?',
        answer: 'Most Idaho cities require backflow preventer permits and inspections to protect drinking water supplies. Some cities require full irrigation system permits. We handle all permitting and coordination with city inspectors as part of our installation service. This ensures legal, code-compliant systems that won\'t cause issues when selling your home.'
      },
      {
        question: 'Can you add drip irrigation for trees and shrubs?',
        answer: 'Absolutely! Most quality systems include drip zones for trees, shrubs, and garden beds. Drip irrigation delivers water directly to root zones with 90-95% efficiency (vs. 50-70% for spray/rotor). It\'s ideal for established trees, shrub beds, vegetable gardens, and perennial borders. We design integrated systems combining spray/rotor for lawns with drip for plantings.'
      },
      {
        question: 'How soon after installation can I use my sprinkler system?',
        answer: 'Immediately! Once installation is complete and system is tested, you can begin using it right away. We program the controller with appropriate schedules and provide operation training. Many clients start their new system the day we finish installation.'
      },
      {
        question: 'Will installation damage my existing lawn and landscape?',
        answer: 'Temporary disruption is minimal. We use specialized trenching equipment that cuts narrow trenches (1-2 inches wide). Most lawn trenches heal completely in 2-3 weeks with proper watering. Landscape beds are carefully restored. Sod can be cut and replaced if needed. The long-term benefit far outweighs the brief installation impact.'
      },
      {
        question: 'What maintenance do sprinkler systems need?',
        answer: 'Annual spring startup and inspection, monthly checks during season for proper operation, fall winterization (blowout) before freezing temperatures, and occasional head adjustments as landscape matures. We offer maintenance packages covering all seasonal service. Properly maintained systems last 15-25+ years.'
      }
    ],
    relatedServices: ['irrigation-maintenance', 'sprinkler-blowout', 'smart-controller-upgrade', 'drip-irrigation'],
    pricingGuidance: 'Sprinkler system installation: $2,500-7,000 for most residential properties depending on size and zones. Smart controller upgrades add $200-400. Free design consultations and accurate quotes.',
    seasonality: 'Installed April through October. Spring installation (March-May) most popular for summer use. Fall installation possible if completed before freeze.',
    facts: [
      { label: 'Quarter-acre cost', value: '$2,500-5,000' },
      { label: 'Half-acre cost', value: '$4,000-7,000' },
      { label: 'Installation time', value: '2-4 days' },
      { label: 'Water savings', value: '30-50%' },
      { label: 'System lifespan', value: '15-25+ years' },
      { label: 'ROI period', value: '5-10 years' },
      { label: 'Trench depth', value: '6-8 inches' },
      { label: 'Property value increase', value: '5-15%' }
    ]
  },
  {
    slug: 'irrigation-repair',
    name: 'Sprinkler System Repair',
    category: 'landscaping-irrigation',
    shortDescription: 'Fast, professional sprinkler repair for broken heads, leaking valves, and irrigation system problems',
    longDescription: 'Sprinkler system problems waste water, damage lawns, and cost money every single day they go unfixed - a single broken sprinkler head can waste 200-300 gallons per day while a leaking valve can waste thousands of gallons monthly, driving up water bills and killing grass through overwatering or creating dead brown zones from lack of coverage. Our professional sprinkler repair service quickly diagnoses and fixes all irrigation problems ensuring your system operates efficiently, covers your entire landscape properly, and conserves water throughout the Idaho growing season. We handle everything from simple broken sprinkler head replacement to complex valve repairs, underground leak detection, controller troubleshooting, and complete system tune-ups. Most Idaho sprinkler systems develop problems eventually - lawn mowers hit and break heads, valves fail from age and debris, pipes crack from freeze-thaw cycles, wiring corrodes, timers malfunction, and coverage patterns change as landscapes mature. These aren\'t just minor annoyances - irrigation problems directly impact lawn health, waste significant water (typical leaking valve wastes 3,000-5,000 gallons monthly costing $20-40), create drainage issues and wet spots, stress plants through inconsistent watering, and violate local water restrictions in many Idaho communities. Our repair service addresses all common irrigation failures: broken or damaged sprinkler heads from mower strikes or vehicle traffic, leaking or stuck-open valves causing constant water flow and flooding, cracked or broken underground pipes from freezing, settling, or root intrusion, controller malfunctions preventing zones from running properly, low water pressure issues affecting coverage, mis-aimed heads watering driveways and sidewalks instead of lawns, and zones with dead spots or inadequate coverage. We service all major irrigation brands including Rain Bird, Hunter, Toro, Orbit, Irritrol, and generic systems common throughout Idaho subdivisions. Our service trucks stock hundreds of common parts enabling same-day repairs for most issues - spray heads, rotors, valves, valve diaphragms, solenoids, nozzles, swing joints, and fittings. For underground leaks, we use systematic troubleshooting combining visual inspection for soggy areas, pressure testing to confirm leaks, and strategic excavation to minimize landscape disruption. Once located, we repair pipe breaks using proper fittings, pressure test repairs, and completely restore landscaping. Every repair service includes comprehensive system evaluation - we don\'t just fix the immediate problem but inspect your entire system for additional issues, adjust mis-aimed heads, optimize run times and schedules, and provide recommendations for improving system performance. This preventive approach saves money by catching small problems before they become expensive failures.',
    benefits: [
      'Fast diagnosis and same-day repairs get system working immediately',
      'Stops water waste saving $20-40 monthly on typical leak repairs',
      'Prevents brown spots from broken heads and overwatered areas from leaking valves',
      'Expert repair of all irrigation brands Rain Bird, Hunter, Toro, Orbit',
      'Warranty on parts and labor provides peace of mind',
      'Emergency service available for major leaks and flooding',
      'Complete system optimization while onsite improves overall performance',
      'Much less expensive than system replacement (repairs typically $100-500 vs $3,000-7,000)',
      'Service trucks stocked with parts for same-day completion',
      'Underground leak detection and repair prevents landscape damage',
      'Controller troubleshooting and programming fixes timing issues',
      'Prevents lawn damage from inconsistent watering'
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
      },
      {
        question: 'How long do sprinkler repairs take?',
        answer: 'Most common repairs (broken heads, valve replacements, minor leaks) are completed in 1-3 hours same-day. Underground leak repairs may take 2-6 hours depending on location depth and accessibility. Controller replacements: 1-2 hours. We arrive with parts stocked to complete most repairs immediately.'
      },
      {
        question: 'Can broken sprinkler heads damage my lawn?',
        answer: 'Absolutely. Broken heads create dry brown spots where water doesn\'t reach, or cause overwatering and fungus in low areas where water pools. A single broken head can damage 200-500 sq ft of lawn within weeks. Quick repair prevents permanent turf damage requiring expensive renovation or sod replacement.'
      },
      {
        question: 'Do you offer emergency sprinkler repair service?',
        answer: 'Yes! For major leaks, flooding, or stuck-open valves wasting water, we offer same-day emergency service. Emergency service includes $25-50 premium but stops water waste immediately. Call us and we\'ll respond within 2-4 hours for emergencies.'
      },
      {
        question: 'Why is my water bill suddenly high?',
        answer: 'Sudden water bill increases usually indicate irrigation system leaks - a stuck-open valve, underground pipe break, or continuously running zone. A leaking valve can waste 3,000-5,000 gallons monthly adding $20-40 to bills. We can diagnose the source quickly and repair it, typically paying for itself in 1-2 months of water savings.'
      },
      {
        question: 'Can you adjust my sprinkler heads while repairing?',
        answer: 'Absolutely! Every repair service includes system-wide inspection and head adjustment at no additional charge. We fix the immediate problem but also adjust mis-aimed heads, optimize coverage, and identify other potential issues. This comprehensive approach prevents future problems.'
      },
      {
        question: 'How do I prevent sprinkler problems?',
        answer: 'Best prevention: annual spring startup and fall winterization, avoid mowing over or near heads, don\'t drive vehicles on lawn, mark head locations for contractors, and schedule regular system inspections. Proper winterization prevents 80% of freeze damage - Idaho\'s most common irrigation problem.'
      },
      {
        question: 'What causes sprinkler valves to fail?',
        answer: 'Valve failures result from debris clogging diaphragms (most common in Idaho\'s silty water), aging rubber diaphragms cracking, solenoid electrical failures, and freeze damage from inadequate winterization. Valves typically last 10-20 years with proper maintenance. We stock replacement valves for all major brands enabling same-day repair.'
      }
    ],
    relatedServices: ['sprinkler-blowout', 'irrigation-maintenance', 'sprinkler-system-installation', 'smart-controller-upgrade'],
    pricingGuidance: 'Service call: $75-125. Head replacement: $15-25 each. Valve repair: $150-300. Pipe repairs: $100-400 depending on location and length. Emergency service available.',
    seasonality: 'Repairs needed April through October (operating season). Highest demand May-July when problems are discovered. Emergency service available for major leaks.',
    facts: [
      { label: 'Service call', value: '$75-125' },
      { label: 'Head replacement', value: '$15-25 each' },
      { label: 'Valve repair', value: '$150-300' },
      { label: 'Typical repair time', value: '1-3 hours' },
      { label: 'Leaking valve waste', value: '3,000-5,000 gal/mo' },
      { label: 'Monthly waste cost', value: '$20-40' },
      { label: 'Emergency response', value: '2-4 hours' },
      { label: 'Repair season', value: 'April-October' }
    ]
  },
  {
    slug: 'irrigation-maintenance',
    name: 'Irrigation System Maintenance',
    category: 'landscaping-irrigation',
    shortDescription: 'Seasonal sprinkler system maintenance to optimize performance and prevent costly breakdowns',
    longDescription: 'Regular professional irrigation maintenance is the single most cost-effective way to ensure your sprinkler system operates efficiently, conserves water, protects your lawn investment, and avoids expensive emergency repairs throughout Idaho\'s demanding growing season. Our comprehensive irrigation maintenance service combines spring startup, mid-season optimization, and fall winterization to keep your system running at peak performance year after year. Most Idaho homeowners view their sprinkler systems as "set it and forget it" - turn them on in spring, let them run all summer, shut them off in fall. This approach leads to 30-50% water waste through mis-aimed heads, leaking valves, incorrect run times, and undetected problems that damage lawns and drive up utility bills. Professional maintenance prevents these costly issues while extending system lifespan from typical 12-15 years to 20-25+ years. Our spring startup service (March-April) prepares your system for the irrigation season after Idaho\'s harsh winters that can crack pipes, damage valves, and shift sprinkler heads. We methodically turn on water supply and pressurize the system slowly, check every zone for leaks or freeze damage, inspect and test all sprinkler heads for proper operation, adjust heads damaged by snow, frost heave, or winter equipment, replace broken or worn components, clean clogged nozzles and filters, test and repair valve operation, inspect controller and wiring for winter damage, program seasonal watering schedules appropriate for spring, and provide detailed report of all findings and repairs. Spring startup catches 80-90% of winter damage before it wastes water or damages lawns. Mid-season service (June-July) addresses problems that develop during use and optimizes system performance during peak water demand when Idaho\'s heat stresses lawns. We run complete system test checking all zones, identify coverage gaps or overwatering areas, adjust head aims as plantings mature and block coverage, replace heads damaged by mowers or traffic, optimize run times for summer heat and plant needs, check water pressure and adjust if needed, clean filters and flush lines, inspect for new leaks or valve problems, and verify controller programming matches current conditions. Mid-season service identifies problems before they cause permanent lawn damage requiring expensive renovation. Fall winterization (October) is absolutely critical in Idaho where ground freezes and temperatures drop below 20°F - proper winterization prevents 90% of winter damage saving hundreds in spring repairs. We shut down system properly and drain all water, blow out all pipes using compressed air (80+ PSI), ensure every drop of water is removed from pipes and valves, protect backflow preventers from freeze damage, shut off water supply and controller, and document system condition for spring startup.',
    benefits: [
      'Prevents expensive emergency repairs saving $300-800 annually',
      'Optimizes water efficiency reducing bills by 20-40% ($100-200/year)',
      'Ensures uniform coverage producing healthier greener lawn',
      'Extends irrigation system lifespan from 15 to 25+ years',
      'Seasonal programming adjustments prevent water waste',
      'Peace of mind knowing system is professionally maintained',
      'Priority emergency service for maintenance plan members',
      'Comprehensive service covers all seasonal needs',
      'Winterization prevents 90% of freeze damage ($400-800 savings)',
      'Early problem detection before lawn damage occurs',
      'Compliance with local water restrictions and guidelines',
      'Detailed service reports track system condition over time'
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
      },
      {
        question: 'How much does irrigation maintenance cost in Kuna and the Treasure Valley?',
        answer: 'Spring startup: $100-150. Mid-season checkup: $75-125. Fall winterization (blowout): $75-125. Annual maintenance plans covering all three services: $300-500 (saves $50-100 vs individual services). Maintenance plans include priority service, discounted repairs, and detailed service reports. Investment pays for itself through water savings and prevented repairs.'
      },
      {
        question: 'Is winterization really necessary every year in Idaho?',
        answer: 'Absolutely essential! Idaho winters with ground freezing and sub-20°F temperatures will destroy un-winterized irrigation systems. Water left in pipes expands when frozen, cracking pipes, valves, and backflow preventers. Repairs from skipped winterization typically cost $400-1,200. The $75-125 winterization cost prevents thousands in potential damage. Never skip winterization in Idaho.'
      },
      {
        question: 'What does sprinkler winterization include?',
        answer: 'Complete system shutdown, compressed air blowout of all pipes and lines at 80+ PSI, removal of every drop of water from system, protection of backflow preventer, water supply shutoff, controller shutdown, and documentation of system condition. Process takes 30-60 minutes for typical residential systems. Must be completed before hard freeze (typically late October in Idaho).'
      },
      {
        question: 'Can I do irrigation maintenance myself?',
        answer: 'Possible but not recommended. DIY startup/shutdown risks missing leaks, improper winterization leading to freeze damage, incorrect controller programming wasting water, and missed problems that become expensive repairs. Blowout requires $300-800 air compressor capable of 80+ PSI continuous flow. Professional service costs less than equipment rental and ensures proper maintenance.'
      },
      {
        question: 'What happens if I skip maintenance for a year?',
        answer: 'Skipped spring startup means unknown winter damage wasting water all season. No mid-season service allows small problems to escalate. Skipped winterization risks catastrophic freeze damage ($500-2,000 repairs). Properly maintained systems last 20-25+ years; neglected systems fail in 10-15 years. Annual maintenance is cheap insurance protecting a $3,000-7,000 asset.'
      },
      {
        question: 'Do maintenance plans include repairs?',
        answer: 'Plans include minor repairs and adjustments (head replacement up to 5, nozzle cleaning, minor leak repairs). Major repairs (valve replacement, pipe repairs, controller replacement) are quoted separately but plan members receive 10-15% discounts. Most clients need 0-2 major repairs per year with proper maintenance.'
      },
      {
        question: 'When is the best time to schedule mid-season service?',
        answer: 'June or July when your system has run for 2-3 months. This timing catches problems that develop during use (heads damaged by mowers, coverage issues from plant growth, valves wearing out) before peak summer heat stress when lawn damage happens fastest. Mid-season service optimizes performance for the hottest, most demanding part of the growing season.'
      }
    ],
    relatedServices: ['sprinkler-blowout', 'irrigation-repair', 'smart-controller-upgrade', 'sprinkler-system-installation'],
    pricingGuidance: 'Individual services: Spring startup $100-150, Mid-season checkup $75-125, Fall winterization $75-125. Annual maintenance plans: $300-500 covering all seasonal services.',
    seasonality: 'Spring startup (March-April), Mid-season service (June-July), Fall winterization (October). Plan members get priority scheduling.',
    facts: [
      { label: 'Spring startup cost', value: '$100-150' },
      { label: 'Winterization cost', value: '$75-125' },
      { label: 'Annual plan cost', value: '$300-500' },
      { label: 'Freeze damage cost', value: '$400-1,200' },
      { label: 'Water savings', value: '20-40%' },
      { label: 'Lifespan with maintenance', value: '20-25+ years' },
      { label: 'Winterization deadline', value: 'late October' },
      { label: 'Annual savings', value: '$300-800' }
    ]
  },
  {
    slug: 'tree-trimming',
    name: 'Tree Trimming & Pruning',
    category: 'landscaping-specialty',
    shortDescription: 'Professional tree trimming and pruning services for health, safety, and aesthetic enhancement',
    longDescription: 'Professional tree trimming and pruning are essential for maintaining healthy, safe, and beautiful trees throughout Idaho\'s Treasure Valley where mature shade trees, ornamental trees, and fruit trees are valuable landscape assets that require expert care to thrive in our unique semi-arid climate with harsh winters and hot, dry summers. Our ISA-certified arborists provide comprehensive tree care services including structural pruning for young trees, deadwood removal, canopy thinning to reduce wind resistance, crown reduction for size control, clearance pruning away from structures and power lines, fruit tree pruning for production, and restoration pruning for neglected or storm-damaged trees. Unlike untrained tree trimmers who often "top" trees (removing large branches randomly) causing permanent damage, structural weakness, disease vulnerability, and ugly growth patterns, our arborists follow proper pruning science preserving tree health while achieving your safety and aesthetic goals. Idaho trees face unique challenges requiring expert knowledge - extreme temperature swings from -10°F winters to 100°F summers stress trees, low humidity and clay soils affect water uptake and root health, high winds cause branch failures on improperly pruned trees, fire blight affects fruit trees and ornamentals requiring specific pruning protocols, and harsh winter storms break weak branches and cause ice damage. Professional pruning addresses these challenges by removing deadwood that breaks in storms and harbors disease, thinning crowns to reduce wind resistance by 20-40% preventing storm damage, raising canopies to prevent snow load on lower branches, correcting poor structure before branches fail, removing crossing branches that rub and create wounds, and maintaining appropriate clearance from homes preventing roof and siding damage. Our pruning service follows industry best practices and tree biology principles - we never remove more than 25% of live foliage in one season (over-pruning stresses trees), make proper cuts at branch collars promoting fast wound closure, maintain natural tree form rather than creating unnatural shapes, time pruning appropriately for each species (spring vs fall), and sterilize equipment between trees preventing disease spread. Common trees requiring regular pruning in Idaho include shade trees like ash, locust, maple, and elm that need structural pruning and deadwood removal every 3-5 years, ornamental trees like flowering pear, crabapple, and hawthorn needing annual shaping and disease control, fruit trees including apple, cherry, and plum requiring annual dormant season pruning for production and form, and evergreens like pine and spruce needing selective pruning to manage size and density.',
    benefits: [
      'Removes dead diseased hazardous branches preventing $5,000-20,000 damage',
      'Improves tree health and longevity extending lifespan by 10-20 years',
      'Enhances property safety reducing liability and insurance concerns',
      'Maintains natural tree shape and beauty increasing property value 3-7%',
      'Prevents branches from touching roof or power lines ($500-2,000 damage prevention)',
      'Allows better light penetration to lawn below improving turf health',
      'Reduces wind resistance by 20-40% preventing storm damage and tree failure',
      'ISA-certified arborists ensure proper technique following industry standards',
      'Fruit tree pruning increases production by 30-50% and fruit quality',
      'Clearance pruning prevents home siding and gutter damage',
      'Crown thinning reduces tree stress and improves air circulation',
      'Professional equipment and safety practices protect property and people'
    ],
    process: [
      { step: 1, title: 'Tree Assessment', description: 'Our arborist evaluates tree health, structure, and hazards. We discuss your goals: safety clearance, view enhancement, health improvement, or aesthetic shaping.' },
      { step: 2, title: 'Pruning Plan Development', description: 'We create a pruning strategy appropriate for tree species, age, and condition. Plan includes which branches to remove and proper pruning points to promote healthy regrowth.' },
      { step: 3, title: 'Safe Tree Access', description: 'Our climbers safely access the tree using ropes and harnesses (bucket trucks for accessible trees). All safety protocols and equipment are OSHA-compliant.' },
      { step: 4, title: 'Precision Pruning', description: 'Branches are pruned using proper three-cut technique to prevent bark tearing. Cuts are made at branch collar for optimal healing. We never top trees or leave ugly stubs.' },
      { step: 5, title: 'Branch Removal & Cleanup', description: 'All cut branches are removed and disposed of—disposal always included. Large wood can be cut into firewood rounds if desired. Smaller branches are chipped or hauled away.' },
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
      },
      {
        question: 'How often should trees be trimmed in Kuna and the Treasure Valley?',
        answer: 'Shade trees: every 3-5 years for structural maintenance. Ornamental trees: every 1-2 years for shape and health. Fruit trees: annually in dormant season for production. Young trees need more frequent training (every 1-2 years) to develop strong structure. Deadwood removal as needed anytime. Our arborists recommend timing during assessment.'
      },
      {
        question: 'What is tree "topping" and why is it bad?',
        answer: 'Topping is cutting back large branches to stubs or lateral branches too small to support growth. It causes permanent damage including stress, disease vulnerability, weak regrowth, ugly appearance, and shortened lifespan. Topped trees often become more hazardous long-term. Our arborists never top trees - we use proper reduction and thinning techniques.'
      },
      {
        question: 'Can tree trimming improve fruit production?',
        answer: 'Absolutely! Proper dormant season pruning of fruit trees (apples, cherries, plums) increases production by 30-50% and fruit quality significantly. Pruning opens canopy for sunlight penetration, removes competing branches, stimulates productive growth, and allows better spray coverage for pest/disease control. Annual fruit tree pruning is essential for good harvests.'
      },
      {
        question: 'Is tree trimming dangerous? Do you have insurance?',
        answer: 'Tree work is one of the most dangerous professions - OSHA rates it among top 10 hazardous jobs. Falling, chainsaw injuries, power line contact, and falling debris cause serious injuries. We are fully insured ($2 million liability, workers compensation) and our crews are trained in OSHA safety protocols, rigging, and climbing techniques. Never hire uninsured tree trimmers.'
      },
      {
        question: 'Can you save a tree that is partially dead or damaged?',
        answer: 'Often yes! If 40-60%+ of the tree is still healthy, strategic pruning can remove dead sections, reshape the tree, and promote healthy growth in viable portions. Our arborists assess each tree individually. Some trees are better candidates for removal, but many can be saved with expert pruning.'
      },
      {
        question: 'What happens to the wood and branches?',
        answer: 'Small branches are chipped on-site and hauled away. Large branches and trunk wood can be cut into firewood-length rounds and left for you (free firewood!), or we haul everything away. Cleanup is complete - your property will look perfect when we finish. Wood disposal/chipping is included in our pricing.'
      },
      {
        question: 'Can trimming prevent trees from breaking in windstorms?',
        answer: 'Yes! Proper crown thinning reduces wind resistance by 20-40%, allowing wind to pass through rather than catching the full force. Removing deadwood eliminates weak branches that break first. Correcting poor structure strengthens trees. Idaho windstorms cause extensive tree damage - preventive trimming dramatically reduces risk.'
      }
    ],
    relatedServices: ['tree-removal', 'stump-grinding', 'hedge-trimming', 'storm-damage-cleanup'],
    pricingGuidance: 'Tree trimming: $150-2000+ depending on size and scope. Average residential service: $400-700. Volume discounts for multiple trees. Emergency storm damage service available.',
    seasonality: 'Best: Late winter to early spring (February-April). Available year-round except during severe weather. High demand in spring and after summer storms.',
    facts: [
      { label: 'Small tree cost', value: '$150-400' },
      { label: 'Medium tree cost', value: '$400-900' },
      { label: 'Large tree cost', value: '$900-2,000+' },
      { label: 'Best timing', value: 'February-April' },
      { label: 'Shade tree frequency', value: 'Every 3-5 years' },
      { label: 'Fruit tree frequency', value: 'Annually' },
      { label: 'Wind resistance reduction', value: '20-40%' },
      { label: 'Fruit production increase', value: '30-50%' }
    ]
  },
  {
    slug: 'lawn-edging',
    name: 'Lawn Edging & Bed Borders',
    category: 'lawn-care',
    shortDescription: 'Professional lawn edging and bed border installation for crisp, defined landscape lines',
    longDescription: 'Professional lawn edging and bed border installation transforms average landscapes into polished, magazine-worthy outdoor spaces by creating clean, crisp definition between lawns, planting beds, pathways, and hardscape features throughout Kuna and Treasure Valley properties. Sharp, well-defined edges are the hallmark of professional landscape maintenance - they instantly make any property look more expensive, better maintained, and thoughtfully designed. Our comprehensive edging service includes bed border redefinition using proper curves and proportions, installation of permanent edging materials preventing grass encroachment, creation of precise borders that contain mulch and prevent soil migration, and enhancement of your property\'s overall curb appeal and structure. Most Idaho landscapes suffer from poorly defined or non-existent borders between lawn and beds - grass invades planting areas requiring constant hand-trimming and weeding, mulch migrates onto lawns creating mowing obstacles and messy appearance, bed lines become irregular and wavy from years of inattention, and the overall landscape lacks visual structure and definition. Professional edging solves all these maintenance headaches while dramatically improving appearance. We offer multiple edging solutions appropriate for different budgets, aesthetics, and maintenance preferences. Steel landscape edging provides the cleanest, most permanent solution with sleek modern appearance, invisible installation showing only a thin top edge, 25-30 year lifespan requiring zero maintenance, and complete grass blockage preventing invasion into beds. Plastic landscape edging offers economical permanent solution with good grass barrier properties, 8-15 year lifespan when quality materials are used, easy installation flexibility for curved beds, and availability in multiple colors (black, brown, green). Stone or brick edging delivers traditional, upscale appearance, works beautifully with formal landscape styles, provides extremely durable permanent solution (30-50 years), and can be mortared or dry-stacked depending on formality desired. Natural cut edges create budget-friendly option requiring no materials, work well for cottage gardens and informal landscapes, but require annual or bi-annual re-edging to maintain sharp definition. Idaho\'s clay soil and challenging growing conditions make proper edging especially important - our heavy clay prevents grass roots from spreading easily but also makes manual edging difficult, summer heat causes grass to aggressively expand into cooler, irrigated beds, and freeze-thaw cycles can shift improperly installed edging creating gaps. Professional installation accounts for these challenges ensuring long-lasting performance. Beyond functionality, well-designed bed borders dramatically improve landscape aesthetics through proportional bed sizing that balances lawn and planting areas, flowing curves that lead the eye naturally through the landscape, adequate bed width for proper plant groupings (minimum 3-4 feet for foundation beds), and strategic definition separating different landscape zones. Edging installation is often combined with mulch refresh for complete landscape transformation - fresh mulch inside newly defined borders creates stunning curb appeal instantly.',
    benefits: [
      'Creates crisp professional landscape definition increasing curb appeal 15-25%',
      'Prevents grass from invading flower beds reducing weeding time by 80%',
      'Keeps mulch and soil contained in beds preventing lawn contamination',
      'Makes mowing and trimming 30-40% faster and easier',
      'Reduces overall landscape maintenance time by 3-5 hours monthly',
      'Enhances property appearance instantly with minimal investment',
      'Permanent steel edging lasts 25-30 years with zero maintenance',
      'Adds visual structure and flow to landscape design',
      'Protects bed soil from lawn mower damage and compaction',
      'Creates mowing guide preventing bed encroachment and turf damage',
      'Increases property value and buyer appeal when selling',
      'Complements and enhances mulch, stone, and plantings'
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
      },
      {
        question: 'How much does lawn edging cost in Kuna and the Treasure Valley?',
        answer: 'Natural cut edging: $2-4 per linear foot (requires annual maintenance). Plastic edging: $3-6 per foot. Steel landscape edging: $6-12 per foot. Stone/brick edging: $8-18 per foot. Most residential properties need 50-150 linear feet. Complete front yard edging typically runs $300-1,200 depending on material choice. Combined with mulch installation for maximum impact.'
      },
      {
        question: 'Can you redesign my bed shapes or just edge existing beds?',
        answer: 'We can do both! Many clients want to redesign bed lines for better proportions, flow, and curb appeal. We create sweeping curves, geometric patterns, or traditional shapes based on your home style and preferences. Good bed design makes your entire landscape look more expensive and professionally planned. Free design consultation included.'
      },
      {
        question: 'Will steel edging rust and look bad?',
        answer: 'Quality steel landscape edging is powder-coated or made from cor-ten steel that develops a protective rust patina. It maintains structural integrity and clean appearance for 25-30 years. The thin top edge (1/4 inch) is barely visible once installed - you see crisp bed definition, not the edging itself. Much more attractive and durable than plastic.'
      },
      {
        question: 'How deep should landscape edging be installed?',
        answer: 'Proper installation depth is 4-6 inches depending on material. This depth blocks grass rhizomes that spread underground while providing stability against frost heave. Top edge sits 1-2 inches above soil level to contain mulch. DIY installations are often too shallow (2-3 inches) leading to grass invasion and shifting.'
      },
      {
        question: 'Can I install edging myself or should I hire professionals?',
        answer: 'DIY is possible but challenging - requires proper trenching tools, careful layout for smooth curves, correct depth installation, and proper staking/securing. Professional installation ensures uniform depth, smooth flowing lines, proper stake spacing, and long-lasting performance. Labor cost is relatively low vs materials - most clients find professional installation worth the investment.'
      },
      {
        question: 'Does edging work with Idaho clay soil and frost heaving?',
        answer: 'Yes when properly installed! We trench to proper depth (4-6 inches) below frost line disturbance. Plastic edging has more flexibility for heaving movement. Steel edging is rigid but properly staked installation resists heaving. Stone/brick must have proper base preparation. We account for Idaho freeze-thaw cycles in our installation techniques.'
      },
      {
        question: 'Should edging be installed before or after mulch?',
        answer: 'Edging first, mulch second for best results. Edging creates the boundary that contains mulch and prevents migration. We often install edging and mulch in same visit for complete landscape transformation. Sharp new edges filled with fresh mulch create stunning instant curb appeal. Many clients combine these services for maximum impact.'
      }
    ],
    relatedServices: ['mulch-installation', 'bed-preparation', 'landscape-design', 'seasonal-cleanup'],
    pricingGuidance: 'Lawn edging installation: $2-18 per linear foot depending on material. Average front yard: $300-1,200. Free quotes with material recommendations based on budget.',
    seasonality: 'Installed April through October when ground is workable. Spring (April-May) is most popular for combination with mulch installation. Fall installation also common.',
    facts: [
      { label: 'Steel edging cost', value: '$6-12/linear ft' },
      { label: 'Plastic edging cost', value: '$3-6/linear ft' },
      { label: 'Stone/brick cost', value: '$8-18/linear ft' },
      { label: 'Typical front yard', value: '$300-1,200' },
      { label: 'Steel lifespan', value: '25-30 years' },
      { label: 'Installation depth', value: '4-6 inches' },
      { label: 'Maintenance reduction', value: '80%' },
      { label: 'Curb appeal increase', value: '15-25%' }
    ]
  },
  {
    slug: 'christmas-light-installation',
    name: 'Christmas Light Installation',
    category: 'christmas-lights',
    shortDescription: 'Professional Christmas light installation and removal service for homes and businesses, including permanent app-controlled lighting',
    longDescription: 'Transform your Idaho home into a spectacular winter wonderland with our professional Christmas light installation service, now offering both traditional seasonal lights and cutting-edge permanent lighting systems. Choose traditional seasonal installation designed for the Treasure Valley\'s unique winter conditions, or upgrade to permanent lighting that stays on your home year-round and gives you complete control through a smartphone app. We eliminate the hassle, danger, and frustration of DIY holiday decorating by handling everything from initial design consultation through post-season takedown and storage. Our experienced, insured crews safely install premium commercial-grade LED lights on rooflines, peaks, eaves, trees, shrubs, walkways, columns, and landscape features using professional-grade clips and mounting systems that never damage your siding, gutters, or trim. Unlike cheap big-box store lights that burn out after one season, we provide energy-efficient LED lights rated for 50,000+ hours that stay bright and vibrant throughout Idaho\'s cold winters, wind storms, and occasional heavy snow. Each installation is custom-designed to highlight your home\'s architectural features and create the stunning display you envision - from classic white elegance to colorful traditional displays to modern animated lighting. We handle all electrical connections, timer programming, and testing to ensure everything works perfectly from day one. Throughout the holiday season, we monitor weather conditions and provide complimentary mid-season service if Idaho winds damage connections or if any bulbs need replacement. You simply flip the switch and enjoy the magic. After the holidays, we carefully remove every light, clip, and extension cord, pack everything in organized storage tubs, and either return them to you or store them professionally for next season. Our storage service protects your investment and eliminates the frustration of tangled lights and missing components. With service throughout Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle, we\'ve been creating stunning holiday displays since 2010. This full-service approach saves you 8-12 hours of dangerous ladder work and allows you to focus on what really matters during the holidays - spending time with family and friends while your home becomes the showcase of the neighborhood.',
    benefits: [
      'Professional custom design creates stunning neighborhood showcase displays',
      'Eliminates dangerous ladder work and roof safety risks completely',
      'Premium commercial-grade LED lights provided - last 50,000+ hours',
      'PERMANENT LIGHTING: Full smartphone app control with millions of color combinations',
      'PERMANENT LIGHTING: Celebrate every holiday year-round - Christmas, July 4th, Halloween, game days',
      'PERMANENT LIGHTING: Zero annual maintenance - installed once, controlled forever via app',
      'PERMANENT LIGHTING: Discreet year-round mounting - barely visible when not illuminated',
      'TRADITIONAL LIGHTING: Installation and post-season removal included in one price',
      'TRADITIONAL LIGHTING: Professional storage service option available',
      'Saves 8-12 hours of your valuable holiday time annually',
      'All lights tested before installation ensures perfect operation',
      'Complimentary mid-season storm damage repair (traditional) or comprehensive warranty (permanent)',
      'Energy-efficient LEDs reduce electricity costs by 80-90%',
      'No damage to siding, gutters, or trim - professional mounting systems only',
      'Withstands Idaho winter weather - wind, snow, and cold rated',
      'Fully insured crews provide peace of mind and quality guarantee',
      'Instant color changes from your phone - no ladder required ever again'
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
        answer: 'We install Thanksgiving week through mid-December. Book in October for best availability - prime weeks book up fast! Our schedule fills quickly as November approaches. Early booking ensures you get installation before your holiday parties and gatherings.'
      },
      {
        question: 'How much does professional Christmas light installation cost in Idaho?',
        answer: 'Typical homes (1,500-2,500 sq ft): $400-1,200. Larger homes (2,500-4,000 sq ft): $1,200-2,000. Premium/elaborate displays: $2,000-3,500+. Cost includes design, all equipment, commercial-grade lights, installation, mid-season service, and post-holiday removal. Storage service adds $75-150/year.'
      },
      {
        question: 'Do I need to provide the lights or equipment?',
        answer: 'No! We provide everything - commercial-grade LED lights, extension cords, professional clips, timers, and all installation equipment. You provide nothing but the vision. Our lights are rated for 50,000+ hours and much more durable than consumer-grade products.'
      },
      {
        question: 'What if lights go out or get damaged during the season?',
        answer: 'We include complimentary mid-season service with every installation. If bulbs burn out, connections fail, or Idaho winds damage the display, just call us. We\'ll come repair or replace at no additional charge. Most issues are fixed within 24-48 hours.'
      },
      {
        question: 'Do you take the lights down after Christmas?',
        answer: 'Yes! Removal is included in every installation package. We typically remove lights in January (after New Year\'s). Everything is carefully removed without damaging your home. Lights are packed in organized tubs and either returned to you or placed in our storage service.'
      },
      {
        question: 'Can you install lights on two-story homes or steep roofs?',
        answer: 'Absolutely! We specialize in challenging installations. We have professional safety equipment including harnesses, ladder stabilizers, and bucket truck access for tall homes. Two-story homes, steep pitches, and difficult access are routine for our experienced crews.'
      },
      {
        question: 'Are LED lights really worth the extra cost?',
        answer: 'Yes! LEDs use 80-90% less electricity than incandescent bulbs - typical display costs $15-30 for entire season vs. $150-200. LEDs last 50,000+ hours (decades of use), stay cool so they\'re safer, and maintain consistent color. They pay for themselves in 2-3 seasons just in energy savings.'
      },
      {
        question: 'What styles and colors of lights do you offer?',
        answer: 'We offer complete flexibility: classic warm white, cool white, multicolor traditional, all blue, all red, color-changing RGB, and custom combinations. Styles include C9 bulbs (classic large), mini lights (dense coverage), icicle lights, net lights for bushes, and rope lighting for unique applications. We match your vision.'
      },
      {
        question: 'Will the installation damage my gutters, siding, or roof?',
        answer: 'No! We use professional-grade clips specifically designed for each surface type - never staples, nails, or screws. Our clips grip securely without penetrating materials. We\'ve installed thousands of displays without damage. If any accidental damage occurs, we repair it immediately at our expense.'
      },
      {
        question: 'Do you offer commercial Christmas light installation?',
        answer: 'Yes! We handle commercial properties including retail centers, office buildings, restaurants, and HOA common areas. Commercial installations include higher-grade components, custom designs for business branding, and flexible installation timing to minimize business disruption. Contact us for commercial quotes.'
      },
      {
        question: 'Can I keep the same design every year with storage service?',
        answer: 'Absolutely! Our storage service protects your lights in climate-controlled space and maintains detailed records of your design. Next season, we reinstall the exact same display - no redesign needed unless you want changes. This saves time and ensures consistency year after year.'
      },
      {
        question: 'What happens if it snows before/during installation?',
        answer: 'We install in snow and cold - it\'s Idaho! Our crews work safely in winter conditions. Heavy snow may delay installation 1-2 days for safety, but we push through typical Idaho winter weather. Most installations happen before significant snow. If weather is severe, we reschedule to the next available day.'
      },
      {
        question: 'What is permanent lighting and how does it work?',
        answer: 'Permanent lighting is a revolutionary year-round lighting system installed once on your roofline. LED track lights remain discreetly mounted 365 days a year. Using a smartphone app, you control everything: colors (millions of combinations), patterns, brightness, schedules, and animations. Change from red/green for Christmas to red/white/blue for July 4th to orange for Halloween - all instantly from your phone without ever touching a ladder.'
      },
      {
        question: 'How much does permanent lighting cost compared to traditional seasonal lights?',
        answer: 'Permanent lighting typically costs $12-18 per linear foot installed (one-time cost). A typical home (200 linear feet) runs $2,400-3,600. Traditional seasonal lighting costs $3.50-5 per foot annually. Permanent lighting pays for itself in 3-4 years by eliminating annual installation/removal costs. Plus you gain unlimited use for every holiday and event year-round.'
      },
      {
        question: 'Can you really see permanent lights when they\'re not turned on?',
        answer: 'The track system is designed to be extremely discreet - typically mounted along the roofline, it\'s barely noticeable when not illuminated. The low-profile design blends with your home\'s architecture. Most homeowners and neighbors don\'t even notice they\'re there until you turn them on. It\'s nothing like having visible Christmas lights up year-round.'
      },
      {
        question: 'What can I control with the permanent lighting app?',
        answer: 'Complete control: Choose from millions of colors and color combinations. Create custom patterns and animations. Set schedules (automatic on/off times). Adjust brightness levels. Save favorite scenes for holidays. Create dynamic effects like chasing, fading, twinkling. Control individual sections separately. Access pre-programmed holiday themes. All controlled from your smartphone or tablet - iOS and Android compatible.'
      },
      {
        question: 'Does permanent lighting require maintenance or replacement?',
        answer: 'Minimal maintenance required. LED lights are rated for 50,000+ hours (decades of typical use). The system is fully weatherproof and designed to withstand Idaho\'s harshest winters. We provide a comprehensive warranty covering components and installation. No annual takedown/reinstallation means no wear and tear from handling. No storage needed. No tangled wires. Set it and forget it - except when you want to show off your team colors!'
      },
      {
        question: 'Can permanent lighting handle Idaho winter weather and snow?',
        answer: 'Absolutely! Permanent lighting systems are specifically engineered for extreme weather conditions including heavy snow, ice, high winds, and temperature extremes (-40°F to 140°F). The sealed LED track system is completely waterproof and designed to perform flawlessly in Idaho winters. In fact, because the system is permanently mounted with professional weatherproof connections, it\'s MORE reliable than traditional lights that can fail from seasonal handling and weather exposure.'
      }
    ],
    relatedServices: ['landscape-lighting', 'outdoor-lighting', 'holiday-decor'],
    pricingGuidance: 'TRADITIONAL: $3.50-5/ft annually (typical homes $400-1,200). Includes installation, lights, removal, mid-season service. Storage: +$75-150/year. PERMANENT: $12-18/ft one-time (typical homes $2,400-3,600). Year-round control via app, comprehensive warranty, zero annual costs.',
    seasonality: 'Installation: November-December (book in October). Removal: January. High demand - early booking essential.',
    facts: [
      { label: 'Typical home cost', value: '$400-1,200' },
      { label: 'LED energy savings', value: '80-90%' },
      { label: 'LED bulb lifespan', value: '50,000+ hours' },
      { label: 'Best booking time', value: 'October' },
      { label: 'Installation season', value: 'Nov-Dec' },
      { label: 'Removal time', value: 'January' },
      { label: 'Mid-season service', value: 'included' },
      { label: 'Storage service', value: '+$75-150/year' }
    ]
  },
  {
    slug: 'lawn-renovation',
    name: 'Lawn Renovation',
    category: 'lawn-care',
    shortDescription: 'Complete lawn renovation service to transform tired, thin lawns into thick, healthy turf',
    longDescription: 'When your Idaho lawn is more weeds than grass, thin and patchy, or simply failing despite your best efforts, complete lawn renovation is the transformative solution you need. Our comprehensive renovation service completely rebuilds your lawn from the ground up without the massive expense and disruption of full sod replacement. This intensive, multi-step process transforms failing lawns into thick, lush carpets of healthy grass in just 6-8 weeks for a fraction of sod installation costs. The renovation process begins with aggressive power raking (dethatching) that removes most of the existing poor-quality turf, thatch accumulation, and embedded weed growth - essentially creating a fresh slate for new grass establishment. We then perform multiple passes of core aeration to relieve the severe soil compaction common in Idaho\'s clay-based soils, creating thousands of perfect germination pockets for grass seed. Premium grass seed specifically selected for Treasure Valley climate conditions is broadcast at heavy renovation rates (8-10 pounds per 1,000 square feet - triple the normal overseeding rate) to ensure thick, dense coverage. The seed blend typically includes Kentucky bluegrass for durability and self-repair, turf-type tall fescue for drought resistance and heat tolerance, and perennial ryegrass for quick germination and establishment. Professional-grade starter fertilizer with high phosphorus content is applied to promote explosive root development, while compost top-dressing (1/4 inch layer) improves soil structure, moisture retention, and provides slow-release nutrients throughout the growing season. This soil amendment is particularly beneficial in Idaho where heavy clay soils often lack organic matter and proper drainage. The result is a lawn that looks and performs like new sod at 50-70% cost savings. Within 7-14 days you\'ll see germination, in 3-4 weeks noticeable thickness, and by 6-8 weeks a transformation so dramatic your neighbors will think you installed new sod. Renovation is ideal for lawns that are more than 50% weeds, have thin or bare areas throughout, suffer from persistent disease problems, or simply haven\'t responded to normal lawn care treatments.',
    benefits: [
      'Transforms weed-infested lawns into thick, healthy turf in 6-8 weeks',
      'Costs 50-70% less than complete sod replacement',
      'Introduces modern disease-resistant grass varieties with better performance',
      'Dramatically improves clay soil structure through compost amendment',
      'Results in thicker, greener, more resilient lawn long-term',
      'Reduces future weed pressure by 80-90% through dense turf',
      'Minimal property disruption compared to sod tear-out and replacement',
      'Provides permanent solution versus temporary cosmetic fixes',
      'Creates self-repairing lawn from bluegrass spreading growth habit',
      'Improves drought tolerance through deep root development',
      'Reduces watering needs by 20-30% versus old, shallow-rooted lawn',
      'Increases property value and curb appeal dramatically'
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
        answer: 'Renovation is much more aggressive and transformative. We remove 60-80% of existing turf through heavy power raking, perform multiple aeration passes, seed at triple the normal rate (8-10 lbs per 1,000 sq ft vs. 3-4 lbs), add compost top-dressing, and use starter fertilizer. Overseeding is maintenance for good lawns; renovation is rebuilding for failing lawns.'
      },
      {
        question: 'When should I renovate my lawn in Idaho?',
        answer: 'Fall (late August through mid-September) is ideal for Idaho. Soil is still warm (60-75°F) for germination, but cooler air reduces stress. Fall moisture from September rains helps establishment. Spring (April-May) works but you\'ll battle crabgrass and other weeds. Fall renovation success rate is 80-90% vs. 60-70% in spring.'
      },
      {
        question: 'How long until my lawn looks good after renovation?',
        answer: 'Timeline: Visible germination in 7-14 days. Noticeable green thickness in 3-4 weeks. Thick, lush lawn in 6-8 weeks. Full maturity and complete fill-in by following spring. Results are so dramatic neighbors will think you installed new sod. First mowing typically happens at 3-4 weeks.'
      },
      {
        question: 'Can I walk on the lawn during recovery?',
        answer: 'Minimize traffic for first 3-4 weeks to allow seed germination and root development. Light foot traffic (walking to mailbox, etc.) is okay after 2 weeks. Avoid heavy use, pet play, or sports until grass reaches mowing height (typically 4-6 weeks). Full traffic tolerance develops by 8-10 weeks.'
      },
      {
        question: 'How much does lawn renovation cost compared to new sod?',
        answer: 'Renovation: $0.40-0.75 per sq ft all-inclusive. New sod installation: $1.00-2.00 per sq ft. For typical 5,000 sq ft lawn: Renovation = $2,000-3,750. Sod = $5,000-10,000. You save 50-70% with renovation while getting similar end results. Renovation also improves soil, which sod installation doesn\'t address.'
      },
      {
        question: 'Is my lawn a good candidate for renovation vs. total replacement?',
        answer: 'Good candidates: Lawns with 30-70% weeds, thin/patchy areas, persistent disease, or poor grass varieties. Not candidates: Severe grading issues, major drainage problems, or compacted construction soil that needs excavation. If you have 30%+ viable grass and relatively level ground, renovation works great. We provide free assessment.'
      },
      {
        question: 'What kind of grass seed do you use for renovation?',
        answer: 'We use premium blends specifically formulated for Idaho: Kentucky bluegrass (50-60% for spreading/self-repair), turf-type tall fescue (30-40% for drought tolerance and durability), and perennial ryegrass (10-20% for quick establishment). All seed is certified, weed-free, and selected for disease resistance. No cheap contractor-grade seed.'
      },
      {
        question: 'How much watering is required after renovation?',
        answer: 'Critical first 3 weeks: Keep surface moist (light watering 2-3 times daily for 10 minutes). Weeks 4-6: Water deeply once daily. Weeks 7-8: Transition to normal schedule (2-3 times weekly). Total water use is high initially but tapers quickly. We provide detailed watering schedule and follow-up support.'
      },
      {
        question: 'Will the renovation damage my sprinkler system?',
        answer: 'No damage if heads are marked. We flag all sprinkler heads before power raking and aeration. Our equipment is designed to work around irrigation. If you have shallow lines or pop-up heads, notify us during assessment so we can take extra precautions. Minor adjustments to heads are included if needed.'
      },
      {
        question: 'Can you renovate part of my lawn or does it have to be the whole thing?',
        answer: 'We can renovate specific areas (front yard only, problem zones, etc.). However, full-lawn renovation provides best results and value. Partial renovation still requires same equipment mobilization, so per-square-foot cost is higher. Minimum size is typically 2,000 sq ft for equipment efficiency. We can quote both options.'
      },
      {
        question: 'What should I do to prepare my lawn before renovation?',
        answer: 'Nothing! We handle all preparation. Don\'t fertilize or apply weed killer for 3-4 weeks before renovation. Keep lawn mowed at normal height. Ensure irrigation system is working properly. Mark any hidden utilities, invisible dog fences, or shallow sprinkler lines. We do the rest.'
      },
      {
        question: 'Do you offer any guarantees on renovation success?',
        answer: 'We guarantee 80%+ germination and coverage if you follow our watering instructions. If germination is poor due to our error (bad seed, improper application), we\'ll reseed thin areas at no charge. Success requires your commitment to watering - that\'s the #1 factor. We provide ongoing support and will inspect at 2-3 weeks to ensure you\'re on track.'
      }
    ],
    relatedServices: ['aeration', 'overseeding', 'dethatching', 'sod-installation'],
    pricingGuidance: 'Lawn renovation: $0.40-0.75 per sq ft. Typical 5,000 sq ft lawn: $2,000-3,750 all-in. Much less than sod replacement.',
    seasonality: 'Best: Late August to mid-September. Spring: April-May. Peak demand in fall - book by July for September service.',
    facts: [
      { label: 'Cost per sq ft', value: '$0.40-0.75' },
      { label: 'Typical 5,000 sq ft', value: '$2,000-3,750' },
      { label: 'Sod cost savings', value: '50-70%' },
      { label: 'Best timing', value: 'late Aug-mid Sept' },
      { label: 'Germination time', value: '7-14 days' },
      { label: 'Thick lawn time', value: '6-8 weeks' },
      { label: 'Seed rate', value: '8-10 lbs/1,000 sq ft' },
      { label: 'Success rate (fall)', value: '80-90%' }
    ]
  },
  {
    slug: 'tree-removal',
    name: 'Tree Removal',
    category: 'landscaping-specialty',
    shortDescription: 'Professional tree removal service for dead, dying, hazardous, or unwanted trees',
    longDescription: 'Professional tree removal is a critical service when trees become hazardous, diseased beyond saving, interfere with structures or utilities, or simply no longer fit your landscape plans. In Idaho\'s Treasure Valley, common reasons for tree removal include storm-damaged trees threatening homes, dead or dying trees creating liability, diseased trees spreading infection to healthy specimens, and overgrown trees damaging foundations, driveways, or underground utilities. Our ISA-certified arborists and experienced removal crews safely eliminate trees of any size using specialized equipment, advanced rigging techniques, and industry-standard safety protocols. We handle everything from small ornamental trees to massive 80-foot cottonwoods, pines, and poplars common in Idaho landscapes. Tree removal is dangerous work requiring professional expertise - attempting DIY removal causes thousands of injuries annually and frequently results in property damage costing far more than professional service. Our crews use climbing harnesses, rigging ropes, cranes, bucket trucks, and specialized cutting equipment to systematically dismantle trees from top down, carefully lowering each section to prevent damage to structures, landscaping, sprinkler systems, and neighboring properties. For trees in extremely tight spaces near homes, garages, or fences, we employ piece-by-piece removal - sometimes cutting sections as small as 3-4 feet to thread them between obstacles. Every removal begins with thorough assessment by our arborists who evaluate tree health, structural integrity, lean direction, proximity to hazards, and optimal removal approach. We identify underground utilities, mark sprinkler systems, protect surrounding plants with barriers, and establish safety perimeters. Our $2 million liability insurance and workers\' compensation coverage protect you from any risk - if the unexpected happens, you\'re fully protected. Complete cleanup is included with every removal - all branches, trunk sections, and debris are hauled away and properly disposed of or recycled. Wood can be cut into firewood rounds if desired at no charge. Stump grinding is available to eliminate the remaining stump 6-12 inches below grade, leaving the area ready for grass, landscaping, or new plantings. We provide 24/7 emergency tree removal for storm-damaged or fallen trees threatening structures or blocking access. Our rapid response teams mobilize quickly to secure your property and remove hazards. With service throughout Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle, we\'ve safely removed thousands of trees since 2010.',
    benefits: [
      'Eliminates hazardous or dead trees safely before they cause damage',
      'ISA-certified arborists ensure proper assessment and technique',
      'Licensed and fully insured with $2M liability coverage',
      'Specialized rigging equipment enables safe removal in tight spaces',
      'Complete cleanup and debris haul-away included in price',
      'Stump grinding available to finish job completely',
      'Protects structures, utilities, and surrounding landscape',
      'Fast 24/7 emergency storm damage response available',
      'No damage to property - professional precision work',
      'Free detailed estimates with no obligation or pressure',
      'Wood can be cut into firewood at no charge if desired',
      'Removes liability risk from dangerous or dying trees'
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
        question: 'How much does tree removal cost in Idaho?',
        answer: 'Small trees (under 30 ft): $300-800. Medium trees (30-60 ft): $800-2,000. Large trees (60-80 ft): $2,000-4,000. Very large trees (80+ ft): $4,000-8,000+. Factors affecting cost: tree size, species (hardwood vs. softwood), location difficulty, access constraints, proximity to structures, number of cuts required, cleanup difficulty. We provide free detailed estimates with clear pricing.'
      },
      {
        question: 'Do I need a permit to remove a tree in Kuna, Boise, or Meridian?',
        answer: 'Most residential properties in the Treasure Valley don\'t require permits for tree removal on private property. However, some HOAs have tree preservation requirements, and some cities have protected species ordinances (heritage trees, certain sizes). Kuna and Meridian are generally permissive. Some Boise neighborhoods have restrictions. We can advise on local requirements and help with any needed permits.'
      },
      {
        question: 'Can you remove a tree that\'s very close to my house or garage?',
        answer: 'Yes! We specialize in challenging removals near structures. Using advanced rigging systems, ropes, pulleys, and piece-by-piece dismantling, we safely remove trees with branches overhanging roofs or trunks just feet from foundations. Our crews are trained in precision cutting and controlled lowering techniques. Trees between houses, near pools, or above buried utilities are routine for us.'
      },
      {
        question: 'What happens to the wood after tree removal?',
        answer: 'Standard service includes hauling all wood and debris away - we handle disposal/recycling. If you want firewood, we\'ll cut the trunk into 16-18 inch rounds and stack them at no charge - great for cottonwood, locust, ash, and fruit trees. Large diameter wood can also be milled into lumber. Branches and leaves are chipped or composted.'
      },
      {
        question: 'Do you offer 24/7 emergency tree removal service?',
        answer: 'Yes! We provide round-the-clock emergency response for storm-damaged trees, trees fallen on structures, trees blocking roads/driveways, or hanging limbs threatening to fall. We respond within 2-4 hours in most cases. Emergency service includes securing the scene, removing immediate hazards, and either complete removal or making safe until full removal can be scheduled. Premium emergency rates apply for after-hours service.'
      },
      {
        question: 'Is tree removal dangerous? Why not just do it myself?',
        answer: 'Tree removal is one of the most dangerous tasks in landscaping. According to OSHA, tree work causes 100+ deaths annually. Risks include: falling from heights, chainsaw injuries, struck by falling limbs (widow-makers), electrocution from power lines, structural collapse, and property damage. Professional crews have safety training, proper equipment (harnesses, ropes, rigging), insurance, and experience. DIY tree removal often costs more after medical bills and property repairs than hiring professionals initially.'
      },
      {
        question: 'How long does tree removal take?',
        answer: 'Timeline varies by tree size and complexity. Small trees (under 30 ft): 2-4 hours including cleanup. Medium trees (30-60 ft): 4-8 hours. Large trees (60+ ft) or difficult access: Full day or more. Very large trees or those requiring crane access may take 2-3 days. Weather, crew availability, and permit requirements can extend timeline. We provide estimated timeframe with every quote.'
      },
      {
        question: 'Will removing a tree damage my lawn or landscaping?',
        answer: 'We minimize lawn damage through careful planning and protection measures. We lay plywood over high-traffic areas, establish single access routes, and use lighter equipment when possible. Some turf compression is unavoidable with heavy equipment, but it recovers in 2-4 weeks. We can restore any damaged areas with topsoil and seed if needed. Benefits of removing a hazardous tree far outweigh temporary lawn disturbance.'
      },
      {
        question: 'Should I remove a tree that looks dead or just wait and see?',
        answer: 'Dead or dying trees should be removed promptly - they become increasingly dangerous as they deteriorate. Dead wood loses structural integrity, branches break off without warning, and root decay can cause unexpected collapse. Waiting increases risk and often increases cost as access becomes more difficult. If you\'re unsure whether a tree is dead, our arborists can assess it. Signs of death: no leaf/needle growth in growing season, brittle branches, extensive bark loss, mushrooms at base (root rot).'
      },
      {
        question: 'Can you remove just part of a tree instead of the whole thing?',
        answer: 'Yes! Strategic pruning or crown reduction can eliminate hazardous portions while keeping the tree. We remove dead/dying branches, reduce height to clear structures, or remove limbs overhanging roofs. However, some situations require complete removal: trees with systemic disease, severe structural damage, root problems, or trees too close to foundations. Our arborists will recommend the best approach based on tree health and your goals.'
      },
      {
        question: 'What\'s included in your tree removal service?',
        answer: 'Complete service includes: On-site assessment and quote, all labor and equipment (climbers, saws, ropes, trucks, chippers), systematic tree dismantling, careful lowering of all sections, complete debris removal and haul-away, cleanup of work area, and final walk-through. Optional add-ons: stump grinding, firewood cutting/stacking, root removal, and site restoration. We leave your property clean and safe.'
      },
      {
        question: 'Do you have insurance and what does it cover?',
        answer: 'We carry $2 million general liability insurance and full workers\' compensation coverage. Liability insurance covers any accidental property damage during removal (structures, vehicles, landscaping, utilities). Workers\' comp protects you from liability if crew members are injured on your property. We provide certificates of insurance upon request before starting work. Never hire uninsured tree services - you assume all liability for injuries and damage.'
      }
    ],
    relatedServices: ['stump-grinding', 'tree-trimming', 'storm-damage-cleanup', 'emergency-tree-service'],
    pricingGuidance: 'Tree removal: $300-5,000+ depending on size and difficulty. Average: $1,200-1,800. Stump grinding: +$150-400. Emergency service: Premium rates apply.',
    seasonality: 'Year-round service. High demand after storms. Winter removal common (less landscaping damage). Book ahead for non-emergency work.',
    facts: [
      { label: 'Small tree cost', value: '$300-800' },
      { label: 'Medium tree cost', value: '$800-2,000' },
      { label: 'Large tree cost', value: '$2,000-4,000' },
      { label: 'Average removal', value: '$1,200-1,800' },
      { label: 'Emergency response', value: '2-4 hours' },
      { label: 'Insurance coverage', value: '$2M liability' },
      { label: 'Service availability', value: '24/7 emergency' },
      { label: 'Firewood cutting', value: 'included free' }
    ]
  },
  {
    slug: 'stump-grinding',
    name: 'Stump Grinding & Removal',
    category: 'landscaping-specialty',
    shortDescription: 'Complete stump grinding and removal service to eliminate unsightly stumps from your landscape',
    longDescription: 'Stump grinding is the most effective and economical method to completely eliminate tree stumps from your Idaho property, transforming unsightly remnants into usable landscape space. After tree removal, stumps become permanent eyesores that attract pests, create trip hazards, harbor diseases that can spread to healthy trees, sprout persistent new growth requiring constant maintenance, and waste valuable yard space that could be lawn, garden, or patio. Our professional stump grinding service uses powerful commercial grinders with carbide-tipped cutting wheels that pulverize stumps and their major root systems 6-12 inches below ground level - deep enough for grass, plantings, or hardscaping to thrive over the area. This process is dramatically faster, less expensive, and far less disruptive than traditional stump removal (excavation) which requires backhoes, leaves massive holes requiring fill dirt, and destroys surrounding landscaping. Stump grinding produces wood chips as the only byproduct, which we remove completely as part of standard service or can spread in your flower beds as free mulch if desired - they make excellent organic mulch after a few months of composting. We handle stumps of any size, from small ornamental tree stumps 6-8 inches in diameter to massive cottonwood, pine, or poplar stumps 48+ inches across. Our fleet includes different-sized grinders allowing access to tight spaces - we can grind stumps just inches from fences, foundations, retaining walls, or other obstacles that would be impossible with excavation equipment. The grinding process is methodical and controlled: we lower the grinding wheel onto the stump, systematically reducing it to wood chips while working below grade to eliminate all visible wood and the top portion of the root system. Surface roots extending into lawn areas are also ground down. After grinding, the resulting crater is filled with the remaining wood chips and topped with soil, creating a smooth, level surface ready for immediate use. For areas where you plan to replant trees, we can grind deeper (12-18 inches) to ensure complete root removal and eliminate any potential disease transfer. The entire process typically takes 30 minutes to 2 hours depending on stump size and hardness. Idaho hardwoods like locust and oak grind more slowly than softwoods like cottonwood and pine. We provide same-day or next-day service in most cases, and can often grind multiple stumps in a single visit with volume discounts. Service throughout Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle.',
    benefits: [
      'Eliminates unsightly stumps completely and permanently',
      'Removes trip hazards and liability concerns from property',
      'Frees valuable space for lawns, gardens, or new plantings',
      'Prevents regrowth and persistent sucker sprouts',
      'Costs 60-80% less than traditional stump excavation',
      'Minimal landscape disruption compared to digging out stumps',
      'Wood chips removed or recycled as free mulch for beds',
      'Same-day or next-day service available in most cases',
      'Can grind stumps in tight spaces inaccessible to excavators',
      'Prevents disease spread to healthy trees from rotting stumps',
      'Eliminates pest habitat including carpenter ants and termites',
      'Increases property value and curb appeal dramatically'
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
        question: 'How much does stump grinding cost in Idaho?',
        answer: 'Pricing is typically $3-8 per inch of stump diameter measured at widest point. Small stumps (12-20 inches): $150-250. Medium stumps (20-30 inches): $250-350. Large stumps (30-42 inches): $350-500. Very large stumps (42+ inches): $500-800+. Multiple stumps on same property receive volume discounts (typically 10-20% off). Difficult access or very hard species may cost more. Free quotes provided.'
      },
      {
        question: 'How deep do you grind stumps below ground?',
        answer: 'Standard grinding is 6-12 inches below grade - sufficient for planting grass, flowers, or installing sod over the area. If you plan to replant a tree in the same spot or install hardscaping/structures, we can grind deeper (12-18 inches) for additional fee. Deeper grinding ensures complete root removal and eliminates potential issues.'
      },
      {
        question: 'What do you do with the wood chips after grinding?',
        answer: 'Standard service includes complete wood chip removal - we rake them up, load them, and haul them away. However, wood chips make excellent mulch for flower beds. If you want them, we\'ll spread them in your beds at no charge. Fresh chips should compost 2-3 months before planting. One large stump can produce 3-5 cubic yards of chips.'
      },
      {
        question: 'Can you grind stumps very close to fences or buildings?',
        answer: 'Yes! We specialize in tight-access grinding. Our grinders can work within 6-12 inches of fences, foundations, retaining walls, and other obstacles. We have different sized machines including narrow-access grinders (30 inches wide) that fit through gates and between houses. If we can access the stump, we can grind it. Traditional excavation would destroy nearby structures.'
      },
      {
        question: 'Will stump grinding damage my lawn or landscaping?',
        answer: 'We minimize lawn damage through careful equipment operation and access route planning. We lay plywood over high-traffic areas when needed to protect turf. Smaller grinders cause minimal turf compression. Any minor lawn disturbance recovers within 2-3 weeks. We fill and grade the area smooth after grinding. Benefit of removing the stump far outweighs temporary minor lawn disturbance.'
      },
      {
        question: 'How long does stump grinding take?',
        answer: 'Small stumps (12-20 inches): 30-60 minutes. Medium stumps (20-30 inches): 1-2 hours. Large stumps (30-48 inches): 2-4 hours. Very large stumps (48+ inches): 4-6+ hours. Hardwood species (oak, locust) grind slower than softwoods (cottonwood, pine). Multiple stumps on one property are more efficient per-stump. We provide estimated timeline with every quote.'
      },
      {
        question: 'Will the stump grow back after grinding?',
        answer: 'No, properly ground stumps will not regrow. We grind 8-12 inches below grade and pulverize the root crown - this kills the tree\'s ability to sprout. Some species (willows, poplars, cottonwoods) may send up suckers from distant lateral roots, but these are easily removed and eventually stop. The main stump will never regrow if ground properly.'
      },
      {
        question: 'Can I plant a new tree where a stump was ground?',
        answer: 'Yes, but with caveats. Wait 6-12 months for wood chips to decompose. Remove remaining chips and add quality topsoil before planting. Consider grinding deeper (12-18 inches) if replanting is your goal. Ideally, plant new tree 3-5 feet from old stump location to avoid any residual root material. We can coordinate deeper grinding and soil amendment for replanting projects.'
      },
      {
        question: 'What\'s the difference between stump grinding and stump removal?',
        answer: 'Stump grinding grinds the visible stump and major roots 6-12 inches below grade, leaving fine wood chips. Total stump removal (excavation) digs out the entire stump and root ball using backhoe, leaving a massive hole. Grinding costs 60-80% less, causes minimal landscape disruption, and achieves the same practical result. Excavation is only needed for construction sites or if you must remove every root.'
      },
      {
        question: 'How soon after tree removal can stumps be ground?',
        answer: 'Stumps can be ground immediately after tree removal - fresh stumps actually grind slightly easier than aged, hardened stumps. We often combine tree removal and stump grinding in one visit for convenience and cost savings. However, stumps that have been in place for years grind just fine - there\'s no time limit. The key is whether you want to reclaim that space now or later.'
      },
      {
        question: 'Do I need to be home during stump grinding?',
        answer: 'No, you don\'t need to be home. We need clear access to the stump(s) - gate unlocked or access route confirmed. Mark any underground utilities, invisible dog fences, or irrigation lines within 10 feet of stump. We\'ll text before arrival and after completion. Most clients prefer to be gone - grinding is loud but not dangerous to observe from a distance.'
      },
      {
        question: 'Is stump grinding safe for nearby plants and trees?',
        answer: 'Yes, grinding is very safe for surrounding landscape when done properly. We don\'t damage surface roots of nearby trees or disturb flower beds. Flying wood chips are controlled and directed into safe areas. We protect nearby plants with barriers if needed. Grinding releases nutrients into soil as chips decompose, actually benefiting nearby plants slightly. Far safer than excavation which tears up everything nearby.'
      }
    ],
    relatedServices: ['tree-removal', 'sod-installation', 'landscape-design', 'lawn-renovation'],
    pricingGuidance: 'Stump grinding: $3-8 per inch diameter. Typical range: $150-400 per stump. Volume discounts for multiple stumps. Deep grinding (12-18 inches): premium pricing.',
    seasonality: 'Year-round service. Spring and fall most popular for combining with landscape projects. Frozen ground can complicate winter grinding.',
    facts: [
      { label: 'Cost per inch', value: '$3-8' },
      { label: 'Small stump cost', value: '$150-250' },
      { label: 'Medium stump cost', value: '$250-350' },
      { label: 'Large stump cost', value: '$350-500' },
      { label: 'Standard depth', value: '6-12 in. below grade' },
      { label: 'Small stump time', value: '30-60 min' },
      { label: 'Volume discount', value: '10-20% off' },
      { label: 'Service speed', value: 'same/next day' }
    ]
  },
  {
    slug: 'fall-cleanup',
    name: 'Fall Cleanup',
    category: 'lawn-care',
    shortDescription: 'Comprehensive fall lawn and landscape cleanup service to prepare your property for winter',
    longDescription: 'Fall cleanup is the most critical seasonal maintenance service for Idaho lawns and landscapes, serving as essential preparation for harsh Treasure Valley winters while setting the foundation for a healthy, beautiful lawn next spring. Our comprehensive fall cleanup service transforms your property from summer wear and autumn leaf accumulation into a winter-ready landscape that will emerge healthy when spring arrives. The service includes complete leaf removal from lawns, beds, and hardscaping before leaves smother grass and create disease-harboring mats under winter snow. We perform final mowing at optimal winter height (2-2.5 inches) which prevents snow mold fungus while protecting grass crowns from extreme cold and desiccating winter winds. Flower beds receive thorough cleanup including cutting back perennials to 4-6 inches (promoting healthy spring regrowth), removing dead annuals, pulling remaining weeds, and edging bed borders for crisp definition. Ornamental grasses are cut to 6 inches, removing old growth that would mat and smother new shoots in spring. Gutter cleaning prevents ice dam formation during freeze-thaw cycles that can cause thousands in water damage to roofs, siding, and foundations - Idaho\'s winter temperature swings make this particularly critical. We remove all accumulated debris including fallen branches, wind-blown trash, and summer season remnants that detract from winter curb appeal and can harbor rodents and pests seeking winter shelter. The entire property is edged, blown clean, and detailed for pristine presentation through winter months. This comprehensive approach prevents multiple lawn and landscape problems: snow mold disease from matted leaves, rodent nesting in accumulated debris, winter injury to improperly prepared plants, spring disease from infected plant material left overwinter, and the massive spring cleanup burden from neglected fall preparation. Idaho\'s unpredictable fall weather - early snows, temperature swings, and wind storms - makes professional fall cleanup timing critical. We monitor weather and schedule service during optimal windows, typically late October through mid-November after most leaf drop but before ground freeze and first significant snow. Many properties benefit from two fall services: early cleanup for first wave of leaves followed by final cleanup for late-dropping trees like elm and ash. Service throughout Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle.',
    benefits: [
      'Removes leaves before they smother grass and create disease mats',
      'Prevents snow mold fungus that devastates Idaho lawns in spring',
      'Prepares property for harsh winter weather and temperature extremes',
      'Reduces spring cleanup workload by 60-80% saving time and money',
      'Protects plants and landscaping investments from winter damage',
      'Cleans gutters preventing costly ice dam damage to roof and siding',
      'Final mowing at 2-2.5 inch optimal winter height protects grass crowns',
      'Complete property looks pristine and winter-ready for first snow',
      'Eliminates rodent nesting habitat in accumulated debris piles',
      'Prevents spring disease from infected plant material left overwinter',
      'Maintains curb appeal throughout winter months with neat appearance',
      'Combines perfectly with fall aeration and winterization services'
    ],
    process: [
      { step: 1, title: 'Initial Assessment', description: 'We walk the property to assess leaf coverage, gutter condition, bed cleanup needs, and special requirements for your landscape.' },
      { step: 2, title: 'Leaf Removal', description: 'All leaves are removed from lawn, beds, patios, and hardscaping using blowers and rakes. Heavy leaf areas get multiple passes for complete removal.' },
      { step: 3, title: 'Final Mowing', description: 'Lawn is mowed to 2-2.5 inches - the ideal height for winter. This prevents snow mold while protecting grass crowns from extreme cold.' },
      { step: 4, title: 'Bed Cleanup', description: 'Perennial beds are cut back, annuals removed, and beds cleaned of debris. Mulch is refreshed if needed. Plants are prepared for dormancy.' },
      { step: 5, title: 'Gutter Cleaning', description: 'Gutters and downspouts are cleared of leaves and debris. This prevents ice dams and water damage during winter freeze-thaw cycles.' },
      { step: 6, title: 'Final Details & Disposal', description: 'All debris is hauled away and disposed of—disposal included with no additional fees. Property is blown clean. Hardscaping is edged and cleaned. Your property is winter-ready and looks great.' }
    ],
    faqs: [
      {
        question: 'When should I schedule fall cleanup in Idaho?',
        answer: 'Late October through mid-November is ideal timing for the Treasure Valley - after most leaves have fallen but before ground freeze and first major snow. Earlier is risky (leaves still falling), later risks frozen ground and snow. We monitor weather closely and recommend scheduling early November for most properties. Different areas have different timing: lowland Kuna/Nampa typically mid-late November, foothill areas (Eagle, North Boise) late October-early November.'
      },
      {
        question: 'How much does fall cleanup cost in Kuna and surrounding areas?',
        answer: 'Typical residential properties (5,000-8,000 sq ft lot): $200-400 depending on leaf volume and services included. Larger properties (10,000-15,000 sq ft): $400-700. Properties with heavy tree coverage or multiple large trees: $500-1,000+. Gutter cleaning adds $150-300. Multiple cleanup visits: Package pricing saves 10-15%. We provide free detailed estimates based on your specific property conditions.'
      },
      {
        question: 'Do I need multiple fall cleanup visits or just one?',
        answer: 'Depends on your trees and timing flexibility. Properties with multiple large deciduous trees (ash, elm, maple, oak) that drop at different times benefit from 2-3 visits: early cleanup (mid-late October), mid cleanup (early November), final cleanup (mid-late November). Single late-season cleanup (mid-November) works if trees drop simultaneously or you have patience for the mess. Multiple visits maintain appearance but cost more.'
      },
      {
        question: 'What do you do with all the leaves after removal?',
        answer: 'We haul away and dispose of all leaves and debris as part of our standard service—disposal is always included with no additional fees. Leaves are composted at approved facilities or properly disposed of per local regulations. A typical 5,000 sq ft property generates 3-8 cubic yards of leaves. If you have a compost area or want leaves for garden mulch, we can leave shredded/chopped leaves in a designated spot at no charge.'
      },
      {
        question: 'Should I combine fall cleanup with other fall services?',
        answer: 'Absolutely! Fall cleanup pairs perfectly with fall aeration/overseeding (September-early October), sprinkler system winterization/blowout (October-November), final fertilizer application, and gutter cleaning. Bundling services saves money (typically 10-15% discount), ensures complete fall preparation, and requires only one service visit. Most cost-effective approach: aerate/overseed in September, fall cleanup in November, winterize sprinklers same visit.'
      },
      {
        question: 'Will fall cleanup damage my lawn or flower beds?',
        answer: 'No damage when done properly. We use lightweight blowers and hand rakes in beds to avoid plant damage. Lawn mowing and cleanup actually benefits turf by removing disease-harboring debris. We protect delicate plants and avoid compacting wet soils. Any minor turf compression from equipment recovers quickly. Professional cleanup is far gentler than leaving matted leaves that smother and kill grass over winter.'
      },
      {
        question: 'What happens if it snows before I schedule fall cleanup?',
        answer: 'Light snow (1-3 inches) isn\'t a problem - we can still cleanup effectively. Heavy snow (4+ inches) or frozen ground makes cleanup difficult or impossible until spring thaw. This is why scheduling early-mid November is critical in Idaho. If early snow hits, we can often cleanup between storms or during melts. Worst case: cleanup becomes part of spring service at spring pricing.'
      },
      {
        question: 'Do you clean gutters as part of fall cleanup?',
        answer: 'Gutter cleaning is an optional add-on service, not automatically included in standard fall cleanup. However, we highly recommend it - clogged gutters during Idaho\'s freeze-thaw winter cycles cause ice dams leading to roof damage, water infiltration, and foundation problems. Adding gutter cleaning to fall cleanup costs $150-300 depending on home size and is much cheaper than ice dam water damage repairs ($2,000-10,000+).'
      },
      {
        question: 'Can you just blow leaves into my landscape beds or do they have to be removed?',
        answer: 'We don\'t recommend blowing leaves into beds - 2-3 inch+ leaf layers smother plants, harbor disease and pests, and create slug/rodent habitat. Thin layer (under 1 inch) of shredded leaves as winter mulch is fine. Standard practice is complete removal from both lawn and beds for healthiest landscape. If you have naturalized areas or want leaves for compost, we can relocate them there instead of hauling.'
      },
      {
        question: 'What\'s included in your fall cleanup service?',
        answer: 'Complete service includes: thorough leaf removal from lawn, beds, patios, walkways, and driveways; final mowing to winter height (2-2.5 inches); bed cleanup (cutting back perennials, removing dead annuals); ornamental grass cutting; edging and defining bed borders; removal of all fallen branches and debris; complete property blowing and cleanup; haul-away of all debris. Optional add-ons: gutter cleaning, sprinkler winterization, fertilizer application.'
      },
      {
        question: 'Why is fall cleanup important for preventing lawn disease?',
        answer: 'Matted leaves over winter create perfect conditions for snow mold fungus (Typhula and Fusarium species) - Idaho\'s fluctuating winter temps (freeze, thaw, snow, repeat) under leaf mats cause devastating spring lawn damage. Thick leaf layers also smother grass, blocking light and air, creating anaerobic conditions that kill turf. Infected plant debris left in beds spreads disease to healthy plants. Fall cleanup removes these disease sources and prevents thousands in spring lawn renovation costs.'
      },
      {
        question: 'Do I still need fall cleanup if I don\'t have many trees?',
        answer: 'Yes! Even properties without major trees benefit from fall cleanup. Neighbor\'s leaves blow onto your property. Summer debris, dead plant material, and fallen branches accumulate. Final mowing to proper winter height is critical for snow mold prevention. Bed cleanup and perennial cutting prepares gardens for healthy spring growth. Gutter cleaning prevents winter ice dam damage. Full property cleanup maintains curb appeal through winter. Properties without heavy leaves typically cost 30-50% less than heavy-tree properties.'
      }
    ],
    relatedServices: ['spring-cleanup', 'leaf-removal', 'gutter-cleaning', 'aeration'],
    pricingGuidance: 'Fall cleanup: $200-500 typical residential. Larger properties: $500-1,000+. Gutter cleaning: +$150-300. Multiple visits: Package pricing available.',
    seasonality: 'Late October through mid-November. Peak demand in early November. Book early as schedules fill quickly before first snow.',
    facts: [
      { label: 'Typical cost', value: '$200-400' },
      { label: 'Large property cost', value: '$500-1,000+' },
      { label: 'Best timing', value: 'late Oct-mid Nov' },
      { label: 'Gutter cleaning add', value: '+$150-300' },
      { label: 'Final mow height', value: '2-2.5 in.' },
      { label: 'Spring work reduction', value: '60-80%' },
      { label: 'Multiple visit discount', value: '10-15% off' },
      { label: 'Typical leaf volume', value: '3-8 cubic yards' }
    ]
  },
  {
    slug: 'spring-cleanup',
    name: 'Spring Cleanup',
    category: 'lawn-care',
    shortDescription: 'Complete spring lawn and landscape cleanup to revitalize your property after winter',
    longDescription: 'Spring cleanup is the essential seasonal service that awakens your Idaho landscape after harsh winter dormancy and sets the foundation for a beautiful, healthy lawn and garden throughout the entire growing season. After months of snow cover, freeze-thaw cycles, and winter storms, Treasure Valley properties accumulate significant debris, damage, and organic material that must be professionally removed before active spring growth begins. Our comprehensive spring cleanup service transforms winter-weary landscapes into fresh, vibrant outdoor spaces ready to flourish. The process begins with thorough removal of all winter accumulation: fallen branches from ice and wind storms, matted leaves that blew in or emerged from under snow, dead vegetation that winter-killed, trash and debris that accumulated, and any residual salt or de-icing material from walkways that can damage plants. We perform vigorous power raking to lift and remove the dense mat of dead grass blades (winter-killed turf tissue) that smothers new spring growth and harbors snow mold fungus - this crucial step allows sunlight and air to reach the soil and emerging grass shoots. Flower beds receive complete spring preparation including cutting back the dead top growth of perennials to 2-3 inches (promoting vigorous new growth), removing winter-killed annuals and any plants that didn\'t survive, redefining crisp bed edges that winter heaving blurred, and removing old mulch layers if fresh mulch installation is planned. Ornamental grasses are cut back to 4-6 inches, removing the previous season\'s growth that would otherwise mat down and smother new shoots emerging from the grass crown. We clean all hardscaping - patios, walkways, driveways - removing winter grime, organic stains, and accumulated debris. The lawn receives its critical first mowing of the season at appropriate height for your grass type (typically 2.5-3 inches) which removes winter-damaged blade tips, encourages lateral spreading growth, and establishes the healthy mowing pattern for the season. Throughout the service, our crews identify winter damage requiring attention: broken shrub branches needing pruning, frost-heaved plants needing resetting, drainage issues revealed by spring snowmelt, and any disease or pest problems emerging in early spring. This diagnostic aspect helps you address problems early before they become severe. All debris - typically 2-5 cubic yards for average properties - is completely removed and hauled away, leaving your property immaculate and ready for spring growth. The transformation is dramatic: what started as a drab, debris-covered winter landscape becomes a fresh, clean canvas ready for spring color and growth. Spring cleanup timing is critical in Idaho - too early and you\'re working in mud and snow, too late and aggressive spring growth has already started making cleanup difficult. We monitor weather patterns and schedule service in the optimal window, typically late March for lowland areas (Kuna, Nampa, Caldwell) and early-mid April for foothill areas (Eagle, North Boise) after ground thaw but before major growth flush.',
    benefits: [
      'Removes all winter debris and storm damage completely',
      'Allows critical sunlight and air to reach emerging grass growth',
      'Prevents disease spread from winter-killed vegetation and snow mold',
      'Reveals winter damage and landscape issues needing early attention',
      'Cleans and refreshes entire property for spring enjoyment',
      'Prepares lawn perfectly for spring fertilization and weed treatments',
      'First mowing at proper height sets healthy growth pattern all season',
      'Property looks fresh, clean, and welcoming after winter drabness',
      'Identifies early spring pest and disease problems before they spread',
      'Removes matted dead grass that smothers new growth',
      'Provides clean foundation for spring mulch and planting projects',
      'Dramatically reduces work needed throughout growing season'
    ],
    process: [
      { step: 1, title: 'Property Assessment', description: 'We evaluate winter damage, debris accumulation, and landscape needs. Note any issues requiring attention (broken plants, drainage problems, etc.).' },
      { step: 2, title: 'Debris Removal', description: 'All winter debris is removed: fallen branches, accumulated leaves, trash, and dead vegetation. Heavy raking removes matted grass and thatch.' },
      { step: 3, title: 'Bed Cleanup & Edging', description: 'Perennial beds are cleaned, edges redefined, and winter-killed annuals removed. Beds are prepared for mulch installation if desired.' },
      { step: 4, title: 'Ornamental Grass Cutting', description: 'Ornamental grasses are cut back to 4-6 inches to allow fresh spring growth. Old growth is removed and hauled away.' },
      { step: 5, title: 'First Mowing & Trimming', description: 'Lawn receives first mowing of season at appropriate height for grass type. Edges are trimmed and property is detailed for crisp appearance.' },
      { step: 6, title: 'Final Cleanup & Recommendations', description: 'All debris is hauled away and disposed of—disposal included. Property is blown clean. We provide recommendations for spring services: aeration, fertilization, irrigation startup.' }
    ],
    faqs: [
      {
        question: 'When should I schedule spring cleanup in Idaho?',
        answer: 'Late March through April is the optimal window for Treasure Valley spring cleanup - after snow melts and ground thaws but before aggressive spring growth begins. Exact timing varies by elevation and weather patterns. We typically start lowland areas (Boise, Kuna, Nampa, Caldwell) in late March when daytime temps reach 50-60°F consistently. Foothill areas (Eagle, North Boise) and higher elevations start early-mid April. Scheduling too early means working in mud and potential re-snow; too late means mowing through aggressive growth.'
      },
      {
        question: 'How much does spring cleanup cost in Kuna and surrounding areas?',
        answer: 'Typical residential properties (5,000-8,000 sq ft): $250-450 depending on property size, winter damage severity, and debris volume. Larger properties (10,000-15,000 sq ft): $450-800. Properties with heavy winter damage or extensive debris: $600-1,200+. Price includes complete cleanup, debris haul-away, and first mowing. Package pricing available when combined with aeration, fertilization, or mulch installation (typically save 10-15%). Free detailed estimates provided.'
      },
      {
        question: 'What if I have winter damage to plants, shrubs, or trees?',
        answer: 'Our crews identify all winter damage during cleanup and provide detailed recommendations. Minor pruning of broken branches and deadwood removal is included in spring cleanup. Significant tree damage, large shrub rejuvenation, or tree removal would be quoted separately as additional service. Early identification and treatment prevents disease spread, allows damaged plants to recover, and informs replacement planning if needed. We take photos and explain options.'
      },
      {
        question: 'Should I do spring cleanup before or after lawn aeration?',
        answer: 'Spring cleanup FIRST, always! Debris must be removed so aeration equipment can effectively penetrate soil. Ideal sequence for spring lawn care: 1) Spring cleanup (late March-early April), 2) Aeration and overseeding if needed (mid-April), 3) First fertilizer application (late April-early May), 4) Pre-emergent weed control (if not done with fertilizer). We bundle these services with package pricing for convenience and cost savings.'
      },
      {
        question: 'Do you restart irrigation systems during spring cleanup?',
        answer: 'Irrigation startup is a separate specialized service requiring backflow testing, zone activation, pressure testing, and controller programming. However, spring cleanup and irrigation startup are commonly scheduled the same week for convenience - one visit handles both. Package pricing available. Typical timing: spring cleanup early April, irrigation startup mid-April (after frost danger passes). We coordinate scheduling to minimize visits.'
      },
      {
        question: 'What\'s included in your spring cleanup service?',
        answer: 'Complete service includes: thorough debris removal (branches, leaves, trash, dead vegetation), vigorous power raking to remove matted dead grass, perennial bed cleanup and cutting back, ornamental grass cutting (4-6 inches), redefining bed edges, first mowing of season at proper height, trimming and edging, cleaning all hardscaping (patios, walks, driveways), complete property blowing and detailing, removal and haul-away of ALL debris (typically 2-5 cubic yards), identification and reporting of winter damage or issues.'
      },
      {
        question: 'Can I do spring cleanup myself to save money?',
        answer: 'Yes, but consider time and equipment costs. Spring cleanup requires: power rake or dethatcher rental ($75-100/day), truck for debris haul ($50+ dump fee), 6-10 hours of physical labor, proper tools and knowledge. Professional service costs $250-450 for average property and includes expertise, equipment, and guaranteed results. DIY saves $100-200 but costs you entire weekend. Most clients find professional service worth the cost for time savings and superior results.'
      },
      {
        question: 'How long does spring cleanup take?',
        answer: 'Timeline varies by property size and condition. Small properties (5,000 sq ft) with light debris: 2-3 hours. Average properties (8,000 sq ft) with typical winter accumulation: 4-6 hours. Large properties (12,000+ sq ft) or heavy winter damage: 6-10 hours. We provide estimated timeline with quote. Most residential properties are completed in single day. Larger estates or commercial properties may require 2 days.'
      },
      {
        question: 'Will spring cleanup damage my emerging spring bulbs or perennials?',
        answer: 'No - our experienced crews carefully work around emerging bulbs (daffodils, tulips, crocuses) and new perennial growth. We hand-rake near delicate plants instead of using power equipment. Spring cleanup actually HELPS plants by removing smothering debris and disease-harboring dead material. Proper cleanup allows more sunlight to reach emerging growth, promoting faster, healthier development. We protect fragile spring growth while removing winter damage.'
      },
      {
        question: 'What should I do to prepare my property for spring cleanup?',
        answer: 'Minimal preparation needed: 1) Pick up any pet waste, toys, hoses, or decorations from lawn and beds. 2) Mark any hidden lawn features (invisible fence lines, shallow sprinkler components, ground-level lighting). 3) Ensure gates are unlocked for equipment access. 4) If you want specific plants saved or removed, mark them with flags or notify us. That\'s it! We handle everything else. Don\'t try to "pre-clean" - you\'ll just duplicate our work.'
      },
      {
        question: 'Can you install new mulch during spring cleanup?',
        answer: 'Yes! Spring cleanup + fresh mulch installation is the most popular spring package. Cleanup prepares beds perfectly for mulch - edges are redefined, old debris removed, perennials cut back. We can apply 2-3 inches of premium shredded hardwood, cedar, or colored mulch immediately after cleanup. Package pricing typically saves 10-15% versus separate services. This one-visit approach is most efficient and gives stunning instant results.'
      },
      {
        question: 'Do you offer spring cleanup for commercial properties and HOAs?',
        answer: 'Yes! We provide spring cleanup for office complexes, retail centers, HOA common areas, apartment complexes, and municipal properties throughout the Treasure Valley. Commercial service includes everything residential service offers plus: flexible scheduling to minimize business disruption, multiple-property package pricing, detailed property reports, before/after photo documentation, and ongoing maintenance contracts if desired. Contact us for commercial quotes.'
      }
    ],
    relatedServices: ['fall-cleanup', 'aeration', 'fertilization', 'mulch-installation'],
    pricingGuidance: 'Spring cleanup: $250-600 typical residential. Larger properties: $600-1,200+. Package pricing available with aeration, fertilization, mulch services.',
    seasonality: 'Late March through April. Peak demand in early April. Book in February-March for best scheduling. Essential service to start season right.',
    facts: [
      { label: 'Typical cost', value: '$250-450' },
      { label: 'Large property cost', value: '$600-1,200+' },
      { label: 'Best timing', value: 'late Mar-April' },
      { label: 'Average debris volume', value: '2-5 cubic yards' },
      { label: 'First mow height', value: '2.5-3 in.' },
      { label: 'Package savings', value: '10-15% off' },
      { label: 'Typical duration', value: '4-6 hours' },
      { label: 'Peak booking', value: 'early April' }
    ]
  },
  {
    slug: 'sprinkler-repair',
    name: 'Sprinkler Repair',
    category: 'landscaping-irrigation',
    shortDescription: 'Fast, professional sprinkler and irrigation system repair to fix leaks, broken heads, and system malfunctions',
    longDescription: 'Sprinkler problems waste water, create muddy messes, and leave brown spots in your lawn. Our expert sprinkler repair service quickly diagnoses and fixes all irrigation issues: broken sprinkler heads, leaking valves, damaged pipes, controller problems, and zone failures. We stock common parts on our trucks for same-visit repairs in most cases. Whether you have a single broken head or complex system issues, we provide fast, reliable repairs that restore proper watering and prevent water waste.',
    benefits: [
      'Stops water waste from leaks and breaks',
      'Eliminates muddy areas and erosion',
      'Restores even coverage preventing brown spots',
      'Expert diagnosis finds hidden problems',
      'Most repairs completed same visit',
      'Quality parts ensure long-lasting repairs',
      'Prevents higher water bills',
      'Licensed and experienced irrigation techs'
    ],
    process: [
      { step: 1, title: 'Problem Assessment', description: 'We inspect system to diagnose issues: run zones to observe coverage, check for leaks, test controller, and identify all problem areas.' },
      { step: 2, title: 'Repair Estimate', description: 'For complex repairs, we provide estimate before proceeding. Simple repairs (broken heads, minor leaks) are typically done immediately at standard service rates.' },
      { step: 3, title: 'Parts & Materials', description: 'We carry common parts on trucks (heads, nozzles, valves, pipe fittings). For unusual parts, we can usually get them same-day or next-day.' },
      { step: 4, title: 'Repair Work', description: 'Broken sprinkler heads replaced, leaking valves repaired or replaced, damaged pipes fixed, controller issues resolved. Work is done efficiently with minimal landscape disruption.' },
      { step: 5, title: 'System Testing', description: 'All repaired zones are tested to ensure proper operation, correct coverage, and no new leaks. Adjustments made as needed.' },
      { step: 6, title: 'Cleanup & Documentation', description: 'Work area is cleaned and restored. We document repairs made and provide recommendations for any additional issues discovered.' }
    ],
    faqs: [
      {
        question: 'How much does sprinkler repair cost?',
        answer: 'Service call: $75-125. Simple repairs (broken head replacement): $75-150 total. Valve replacement: $150-300. Pipe repairs: $150-400 depending on location and extent. Complex controller replacement: $300-800. We provide estimates for larger repairs.'
      },
      {
        question: 'Can you repair my broken sprinkler head same day?',
        answer: 'Usually yes! We stock common sprinkler heads, nozzles, and parts. Most head replacements and simple repairs are completed during initial service visit. Complex repairs may require parts ordering.'
      },
      {
        question: 'My sprinkler zone won\'t turn on - what\'s wrong?',
        answer: 'Common causes: faulty valve solenoid, broken valve wiring, controller malfunction, or valve stuck closed. Our techs systematically diagnose the issue - often it\'s a simple fix like replacing a $15 solenoid.'
      },
      {
        question: 'Do you repair all brands of sprinkler systems?',
        answer: 'Yes! We work on all major brands: Rain Bird, Hunter, Toro, Orbit, and others. Our techs are trained on all common residential and commercial irrigation systems in Idaho.'
      },
      {
        question: 'Should I repair my old system or replace it?',
        answer: 'Depends on system age and condition. Individual repairs usually make sense. If system is 20+ years old with multiple failures, replacement may be more cost-effective long-term. We provide honest recommendations based on your situation.'
      }
    ],
    relatedServices: ['irrigation-repair', 'sprinkler-system-installation', 'irrigation-maintenance', 'sprinkler-blowout'],
    pricingGuidance: 'Service call: $75-125. Head replacement: $75-150. Valve work: $150-300. Pipe repairs: $150-400. Controller: $300-800. Volume/membership discounts available.',
    seasonality: 'Peak demand: April-August (growing season). Emergency repairs year-round. Broken pipes often discovered during spring startup or after freeze damage.'
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

// Service pricing guidance lookup map - includes ALL services with pricingGuidance defined
export const SERVICE_PRICING_GUIDANCE_MAP = new Map(
  PRIORITY_SERVICES
    .filter(service => service.pricingGuidance)
    .map(service => [service.slug, { name: service.name, pricingGuidance: service.pricingGuidance! }])
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
