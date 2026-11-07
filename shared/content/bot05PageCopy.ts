/**
 * BOT-05 existing-URL copy (Priya drafts, Sam PASS 2026-10-24).
 * Marketing truth: D1 cabinet identity (design, build to order, install).
 */
import { REGISTERED_BONDED_INSURED } from "../claims";
import { HERO_SUBHEAD } from "../siteContent";

export const BUILD_CABINETS_ANSWER =
  "Yes. Boise Cabinet Co designs custom cabinets to your measurements and plans each order around your layout.";

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

const QUOTE_LEAD_TIME_FAQ: Bot05Faq = {
  question: "When will my cabinets be ready?",
  answer:
    "Your cabinets are built to order, so your lead time is confirmed with your quote. Scope, elevations and finish selections are documented in writing before production starts.",
};

const BOISE_VISIBILITY_FAQS: Bot05Faq[] = [
  {
    question: "Do you install custom cabinets in Boise?",
    answer: "Yes. Our own crew installs your cabinets. Installation includes a written workmanship warranty.",
  },
  QUOTE_LEAD_TIME_FAQ,
];

const MERIDIAN_VISIBILITY_FAQS: Bot05Faq[] = [
  {
    question: "Do you install custom cabinets?",
    answer: "Yes. Our own crew installs your cabinets. Installation includes a written workmanship warranty.",
  },
  QUOTE_LEAD_TIME_FAQ,
];

const MIDDLETON_VISIBILITY_FAQS: Bot05Faq[] = [
  {
    question: "Do you design garage cabinets in Middleton?",
    answer:
      "Yes. We design garage storage for Middleton homes, plan it around your layout and install it with our own crew. The in-home design consultation is free.",
  },
  QUOTE_LEAD_TIME_FAQ,
];

const KUNA_VISIBILITY_FAQS: Bot05Faq[] = [
  {
    question: "What does the free design visit include?",
    answer: "We walk your space, talk through how you use it, and give planning guidance with no obligation.",
  },
  {
    question: "Are you a registered and insured contractor?",
    answer:
      "Yes. Work is performed by P5 Home Co LLC, Idaho Registered Contractor #8381215, insured, with a certificate available on request.",
  },
];

const PANTRY_VISIBILITY_FAQS: Bot05Faq[] = [
  {
    question: "Can you design a pantry with floor-to-ceiling storage?",
    answer:
      "Yes. We plan tall pantry cabinets, pull-outs and adjustable shelves around your room and the items you need to reach.",
  },
  QUOTE_LEAD_TIME_FAQ,
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
    desc: "Our crew delivers and installs your cabinets, then walks the finished work with you.",
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
    desc: "Our crew delivers and installs the cabinets, then walks the finished kitchen with you.",
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
  answer?: string;
  sections?: Bot05Section[];
  steps?: Bot05Step[];
  processHeading?: string;
  processNote?: string;
  faqs?: Bot05Faq[];
  appendFaqs?: Bot05Faq[];
  links?: Bot05Link[];
};

