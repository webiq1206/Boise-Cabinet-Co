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
    name: 'Kitchen Cabinets',
    headline: 'Kitchen Cabinets in the Treasure Valley',
    primaryKeyword: 'kitchen cabinets boise idaho',
    overview:
      'Quality kitchen cabinets define how your family cooks, stores, and gathers. Boise Cabinet Co designs, supplies, and installs custom and value kitchen cabinetry with clear written scope from first visit through final walkthrough.',
    benefits: [
      'Design Studio layout tools and in-home templating',
      'Written scope and finish selections before shop release',
      'Frameless Euro construction and plywood box options',
      'Professional installation with workmanship guarantee',
    ],
    inclusions: [
      'Cabinet layout and design direction',
      'Door style, finish, and hardware selections',
      'Interior organization and accessory planning',
      'Shop drawings and fabrication coordination',
      'Installation, adjustment, and punch list',
    ],
    timeline: 'Most kitchen cabinet programs run 8 to 16 weeks from design lock through installation, depending on line and finish lead times.',
    processSteps: [
      { title: 'Design consultation', description: 'We walk your space, discuss storage goals, and share a planning range.' },
      { title: 'Selections and scope', description: 'You receive line, finish, and hardware guidance with written scope.' },
      { title: 'Fabrication', description: 'Shop drawings are approved before cabinets are built.' },
      { title: 'Installation and walkthrough', description: 'Our team sets cabinets, coordinates tops, and completes final walkthrough.' },
    ],
    faqs: [
      {
        question: 'How much do kitchen cabinets cost in the Treasure Valley?',
        answer:
          'Investment depends on linear footage, line tier, and accessories. Use our project estimator for a planning range, then schedule a free design visit for written scope.',
      },
      {
        question: 'Can I use my kitchen during cabinet installation?',
        answer:
          'Often yes with a temporary setup. We protect adjacent rooms and communicate utility shutoff windows during consultation.',
      },
      {
        question: 'Do you handle permits for kitchen cabinet work?',
        answer:
          'Cabinet-only work may not require permits. Trade work in scope is coordinated when included in your project.',
      },
    ],
  },
  'bathroom-remodel': {
    slug: 'bathroom-remodel',
    name: 'Bathroom Vanities',
    headline: 'Bathroom Vanities in the Treasure Valley',
    primaryKeyword: 'bathroom vanity cabinets boise idaho',
    overview:
      'Bathroom vanities should be beautiful, durable, and sized for real storage. We design single and double vanities, linen towers, and bath storage with clear expectations and finishes chosen for Idaho homes.',
    benefits: [
      'Vanity sizing matched to plumbing and wall conditions',
      'Finish and hardware coordinated with your home',
      'Transparent project investment with written scope',
      'Written workmanship guarantee on installation',
    ],
    inclusions: [
      'Vanity and tower planning',
      'Finish, hardware, and mirror coordination',
      'Countertop templating coordination when in scope',
      'Professional installation and adjustment',
      'Protection of adjacent living spaces',
    ],
    timeline: 'Typical vanity projects complete in 4 to 10 weeks from design lock, depending on custom lead times and countertops.',
    processSteps: [
      { title: 'Consultation', description: 'We assess your bath, discuss storage needs, and outline a planning range.' },
      { title: 'Selections and scope', description: 'Finishes and dimensions are documented before order.' },
      { title: 'Fabrication and install', description: 'Cabinets are built to approved drawings and installed on site.' },
      { title: 'Final walkthrough', description: 'We review every detail with you before sign-off.' },
    ],
    faqs: [
      {
        question: 'How long does a vanity project take?',
        answer: 'Most projects run 4 to 10 weeks from design lock. Double vanities with custom storage may take longer.',
      },
      {
        question: 'Can you replace a vanity without moving plumbing?',
        answer: 'Yes. Many updates keep existing plumbing locations. We recommend layout changes only when they add real value.',
      },
      {
        question: 'Do you work in both Ada and Canyon County?',
        answer: 'Yes. We serve Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell, and surrounding Treasure Valley communities.',
      },
    ],
  },
  'whole-home-remodel': {
    slug: 'whole-home-remodel',
    name: 'Whole-Home Cabinetry',
    headline: 'Whole-Home Cabinetry in the Treasure Valley',
    primaryKeyword: 'whole home custom cabinets boise idaho',
    overview:
      'Whole-home cabinetry brings kitchens, baths, laundry, mudroom, and built-ins into one cohesive finish and hardware plan. One team keeps selections, lead times, and installation aligned across rooms.',
    benefits: [
      'Unified finish and hardware schedule',
      'Phased installation to balance livability',
      'Single point of contact for scope and schedule',
      'Experience with Treasure Valley home styles',
    ],
    inclusions: [
      'Room-by-room cabinet planning',
      'Consistent line and finish selections',
      'Shop drawing coordination',
      'Phased delivery and installation',
      'Final walkthrough on every space in scope',
    ],
    timeline: 'Whole-home cabinet programs typically run 3 to 6 months depending on room count and fabrication lead times.',
    processSteps: [
      { title: 'Discovery', description: 'We map goals room by room and identify priorities.' },
      { title: 'Master scope', description: 'A written plan sequences fabrication and install.' },
      { title: 'Phased installation', description: 'Rooms are completed in agreed order with written updates.' },
      { title: 'Completion', description: 'Final walkthrough covers every space in the scope.' },
    ],
    faqs: [
      {
        question: 'Can we stay in the home during whole-home cabinet work?',
        answer:
          'Usually yes when work is phased by room. We will give you an honest assessment based on kitchen and bath access during consultation.',
      },
      {
        question: 'How do you keep a large cabinet program on budget?',
        answer:
          'Written scope, documented selections, and change orders for any additional work, all approved before we proceed.',
      },
      {
        question: 'Why order cabinets as one program?',
        answer:
          'One finish and hardware schedule prevents mismatched adjacent rooms and can reduce mobilization cost.',
      },
    ],
  },
  'adu': {
    slug: 'adu',
    name: 'Closet & Garage Storage',
    headline: 'Closet and Garage Storage in the Treasure Valley',
    primaryKeyword: 'custom closet systems boise idaho',
    overview:
      'Closet systems and garage storage turn unused space into daily function. Boise Cabinet Co designs reach-in closets, walk-ins, and garage wall systems with durable materials and professional installation.',
    benefits: [
      'Layouts matched to how you store and access items',
      'Durable hardware and adjustable shelving options',
      'Finish choices that hold up in Idaho garages and closets',
      'Professional installation and alignment',
    ],
    inclusions: [
      'On-site measurement and design',
      'Shelving, rods, drawers, and accessory planning',
      'Finish and hardware selections',
      'Fabrication and delivery',
      'Installation and final adjustment',
    ],
    timeline: 'Most closet and garage projects run 3 to 8 weeks from design lock through installation.',
    processSteps: [
      { title: 'Consultation', description: 'We review your space, storage habits, and goals.' },
      { title: 'Design and scope', description: 'Layouts and finishes are documented in writing.' },
      { title: 'Fabrication', description: 'Components are built to approved dimensions.' },
      { title: 'Installation', description: 'Systems are installed, aligned, and walked through with you.' },
    ],
    faqs: [
      {
        question: 'How much do custom closets cost in the Treasure Valley?',
        answer:
          'Investment depends on size, line, and accessories. Use our estimator for a planning range, then schedule a visit for written scope.',
      },
      {
        question: 'Can garage storage handle temperature swings?',
        answer:
          'We specify materials and finishes suited to Idaho garages and discuss ventilation during design.',
      },
      {
        question: 'Do closet systems need permits?',
        answer:
          'Most fastened casework does not. Electrical for integrated lighting may. We clarify during consultation.',
      },
    ],
  },
  'room-addition': {
    slug: 'room-addition',
    name: 'Built-In Storage',
    headline: 'Built-In Storage in the Treasure Valley',
    primaryKeyword: 'custom built-in cabinets boise idaho',
    overview:
      'Built-ins, entertainment centers, and specialty storage add function without sacrificing style. We design mudroom lockers, home office walls, and media units that match your architecture and daily routines.',
    benefits: [
      'Custom dimensions for alcoves and feature walls',
      'Finish and profile matched to existing trim',
      'Integrated outlets and cable paths when needed',
      'Clear scope before fabrication',
    ],
    inclusions: [
      'Design and field measurement',
      'Shop drawings and finish selections',
      'Fabrication of casework and panels',
      'On-site installation and scribe details',
      'Hardware adjustment and punch list',
    ],
    timeline: 'Built-in projects vary; many single-room programs run 4 to 10 weeks from design lock through installation.',
    processSteps: [
      { title: 'Site visit', description: 'We review dimensions, outlets, and design goals.' },
      { title: 'Design and drawings', description: 'Plans address fit, finish, and function.' },
      { title: 'Fabrication', description: 'Components are built to approved shop drawings.' },
      { title: 'Installation', description: 'Units are set, scribed, and finished on site.' },
    ],
    faqs: [
      {
        question: 'Can built-ins match my existing millwork?',
        answer: 'Yes. Profile, paint, and stain are planned to blend or contrast intentionally with your home.',
      },
      {
        question: 'What rooms work best for built-ins?',
        answer: 'Mudrooms, home offices, entertainment areas, and under-stair storage are common Treasure Valley requests.',
      },
      {
        question: 'How do I get a quote for built-ins?',
        answer: 'Use our online estimator for a planning range, then book a design visit for written scope.',
      },
    ],
  },
};

