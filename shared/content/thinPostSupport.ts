/**
 * Phase 4 support for the thin May 2026 posts (body under 700 words), ahead of
 * the owner-approved merge release in docs/blog-merge-map.md. No post is
 * deleted or redirected here. Two things change:
 *
 * 1. Metadata for posts whose title or description was a template ("{Title}
 *    ... Serving Boise, Meridian, Eagle, Nampa, and the Treasure Valley.").
 *    Descriptions are written from each post's own headings, so they promise
 *    only what the page covers. Posts listed in lib/phase1SearchCopy.ts take
 *    their description from there instead; this map covers the rest.
 * 2. Internal links: every thin post already links its pillar guide in the
 *    body. Those whose body linked no room or service page get one sentence
 *    pointing at the commercial page for their topic, so informational posts
 *    feed the page that owns the query instead of only /catalog.
 */
import type { BlogPostData } from '../blogContent';

/** A post body under this many words counts as thin (seo-notes-cabinet.md). */
export const THIN_POST_WORDS = 700;

export const THIN_POST_META: Record<string, { seoTitle?: string; metaDescription?: string }> = {
  'kitchen-cabinet-timeline-boise': {
    seoTitle: 'Kitchen Cabinet Timeline Boise | By Phase',
    metaDescription:
      'Kitchen cabinet timeline in Boise, phase by phase: design, approval, fabrication, delivery and installation, what slows a project, and how to protect it.',
  },
  'kitchen-layout-ideas-boise-homes': {
    metaDescription:
      'Kitchen layout ideas for Boise homes: cabinet plans by housing era, galley, L-shaped and island kitchens, and ways to use corner dead space.',
  },
  'kitchen-cabinet-trends': {
    seoTitle: 'Kitchen Cabinet Trends in Boise Homes',
    metaDescription:
      'Kitchen cabinet trends Treasure Valley homeowners are choosing: shaker and slab doors, storage that outlasts color trends, and trends worth skipping.',
  },
  'open-kitchen-cabinet-storage': {
    seoTitle: 'Open Kitchen Cabinet Storage | Planning',
    metaDescription:
      'Open kitchen cabinet storage: replacing lost wall cabinets with working storage, islands as the new anchor, sight lines, and checks before demo.',
  },
  'kitchen-island-design-guide': {
    seoTitle: 'Kitchen Island Design Guide | Sizing',
    metaDescription:
      'Kitchen island design guide: the sizing rules that matter, what goes inside the island, finish strategy, and when a kitchen should skip the island.',
  },
  'walk-in-pantry-design-guide': {
    seoTitle: 'Walk-In Pantry Design Guide | Cabinets',
    metaDescription:
      'Walk-in pantry design: layout basics, shelving, counters and appliance garages, and pantry cabinet walls for kitchens where a walk-in does not fit.',
  },
  // bathroom-vanity-layout-guide keeps its title: 19 impressions at 11.7 in
  // Search Console (June to October 2026), too close to page one to reword.
  'multi-room-cabinet-planning': { seoTitle: 'Multi-Room Cabinet Planning | One Plan' },
  // Was "Outdoor Kitchen Cabinets Boise", the exact query /cabinets/outdoor owns.
  'outdoor-kitchen-cabinets-boise': { seoTitle: 'Outdoor Cabinet Planning | Weather, Cost' },
  'whole-home-cabinet-timeline': { seoTitle: 'Whole-Home Cabinet Timeline' },
};

type PlanningLink = { href: string; sentence: string };

const KITCHEN: PlanningLink = {
  href: '/cabinets/kitchen',
  sentence:
    'When you are ready to plan your own, see <a href="/cabinets/kitchen">kitchen cabinets in Boise</a> for layouts, door styles, and installation by our crew.',
};
const BATHROOM: PlanningLink = {
  href: '/cabinets/bathroom',
  sentence:
    'When you are ready to plan your own, see <a href="/cabinets/bathroom">bathroom vanities in Boise</a> for single and double vanities built to your layout.',
};
const BUILT_INS: PlanningLink = {
  href: '/cabinets/built-ins',
  sentence:
    'For storage beyond the kitchen, see <a href="/cabinets/built-ins">built-in cabinets in Boise</a>, sized on site and scribed to your walls.',
};
const INSTALLATION: PlanningLink = {
  href: '/services/cabinet-installation',
  sentence:
    'Our <a href="/services/cabinet-installation">cabinet installation</a> page explains how our own crew delivers, levels, and scribes cabinets across the Treasure Valley.',
};

/** Commercial page per thin post whose body linked no room or service page. */
const PLANNING_LINKS: Record<string, PlanningLink> = {
  'kitchen-cabinet-trends': KITCHEN,
  'accessible-bathroom-vanity-guide': BATHROOM,
  'bathroom-vanity-roi-boise': BATHROOM,
  'multi-room-cabinet-planning': BUILT_INS,
  'cabinet-project-planning-guide': KITCHEN,
  'cabinet-buying-mistakes': KITCHEN,
  'whole-home-cabinet-timeline': INSTALLATION,
  'living-through-cabinet-installation': INSTALLATION,
  'cabinet-refresh-vs-replace-vs-moving': KITCHEN,
  'custom-cabinet-design-process': KITCHEN,
  'cabinet-planning-checklist': KITCHEN,
  'questions-to-ask-cabinet-company': INSTALLATION,
  'cabinet-company-red-flags': INSTALLATION,
  'what-makes-great-cabinet-company': INSTALLATION,
  'how-to-compare-cabinet-quotes': KITCHEN,
  'why-cabinet-quotes-vary': KITCHEN,
  'cabinet-consultation-process': KITCHEN,
  'custom-cabinet-shop-vs-big-box': INSTALLATION,
  'fixed-price-vs-cost-plus': KITCHEN,
  'cabinet-finishes-door-styles-guide': KITCHEN,
  'cabinet-measurement-design-phase': KITCHEN,
  'cabinet-design-development': KITCHEN,
  'cabinet-fabrication-installation': INSTALLATION,
  'cabinet-installation-punch-list': INSTALLATION,
  'cabinet-warranty-guide': INSTALLATION,
  'kitchen-cabinet-roi-boise': KITCHEN,
  'cabinet-upgrades-before-selling': KITCHEN,
  'cabinets-for-long-term-living': KITCHEN,
  'custom-vs-reserve-cabinets': KITCHEN,
};

/** Does this HTML link a room page (/cabinets/{room}) or a /services/ page? */
export function linksRoomOrService(html: string): boolean {
  return /href="\/(cabinets\/[a-z-]+|services\/[a-z-]+)"/.test(html);
}

/**
 * Append the planning sentence to the end of the post body, inside the last
 * section, when the body has no room or service link yet.
 */
function withPlanningLink(post: BlogPostData): BlogPostData {
  const link = PLANNING_LINKS[post.slug];
  if (!link || linksRoomOrService(post.content)) return post;
  return { ...post, content: `${post.content}\n<p>${link.sentence}</p>` };
}

export function applyThinPostSupport(post: BlogPostData): BlogPostData {
  const meta = THIN_POST_META[post.slug];
  const withMeta = meta ? { ...post, ...meta } : post;
  return withPlanningLink(withMeta);
}