export const BOT05_LOCATIONS: Record<string, Bot05LocationCopy> = {
  boise: {
    title: "Custom Cabinets in Boise, ID, Installed by Our Crew",
    description:
      "Custom cabinets for Boise homes, from North End kitchens to new builds, built to your layout and installed by our own crew. Free in-home design consult.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Boise, Idaho",
    answer:
      "Get custom cabinets planned around how you cook and store. Boise Cabinet Co starts every Boise project with a free in-home design consultation, measures your space, plans cabinets around your layout and installs them with our own crew. Your cabinets are built to order, you see a written price before work, and installation includes a written workmanship warranty.",
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
    appendFaqs: BOISE_VISIBILITY_FAQS,
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
    title: "Custom Cabinet Company in Meridian, ID",
    description:
      "Custom kitchen cabinets for Meridian homes, planned around your layout and installed by our own crew. Free design consult and a written price before work.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Meridian, Idaho",
    answer:
      "Get kitchen cabinets, vanities and built-ins designed around your measurements. Boise Cabinet Co is a custom cabinet company serving Meridian, Idaho. We plan cabinets around your layout. Your cabinets are built to order and installed by our own crew. Every project starts with a free in-home design consultation and a written price before work begins.",
    appendFaqs: MERIDIAN_VISIBILITY_FAQS,
    firstSentence:
      "Custom cabinetry in Meridian, ID starts with a free in-home design consultation, then cabinets built to your layout and professional installation.",
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
  },
  middleton: {
    title: "Garage Cabinets and Pantries in Middleton",
    description:
      "Garage cabinets, pantries and custom storage for Middleton homes, planned around your layout and installed by our own crew. Book a free design consult.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Middleton, Idaho",
    answer:
      "Get storage that fits how your family uses each space. Boise Cabinet Co designs garage cabinets, kitchen pantries, mudrooms and custom storage for Middleton homes, planned around your layout, built to order and installed by our own crew. You start with a free in-home design consultation and a written price before any work begins.",
    appendFaqs: MIDDLETON_VISIBILITY_FAQS,
    firstSentence:
      "Custom cabinets in Middleton, ID start with a free in-home design consultation for kitchens, pantries, mudrooms, and storage along the Highway 44 corridor.",
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
  },
  kuna: {
    title: "Kitchen and Garage Cabinets in Kuna, ID",
    description:
      "Kitchen, pantry and garage cabinets for Kuna homes, planned around your layout, installed by our crew. Upgrade builder-grade storage. Free design consult.",
    h1Lead: "Custom cabinets in",
    h1Accent: "Kuna, Idaho",
    answer:
      "Get storage that finally works in a newer Kuna home. Boise Cabinet Co designs custom kitchen, pantry and garage cabinets, planned around your layout, built to order and installed by our own crew. It is a simple way to upgrade builder-grade cabinets or organize the garage. Start with a free in-home design visit and a written price before work.",
    appendFaqs: KUNA_VISIBILITY_FAQS,
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
  answer?: string;
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
    title: "Custom Kitchen Cabinets in Boise",
    description:
      "A kitchen that fits how you cook, with custom cabinets planned around your layout and installed by our crew. Free design consult, written price first.",
    h1Lead: "Kitchen cabinets in",
    h1Accent: "Boise, Idaho",
    answer:
      "Get kitchen storage planned around how you cook and gather. Boise Cabinet Co designs custom kitchen cabinets for Boise homes. Your cabinets are built to order, planned around your layout and installed by our own crew. Whether you are planning a kitchen or island, start with an in-home design consultation and a written quote before work.",
    firstSentence:
      "Kitchen cabinets in Boise, Idaho should mean a local team that designs around your measurements and layout, and installs with our Treasure Valley crew.",
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
    title: "Custom Pantry Cabinets in Boise",
    description:
      "See what you stock at a glance. Walk-in and reach-in pantries with pull-outs and adjustable shelves, planned around your layout, installed by our crew.",
    h1Lead: "Pantry cabinets in",
    h1Accent: "Boise, Idaho",
    answer:
      "See everything you stock at a glance. Boise Cabinet Co designs walk-in and reach-in pantries with adjustable shelving, pull-out systems, appliance garages and bulk storage, planned around your layout, built to order and installed by our own crew. Start with a free in-home design consultation and a written price before work.",
    firstSentence:
      "Pantry projects usually mean better bulk storage and fewer deep shelves you cannot reach. We help you choose walk-in or tall pantry layouts, plan cabinets around your measurements, and install them across the Treasure Valley.",
    aboveFold: "",
    trustLine: TRUST_LINE,
    ctaLabel: "Request a quote",
    sections: [
      {
        heading: "Walk-in and tall pantry storage",
        paragraphs: [
          "A pantry can be a walk-in room or a tall reach-in run. Adjustable shelving and pull-out access keep bulk storage usable. We measure the space, plan cabinets around your layout, and install them.",
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
    faqs: [
      ...KITCHEN_FAQS.map((faq) =>
        faq.question === "Can you design a walk-in pantry?"
          ? {
              ...faq,
              answer:
                "Yes, when the room supports it. We plan the layout with you, then plan and install pantry cabinets sized to your space.",
            }
          : faq,
      ),
      ...PANTRY_VISIBILITY_FAQS,
    ],
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
