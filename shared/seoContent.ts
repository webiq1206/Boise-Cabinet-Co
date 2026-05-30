import type { ServiceData, CityData } from './contentData';
import { getCountyLabel } from './contentData';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceSEOContent {
  slug: string;
  name: string;
  headline: string;
  primaryKeyword: string;
  overview: string;
  benefits: string[];
  inclusions: string[];
  timeline: string;
  processSteps: { title: string; description: string }[];
  faqs: FAQItem[];
}

export const SERVICE_SEO_CONTENT: Record<string, ServiceSEOContent> = {
  'kitchen-remodel': {
    slug: 'kitchen-remodel',
    name: 'Kitchen Remodel',
    headline: 'Kitchen Remodeling in the Treasure Valley',
    primaryKeyword: 'kitchen remodeling boise idaho',
    overview:
      'A well-planned kitchen remodel improves how your family cooks, gathers, and moves through the home. Boise Remodeling Co handles design, permitting, and construction under one roof so layout, cabinetry, lighting, and finishes stay aligned from first visit to final walkthrough.',
    benefits: [
      'Single design-build team, no juggling separate designers and contractors',
      'Written scope and finish selections before construction begins',
      'Ada and Canyon County permits handled in-house',
      'Weekly written schedule updates every Friday',
    ],
    inclusions: [
      'Layout planning and design direction',
      'Cabinetry, countertops, and backsplash coordination',
      'Lighting and electrical updates as needed',
      'Plumbing adjustments for sinks and appliances',
      'Dust barriers, floor protection, and daily cleanup',
    ],
    timeline: 'Most kitchen remodels run 6 to 10 weeks from permit approval, depending on layout changes and custom lead times.',
    processSteps: [
      { title: 'In-home consultation', description: 'We walk your space, discuss goals, and share a planning range on the spot.' },
      { title: 'Design and scope', description: 'You receive selections guidance and a written scope with your project investment.' },
      { title: 'Permits and scheduling', description: 'We file permits and build a week-by-week schedule before demo day.' },
      { title: 'Construction and walkthrough', description: 'Our crew executes the plan; you receive a final walkthrough and workmanship guarantee.' },
    ],
    faqs: [
      {
        question: 'How much does a kitchen remodel cost in the Treasure Valley?',
        answer:
          'Investment depends on size, layout changes, and finish level. Use our project estimator for a planning range, then schedule a free in-home visit for a written scope tailored to your home.',
      },
      {
        question: 'Can I use my kitchen during the remodel?',
        answer:
          'For many projects, yes with temporary setups. We install dust barriers and protect adjacent rooms. We will be honest about timeline impacts during your consultation.',
      },
      {
        question: 'Do you handle permits for kitchen remodels?',
        answer:
          'Yes. Permits are included and managed in-house for Ada and Canyon County jurisdictions.',
      },
    ],
  },
  'bathroom-remodel': {
    slug: 'bathroom-remodel',
    name: 'Bathroom Remodel',
    headline: 'Bathroom Remodeling in the Treasure Valley',
    primaryKeyword: 'bathroom remodeling boise idaho',
    overview:
      'Bathroom remodels should feel calm, functional, and built to last. We design primary baths, guest baths, and powder rooms with clear expectations, proactive communication, and finishes chosen for Idaho homes.',
    benefits: [
      'Design-build accountability from layout through tile and fixtures',
      'Waterproofing and plumbing scope defined in writing',
      'Transparent project investment, no surprise line-item games',
      'Written workmanship guarantee on our labor',
    ],
    inclusions: [
      'Vanity, shower, and tub planning',
      'Tile, flooring, and fixture selections guidance',
      'Ventilation and lighting improvements',
      'Plumbing and electrical updates as scoped',
      'Daily protection of adjacent living spaces',
    ],
    timeline: 'Typical bathroom remodels complete in 3 to 5 weeks after permits, depending on custom materials and layout changes.',
    processSteps: [
      { title: 'Consultation', description: 'We assess your bath, discuss storage and accessibility needs, and outline a planning range.' },
      { title: 'Selections and scope', description: 'Finishes and fixtures are documented before demolition.' },
      { title: 'Build', description: 'Licensed trades coordinate waterproofing, tile, and trim with weekly updates.' },
      { title: 'Final walkthrough', description: 'We review every detail with you before sign-off.' },
    ],
    faqs: [
      {
        question: 'How long does a bathroom remodel take?',
        answer: 'Most projects run 3 to 5 weeks from permit approval. Larger primary baths with layout changes may take longer.',
      },
      {
        question: 'Can you remodel a bathroom without moving plumbing?',
        answer: 'Yes. Cosmetic and mid-scope updates can keep existing plumbing locations. We will recommend layout changes only when they add real value.',
      },
      {
        question: 'Do you work in both Ada and Canyon County?',
        answer: 'Yes. We serve Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell, and surrounding Treasure Valley communities.',
      },
    ],
  },
  'whole-home-remodel': {
    slug: 'whole-home-remodel',
    name: 'Whole-Home Remodel',
    headline: 'Whole-Home Remodeling in the Treasure Valley',
    primaryKeyword: 'whole home remodeling boise idaho',
    overview:
      'Whole-home remodeling brings multiple rooms into one cohesive plan, open concepts, updated systems, new finishes, and better flow. Our design-build approach keeps one team accountable across phases so your home feels intentional, not piecemeal.',
    benefits: [
      'Phased scheduling to balance livability and progress',
      'Unified design language across rooms',
      'Single point of contact for scope, budget, and schedule',
      'Experience with Treasure Valley homes from ranchers to new construction',
    ],
    inclusions: [
      'Whole-home planning and prioritization',
      'Structural and layout changes as scoped',
      'Flooring, paint, and trim packages',
      'Kitchen and bath updates within the master plan',
      'Permit coordination across trades',
    ],
    timeline: 'Whole-home renovations typically run 3 to 6 months depending on scope, phasing, and permit timelines.',
    processSteps: [
      { title: 'Discovery', description: 'We map goals room by room and identify must-haves vs. nice-to-haves.' },
      { title: 'Master scope', description: 'A written plan sequences work to minimize disruption.' },
      { title: 'Phased construction', description: 'Trades follow an agreed schedule with Friday written updates.' },
      { title: 'Completion', description: 'Final walkthrough covers every space in the scope.' },
    ],
    faqs: [
      {
        question: 'Can we live in the home during a whole-home remodel?',
        answer:
          'Sometimes yes, sometimes no. We will give you an honest assessment based on HVAC, electrical, and dust exposure during your consultation.',
      },
      {
        question: 'How do you keep a large project on budget?',
        answer:
          'Written scope, documented selections, and change orders for any additional work, all approved before we proceed.',
      },
      {
        question: 'Is design-build better than hiring separate contractors?',
        answer:
          'For multi-room work, design-build reduces coordination risk and keeps design intent intact through construction.',
      },
    ],
  },
  'room-addition': {
    slug: 'room-addition',
    name: 'Room Addition',
    headline: 'Home Additions in the Treasure Valley',
    primaryKeyword: 'home additions boise idaho',
    overview:
      'Room additions expand living space without moving. We design attached additions, in-law suites, and bonus rooms that match your roof lines, foundation, and interior architecture, with permits and structural scope handled professionally.',
    benefits: [
      'Structural and architectural planning before breaking ground',
      'Exterior materials matched to your existing home',
      'Clear permit path for Ada and Canyon County',
      'Integrated HVAC and electrical planning',
    ],
    inclusions: [
      'Feasibility and site evaluation',
      'Foundation and framing',
      'Roof tie-in and exterior finish',
      'Interior finish to match existing home',
      'Permit and inspection coordination',
    ],
    timeline: 'Additions vary widely; many projects run 3 to 5 months from design through certificate of occupancy.',
    processSteps: [
      { title: 'Site visit', description: 'We review setbacks, access, and structural implications.' },
      { title: 'Design and engineering', description: 'Plans address code, loads, and aesthetic match.' },
      { title: 'Construction', description: 'Foundation through finish with weekly communication.' },
      { title: 'Inspections and closeout', description: 'We coordinate final inspections and walkthrough.' },
    ],
    faqs: [
      {
        question: 'Do I need a permit for a room addition in Idaho?',
        answer: 'Yes. Additions require permits in Ada and Canyon County. We handle permitting as part of our scope.',
      },
      {
        question: 'Will an addition match my existing home?',
        answer: 'That is a core part of our design process, roof lines, siding, and interior trim are planned to blend, not bolt on.',
      },
      {
        question: 'How do additions affect property taxes?',
        answer: 'Added square footage may affect assessed value. We can discuss timing and scope during planning; consult your tax advisor for specifics.',
      },
    ],
  },
};

