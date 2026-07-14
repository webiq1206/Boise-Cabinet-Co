/**
 * Maps a qualified domain to the white-hat play we'd use to earn its link,
 * the automation level, and a one-line recommended action. Pure heuristics over
 * the domain + metrics; no network calls.
 */

import { AUTO_SUBMIT_CATEGORIES, SEED_TARGETS } from "./config";
import type { AutomationLevel, CandidateMetrics, OpportunityCategory } from "./types";

const SEED_MAP = new Map(SEED_TARGETS.map((s) => [s.domain, s.category as OpportunityCategory]));

const REVIEW_PLATFORMS = ["houzz", "angi", "bbb.org", "yelp", "birdeye", "thumbtack", "porch", "buildzoom"];
const DIRECTORY_HINTS = ["chamber", "directory", "local", "citysearch", "manta", "yellowpages", "hotfrog", "dnb", "dandb", "alignable"];
const NEWS_HINTS = ["news", "times", "post", "tribune", "statesman", "journal", "gazette", "press", "communityimpact"];
const ASSOCIATION_TLDS = [".org"];
const RESOURCE_TLDS = [".edu", ".gov"];

export function classify(m: CandidateMetrics): {
  category: OpportunityCategory;
  automation: AutomationLevel;
  recommendedPlay: string;
} {
  const d = m.domain.toLowerCase();

  const category: OpportunityCategory =
    SEED_MAP.get(d) ??
    (RESOURCE_TLDS.some((t) => d.endsWith(t))
      ? "resource-page"
      : REVIEW_PLATFORMS.some((t) => d.includes(t))
        ? "review-platform"
        : NEWS_HINTS.some((t) => d.includes(t))
          ? "local-news"
          : DIRECTORY_HINTS.some((t) => d.includes(t))
            ? "local-citation"
            : ASSOCIATION_TLDS.some((t) => d.endsWith(t))
              ? "industry-association"
              : "resource-page");

  const automation: AutomationLevel = AUTO_SUBMIT_CATEGORIES.has(category)
    ? "auto"
    : category === "digital-pr" || category === "guest-post"
      ? "manual"
      : "assisted";

  return { category, automation, recommendedPlay: playFor(category, m.domain) };
}

function playFor(category: OpportunityCategory, domain: string): string {
  switch (category) {
    case "local-citation":
      return `Submit consistent NAP business listing on ${domain}`;
    case "review-platform":
      return `Claim/complete the ${domain} profile and request verified reviews`;
    case "curated-bestof":
      return `Pitch inclusion in ${domain}'s "best cabinet makers" list with proof points`;
    case "industry-association":
      return `Join ${domain} and claim the member-directory profile link`;
    case "supplier-manufacturer":
      return `Request a dealer/installer listing link from ${domain}`;
    case "resource-page":
      return `Suggest our relevant guide for ${domain}'s resource/links page`;
    case "broken-link":
      return `Offer our page as a replacement for a dead link on ${domain}`;
    case "unlinked-mention":
      return `Ask ${domain} to link an existing unlinked mention of the brand`;
    case "digital-pr":
      return `Pitch a data story / expert quote to ${domain}`;
    case "guest-post":
      return `Propose an editorial contribution to ${domain}`;
    case "local-news":
      return `Offer a local-interest angle or expert source to ${domain}`;
    case "partnership":
      return `Set up a reciprocal referral/partner link with ${domain}`;
    default:
      return `Evaluate ${domain} for a contextual link`;
  }
}
