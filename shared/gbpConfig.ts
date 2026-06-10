/**
 * Google Business Profile launch data — single source of truth for copy, URLs,
 * services, products, Q&A, and UTM-tagged links. Consumed by docs generators
 * and verification scripts under scripts/gbp/.
 */
import { SITE_CONFIG } from "@/shared/siteConfig";
import { DOOR_STYLES } from "@/shared/catalog/generated/doorStyles";

const SITE = SITE_CONFIG.siteUrl.replace(/\/$/, "");

export const GBP_UTM = {
  source: "gbp",
  medium: "organic",
} as const;

export function gbpUrl(
  path: string,
  campaign: string,
  extra?: Record<string, string>,
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const params = new URLSearchParams({
    utm_source: GBP_UTM.source,
    utm_medium: GBP_UTM.medium,
    utm_campaign: campaign,
    ...extra,
  });
  return `${SITE}${normalized}?${params.toString()}`;
}

export const GBP_PROFILE = {
  businessName: "Boise Cabinet Co",
  legalName: "Boise Cabinet Co LLC",
  businessType: "Service-Area Business (hide address)",
  addressOnFile: "Meridian, ID (verification only; do not display publicly)",
  phone: SITE_CONFIG.phone,
  email: SITE_CONFIG.email,
  openingDate: "2017",
  serviceRadiusMiles: 35,
  websiteUrl: gbpUrl("/", "profile"),
  appointmentUrl: gbpUrl("/contact", "appointment"),
  estimateUrl: gbpUrl("/estimate", "estimate"),
  primaryCategory: "Cabinet maker",
  secondaryCategories: [
    "Cabinet store",
    "Kitchen remodeler",
    "Bathroom remodeler",
    "Carpenter",
  ],
  hours: {
    monday: "7:00 AM - 6:00 PM",
    tuesday: "7:00 AM - 6:00 PM",
    wednesday: "7:00 AM - 6:00 PM",
    thursday: "7:00 AM - 6:00 PM",
    friday: "7:00 AM - 6:00 PM",
    saturday: "8:00 AM - 4:00 PM",
    sunday: "Closed",
  },
  paymentMethods: ["Cash", "Credit Card", "Check", "Financing"],
  social: {
    facebook: "https://www.facebook.com/boisecabinetco",
    instagram: "https://www.instagram.com/boisecabinetco",
  },
  messagingWelcome:
    "Hi! Thanks for reaching out to Boise Cabinet Co. We design, build, and install custom cabinets across the Treasure Valley. How can we help with your project? You can also book a free consultation at boisecabinet.co/contact",
  attributes: {
    onlineEstimates: true,
    onsiteServices: true,
  },
} as const;

export const GBP_BUSINESS_DESCRIPTION =
  "Boise Cabinet Co designs, builds, and installs custom frameless (European-style) kitchen cabinets, bathroom vanities, and built-in storage for Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. Founded in 2017, we offer 299 cabinet finishes and six door styles, all built to order with soft-close hardware and backed by a limited lifetime workmanship warranty. Every project starts with a free in-home design consultation, a written scope before fabrication, and one accountable team from first sketch to final walkthrough. Homeowners track approvals, timelines, and installation through our client portal. We handle Ada and Canyon County projects with local permit and schedule expertise. Request your free consultation today.";

export interface GbpServiceArea {
  name: string;
  county: "ada" | "canyon";
  gbpLabel: string;
  guidePath: string;
}

