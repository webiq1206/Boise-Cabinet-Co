/**
 * BOT-05 existing-URL copy (Priya drafts, Sam PASS 2026-10-24).
 * Marketing truth: D1 cabinet identity (design, build to order, install).
 */
import { IDAHO_REGISTERED_CONTRACTOR, REGISTERED_BONDED_INSURED } from "../claims";
import { HERO_SUBHEAD } from "../siteContent";

export const BUILD_CABINETS_ANSWER =
  "Yes. Boise Cabinet Co designs custom cabinets to your measurements and builds each order to your layout.";

export const TRUST_LINE = `${REGISTERED_BONDED_INSURED}.`;

export const LEAD_TIME_LINE =
  "Lead time from approved design is typically 4-8 weeks.";

export const DEPOSIT_TO_LOCK_ORDER = "deposit to lock your order";

export type Bot05Faq = { question: string; answer: string };
export type Bot05Link = { href: string; label: string };
export type Bot05Step = { number: string; title: string; desc: string };
export type Bot05Section = { heading: string; paragraphs: string[] };

const BUILD_FAQ: Bot05Faq = {
  question: "Do you build cabinets?",
  answer: BUILD_CABINETS_ANSWER,
};

const BOISE_FAQS: Bot05Faq[] = [
  BUILD_FAQ,
  {
    question: "What areas do you serve?",
    answer:
      "Boise and the Treasure Valley, including Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.",
  },
  {
    question: "How long does a typical project take?",
    answer: `${LEAD_TIME_LINE} Install scheduling depends on scope and access.`,
  },
  {
    question: "What is included with installation?",
    answer:
      "Professional installation by our Treasure Valley crew, site protection as scoped, and a final walkthrough. Exact inclusions appear in your written proposal.",
  },
  {
    question: "How do I get a quote?",
    answer:
      "Request a free in-home design consultation or send project details through the site form. Call or text (208) 477-1169.",
  },
];

const KITCHEN_FAQS: Bot05Faq[] = [
  {
    question: "What pantry options do you offer?",
    answer:
      "Walk-in and reach-in or tall pantry cabinets with adjustable shelving and pull-out access where the layout allows. Exact configurations are confirmed after measuring your space.",
  },
  {
    question: "Can you design a walk-in pantry?",
    answer:
      "Yes, when the room supports it. We plan the layout with you, then build and install pantry cabinets sized to your space.",
  },
  {
    question: "Do you serve Kuna?",
    answer: "Yes. Kuna is in our Treasure Valley service area. See the Kuna location page for local notes.",
  },
  {
    question: "How does pricing work?",
    answer:
      "You get planning guidance after we understand scope, finishes, and linear footage. Your written proposal is the source of truth.",
  },
  BUILD_FAQ,
  {
    question: "What is the next step?",
    answer: "Book a free in-home design consultation or send layout notes and photos through the site.",
  },
];

export const BOISE_PROCESS_STEPS: Bot05Step[] = [
  {
    number: "01",
    title: "Free design consultation",
    desc: "Free design consultation at your home.",
  },
  {
    number: "02",
    title: "Selections",
    desc: "Selections for layout, door style, finish, and hardware.",
  },
  {
    number: "03",
    title: "Proposal and deposit",
    desc: `Written proposal and ${DEPOSIT_TO_LOCK_ORDER}.`,
  },
  {
    number: "04",
    title: "Lead time",
    desc: LEAD_TIME_LINE,
  },
  {
    number: "05",
    title: "Delivery and install",
    desc: "Delivery, professional installation, and a final walkthrough.",
  },
];

export const KITCHEN_PROCESS_STEPS: Bot05Step[] = [
  {
    number: "01",
    title: "Free design consultation",
    desc: "Free design consultation.",
  },
  {
    number: "02",
    title: "Layout and selections",
    desc: "Layout, door style, finish, and hardware selections with your project team.",
  },
  {
    number: "03",
    title: "Approval and deposit",
    desc: `Approval and ${DEPOSIT_TO_LOCK_ORDER}.`,
  },
  {
    number: "04",
    title: "Lead time",
    desc: LEAD_TIME_LINE,
  },
  {
    number: "05",
    title: "Delivery, install, and walkthrough",
    desc: "Delivery, install, and walkthrough.",
  },
];

export type Bot05LocationCopy = {
  title?: string;
  description?: string;
  h1Lead: string;
  h1Accent: string;
  firstSentence: string;
  aboveFold?: string;
  trustLine: string;
  ctaLabel: string;
  sections?: Bot05Section[];
  steps?: Bot05Step[];
  processHeading?: string;
  processNote?: string;
  faqs?: Bot05Faq[];
  links?: Bot05Link[];
};

