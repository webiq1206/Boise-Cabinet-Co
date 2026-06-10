import {
  BOISE_REMODELING_COST_GUIDE_HTML,
  BOISE_REMODELING_COST_QUICK_ANSWER,
  BOISE_REMODELING_COST_TAKEAWAYS,
} from './content/wave1/boiseRemodelingCostGuide';
import {
  TREASURE_VALLEY_GUIDE_HTML,
  BOISE_GUIDE_HTML,
  TV_QUICK_ANSWER,
  BOISE_QUICK_ANSWER,
  TV_TAKEAWAYS,
  BOISE_TAKEAWAYS,
} from './content/wave1/locationGuides';
import { ALL_HUB_PILLARS } from './content/allHubsContent';
import { CITY_CABINET_GUIDES } from './content/cityCabinetGuides';
import { expandPillar } from './content/contentFactory';
import { SITE_CONFIG } from './siteConfig';

export type GuideType = 'hub-pillar' | 'location' | 'neighborhood' | 'master';

export interface GuidePageData {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  author: string;
  hubSlug: string;
  guideType: GuideType;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  heroImage?: string;
  quickAnswer?: string;
  keyTakeaways?: string[];
  faqs: Array<{ question: string; answer: string }>;
  linkedClusterSlugs?: string[];
  linkedServices?: string[];
  linkedCities?: string[];
  relatedLinks?: Array<{ url: string; anchor?: string }>;
  primaryKeyword?: string;
}

const costPillarFaqs = [
  {
    question: 'How much do custom kitchen cabinets cost in Boise?',
    answer:
      'Most Treasure Valley kitchen cabinet packages plan from roughly $15,000–$45,000+ for value cabinet lines and higher for fully custom layouts, depending on linear footage, door style, and interior accessories.',
  },
  {
    question: 'What affects custom cabinet pricing the most?',
    answer:
      'Door style, box construction, finish tier, interior organizers, and total linear footage drive price more than city alone. Layout complexity and specialty storage add cost.',
  },
  {
    question: 'How do value and custom cabinet costs compare?',
    answer:
      'Value cabinet lines offer standardized sizes with selectable finishes at a lower entry point. Custom Cabinets are sized to your room and typically cost more per linear foot with longer lead times.',
  },
  {
    question: 'Are cabinet installation and delivery included in quotes?',
    answer:
      'Boise Cabinet Co quotes typically include shop fabrication, delivery, and professional installation for cabinet scope. Countertops, appliances, and trade work are quoted separately when needed.',
  },
  {
    question: 'How long from cabinet order to installation?',
    answer:
      'Cabinet lead time is typically 4-8 weeks from approved design to delivery. Measure early in your project so cabinets do not delay other trades.',
  },
  {
    question: 'Should I budget by linear foot or per cabinet?',
    answer:
      'Linear foot is a useful planning metric for runs of base and wall cabinets. Vanities and tall units are often quoted per piece after layout is defined.',
  },
  {
    question: 'How much do bathroom vanity cabinets cost in Boise?',
    answer:
      'Single-vanity packages often plan from roughly $2,500–$8,000+; double vanities and linen storage increase investment. Finish and drawer interior selections matter.',
  },
  {
    question: 'What does a whole-home cabinet package cost?',
    answer:
      'Coordinated kitchen, bath, laundry, mudroom, and built-in packages are quoted as a program after room-by-room layouts. Bundling can improve finish consistency and scheduling.',
  },
  {
    question: 'Should I hold contingency on a cabinet project?',
    answer:
      'Hold 5–10% for field adjustments, out-of-plumb walls, soffit surprises, or late selection changes are common in older Treasure Valley homes.',
  },
  {
    question: 'Why do cabinet quotes vary so much between companies?',
    answer:
      'Quotes differ when box material, hardware tier, installation scope, and warranty are not aligned. Compare line-item scope, not bottom-line price alone.',
  },
  {
    question: 'Are stock cabinets cheaper than custom in Boise?',
    answer:
      'Stock and big-box lines cost less upfront but offer fewer sizes and finishes. Custom cabinetry fits irregular Boise layouts and typically includes professional measurement and install.',
  },
  {
    question: 'Do you publish starting-at cabinet prices?',
    answer:
      'We publish planning ranges by room and collection for education. Firm pricing requires measurements, layout approval, and finish selections.',
  },
  {
    question: 'How do I get an accurate cabinet estimate?',
    answer:
      'Browse our catalog, use the design studio or consultation form, and schedule an in-home measure for a written quote tied to your layout.',
  },
  {
    question: 'Does Eagle or Meridian cost more than Boise for cabinets?',
    answer:
      'Material and labor rates are similar across the valley. Finish level, travel, and HOA documentation time, not zip code alone, usually explain differences.',
  },
  {
    question: 'Can I phase cabinets room by room to spread cost?',
    answer:
      'Yes. A whole-home cabinet plan helps keep door styles and finishes cohesive when you install kitchen first and baths or built-ins later.',
  },
];

