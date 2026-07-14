/**
 * Qualification + scoring. This is the heart of "quality over quantity."
 *
 * A candidate is first hard-DISQUALIFIED (denylists, spam, site-wide farms,
 * off-topic), then the survivors get a composite 0-100 SEO-value score from
 * authority, topical relevance, real audience, and link quality. We deliberately
 * never let raw Domain Rating alone qualify a domain, because high-DR hosting
 * footprints and link farms are exactly the trap that triggers penalties.
 */

import {
  LINKFARM_DENYLIST,
  PLATFORM_DENYLIST,
  RELEVANCE_TERMS,
  THRESHOLDS,
} from "./config";
import type { CandidateMetrics, OpportunityCategory, ScoreResult } from "./types";

/**
 * Categories where the destination is relevant by FUNCTION, not by keyword: a
 * local business legitimately belongs in these regardless of whether the
 * domain's own name is topical. The keyword-relevance gate would wrongly reject
 * Houzz, the BBB, chamber directories, NKBA, etc., so it is skipped for these.
 */
const FUNCTIONALLY_RELEVANT: Set<OpportunityCategory> = new Set([
  "local-citation",
  "review-platform",
  "industry-association",
  "curated-bestof",
  "local-news",
  "supplier-manufacturer",
  "partnership",
]);

function matchesDenylist(domain: string, list: string[]): boolean {
  const d = domain.toLowerCase();
  return list.some((entry) => d === entry || d.endsWith(`.${entry}`));
}

/**
 * Topical relevance in [0,1]. Uses the domain name plus any keywords we know
 * the domain ranks for (passed in when available). Geo matches weigh double
 * because local links are disproportionately valuable for a local business.
 */
export function relevanceScore(domain: string, keywords: string[] = []): number {
  const hay = [domain.toLowerCase(), ...keywords.map((k) => k.toLowerCase())].join(" ");
  let hits = 0;
  let weight = 0;
  for (const term of RELEVANCE_TERMS.industry) {
    weight += 1;
    if (hay.includes(term)) hits += 1;
  }
  for (const term of RELEVANCE_TERMS.geo) {
    weight += 2;
    if (hay.includes(term)) hits += 2;
  }
  // Squash: even one strong match yields meaningful relevance.
  const raw = hits / Math.max(weight * 0.25, 1);
  return Math.min(1, raw);
}

/** Log-normalize a 0..100 DR onto 0..1 with diminishing returns. */
function drScore(dr: number): number {
  return Math.min(1, Math.log10(Math.max(dr, 1) + 1) / Math.log10(101));
}

function trafficScore(traffic: number): number {
  if (traffic <= 0) return 0;
  return Math.min(1, Math.log10(traffic + 1) / Math.log10(1_000_000));
}

export function scoreCandidate(
  m: CandidateMetrics,
  opts: { keywords?: string[]; category?: OpportunityCategory; allowlisted?: boolean } = {},
): ScoreResult {
  const reasons: string[] = [];
  const rawRelevance = relevanceScore(m.domain, opts.keywords);
  const functional = opts.allowlisted || (opts.category != null && FUNCTIONALLY_RELEVANT.has(opts.category));
  // Functional/allowlisted targets get a relevance floor so they aren't gated
  // or scored to zero purely because the domain name isn't topical.
  const relevance = functional ? Math.max(rawRelevance, 0.5) : rawRelevance;
  const isLocal = RELEVANCE_TERMS.geo.some((g) => m.domain.toLowerCase().includes(g));

  const dq = (reason: string): ScoreResult => ({
    score: 0,
    tier: "reject",
    relevance,
    reasons,
    disqualified: true,
    disqualifyReason: reason,
  });

  // --- Hard disqualifiers (order matters: cheapest + most decisive first) ---
  if (m.isSpam) return dq("Flagged spam by Ahrefs");
  if (matchesDenylist(m.domain, PLATFORM_DENYLIST))
    return dq("Hosting/CDN/platform footprint, not an editorial link");
  if (matchesDenylist(m.domain, LINKFARM_DENYLIST))
    return dq("Known link farm / auto-directory (high DR, no editorial value)");
  if (m.linksToTarget > THRESHOLDS.maxLinksToTargetRatio)
    return dq(`Site-wide/footer link pattern (${m.linksToTarget} links to one target)`);
  if (relevance < THRESHOLDS.minRelevance)
    return dq(`Off-topic (relevance ${relevance.toFixed(2)} < ${THRESHOLDS.minRelevance})`);

  const drFloor = isLocal ? THRESHOLDS.minDomainRatingLocal : THRESHOLDS.minDomainRating;
  if (m.domainRating < drFloor)
    return dq(`DR ${m.domainRating} below ${isLocal ? "local " : ""}floor ${drFloor}`);
  if (m.trafficDomain < THRESHOLDS.minTrafficDomain && m.domainRating < 50)
    return dq(`Zombie domain: traffic ${m.trafficDomain} < ${THRESHOLDS.minTrafficDomain} and DR < 50`);

  // --- Composite score for survivors ---
  const dr = drScore(m.domainRating);
  const traffic = trafficScore(m.trafficDomain);
  const dofollow = m.dofollowLinks > 0 ? 1 : 0.4;

  // Relevance is weighted highest on purpose: a relevant DR30 beats an
  // irrelevant DR80 for sustainable, penalty-safe ranking gains.
  const score = Math.round(
    100 * (0.4 * relevance + 0.3 * dr + 0.2 * traffic + 0.1 * dofollow),
  );

  reasons.push(`DR ${m.domainRating}`, `traffic ~${m.trafficDomain}/mo`, `relevance ${relevance.toFixed(2)}`);
  if (isLocal) reasons.push("local (geo-relevant)");

  const tier: ScoreResult["tier"] = score >= 65 ? "A" : score >= 45 ? "B" : "C";
  return { score, tier, relevance, reasons, disqualified: false };
}