export const GBP_SERVICE_AREAS: GbpServiceArea[] = [
  { name: "Boise", county: "ada", gbpLabel: "Boise, ID", guidePath: "/guides/boise-cabinet-guide" },
  { name: "Meridian", county: "ada", gbpLabel: "Meridian, ID", guidePath: "/guides/meridian-cabinet-guide" },
  { name: "Eagle", county: "ada", gbpLabel: "Eagle, ID", guidePath: "/guides/eagle-cabinet-guide" },
  { name: "Nampa", county: "canyon", gbpLabel: "Nampa, ID", guidePath: "/guides/nampa-cabinet-guide" },
  { name: "Kuna", county: "ada", gbpLabel: "Kuna, ID", guidePath: "/guides/kuna-cabinet-guide" },
  { name: "Star", county: "ada", gbpLabel: "Star, ID", guidePath: "/guides/star-cabinet-guide" },
  { name: "Middleton", county: "canyon", gbpLabel: "Middleton, ID", guidePath: "/guides/middleton-cabinet-guide" },
  { name: "Caldwell", county: "canyon", gbpLabel: "Caldwell, ID", guidePath: "/guides/caldwell-cabinet-guide" },
  { name: "Garden City", county: "ada", gbpLabel: "Garden City, ID", guidePath: "/guides/treasure-valley-cabinet-guide" },
];

export interface GbpService {
  name: string;
  description: string;
  path: string;
  campaign: string;
  priority: "core" | "bonus";
}

export const GBP_SERVICES: GbpService[] = [
  {
    name: "Custom kitchen cabinets",
    description:
      "Built-to-order frameless kitchen cabinets: base runs, uppers, pantries, islands, and appliance panels designed as one coordinated system for Treasure Valley homes.",
    path: "/cabinets/kitchen",
    campaign: "service-kitchen",
    priority: "core",
  },
  {
    name: "Bathroom vanities",
    description:
      "Custom vanity cabinets engineered for moisture resistance, with grooming drawer storage and hamper pull-outs, matched to your tile and stone selections.",
    path: "/cabinets/bathroom",
    campaign: "service-bathroom",
    priority: "core",
  },
  {
    name: "Closet systems",
    description:
      "Custom closet cabinets and organizers sized to your space, from reach-in upgrades to full primary suite systems.",
    path: "/cabinets/closet",
    campaign: "service-closet",
    priority: "core",
  },
  {
    name: "Pantry cabinets",
    description:
      "Walk-in and reach-in pantry systems with adjustable shelving, appliance garages, and pull-out storage.",
    path: "/cabinets/pantry",
    campaign: "service-pantry",
    priority: "core",
  },
  {
    name: "Garage storage cabinets",
    description:
      "Durable garage cabinet systems that stand up to tools, gear, and Idaho temperature swings.",
    path: "/cabinets/garage",
    campaign: "service-garage",
    priority: "core",
  },
  {
    name: "Laundry & mudroom cabinets",
    description:
      "Folding surfaces, pull-out hampers, bench seating, boot storage, and locker systems built for daily family traffic.",
    path: "/cabinets/laundry",
    campaign: "service-laundry",
    priority: "core",
  },
  {
    name: "Built-ins & entertainment centers",
    description:
      "Window seats, bookcases, media centers, fireplace surrounds, and architectural millwork built to order.",
    path: "/cabinets/built-ins",
    campaign: "service-built-ins",
    priority: "core",
  },
  {
    name: "Home office cabinets",
    description:
      "Built-in desks, file drawers, and shelving with integrated cable management.",
    path: "/cabinets/home-office",
    campaign: "service-home-office",
    priority: "core",
  },
  {
    name: "Outdoor kitchen cabinets",
    description:
      "Weather-resistant outdoor kitchen and bar cabinetry for Treasure Valley patios.",
    path: "/cabinets/outdoor",
    campaign: "service-outdoor",
    priority: "core",
  },
  {
    name: "Cabinet installation",
    description:
      "Professional installation by our own team, with final walkthrough and lifetime workmanship warranty.",
    path: "/construction",
    campaign: "service-installation",
    priority: "core",
  },
  {
    name: "Free design consultation",
    description:
      "A 60-90 minute in-home consultation: explore finishes and door styles, get planning guidance and an honest investment range. No pressure.",
    path: "/contact",
    campaign: "service-consultation",
    priority: "core",
  },
  {
    name: "Mudroom cabinets",
    description:
      "Bench seating, boot storage, coat cubbies, and locker systems built for Idaho winters and daily family traffic.",
    path: "/cabinets/mudroom",
    campaign: "service-mudroom",
    priority: "bonus",
  },
  {
    name: "Wet bar cabinets",
    description:
      "Beverage centers with wine storage, glassware dividers, and optional sink bases for entertaining spaces.",
    path: "/cabinets/wet-bar",
    campaign: "service-wet-bar",
    priority: "bonus",
  },
  {
    name: "Entertainment centers",
    description:
      "Media centers, fireplace surrounds, and bar areas with integrated wire management and ventilation clearances.",
    path: "/cabinets/entertainment",
    campaign: "service-entertainment",
    priority: "bonus",
  },
  {
    name: "Bedroom storage cabinets",
    description:
      "Dresser bases, wardrobe towers, and nightstand cabinets coordinated with primary and guest suites.",
    path: "/cabinets/bedroom",
    campaign: "service-bedroom",
    priority: "bonus",
  },
  {
    name: "Whole-home cabinetry",
    description:
      "Coordinated cabinet packages across kitchen, bath, laundry, mudroom, and built-ins with one finish program.",
    path: "/guides/whole-home-cabinetry-guide",
    campaign: "service-whole-home",
    priority: "bonus",
  },
];