export const GUIDE_PAGES: GuidePageData[] = [
  {
    slug: 'boise-cabinet-cost-guide',
    title: 'Boise Cabinet Cost Guide (2026 Planning Ranges)',
    seoTitle: 'Boise Cabinet Cost Guide | Treasure Valley',
    metaDescription:
      '2026 cabinet cost guide for Boise and the Treasure Valley: kitchen, bath, whole-home packages, linear-foot planning, collections, lead times, and budgeting.',
    excerpt:
      'Planning ranges for custom and value cabinets in Boise, Meridian, Eagle, Nampa, and the Treasure Valley, with budgeting tips.',
    content: expandPillar(BOISE_REMODELING_COST_GUIDE_HTML, 'boise-cabinet-cost-guide', 'cabinet-costs'),
    author: 'Boise Cabinet Co',
    hubSlug: 'cabinet-costs',
    guideType: 'hub-pillar',
    tags: ['cost', 'budget', 'boise', 'treasure valley', 'cabinets'],
    publishedAt: '2026-05-01',
    quickAnswer: BOISE_REMODELING_COST_QUICK_ANSWER,
    keyTakeaways: BOISE_REMODELING_COST_TAKEAWAYS,
    faqs: costPillarFaqs,
    linkedClusterSlugs: [
      'kitchen-cabinet-cost-boise',
      'bathroom-vanity-cost-boise',
      'whole-home-cabinet-cost-boise',
      'luxury-custom-cabinet-cost-boise',
      'cabinet-cost-per-linear-foot',
      'what-impacts-cabinet-costs-boise',
      'how-to-budget-cabinets-boise',
    ],
    relatedLinks: [
      { url: '/guides/treasure-valley-cabinet-guide' },
      { url: '/guides/boise-cabinet-guide' },
      { url: '/blog/category/cabinet-costs' },
      { url: '/cabinets' },
      { url: '/estimate' },
      { url: '/contact' },
    ],
    primaryKeyword: 'Boise cabinet cost',
  },
  {
    slug: 'treasure-valley-cabinet-guide',
    title: 'Treasure Valley Custom Cabinet Guide',
    seoTitle: 'Treasure Valley Cabinet Guide | Idaho',
    metaDescription:
      'Custom cabinets across the Treasure Valley: Boise, Meridian, Eagle, Kuna, Star, Middleton, Nampa, Caldwell, room guides, collections, design studio, and delivery.',
    excerpt:
      'Your starting point for custom cabinets anywhere in the Treasure Valley, city context, catalog rooms, and links to planning guides.',
    content: TREASURE_VALLEY_GUIDE_HTML,
    author: 'Boise Cabinet Co',
    hubSlug: 'local-guides',
    guideType: 'master',
    tags: ['treasure valley', 'locations', 'idaho', 'cabinets'],
    publishedAt: '2026-05-01',
    quickAnswer: TV_QUICK_ANSWER,
    keyTakeaways: TV_TAKEAWAYS,
    faqs: [
      {
        question: 'What cities does Boise Cabinet Co serve?',
        answer:
          'We design, build, and install custom cabinets for Boise, Meridian, Eagle, Kuna, Star, Middleton, Nampa, and Caldwell throughout Ada and Canyon Counties.',
      },
      {
        question: 'What cabinet rooms do you offer?',
        answer:
          'Kitchens, bathroom vanities, laundry, mudroom, pantry, closet, garage, home office, entertainment centers, built-ins, outdoor kitchens, and wet bars, see our catalog.',
      },
      {
        question: 'How do I explore cabinet styles and finishes?',
        answer:
          'Browse door styles and finishes online, then use the design studio or schedule a consultation to see samples in your space.',
      },
      {
        question: 'How do I find cabinet costs for my project?',
        answer:
          'Start with our Boise Cabinet Cost Guide and room-specific articles, then request a quote after layout and selections are defined.',
      },
      {
        question: 'Do you deliver to Eagle and Hidden Springs?',
        answer:
          'Yes, we serve Eagle and many HOA communities; allow time for architectural review when exterior-visible cabinetry is involved.',
      },
      {
        question: 'Is Meridian in Ada County?',
        answer:
          'Yes. Meridian is in Ada County. We deliver and install throughout Meridian subdivisions.',
      },
      {
        question: 'What collections do you offer?',
        answer:
          'Value cabinetry and our Custom Cabinets built to your exact specs, compare options on our collections page or during a consultation.',
      },
      {
        question: 'How do I compare cabinet companies in the valley?',
        answer:
          'Compare box construction, warranty, installation scope, and finish options, not price alone. Ask for line-item quotes.',
      },
      {
        question: 'Can cabinet upgrades help before selling a home?',
        answer:
          'Kitchen and bath cabinet refreshes often support resale when aligned with neighborhood expectations, avoid over-improving for the street.',
      },
      {
        question: 'How long do custom cabinets take to receive?',
        answer:
          'Custom cabinet lead time is typically 4-8 weeks from approved design. Plan measurements early.',
      },
      {
        question: 'Do you offer free consultations?',
        answer:
          'We offer design consultations and planning ranges; firm pricing follows measurements and approved layouts.',
      },
      {
        question: 'What neighborhoods do you know best?',
        answer:
          'North End, Boise Bench, Harris Ranch, Eagle, Meridian subdivisions, and growing Kuna and Star communities.',
      },
      {
        question: 'Are hardware and organizers included in quotes?',
        answer:
          'Quotes specify soft-close hardware and interior accessory allowances. Upgrades are selected during design.',
      },
      {
        question: 'How do I start a cabinet project?',
        answer:
          'Explore the catalog, try the design studio, or contact us to schedule an in-home measure.',
      },
    ],
    relatedLinks: [
      { url: '/guides/boise-cabinet-guide' },
      { url: '/guides/boise-cabinet-cost-guide' },
      { url: '/cabinets' },
      { url: '/estimate' },
      { url: '/contact' },
    ],
    primaryKeyword: 'Treasure Valley custom cabinets',
  },
  {
    slug: 'boise-cabinet-guide',
    title: 'Boise Custom Cabinet Guide',
    seoTitle: 'Boise Custom Cabinet Guide | Neighborhoods & Catalog',
    metaDescription:
      'Custom cabinets in Boise: North End, Bench, Harris Ranch, costs, finishes, and kitchen, bath, and built-in cabinetry for Treasure Valley homes.',
    excerpt:
      'Local guide to custom cabinets in Boise, neighborhood housing types, planning ranges, and catalog links for kitchens, baths, and built-ins.',
    content: BOISE_GUIDE_HTML,
    author: 'Boise Cabinet Co',
    hubSlug: 'local-guides',
    guideType: 'location',
    tags: ['boise', 'north end', 'bench', 'cabinets'],
    publishedAt: '2026-05-01',
    quickAnswer: BOISE_QUICK_ANSWER,
    keyTakeaways: BOISE_TAKEAWAYS,
    faqs: [
      {
        question: 'Do you install cabinets in the North End?',
        answer:
          'Yes. We regularly measure and install in the North End and Boise Bench, sizing cabinets for older footprints and uneven walls.',
      },
      {
        question: 'How much do kitchen cabinets cost in Boise?',
        answer:
          'Most kitchen cabinet packages plan from roughly $15,000–$45,000+ depending on linear footage and collection, see our cabinet cost guide for detail.',
      },
      {
        question: 'What Boise neighborhoods do you serve?',
        answer: 'North End, Bench, Harris Ranch, East Boise, and surrounding Ada County communities.',
      },
      {
        question: 'Can you fit cabinets in a small galley kitchen?',
        answer:
          'Yes, tall pantry cabinets, pull-out bases, and custom widths help maximize storage in compact North End and Bench layouts.',
      },
      {
        question: 'Do you build bathroom vanities for Boise homes?',
        answer:
          'Yes, single and double vanities, linen towers, and drawer interiors sized for your bath layout.',
      },
      {
        question: 'How do I budget cabinets in Boise?',
        answer:
          'Use our cost guide and room articles, then schedule a consultation for a written quote after measurement.',
      },
      {
        question: 'Do you offer design and measurement in one visit?',
        answer:
          'Yes, consultations include layout discussion and field measurements for accurate shop drawings.',
      },
      {
        question: 'Where can I see door styles and finishes?',
        answer:
          'Browse online, use the design studio, or view samples during your in-home consultation.',
      },
    ],
    linkedCities: ['boise'],
    relatedLinks: [
      { url: '/guides/treasure-valley-cabinet-guide' },
      { url: '/guides/boise-cabinet-cost-guide' },
      { url: '/cabinets/kitchen' },
      { url: '/cabinets/bathroom' },
      { url: '/estimate' },
      { url: '/contact' },
    ],
    primaryKeyword: 'Boise custom cabinets',
  },
  ...CITY_CABINET_GUIDES,
  ...ALL_HUB_PILLARS,
];

export function getGuideBySlug(slug: string): GuidePageData | undefined {
  return GUIDE_PAGES.find((g) => g.slug === slug);
}