export const BOT05_LOCATIONS: Record<string, Bot05LocationCopy> = {
  boise: {
    title: "Custom Cabinets Boise",
    description:
      "Custom cabinets for Boise and the Treasure Valley. Built to your layout with 299 finishes, six door styles, and install by our crew. Free in-home design consult.",
    h1Lead: "Custom cabinets",
    h1Accent: "Boise",
    firstSentence:
      "Custom cabinets in Boise start with a free in-home design consultation, then a clear path from selections to professional installation.",
    aboveFold: HERO_SUBHEAD,
    trustLine: TRUST_LINE,
    ctaLabel: "Book a free in-home design consultation",
    sections: [
      {
        heading: "Custom cabinets for Boise homes",
        paragraphs: [
          "Custom cabinets Boise buyers usually want a kitchen that fits the house they already have, not a catalog-only floor plan. North End bungalows, Bench ranches, and newer East Boise layouts each need different heights, pantry depth, and appliance clearances. We measure on site, help you choose from available finishes and door styles, and coordinate build-to-order production with installation so the package arrives ready for your schedule.",
        ],
      },
      {
        heading: "What custom means here",
        paragraphs: [
          "Custom here means configured to your room: widths, heights, pantry and tall storage, and hardware that matches how you cook and store. Frameless construction and soft-close hardware are available on many packages. Browse door styles and finishes before your consult so decisions move faster.",
        ],
      },
      {
        heading: "Cities we serve",
        paragraphs: [
          "Boise is the primary focus of this page. We also serve Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. Use the Meridian and Middleton location pages when your search is city-specific.",
        ],
      },
      {
        heading: "Ready to start",
        paragraphs: [
          "Share photos or a short project note online, or book the free visit. We may need a site visit before a firm estimate. Larger plan sets can take longer to review.",
        ],
      },
    ],
    steps: BOISE_PROCESS_STEPS,
    processHeading: "From consult to install",
    faqs: BOISE_FAQS,
    links: [
      { href: "/cabinets/kitchen", label: "Kitchen cabinets" },
      { href: "/services/cabinet-installation", label: "Cabinet installation" },
      { href: "/locations/meridian", label: "Meridian cabinets" },
      { href: "/locations/middleton", label: "Middleton cabinets" },
      { href: "/", label: "Home" },
      { href: "/cabinets", label: "Cabinet catalog" },
      { href: "/catalog", label: "Door styles and finishes" },
    ],
  },
  meridian: {
    title: "Custom Cabinets Meridian",
    description:
      "Custom cabinets for Meridian and the Treasure Valley. Designed to your measurements, built to your layout, and installed by our crew. Book a free in-home design consult.",
    h1Lead: "Custom cabinets",
    h1Accent: "Meridian",
    firstSentence:
      "Custom cabinetry in Meridian, ID starts with a free in-home design consultation, then cabinets built to your layout and professional installation.",
    trustLine: TRUST_LINE,
    ctaLabel: "Book a free in-home design consultation",
  },
  middleton: {
    title: "Custom Cabinetry Middleton",
    description:
      "Custom cabinetry for Middleton and the Treasure Valley. Kitchens, pantries, and storage built to your layout and installed by our crew. Free in-home design consultation.",
    h1Lead: "Custom cabinetry",
    h1Accent: "Middleton",
    firstSentence:
      "Custom cabinets in Middleton, ID start with a free in-home design consultation for kitchens, pantries, mudrooms, and storage along the Highway 44 corridor.",
    trustLine: TRUST_LINE,
    ctaLabel: "Book a free in-home design consultation",
  },
  kuna: {
    description:
      "Kitchen cabinets and pantry storage in Kuna, built to your layout with a free design consult. Upgrades for newer builder-grade kitchens across the Treasure Valley.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Kuna",
    firstSentence:
      "Kitchen cabinets and pantry storage in Kuna are available from Boise Cabinet Co, including upgrades on newer homes with builder-grade packages.",
    trustLine: TRUST_LINE,
    ctaLabel: "Book a free in-home design consultation",
    links: [
      { href: "/cabinets/kitchen", label: "Kitchen cabinets" },
      { href: "/cabinets/pantry", label: "Pantry cabinets" },
    ],
  },
};

export type Bot05RoomCopy = {
  title: string;
  description: string;
  h1Lead: string;
  h1Accent: string;
  firstSentence: string;
  aboveFold: string;
  trustLine: string;
  ctaLabel: string;
  sections: Bot05Section[];
  steps: Bot05Step[];
  processHeading: string;
  processNote: string;
  faqs: Bot05Faq[];
  links: Bot05Link[];
  pricingNote: string;
};