const DOOR_PRODUCT_DESCRIPTIONS: Record<string, string> = {
  slab: "Minimal, streamlined flat panel doors. Pairs beautifully with woodgrain or bold solid colors. Available across all 299 finishes.",
  "three-piece":
    "Horizontal center panel showcases natural woodgrain depth. Ideal for warm, organic kitchen and bath designs.",
  "modern-shaker":
    "Classic shaker profile with clean, timeless detail. Works in traditional and transitional Treasure Valley homes.",
  "thin-shaker":
    "Transitional modern shaker with softer, understated rails and stiles. A refined middle ground between slab and full shaker.",
  "alpha-shaker":
    "Bold shaker variant with defined frame proportions. Adds architectural character without overwhelming the room.",
  "beta-shaker":
    "Premium shaker option with the deepest frame detail in our lineup. Ideal for statement kitchens and primary baths.",
};

export interface GbpProduct {
  name: string;
  description: string;
  path: string;
  campaign: string;
  imagePath: string;
  priority: "core" | "bonus";
}

export const GBP_DOOR_PRODUCTS: GbpProduct[] = DOOR_STYLES.map((d) => ({
  name: `${d.name} cabinet doors`,
  description: DOOR_PRODUCT_DESCRIPTIONS[d.slug] ?? d.description,
  path: `/door-styles/${d.slug}`,
  campaign: `product-${d.slug}`,
  imagePath: d.imagePath,
  priority: "core" as const,
}));

export const GBP_BONUS_PRODUCTS: GbpProduct[] = [
  {
    name: "Custom Cabinet Collection",
    description:
      "Built-to-order frameless cabinets in any size, 1/4\" increments, 4-8 week lead time.",
    path: "/collections/custom",
    campaign: "product-custom-collection",
    imagePath: "/images/marketing/catalog-default.webp",
    priority: "bonus",
  },
  {
    name: "Cabinet Finish Library (299 options)",
    description: "Browse matte, gloss, and woodgrain finishes for your custom cabinets.",
    path: "/finishes",
    campaign: "product-finishes",
    imagePath: "/images/marketing/catalog-default.webp",
    priority: "bonus",
  },
  {
    name: "Cabinet Hardware (Salice)",
    description:
      "Soft-close hinges and Futura Smove drawer slides, standard on every cabinet.",
    path: "/hardware",
    campaign: "product-hardware",
    imagePath: "/images/marketing/hero-hardware.webp",
    priority: "bonus",
  },
  {
    name: "Smart Storage Accessories",
    description: "Roll-out trays, trash pull-outs, lazy susans, blind corner pull-outs.",
    path: "/accessories",
    campaign: "product-accessories",
    imagePath: "/images/marketing/catalog-default.webp",
    priority: "bonus",
  },
];

