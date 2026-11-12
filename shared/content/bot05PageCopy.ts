/**
 * BOT-05 existing-URL copy (Priya drafts, Sam PASS 2026-10-24).
 * Marketing truth: D1 cabinet identity (design, build to order, install).
 */
import { REGISTERED_INSURED } from "../claims";
import { HERO_SUBHEAD } from "../siteContent";

export const BUILD_CABINETS_ANSWER =
  "Yes. Boise Cabinet Co designs custom cabinets to your measurements and builds each order to your layout.";

export const TRUST_LINE = `${REGISTERED_INSURED}.`;

export const LEAD_TIME_LINE =
  "Lead time from approved design is typically 4-8 weeks.";

/** Pantry only. Other pages keep LEAD_TIME_LINE until their own copy is approved. */
export const PANTRY_LEAD_TIME_LINE =
  "Your lead time is confirmed with your quote.";

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

const SHARED_ROOM_FAQS: Bot05Faq[] = [
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

/**
 * Kitchen and pantry used to share one array whose first questions were pantry
 * questions, so /cabinets/kitchen rendered the pantry FAQ set. Each slug now
 * has its own list.
 */
const KITCHEN_FAQS: Bot05Faq[] = [
  {
    question: "Can you plan cabinets around my existing kitchen layout?",
    answer:
      "Yes. Keep plumbing and appliances where they work for you, or explore a different layout. We plan cabinets around your room and how you cook and store.",
  },
  {
    question: "Can you plan kitchen islands and cabinets for appliance panels?",
    answer:
      "Yes. Add seating and useful storage with an island plan, appliance panels, and tall pantry cabinets arranged around your kitchen.",
  },
  ...SHARED_ROOM_FAQS,
];

const PANTRY_FAQS: Bot05Faq[] = [
  {
    question: "What pantry options do you offer?",
    answer:
      "Walk-in and reach-in or tall pantry cabinets with adjustable shelving and pull-out access where the layout allows. Exact configurations are confirmed after measuring your space.",
  },
  {
    question: "Can you design a walk-in pantry?",
    answer:
      "Yes, when the room supports it. We plan the layout with you, then plan and install pantry cabinets sized to your space.",
  },
  ...SHARED_ROOM_FAQS,
];

export const BOISE_PROCESS_STEPS: Bot05Step[] = [
  {
    number: "01",
    title: "Free design consultation",
    desc: "We visit your home, measure the space, and talk through how you use it.",
  },
  {
    number: "02",
    title: "Selections",
    desc: "Choose the layout, door style, finish, and hardware with our help.",
  },
  {
    number: "03",
    title: "Proposal and deposit",
    desc: `You review a written proposal, then place a ${DEPOSIT_TO_LOCK_ORDER}.`,
  },
  {
    number: "04",
    title: "Lead time",
    desc: LEAD_TIME_LINE,
  },
  {
    number: "05",
    title: "Delivery and install",
    desc: "Our team or a qualified installation partner we manage delivers and installs your cabinets, then walks the finished work with you.",
  },
];

export const KITCHEN_PROCESS_STEPS: Bot05Step[] = [
  {
    number: "01",
    title: "Free design consultation",
    desc: "We visit your home, measure the kitchen, and talk through how you cook and store.",
  },
  {
    number: "02",
    title: "Layout and selections",
    desc: "Layout, door style, finish, and hardware selections with your project team.",
  },
  {
    number: "03",
    title: "Approval and deposit",
    desc: `You approve the written proposal and place a ${DEPOSIT_TO_LOCK_ORDER}.`,
  },
  {
    number: "04",
    title: "Lead time",
    desc: LEAD_TIME_LINE,
  },
  {
    number: "05",
    title: "Delivery, install, and walkthrough",
    desc: "Our team or a qualified installation partner we manage delivers and installs the cabinets, then walks the finished kitchen with you.",
  },
];

/** Same process as the kitchen page, with the pantry lead-time sentence only. */
export const PANTRY_PROCESS_STEPS: Bot05Step[] = KITCHEN_PROCESS_STEPS.map((step) =>
  step.title === "Lead time" ? { ...step, desc: PANTRY_LEAD_TIME_LINE } : step,
);

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
    title: "Custom Cabinets in Boise, Idaho",
    description:
      "Custom cabinets for Boise and the Treasure Valley. Built to your layout, 299 finishes, six door styles, managed installation. Free in-home design consult.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Boise, Idaho",
    firstSentence:
      "Custom cabinets in Boise start with a free in-home design consultation, then a clear path from selections to professional installation.",
    aboveFold: HERO_SUBHEAD,
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
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
          "We work across Boise and the Treasure Valley, including Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. Each city has its own page with local planning notes.",
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
    title: "Custom Cabinets in Meridian, Idaho",
    description:
      "Custom cabinets for Meridian and the Treasure Valley. Built to your layout, 299 finishes, and managed installation. Book a free in-home design consult.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Meridian, Idaho",
    firstSentence:
      "Custom cabinetry in Meridian, ID starts with a free in-home design consultation, then cabinets built to your layout and professional installation.",
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
  },
  middleton: {
    title: "Custom Cabinets in Middleton, Idaho",
    description:
      "Custom cabinetry for Middleton and the Treasure Valley. Kitchens, pantries, and storage built to your layout, with managed installation. Free design consult.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Middleton, Idaho",
    firstSentence:
      "Custom cabinets in Middleton, ID start with a free in-home design consultation for kitchens, pantries, mudrooms, and storage along the Highway 44 corridor.",
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
  },
  kuna: {
    description:
      "Kitchen cabinets and pantry storage in Kuna, built to your layout. Free design consult and upgrades for newer builder-grade kitchens across the Treasure Valley.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Kuna, Idaho",
    firstSentence:
      "Kitchen cabinets and pantry storage in Kuna are available from Boise Cabinet Co, including upgrades on newer homes with builder-grade packages.",
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
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
      "Kitchen cabinets in Boise, Idaho and the Treasure Valley. Custom layouts, 299 finishes, six door styles, managed installation. Request a free design consult.",
    h1Lead: "Kitchen cabinets in",
    h1Accent: "Boise, Idaho",
    firstSentence:
      "Kitchen cabinets in Boise, Idaho should mean a local team that designs to your measurements, builds to your layout, and installs with our Treasure Valley crew.",
    aboveFold: HERO_SUBHEAD,
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
    sections: [
      {
        heading: "Kitchen cabinets for Boise and the Treasure Valley",
        paragraphs: [
          "Kitchen cabinets should cover more than a product photo. Daily cooking, Idaho dry-climate swings, and different house ages all change what storage you need. Galley kitchens on the Bench need different tall storage than larger islands in Eagle or newer Kuna plans. We start with how you cook and store, then map cabinets to that layout.",
        ],
      },
      {
        heading: "Door styles, finishes, and storage",
        paragraphs: [
          "Choose from available door styles and finishes in the catalog, including popular shaker and slab looks. Soft-close hardware and frameless European-style boxes are available on many packages. Focus the plan on drawers for utensils, tall pantry storage, and wall cabinets that match your ceiling height.",
        ],
      },
      {
        heading: "Planning a pantry too?",
        paragraphs: [
          "If a walk-in or tall pantry is the main goal, our pantry cabinets page covers walk-in layouts, tall reach-in runs, and pull-out access in more detail.",
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
      "Kitchen pantry cabinets for walk-in and tall storage in Boise and the Treasure Valley. Built to your layout, with managed installation. Free design consult.",
    h1Lead: "Pantry cabinets in",
    h1Accent: "Boise, Idaho",
    firstSentence:
      "Kitchen pantry cabinets help Treasure Valley homes add tall storage, walk-in layouts, and pull-out access without guessing on sizing.",
    aboveFold:
      "Pantry projects usually mean better bulk storage and fewer deep shelves you cannot reach. We help you choose walk-in or tall pantry layouts, build cabinets to your measurements, and install them across the Treasure Valley.",
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
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
    steps: PANTRY_PROCESS_STEPS,
    processHeading: "Process and lead time",
    processNote: HERO_SUBHEAD,
    faqs: PANTRY_FAQS,
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