export function getAreaIntro(city: CityData): string {
  const county = getCountyLabel(city.county);
  return `Boise Cabinet Co provides custom kitchen cabinets, bathroom vanities, built-ins, and storage solutions for homeowners in ${city.name}, Idaho and throughout ${county}. You work with one accountable team from design through installation.`;
}

export function getCityServiceIntro(
  service: ServiceSEOContent,
  city: CityData,
  localFact?: string,
): string {
  const county = getCountyLabel(city.county);
  const fact = localFact
    ? ` ${localFact}`
    : ` We understand ${county} requirements and typical ${city.name} home styles.`;
  return `Looking for ${service.name.toLowerCase()} in ${city.name}, Idaho?${fact} Boise Cabinet Co offers ${service.name.toLowerCase()} with clear written scope, proactive updates, and a written workmanship guarantee. Schedule a free design consultation or use our project estimator for a planning range.`;
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
      answer: `Use our online project estimator for a planning range, then book a free design visit. We will leave you with clear next steps and written scope options.`,
    },
  ];
}

export const AREA_PAGE_FAQS: FAQItem[] = [
  {
    question: 'What cabinet products and services do you offer?',
    answer:
      'Kitchen cabinets, bathroom vanities, laundry and mudroom storage, pantry systems, closets, built-ins, entertainment centers, home office cabinetry, garage storage, hardware, and professional installation.',
  },
  {
    question: 'Are you licensed and insured?',
    answer:
      'Yes. Boise Cabinet Co is licensed, bonded, and insured. License details available upon request.',
  },
  {
    question: 'How do I start a cabinet project?',
    answer:
      'Call us, use our project estimator, or schedule a free design consultation through our website.',
  },
];

export const HOMEPAGE_FAQS_FOR_SCHEMA: FAQItem[] = [
  {
    question: 'How are you different from other cabinet companies in the Treasure Valley?',
    answer:
      'We combine Design Studio planning, curated collections, shop-built quality, and professional installation under one accountable team.',
  },
  {
    question: 'What areas do you serve?',
    answer:
      'Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell, and the greater Treasure Valley.',
  },
  {
    question: 'Do you handle permits when needed?',
    answer: 'When trade work is in scope, we coordinate permits for Ada and Canyon County.',
  },
  {
    question: 'What is your workmanship guarantee?',
    answer: 'We provide a written workmanship guarantee on our installation labor.',
  },
];
