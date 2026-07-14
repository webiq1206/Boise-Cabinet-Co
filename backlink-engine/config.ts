/**
 * Configuration for the backlink engine: who we are, who we compete with, what
 * "relevant" means, quality thresholds, and the denylists that keep the whole
 * system white-hat. The denylists are the single most important piece here:
 * high Domain Rating alone is a trap (competitor profiles are full of high-DR
 * hosting footprints and link farms), so we never qualify a domain on DR alone.
 */

/** The business we are building authority for. */
export const SITE = {
  name: "Boise Cabinet Co",
  domain: "boisecabinet.co",
  phone: "(208) 477-1169",
  // TODO: confirm the exact street address + zip for citation NAP consistency.
  address: { city: "Meridian", region: "ID", country: "US" },
  serviceArea: [
    "Boise",
    "Meridian",
    "Eagle",
    "Nampa",
    "Kuna",
    "Star",
    "Middleton",
    "Caldwell",
    "Treasure Valley",
  ],
  /** Where approved outreach is sent from (see README on reputation risk). */
  outreachFromEmail: "info@webiq.co",
} as const;

/** Validated competitor seed set (DR captured 2026-07-14 via Ahrefs). */
export const COMPETITORS: { domain: string; dr: number; national?: boolean }[] = [
  { domain: "premiumcabinets.com", dr: 28, national: true },
  { domain: "westernidahocabinets.com", dr: 7 },
  { domain: "bigwoodcabinets.com", dr: 3.6 },
  { domain: "boisekitchencabinets.com", dr: 0.2 },
  { domain: "cabinetconceptsidaho.com", dr: 0.1 },
  { domain: "eaglefinecabinetry.com", dr: 0 },
  { domain: "kcscabinetryidaho.com", dr: 0 },
];

/**
 * Topical relevance vocabulary. A candidate domain scores relevance from how
 * many of these appear in its own ranking keywords / name / niche. Geo terms
 * are weighted higher because local links are disproportionately valuable for a
 * local business.
 */
export const RELEVANCE_TERMS = {
  industry: [
    "cabinet",
    "cabinetry",
    "kitchen",
    "bath",
    "bathroom",
    "vanity",
    "remodel",
    "renovation",
    "countertop",
    "millwork",
    "woodworking",
    "interior design",
    "home improvement",
    "home builder",
    "custom home",
    "construction",
    "flooring",
    "hardware",
  ],
  geo: ["boise", "meridian", "eagle", "nampa", "idaho", "treasure valley", "ada county", "canyon county"],
} as const;

/** Minimum bars. A candidate must clear these to be QUALIFIED, not just scored. */
export const THRESHOLDS = {
  minDomainRating: 20, // authority floor for the authority engine
  minDomainRatingLocal: 10, // relaxed floor when clearly local + relevant
  minTrafficDomain: 100, // avoid zombie domains with DR but no audience
  minRelevance: 0.15, // must be at least loosely on-topic
  maxLinksToTargetRatio: 500, // site-wide/footer link farms link thousands of times
} as const;

/**
 * PLATFORM / CDN / hosting footprints. A link from these is not an editorial
 * endorsement — it's a scraper, a hosting artifact, or a free-subdomain page.
 * Always disqualified regardless of DR.
 */
export const PLATFORM_DENYLIST = [
  "squarespace.com",
  "blogspot.com",
  "amazonaws.com",
  "cloudfront.net",
  "netlify.app",
  "appspot.com",
  "now.sh",
  "vercel.app",
  "wordpress.com",
  "wixsite.com",
  "weebly.com",
  "herokuapp.com",
  "github.io",
  "pages.dev",
  "translate.goog",
  "webcache.googleusercontent.com",
];

/**
 * Known link farms / low-value directories / auto-generated link networks.
 * These carry high DR but zero editorial value and a real footprint risk.
 * Curated from observed competitor profiles + standard SEO blocklists.
 */
export const LINKFARM_DENYLIST = [
  "viesearch.com",
  "folkd.com",
  "apsense.com",
  "linkcentre.com",
  "infospace.com",
  "purevolume.com",
  "ontoplist.com",
  "dogpile.com",
  "2findlocal.com",
  "find-us-here.com",
  "kylos.pl",
  "skole.hr",
  "xrea.com",
  "botw.org",
  "gmx.com",
  "aeroleads.com",
  "instantcheckmate.com",
  "brandfetch.com",
  "reference.com",
  "linkddl.com",
  "bookmarkzoo.win",
];

/**
 * Curated allowlist of legitimate, safe targets to seed the pipeline directly
 * (verified reputable directories, review platforms, and industry bodies). The
 * classifier maps each to a category + automation level.
 */
export const SEED_TARGETS: { domain: string; category: string; note: string }[] = [
  { domain: "houzz.com", category: "review-platform", note: "Design portfolio + reviews; high referral intent" },
  { domain: "bbb.org", category: "review-platform", note: "Better Business Bureau accreditation + profile" },
  { domain: "angi.com", category: "review-platform", note: "Home services marketplace listing" },
  { domain: "expertise.com", category: "curated-bestof", note: "Curated 'best of' city lists; pitch for inclusion" },
  { domain: "threebestrated.com", category: "curated-bestof", note: "Curated top-3 local lists; apply for review" },
  { domain: "dnb.com", category: "local-citation", note: "Dun & Bradstreet business profile" },
  { domain: "chambermaster.com", category: "local-citation", note: "Chamber of Commerce member directories" },
  { domain: "boisechamber.org", category: "local-citation", note: "Boise Metro Chamber membership + directory link" },
  { domain: "nkba.org", category: "industry-association", note: "National Kitchen & Bath Association membership" },
  { domain: "nari.org", category: "industry-association", note: "National Assoc. of the Remodeling Industry" },
  { domain: "kcma.org", category: "industry-association", note: "Kitchen Cabinet Manufacturers Association" },
  { domain: "prnewswire.com", category: "digital-pr", note: "Press-release distribution for genuine news" },
];

/** Categories the engine may fully automate (structured submission), vs. draft-and-approve. */
export const AUTO_SUBMIT_CATEGORIES = new Set(["local-citation", "review-platform"]);