export const BOT05_ROOMS: Record<string, Bot05RoomCopy> = {
  kitchen: {
    title: "Kitchen Cabinets in Boise, Idaho",
    description:
      "Kitchen cabinets in Boise, Idaho and the Treasure Valley. Custom layouts, 299 finishes, six door styles, and installation by our crew. Request a free design consult.",
    h1Lead: "Kitchen cabinets in",
    h1Accent: "Boise, Idaho",
    firstSentence:
      "Kitchen cabinets in Boise, Idaho should mean a local team that designs to your measurements, builds to your layout, and installs with our Treasure Valley crew.",
    aboveFold: HERO_SUBHEAD,
    trustLine: TRUST_LINE,
    ctaLabel: "Book a free design consultation",
    sections: [
      {
        heading: "Kitchen cabinets for Boise and the Treasure Valley",
        paragraphs: [
          "Kitchen cabinets should cover more than a product photo. Daily cooking, Idaho dry-climate swings, and different house ages all change what storage you need. Galley kitchens on the Bench need different tall storage than larger islands in Eagle or newer Kuna plans. We start with how you cook and store, then map cabinets to that layout.",
        ],
      },
      {
        heading: "Styles and storage without a SKU dump",
        paragraphs: [
          "Choose from available door styles and finishes in the catalog, including popular shaker and slab looks. Soft-close hardware and frameless European-style boxes are available on many packages. Focus the plan on drawers for utensils, tall pantry storage, and wall cabinets that match your ceiling height.",
        ],
      },
      {
        heading: "Pantry path from the kitchen page",
        paragraphs: [
          "If your main goal is a walk-in or tall pantry, use the pantry page for walk-in and tall pantry detail. The kitchen page links there so pantry-intent visitors are not stuck on a general kitchen overview.",
        ],
      },
      {
        heading: "Service area",
        paragraphs: [
          "Serving Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. Kuna pantry and kitchen upgrades are common on newer homes with builder-grade packages.",
        ],
      },
    ],
    steps: KITCHEN_PROCESS_STEPS,
    processHeading: "Process and lead time",
    processNote: HERO_SUBHEAD,
    faqs: KITCHEN_FAQS,
    links: [
      { href: "/cabinets/pantry", label: "Pantry cabinets" },
      { href: "/services/cabinet-installation", label: "Cabinet installation" },
      { href: "/locations/kuna", label: "Kuna location" },
      { href: "/locations/boise", label: "Boise location" },
      { href: "/cabinets", label: "Catalog hub" },
      { href: "/catalog", label: "Door styles and finishes" },
    ],
    pricingNote:
      "You get planning guidance after we understand scope, finishes, and linear footage. Your written proposal is the source of truth.",
  },
  pantry: {
    title: "Kitchen Pantry Cabinets in Boise",
    description:
      "Kitchen pantry cabinets for walk-in and tall storage in Boise and the Treasure Valley. Built to your layout and installed by our crew. Free in-home design consultation.",
    h1Lead: "Kitchen pantry cabinets",
    h1Accent: "for your home",
    firstSentence:
      "Kitchen pantry cabinets help Treasure Valley homes add tall storage, walk-in layouts, and pull-out access without guessing on sizing.",
    aboveFold:
      "Pantry projects usually mean better bulk storage and fewer deep shelves you cannot reach. We help you choose walk-in or tall pantry layouts, build cabinets to your measurements, and install them across the Treasure Valley.",
    trustLine: TRUST_LINE,
    ctaLabel: "Tell us about your pantry layout",
    sections: [
      {
        heading: "Walk-in and tall pantry storage",
        paragraphs: [
          "A pantry can be a walk-in room or a tall reach-in run. Adjustable shelving and pull-out access keep bulk storage usable. We measure the space, build cabinets to order, and install them.",
        ],
      },
      {
        heading: "Kuna and the Treasure Valley",
        paragraphs: [
          "Kuna pantry and kitchen upgrades are common on newer homes with builder-grade packages. We also serve Boise, Meridian, Eagle, Nampa, Star, Middleton, and Caldwell.",
        ],
      },
    ],
    steps: KITCHEN_PROCESS_STEPS,
    processHeading: "Process and lead time",
    processNote: HERO_SUBHEAD,
    faqs: KITCHEN_FAQS,
    links: [
      { href: "/cabinets/kitchen", label: "Kitchen cabinets" },
      { href: "/services/cabinet-installation", label: "Cabinet installation" },
      { href: "/locations/kuna", label: "Kuna location" },
      { href: "/locations/boise", label: "Boise location" },
      { href: "/cabinets", label: "Catalog hub" },
    ],
    pricingNote:
      "You get planning guidance after we understand scope, finishes, and linear footage. Your written proposal is the source of truth.",
  },
};

export function bot05Location(slug: string): Bot05LocationCopy | undefined {
  return BOT05_LOCATIONS[slug];
}

export function bot05Room(slug: string): Bot05RoomCopy | undefined {
  return BOT05_ROOMS[slug];
}
