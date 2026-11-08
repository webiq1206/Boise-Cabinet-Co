/**
 * Phase 4 support for the thin May 2026 posts (body under 700 words). The
 * merge release in docs/blog-merge-map.md (shared/content/blogMerges.ts) has
 * since retired 34 of them; entries for those posts were removed here. Two
 * things change for the posts that remain:
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
  'kitchen-cabinet-trends': {
    seoTitle: 'Kitchen Cabinet Trends in Boise Homes',
    metaDescription:
      'Kitchen cabinet trends Treasure Valley homeowners are choosing: shaker and slab doors, storage that outlasts color trends, and trends worth skipping.',
  },
  // docs/kitchen-overlap.md: Boise Remodeling Co owns island layout and the
  // remodel; this post keeps the island-cabinet angle (sizing, storage, finish).
  'kitchen-island-design-guide': {
    seoTitle: 'Kitchen Island Cabinets: Sizing & Storage',
    metaDescription:
      'Kitchen island cabinet design: the sizing rules that matter, what goes inside the island, finish strategy, and when a kitchen should skip the island.',
  },
  // bathroom-vanity-layout-guide keeps its title: 19 impressions at 11.7 in
  // Search Console (June to October 2026), too close to page one to reword.
  // Was "Outdoor Kitchen Cabinets Boise", the exact query /cabinets/outdoor owns.
  'outdoor-kitchen-cabinets-boise': { seoTitle: 'Outdoor Cabinet Planning | Weather, Cost' },
};

type PlanningLink = { href: string; sentence: string };

const KITCHEN: PlanningLink = {
  href: '/cabinets/kitchen',
  sentence:
    'When you are ready to plan your own, see <a href="/cabinets/kitchen">kitchen cabinets in Boise</a> for layouts, door styles, and installation by our team or a qualified installation partner we manage.',
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
    'Our <a href="/services/cabinet-installation">cabinet installation</a> page explains how our team or a qualified installation partner we manage delivers, levels, and scribes cabinets across the Treasure Valley.',
};

/** Commercial page per thin post whose body linked no room or service page. */
const PLANNING_LINKS: Record<string, PlanningLink> = {
  'kitchen-cabinet-trends': KITCHEN,
  'accessible-bathroom-vanity-guide': BATHROOM,
  'cabinet-buying-mistakes': KITCHEN,
  'living-through-cabinet-installation': INSTALLATION,
  'cabinet-planning-checklist': KITCHEN,
  'questions-to-ask-cabinet-company': INSTALLATION,
  'how-to-compare-cabinet-quotes': KITCHEN,
  'cabinet-consultation-process': KITCHEN,
  'kitchen-cabinet-roi-boise': KITCHEN,
  'cabinet-upgrades-before-selling': KITCHEN,
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