export function getAreaIntro(city: CityData): string {
  const county = getCountyLabel(city.county);
  const neighborhood = ''; // filled from CITY_SEO_DATA at runtime in pages
  return `Boise Remodeling Co provides design-build remodeling for homeowners in ${city.name}, Idaho and throughout ${county}. From kitchen and bathroom renovations to whole-home remodels and room additions, you work with one accountable team from consultation through final walkthrough.`;
}

export function getCityServiceIntro(
  service: ServiceSEOContent,
  city: CityData,
  localFact?: string,
): string {
  const county = getCountyLabel(city.county);
  const fact = localFact
    ? ` ${localFact}`
    : ` We understand ${county} permit requirements and typical ${city.name} home styles.`;
  return `Looking for ${service.name.toLowerCase()} in ${city.name}, Idaho?${fact} Boise Remodeling Co offers design-build ${service.name.toLowerCase()} with clear written scope, proactive weekly updates, and a written workmanship guarantee. Schedule a free in-home consultation or use our project estimator for a planning range.`;
}

export function getCityServiceFaqs(service: ServiceSEOContent, city: CityData): FAQItem[] {
  const county = getCountyLabel(city.county);
  return [
    ...service.faqs.slice(0, 2),
    {
      question: `Do you offer ${service.name.toLowerCase()} in ${city.name}?`,
      answer: `Yes. We regularly serve ${city.name} and surrounding ${county} neighborhoods with ${service.name.toLowerCase()} projects.`,
    },
    {
      question: `How do I get a quote for ${service.name.toLowerCase()} in ${city.name}?`,
      answer: `Use our online project estimator for a planning range, then book a free 60 to 90 minute in-home visit. We will leave you with design direction and clear next steps.`,
    },
  ];
}

