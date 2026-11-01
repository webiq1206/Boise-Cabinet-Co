/**
 * The blog merge release (docs/blog-merge-map.md, executed 2026-11-01).
 *
 * Guard, set by the owner: a post merges only if Search Console (1 June to
 * 29 October 2026, per page) shows it under 15 impressions and 0 clicks. Every
 * post below was absent from that export, which lists every page with more
 * than 12 impressions, so each had 12 or fewer and no click. Two posts on the
 * map did not pass and keep their URLs (KEPT_BY_SEARCH_DATA).
 *
 * A merged post is dropped from BLOG_POSTS (so its page, sitemap entry, hub
 * card and related-post card go), 301s straight to its destination
 * (shared/contentRedirects.ts), and any link to it in post or guide bodies is
 * rewritten to the destination. Its most useful section, where it had one the
 * destination did not already cover, is folded into the destination in the
 * post's own words, trimmed but never added to (FOLDED_SECTIONS); templated
 * FAQs and remodel-era copy (whole-house budgets, permits, HVAC) are not
 * carried.
 */

/** Merged post slug -> destination path (one hop, never itself redirected). */
export const MERGED_BLOG_POSTS: Record<string, string> = {
  // Bathroom vanities
  'luxury-bathroom-vanity-guide': '/guides/boise-bathroom-vanity-guide',
  // Boise cabinet costs
  'luxury-custom-cabinet-cost-boise': '/guides/boise-cabinet-cost-guide',
  'whole-home-cabinet-cost-boise': '/guides/boise-cabinet-cost-guide',
  'how-to-budget-cabinets-boise': '/guides/boise-cabinet-cost-guide',
  'what-impacts-cabinet-costs-boise': '/guides/boise-cabinet-cost-guide',
  'kitchen-cabinet-cost-boise': '/blog/custom-kitchen-cabinet-cost',
  // Built-in storage
  'garage-storage-cabinet-systems': '/cabinets/garage',
  'primary-suite-closet-cabinets': '/cabinets/closet',
  'multi-room-cabinet-planning': '/guides/whole-home-cabinetry-guide',
  'outdoor-bar-cabinet-storage': '/blog/outdoor-kitchen-cabinets-boise',
  'premium-outdoor-cabinetry': '/blog/outdoor-kitchen-cabinets-boise',
  // Cabinet project process
  'cabinet-installation-punch-list': '/guides/cabinet-project-process-guide',
  'cabinet-fabrication-installation': '/guides/cabinet-project-process-guide',
  'cabinet-finishes-door-styles-guide': '/guides/cabinet-project-process-guide',
  'cabinet-design-development': '/guides/cabinet-project-process-guide',
  'cabinet-measurement-design-phase': '/guides/cabinet-project-process-guide',
  'cabinet-warranty-guide': '/warranty',
  // Cabinet ROI and home value
  'outdoor-cabinet-roi': '/guides/cabinet-roi-guide-boise',
  'built-in-storage-roi': '/guides/cabinet-roi-guide-boise',
  'bathroom-vanity-roi-boise': '/guides/cabinet-roi-guide-boise',
  'cabinets-for-long-term-living': '/blog/cabinet-upgrades-before-selling',
  // Choosing a cabinet company
  'what-makes-great-cabinet-company': '/guides/choose-cabinet-company-boise',
  'why-cabinet-quotes-vary': '/blog/how-to-compare-cabinet-quotes',
  'fixed-price-vs-cost-plus': '/blog/how-to-compare-cabinet-quotes',
  'custom-vs-reserve-cabinets': '/compare',
  'cabinet-company-red-flags': '/blog/questions-to-ask-cabinet-company',
  'custom-cabinet-shop-vs-big-box': '/blog/stock-vs-custom-cabinets-boise',
  // Kitchen cabinets (docs/kitchen-overlap.md: Remodeling owns kitchen layout,
  // walk-in pantry room design and open-concept remodeling)
  'open-kitchen-cabinet-storage': '/blog/kitchen-cabinet-organization-ideas',
  'walk-in-pantry-design-guide': '/blog/pantry-cabinet-ideas',
  'kitchen-layout-ideas-boise-homes': '/guides/boise-kitchen-cabinet-guide',
  // Whole-home cabinetry
  'cabinet-project-planning-guide': '/blog/cabinet-planning-checklist',
  'whole-home-cabinet-timeline': '/guides/whole-home-cabinetry-guide',
  'cabinet-refresh-vs-replace-vs-moving': '/blog/cabinet-refacing-vs-refinishing-vs-replacing',
  'custom-cabinet-design-process': '/guides/cabinet-project-process-guide',
};

