import { SITE_CONFIG } from "./siteConfig";
import { CATALOG_CONTENT } from "./catalog";
import { HOMEPAGE_FAQS } from "./homepageFaqs";
import { CITIES } from "./contentData";
import { HOW_WE_BUILD_STEPS } from "./siteContent";
import {
  APPLIANCE_DISCLAIMER,
  ESTIMATE_RANGE_DISCLAIMER,
  INCLUDED_SCOPE_NOTE,
  PROJECT_LABELS,
  PROJECT_SIZE_CONFIG,
  type ProjectType,
} from "./estimateEngine";

/**
 * Controlled business knowledge for the estimating assistant.
 *
 * THE RULE: the assistant may only state business facts that appear here, and
 * every entry is assembled from existing published site content (siteConfig,
 * catalog content, homepage FAQs, process steps, estimator disclaimers). The
 * assistant never invents warranties, lead times, promotions, or credentials -
 * if a topic isn't covered here, the honest answer is "that's a great question
 * for your free consultation."
 *
 * Update the underlying source modules (not this file) to change an answer;
 * this module only assembles them.
 */

export interface KnowledgeTopic {
  /** Stable key the assistant's get_business_info tool accepts. */
  key: string;
  /** One-line description shown to the model when listing topics. */
  summary: string;
  /** The full grounded answer content. */
  content: string;
}

function faqBlock(match: (q: string) => boolean): string {
  return HOMEPAGE_FAQS.filter((f) => match(f.q.toLowerCase()))
    .map((f) => `Q: ${f.q}\nA: ${f.a}`)
    .join("\n\n");
}

const SERVICE_LIST = (Object.keys(PROJECT_LABELS) as ProjectType[])
  .map((p) => {
    const cfg = PROJECT_SIZE_CONFIG[p];
    const label = PROJECT_LABELS[p];
    return `- ${label.label}: ${label.sub} (typical size range ${cfg.min}-${cfg.max} ${cfg.unitNoun}${cfg.uppers ? `, plus up to ${cfg.uppers.max} lf of wall cabinets` : ""})`;
  })
  .join("\n");

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    key: "company",
    summary: "Who Boise Cabinet Co is, contact info, and what makes them different",
    content: [
      `${SITE_CONFIG.name} (${SITE_CONFIG.legalName}) - ${SITE_CONFIG.tagline}.`,
      `Based in ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.state}; ${SITE_CONFIG.serviceAreaLabel}.`,
      `Phone (call or text): ${SITE_CONFIG.phone}. Email: ${SITE_CONFIG.email}. Website: ${SITE_CONFIG.siteUrl}.`,
      "",
      faqBlock((q) => q.includes("different") || q.includes("what kind of cabinets")),
    ].join("\n"),
  },
  {
    key: "services",
    summary: "Rooms and cabinet projects offered, with typical size ranges",
    content: [
      "Fully custom frameless (Euro) cabinets, built to order, for every room:",
      SERVICE_LIST,
      "",
      faqBlock((q) => q.includes("closet, laundry") || q.includes("install cabinets or supply")),
    ].join("\n"),
  },
  {
    key: "service-areas",
    summary: "Cities and areas served in the Treasure Valley",
    content: [
      `Service area: ${CITIES.map((c) => c.name).join(", ")} - the full Treasure Valley.`,
      "Just outside these areas? Reach out and we'll confirm whether we can accommodate the project.",
    ].join("\n"),
  },
  {
    key: "process",
    summary: "The five project steps from consultation to installation",
    content: HOW_WE_BUILD_STEPS.map((s) => `${s.number}. ${s.title} - ${s.desc}`).join("\n"),
  },
  {
    key: "consultation",
    summary: "What the free in-home design consultation includes",
    content: [
      faqBlock((q) => q.includes("consultation include")),
      "",
      "The visit is focused on planning guidance and an honest project range, not a commission-driven pitch. Reply within one business day; no spam.",
    ].join("\n"),
  },
  {
    key: "lead-time",
    summary: "Production and installation timeline",
    content: [
      `Typical lead time: ${CATALOG_CONTENT.leadTime} from approved design, depending on project size and finish selection.`,
      "",
      faqBlock((q) => q.includes("how long does")),
    ].join("\n"),
  },
  {
    key: "warranty",
    summary: "The limited lifetime warranty and what it covers",
    content: [
      `${CATALOG_CONTENT.warrantyHeadline}.`,
      CATALOG_CONTENT.warrantySummary,
      `Full details: ${SITE_CONFIG.siteUrl}/warranty`,
    ].join("\n"),
  },
  {
    key: "products",
    summary: "Door styles, finishes, and construction quality options",
    content: [
      faqBlock((q) => q.includes("door styles and finishes")),
      "",
      "Construction quality tiers: Good (furniture-board box with soft-close doors and drawers), Better (plywood box construction with full-extension soft-close slides), Best (all-plywood box with dovetail drawer boxes and reinforced shelves). Soft-close hinges and full-extension drawer slides are standard on every build.",
    ].join("\n"),
  },
  {
    key: "pricing-policy",
    summary: "How pricing and estimates work (policy, not numbers)",
    content: [
      faqBlock((q) => q.includes("how does pricing work")),
      "",
      `Estimator disclaimer shown with every range: ${ESTIMATE_RANGE_DISCLAIMER}`,
      `Scope note: ${INCLUDED_SCOPE_NOTE}`,
      `Kitchens: ${APPLIANCE_DISCLAIMER}`,
      `Planning ranges cover cabinetry and professional installation. Countertops, appliances, plumbing/electrical work, and full-remodel construction are outside the cabinet estimate and are scoped separately at the consultation.`,
      CATALOG_CONTENT.estimateDisclaimer,
    ].join("\n"),
  },
  {
    key: "design-studio",
    summary: "Designing online, the Design Studio, and the client portal",
    content: faqBlock(
      (q) => q.includes("design my cabinets online") || q.includes("track my project"),
    ),
  },
];

export const KNOWLEDGE_TOPIC_KEYS = KNOWLEDGE_TOPICS.map((t) => t.key);

export function getKnowledgeTopic(key: string): KnowledgeTopic | null {
  return KNOWLEDGE_TOPICS.find((t) => t.key === key) ?? null;
}

/** Compact topic index embedded in the assistant's system prompt. */
export function knowledgeTopicIndex(): string {
  return KNOWLEDGE_TOPICS.map((t) => `- ${t.key}: ${t.summary}`).join("\n");
}
