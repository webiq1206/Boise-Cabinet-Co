/**
 * Shared types for the autonomous backlink acquisition engine.
 */

/** The legitimate white-hat plays the engine pursues. */
export type OpportunityCategory =
  | "local-citation" // NAP directories, chambers, local business listings
  | "curated-bestof" // "best cabinet makers in Boise" editorial lists
  | "industry-association" // NKBA, NARI, KCMA, builder associations
  | "supplier-manufacturer" // brands we install linking to their dealers
  | "resource-page" // topical resource/link pages that fit our content
  | "broken-link" // dead links on relevant pages we can replace
  | "unlinked-mention" // brand named without a link
  | "digital-pr" // journalist queries, data studies, press features
  | "guest-post" // editorial contributions on relevant DR40+ sites
  | "local-news" // Idaho / Treasure Valley news + community sites
  | "partnership" // designers, builders, realtors, complementary trades
  | "review-platform"; // Houzz, Angi, BBB, Google-adjacent review sites

/** How much of a play the system can safely complete without a human. */
export type AutomationLevel =
  | "auto" // system can submit end-to-end (structured directory forms, APIs)
  | "assisted" // system drafts + queues; one-tap human approval before send
  | "manual"; // needs genuine human judgment (e.g. bespoke PR pitch)

export type PipelineStatus =
  | "discovered"
  | "disqualified"
  | "qualified"
  | "queued"
  | "drafted"
  | "awaiting_approval"
  | "actioned" // sent / submitted
  | "won" // link detected live
  | "lost" // link removed after being won
  | "rejected"; // human declined

/** Raw signals pulled from Ahrefs for a candidate referring domain. */
export interface CandidateMetrics {
  domain: string;
  domainRating: number; // Ahrefs DR (0-100)
  trafficDomain: number; // estimated monthly organic traffic
  dofollowLinks: number;
  linksToTarget: number;
  isSpam: boolean;
  firstSeen?: string;
  positionsSourceDomain?: number; // keywords the domain ranks for
}

export interface ScoreResult {
  score: number; // 0-100 composite SEO value
  tier: "A" | "B" | "C" | "reject";
  relevance: number; // 0-1 topical relevance estimate
  reasons: string[]; // human-readable scoring rationale
  disqualified: boolean;
  disqualifyReason?: string;
}

/** A single opportunity as it moves through the pipeline. */
export interface Opportunity {
  id: string; // stable hash of domain
  domain: string;
  category: OpportunityCategory;
  automation: AutomationLevel;
  metrics: CandidateMetrics;
  score: ScoreResult;
  /** Which competitor(s) this was mined from, or "seed"/"discovery". */
  sources: string[];
  recommendedPlay: string; // one-line action description
  status: PipelineStatus;
  outreachDraft?: string;
  contact?: { email?: string; url?: string; form?: string };
  firstDiscovered: string; // ISO date (passed in; engine is time-pure)
  lastUpdated: string;
  history: { at: string; event: string }[];
}

export interface PipelineState {
  updatedAt: string;
  target: string;
  opportunities: Opportunity[];
  /** Snapshot of our + competitors' authority for velocity tracking. */
  authoritySnapshots: {
    at: string;
    metrics: Record<string, { dr: number; refdomains: number; traffic: number }>;
  }[];
  wonDomains: string[];
  lostDomains: string[];
}