/**
 * On the merge map but above the guard, so not merged. Search Console figures
 * are impressions / clicks / average position, 1 June to 29 October 2026.
 */
export const KEPT_BY_SEARCH_DATA: Record<string, string> = {
  'bathroom-vanity-layout-guide': '19 / 0 / 11.7: over 14 impressions, close to page one',
  'cabinet-consultation-process': '15 / 0 / 12.4: not under 15 impressions',
};

export function isMergedBlogSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(MERGED_BLOG_POSTS, slug);
}

/** Final destination for a path: a merged post's destination, else the path. */
export function resolveMergedPath(path: string): string {
  const match = /^\/blog\/([a-z0-9-]+)\/?$/.exec(path);
  if (match && isMergedBlogSlug(match[1])) return MERGED_BLOG_POSTS[match[1]];
  return path;
}

/**
 * Safety net for in-body links still aimed at a merged post (source hrefs were
 * rewritten in the merge commit; verify:redirect-collisions keeps it that
 * way): point them at the destination, or unwrap them to plain text on the
 * destination page itself. Other links are left alone.
 */
export function rewriteMergedLinks(html: string, selfPath: string): string {
  return html.replace(
    /<a\b([^>]*?)href="\/blog\/([a-z0-9-]+)\/?(#[^"]*)?"([^>]*)>([\s\S]*?)<\/a>/g,
    (whole, before: string, slug: string, _hash: string | undefined, after: string, text: string) => {
      if (!isMergedBlogSlug(slug)) return whole;
      const destination = MERGED_BLOG_POSTS[slug];
      if (destination === selfPath) return text;
      return `<a${before}href="${destination}"${after}>${text}</a>`;
    },
  );
}

/**
 * Sections folded into a destination body, in the merged post's own words
 * (trimmed: dangling "see the X article" sentences and repeats are left out;
 * a heading may be reworded to stand alone). Keyed by destination path.
 * Destinations that already covered a post's material get nothing.
 */