export const AREA_PAGE_FAQS: FAQItem[] = [
  {
    question: 'What remodeling services do you offer?',
    answer:
      'Kitchen remodels, bathroom remodels, whole-home renovations, and room additions, all managed design-build with one team.',
  },
  {
    question: 'Are you licensed and insured?',
    answer:
      'Yes. Boise Remodeling Co is licensed, bonded, and insured. Idaho contractor license details available upon request.',
  },
  {
    question: 'How do I start a project?',
    answer:
      'Call us, use our project estimator, or schedule a free in-home consultation through our website.',
  },
];

export const HOMEPAGE_FAQS_FOR_SCHEMA: FAQItem[] = [
  {
    question: 'How are you different from other remodeling companies in the Treasure Valley?',
    answer:
      'We operate as a true design-build firm with one accountable team from first visit to final walkthrough, not separate designers and contractors you have to coordinate.',
  },
  {
    question: 'What areas do you serve?',
    answer:
      'Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell, and the greater Treasure Valley.',
  },
  {
    question: 'Do you handle permits?',
    answer: 'Yes. Permits are included in our scope and handled in-house for Ada and Canyon County.',
  },
  {
    question: 'What is your workmanship guarantee?',
    answer: 'We provide a written workmanship guarantee on our labor.',
  },
];