export interface GbpQaPair {
  question: string;
  answer: string;
}

/** GBP-safe Q&A (consultation answer omits showroom; matches SAB model). */
export const GBP_QA_SEEDS: GbpQaPair[] = [
  {
    question: "What makes Boise Cabinet Co different from other cabinet companies?",
    answer:
      "We combine a full product catalog (299 finishes and six door styles) with an online Design Studio, a dedicated client portal for project tracking, and frameless Euro construction backed by a lifetime warranty. You get one accountable team from design through installation, with transparent timelines, written scope, and proactive updates at every stage.",
  },
  {
    question: "What kind of cabinets do you build?",
    answer:
      "We build fully custom frameless cabinets, made to order for your space. You choose from 299 finishes and six door styles, and every cabinet uses the same quality frameless construction.",
  },
  {
    question: "How long does a custom cabinet project take?",
    answer:
      "Most custom cabinet projects run about 4-8 weeks from approved design, depending on size and finish selection. Your client portal shows real-time status from design review through fabrication, delivery, and installation.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We serve the full Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. If you are just outside these areas, reach out and we will let you know if we can accommodate your project.",
  },
  {
    question: "Do you install cabinets or supply only?",
    answer:
      "We offer full-service design, fabrication, delivery, and professional installation. You can also discuss supply-only options for trade partners and contractors through our partner portal.",
  },
  {
    question: "What warranty do you provide?",
    answer:
      "Every Boise Cabinet Co cabinet carries a limited lifetime warranty to the original homeowner on workmanship and materials. Warranty details and service requests are accessible anytime through your client portal.",
  },
  {
    question: "What does the free design consultation include?",
    answer:
      "A 60-90 minute consultation at your home. We review your space, discuss goals, walk through finish and door style options, and provide a planning investment range. No pressure — you leave with clarity, not a sales pitch. Schedule at boisecabinet.co/contact",
  },
  {
    question: "How does pricing work?",
    answer:
      "Pricing depends on your door style, finish selections, linear footage, and accessories. After your Design Studio session or consultation, we provide a detailed written proposal with line-item scope. Deposits are collected through your client portal with secure online payment.",
  },
];

export const GBP_LEGACY_AUDIT_SEARCHES = [
  {
    term: "Boise Remodeling Co",
    reason: "Pre-rebrand identity",
    oldPhone: "(208) 352-2011",
    action: "Claim, correct, or request removal",
  },
  {
    term: "Boise Cabinet Co",
    reason: "Check if a profile already exists",
    action: "Claim or create fresh",
  },
  {
    term: "Boise Cabinet Inc Garden City",
    reason: "Different company — (208) 323-0010",
    action: "Never claim or merge",
  },
] as const;

export const GBP_NAP_BLOCK = `${GBP_PROFILE.businessName}
${GBP_PROFILE.phone}
${GBP_PROFILE.email}
${SITE}
Meridian, ID (service-area; no street address published)`;

export const GBP_COMPLETENESS_CHECKLIST = [
  "Business name exact: Boise Cabinet Co",
  "SAB enabled, address hidden",
  "Primary category: Cabinet maker",
  "4 secondary categories added",
  "Phone, website (UTM), appointment link set",
  "Opening date: 2017",
  "9 service areas added",
  "Hours set (Mon-Fri 7-6, Sat 8-4, Sun closed)",
  "744-char business description pasted",
  "11 core services with descriptions + UTM links",
  "6 door-style products with photos + UTM links",
  "20+ photos uploaded with SEO filenames",
  "Logo and cover photo set",
  "8 Q&A pairs seeded",
  "Messaging enabled with welcome message",
  "Facebook + Instagram linked",
  "Online estimates + onsite services attributes ON",
  "Verification completed",
  "NEXT_PUBLIC_GBP_URL set on website",
  "Bing Places + Apple Business Connect imported",
  "Legacy Boise Remodeling Co listing audited",
  "First Google Post published",
  "Review request process documented for install crew",
] as const;