export const FOLDED_SECTIONS: Record<string, string[]> = {
  '/guides/boise-bathroom-vanity-guide': [
    // from luxury-bathroom-vanity-guide
    '<h2>What makes a vanity read as luxury</h2><p>Furniture details separate luxury vanities from builder boxes: full-height side panels, integrated lighting, floating installs with hidden cleats, and drawer interiors fitted for grooming tools with in-drawer outlets.</p><p>Finish does the visual work: high-gloss, textured woodgrain, or deep matte tones paired with stone that wraps a waterfall edge. Eagle and foothills primary baths typically run double vanities of 72 to 120 inches with a seated makeup zone between, linen towers on the ends, and hamper pull-outs.</p>',
  ],
  '/blog/outdoor-kitchen-cabinets-boise': [
    // from outdoor-bar-cabinet-storage
    '<h2>Sizing a working outdoor bar</h2><p>For real entertaining, plan on 24 to 30 inches of serving counter per guest zone, a weather-rated undercounter refrigerator or ice bin within a step of the bartender, and at least one bank of sealed drawers for tools and linens. Bar-height counters run 42 inches; a 12 to 16 inch overhang seats stools comfortably.</p><p>October to April, outdoor bars in the Treasure Valley sit idle. Sealed cabinet storage protects bottles and equipment from dust and freeze cycles; drainable refrigeration lines and removable accessories simplify winterization.</p>',
    // from premium-outdoor-cabinetry
    '<h2>How Treasure Valley weather tests outdoor cabinets</h2><p>Our climate is hard on outdoor cabinetry: 90 to 100 degree dry summers, sub-freezing winters with snow, and big day-to-night temperature swings that make materials expand and contract constantly. High-altitude UV also fades and chalks anything not rated for it.</p><p>Uncovered patios need the most weatherproof spec; a covered structure dramatically extends the life of everything under it.</p>',
  ],
  '/guides/cabinet-project-process-guide': [
    // from cabinet-measurement-design-phase
    '<h2>What we measure and why</h2><p>Field measurement records wall lengths at multiple heights, floor level across the run, ceiling height at each corner, window and door casings, plumbing and electrical locations, and existing soffits. Cabinets are dimensioned from this reality, not from builder prints that rarely match it.</p>',
    // from cabinet-finishes-door-styles-guide
    '<h2>Sequence the selections</h2><p>Choose in this order: door profile, finish family (matte, gloss, woodgrain), exact finish from physical samples in your home, hardware last. Sequencing prevents the showroom overwhelm of facing hundreds of finishes at once.</p>',
    // from cabinet-design-development
    '<h2>What to check on your shop drawings</h2><ul><li>Cabinet widths against the measured plan, including fillers</li><li>Drawer vs door configuration for every base cabinet</li><li>Appliance openings against confirmed model specs</li><li>Outlet, switch, and vent locations relative to backsplash runs</li><li>Crown, light rail, and end-panel details at exposed sides</li></ul>',
    // from cabinet-fabrication-installation
    '<h2>Installation week</h2><p>Installation runs 2 to 5 days for most kitchens: protection down, bases set level against the measured datum, uppers hung, panels and fillers scribed, doors and drawers adjusted, hardware aligned. Out-of-level floors, normal in older Boise homes, are absorbed at the base so counters land flat.</p>',
    // from cabinet-installation-punch-list
    '<h2>What belongs on a cabinet punch list</h2><p>Door and drawer alignment, consistent reveals, hardware placement, soft-close operation on every hinge and slide, scribe and caulk lines at walls and ceilings (especially in older Boise homes), finish touch-ups, and interior accessory operation. Walk every cabinet, open everything, and look down sight lines where reveals show.</p>',
  ],
  '/guides/cabinet-roi-guide-boise': [
    // from bathroom-vanity-roi-boise
    '<h2>Which baths to prioritize</h2><p>The primary bath drives buyer perception; the guest bath matters when it serves visitors and listing photos. Dated cultured-marble single vanities from the 1990s and 2000s, common across Meridian and Nampa subdivisions, are exactly the swap that photographs well.</p>',
    // from built-in-storage-roi
    '<h2>ROI discipline for built-ins</h2><p>Built-ins should solve a daily problem first and a resale story second; hyper-personalized configurations narrow your buyer pool. Keep systems adaptable, adjustable shelving, standard zones, and they sell as flexibility rather than someone else\'s habits.</p>',
    // from outdoor-cabinet-roi
    '<h2>Sizing the outdoor spend</h2><p>A grill run with storage and counter space captures most of the buyer impression at a fraction of a full outdoor-room budget. Scale up only when the neighborhood supports it.</p>',
  ],
  '/blog/cabinet-upgrades-before-selling': [
    // from cabinets-for-long-term-living
    '<h2>If you are staying for the next 20 years</h2><p>If this is your long-term home, in Boise, Star, Middleton, or anywhere in the valley, optimize for daily function and adaptability instead of resale photos: drawer bases everywhere (easier reach at every age), pull-down or reachable upper storage, and task lighting built into the plan.</p>',
  ],
  '/blog/how-to-compare-cabinet-quotes': [
    // from why-cabinet-quotes-vary
    '<h2>Old-house risk pricing</h2><p>Experienced installers price pre-1980 North End and Bench homes with field-condition contingency: out-of-plumb walls, sloped floors, surprise framing. A bid that ignores those realities is a bid that becomes change orders.</p>',
    // from fixed-price-vs-cost-plus
    '<h2>Fixed price or cost plus?</h2><p>Fixed price: one number for defined scope, with the company carrying estimating risk. Cost plus: you pay actual costs plus a stated margin, carrying the risk yourself in exchange for transparency. A measured layout with locked selections is a fully definable product, so cabinet projects almost always belong in fixed price. If your cabinet line is cost plus, demand the cabinet allowance in writing; vague allowances are where budgets quietly break.</p>',
  ],
  '/blog/questions-to-ask-cabinet-company': [
    // from cabinet-company-red-flags
    '<h2>Red flags in the paperwork</h2><p>No line-item scope, no written change-order process, vague warranty language ("lifetime" with no document), and contracts that let the company substitute materials without approval all shift risk onto you. Compare paperwork quality across bidders; it predicts communication quality after the deposit clears.</p>',
  ],
  '/blog/stock-vs-custom-cabinets-boise': [
    // from custom-cabinet-shop-vs-big-box
    '<h2>Visiting showrooms vs seeing your home measured</h2><p>Big-box displays sell aspiration; they rarely show how stock widths land on a 1958 Bench ranch wall. A local shop should measure your actual room, bring finish samples to your lighting, and produce dimensioned drawings before you commit.</p>',
  ],
  '/blog/kitchen-cabinet-organization-ideas': [
    // from open-kitchen-cabinet-storage
    '<h2>Storage in an open kitchen</h2><p>In open layouts the island often becomes the main prep zone and visual divider. Size base cabinets for drawers, trash pullouts, and appliance garages, not just seating overhang. Shorter uppers, glass doors, or open shelving keep the living room in view while preserving dish and pantry storage.</p>',
  ],
  '/blog/pantry-cabinet-ideas': [
    // from walk-in-pantry-design-guide
    '<h2>Pantry walls when a walk-in does not fit</h2><p>A 24-inch-deep tall cabinet run with roll-out trays delivers most of a walk-in pantry\'s function in a fraction of the footprint, the standard answer in Boise Bench ranches and North End bungalows without room to borrow.</p>',
  ],
  '/guides/boise-kitchen-cabinet-guide': [
    // from kitchen-layout-ideas-boise-homes
    '<h2>Corner and dead-space strategies</h2><p>Lazy susans, blind-corner pull-outs, and angled cabinets each solve corners differently. In older homes with out-of-plumb walls, built-to-order sizing keeps corner reveals clean where stock cabinets show gaps.</p>',
  ],
  '/blog/cabinet-planning-checklist': [
    // from cabinet-project-planning-guide
    '<h2>Plan in this order</h2><p>Scope, budget, selections, schedule. Decide which rooms are in scope, set a planning range per room from the cost guide, make door and finish selections early, then build the calendar around fabrication lead time.</p><p>Homeowners who reverse the order, picking install dates before selections exist, are the ones who end up disappointed by lead-time math.</p>',
  ],
  '/guides/whole-home-cabinetry-guide': [
    // from whole-home-cabinet-timeline
    '<h2>Staging installation by room</h2><p>Kitchen installs first while the household runs on a temporary setup; baths follow one at a time so a working bathroom always exists; laundry, mudroom, closets, and media units slot between. We sequence around how your family actually lives.</p>',
  ],
  '/blog/cabinet-refacing-vs-refinishing-vs-replacing': [
    // from cabinet-refresh-vs-replace-vs-moving
    '<h2>Replace the cabinets or move house?</h2><p>Moving costs in the Treasure Valley, agent fees, moving expenses, and the rate gap on a new mortgage, often exceed a full cabinet replacement before you unpack a single box. If the neighborhood, schools, and commute work, new cabinets in the current home keep those advantages and add exactly the kitchen you want.</p>',
  ],
};

/**
 * The link blocks factory-built bodies end with. Folded sections go in front
 * of the first of them, so they read as part of the article, not after it.
 */
const TRAILING_BLOCKS = [
  '<h2>Explore our catalog</h2>',
  '<h2>Full guide and cost planning</h2>',
  '<h2>Explore the catalog</h2>',
];

/** Destination body with its folded sections added and merged links rewritten. */
export function withMergedContent(html: string, selfPath: string): string {
  const folded = FOLDED_SECTIONS[selfPath];
  let body = html;
  if (folded) {
    const at = TRAILING_BLOCKS.map((marker) => html.indexOf(marker))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0];
    const block = folded.join('\n');
    body = at === undefined ? `${html}\n${block}` : `${html.slice(0, at)}${block}\n${html.slice(at)}`;
  }
  return rewriteMergedLinks(body, selfPath);
}
