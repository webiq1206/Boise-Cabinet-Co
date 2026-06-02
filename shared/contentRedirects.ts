/**
 * 301 redirect map for cabinet content migration.
 * Consumed by next.config.js and available to other build scripts.
 */

export type ContentRedirect = { source: string; destination: string };

const guide = (slug: string) => `/guides/${slug}`;

/** Pillar and location guide slug renames / removals */
export const GUIDE_REDIRECTS: Record<string, string> = {
  '/guides/boise-remodeling-cost-guide': guide('boise-cabinet-cost-guide'),
  '/guides/treasure-valley-remodeling-guide': guide('treasure-valley-cabinet-guide'),
  '/guides/boise-remodeling-guide': guide('boise-cabinet-guide'),
  '/guides/boise-kitchen-remodeling-guide': guide('boise-kitchen-cabinet-guide'),
  '/guides/boise-bathroom-remodeling-guide': guide('boise-bathroom-vanity-guide'),
  '/guides/boise-home-addition-guide': guide('built-in-cabinet-guide'),
  '/guides/whole-home-remodeling-guide': guide('whole-home-cabinetry-guide'),
  '/guides/choose-remodeling-contractor-boise': guide('choose-cabinet-company-boise'),
  '/guides/boise-remodeling-process-guide': guide('cabinet-project-process-guide'),
  '/guides/best-remodeling-roi-boise': guide('cabinet-roi-guide-boise'),
  '/guides/outdoor-living-remodeling-guide': '/cabinets/outdoor',
  '/guides/meridian-remodeling-guide': guide('treasure-valley-cabinet-guide'),
  '/guides/eagle-remodeling-guide': guide('treasure-valley-cabinet-guide'),
  '/guides/kuna-remodeling-guide': guide('treasure-valley-cabinet-guide'),
  '/guides/star-remodeling-guide': guide('treasure-valley-cabinet-guide'),
  '/guides/middleton-remodeling-guide': guide('treasure-valley-cabinet-guide'),
  '/guides/nampa-remodeling-guide': guide('treasure-valley-cabinet-guide'),
  '/guides/north-end-remodeling-guide': guide('boise-cabinet-guide'),
  '/guides/boise-bench-remodeling-guide': guide('boise-cabinet-guide'),
  '/guides/harris-ranch-remodeling-guide': guide('boise-cabinet-guide'),
  '/guides/east-boise-remodeling-guide': guide('boise-cabinet-guide'),
  '/guides/hidden-springs-remodeling-guide': guide('boise-cabinet-guide'),
  '/guides/eagle-foothills-remodeling-guide': guide('boise-cabinet-guide'),
};

const blog = (slug: string) => `/blog/${slug}`;

/** Blog cluster slug renames */
export const BLOG_REDIRECTS: Record<string, string> = {
  '/blog/kitchen-remodel-cost-boise': blog('kitchen-cabinet-cost-boise'),
  '/blog/bathroom-remodel-cost-boise': blog('bathroom-vanity-cost-boise'),
  '/blog/whole-home-remodel-cost-boise': blog('whole-home-cabinet-cost-boise'),
  '/blog/luxury-remodel-cost-boise': blog('luxury-custom-cabinet-cost-boise'),
  '/blog/remodel-cost-per-square-foot-boise': blog('cabinet-cost-per-linear-foot'),
  '/blog/what-impacts-remodeling-costs-boise': blog('what-impacts-cabinet-costs-boise'),
  '/blog/how-to-budget-remodel-boise': blog('how-to-budget-cabinets-boise'),
  '/blog/kitchen-remodel-timeline-boise': blog('kitchen-cabinet-timeline-boise'),
  '/blog/kitchen-remodel-roi': blog('kitchen-cabinet-roi-boise'),
  '/blog/kitchen-roi-remodeling': blog('kitchen-cabinet-roi-boise'),
  '/blog/open-concept-kitchen-remodeling': blog('open-kitchen-cabinet-storage'),
  '/blog/luxury-bathroom-features': blog('luxury-bathroom-vanity-guide'),
  '/blog/small-bathroom-remodel-ideas': blog('small-bathroom-vanity-ideas'),
  '/blog/aging-in-place-bathroom-design': blog('accessible-bathroom-vanity-guide'),
  '/blog/bathroom-layout-planning-guide': blog('bathroom-vanity-layout-guide'),
  '/blog/bathroom-remodel-roi': blog('bathroom-vanity-roi-boise'),
  '/blog/bathroom-roi-remodeling': blog('bathroom-vanity-roi-boise'),
  '/blog/primary-suite-additions': blog('primary-suite-closet-cabinets'),
  '/blog/garage-conversions': blog('garage-storage-cabinet-systems'),
  '/blog/multigenerational-living-remodels': blog('multi-room-cabinet-planning'),
  '/blog/remodel-planning-guide': blog('cabinet-project-planning-guide'),
  '/blog/remodeling-mistakes-to-avoid': blog('cabinet-buying-mistakes'),
  '/blog/whole-home-remodel-timeline': blog('whole-home-cabinet-timeline'),
  '/blog/living-through-a-remodel': blog('living-through-cabinet-installation'),
  '/blog/remodeling-vs-moving': blog('cabinet-refresh-vs-replace-vs-moving'),
  '/blog/design-build-process-guide': blog('custom-cabinet-design-process'),
  '/blog/whole-home-remodel-planning-checklist': blog('cabinet-planning-checklist'),
  '/blog/questions-to-ask-remodeling-contractor': blog('questions-to-ask-cabinet-company'),
  '/blog/remodeling-contractor-red-flags': blog('cabinet-company-red-flags'),
  '/blog/what-makes-great-remodeling-contractor': blog('what-makes-great-cabinet-company'),
  '/blog/how-to-compare-remodeling-estimates': blog('how-to-compare-cabinet-quotes'),
  '/blog/consultation-process-remodeling': blog('cabinet-consultation-process'),
  '/blog/design-build-vs-general-contractor': blog('custom-cabinet-shop-vs-big-box'),
  '/blog/why-remodeling-bids-vary': blog('why-cabinet-quotes-vary'),
  '/blog/material-selection-guide': blog('cabinet-finishes-door-styles-guide'),
  '/blog/preconstruction-guide': blog('cabinet-measurement-design-phase'),
  '/blog/design-development-guide': blog('cabinet-design-development'),
  '/blog/construction-phase-guide': blog('cabinet-fabrication-installation'),
  '/blog/punch-list-guide': blog('cabinet-installation-punch-list'),
  '/blog/warranty-guide-remodeling': blog('cabinet-warranty-guide'),
  '/blog/addition-roi-remodeling': blog('built-in-storage-roi'),
  '/blog/outdoor-living-roi': blog('outdoor-cabinet-roi'),
  '/blog/remodeling-before-selling': blog('cabinet-upgrades-before-selling'),
  '/blog/remodeling-long-term-living': blog('cabinets-for-long-term-living'),
  '/blog/outdoor-kitchens-boise': blog('outdoor-kitchen-cabinets-boise'),
  '/blog/outdoor-entertaining-spaces': blog('outdoor-bar-cabinet-storage'),
  '/blog/luxury-outdoor-living': blog('premium-outdoor-cabinetry'),
  '/blog/kitchen-remodel-cost-treasure-valley': blog('kitchen-cabinet-cost-boise'),
  '/blog/bathroom-remodel-cost-idaho': blog('bathroom-vanity-cost-boise'),
};

/** Removed off-topic posts → nearest cabinet pillar or catalog room */
export const BLOG_REMOVAL_REDIRECTS: Record<string, string> = {
  '/blog/home-addition-cost-boise': guide('boise-cabinet-cost-guide'),
  '/blog/walk-in-shower-guide': guide('boise-bathroom-vanity-guide'),
  '/blog/curbless-shower-guide': guide('boise-bathroom-vanity-guide'),
  '/blog/quartz-vs-quartzite-kitchen': guide('boise-kitchen-cabinet-guide'),
  '/blog/bedroom-additions': guide('built-in-cabinet-guide'),
  '/blog/second-story-additions': guide('built-in-cabinet-guide'),
  '/blog/adu-guide-boise': '/cabinets/built-ins',
  '/blog/home-addition-timeline-guide': guide('cabinet-project-process-guide'),
  '/blog/room-addition-guide-treasure-valley': guide('built-in-cabinet-guide'),
  '/blog/boise-permit-guide': guide('cabinet-project-process-guide'),
  '/blog/remodeling-timeline-guide': guide('cabinet-project-process-guide'),
  '/blog/exterior-remodeling-roi': guide('cabinet-roi-guide-boise'),
  '/blog/energy-efficiency-roi': guide('cabinet-roi-guide-boise'),
  '/blog/covered-patios-boise': '/cabinets/outdoor',
  '/blog/decks-vs-patios-boise': '/cabinets/outdoor',
  '/blog/outdoor-fireplaces-boise': '/cabinets/outdoor',
  '/blog/backyard-transformations-boise': '/cabinets/outdoor',
  '/blog/how-to-choose-design-build-contractor': guide('choose-cabinet-company-boise'),
  '/blog/ada-vs-canyon-county-permit-timelines': guide('cabinet-project-process-guide'),
};

/** Legacy category hub slugs → new cabinet hubs */
export const CATEGORY_REDIRECTS: Record<string, string> = {
  '/blog/category/remodeling-costs': '/blog/category/cabinet-costs',
  '/blog/category/kitchen-remodeling': '/blog/category/kitchen-cabinets',
  '/blog/category/bathroom-remodeling': '/blog/category/bathroom-vanities',
  '/blog/category/home-additions': '/blog/category/built-ins-storage',
  '/blog/category/whole-home-remodeling': '/blog/category/whole-home-cabinetry',
  '/blog/category/contractor-selection': '/blog/category/choosing-cabinet-company',
  '/blog/category/remodeling-process': '/blog/category/cabinet-project-process',
  '/blog/category/remodeling-roi': '/blog/category/cabinet-roi',
  '/blog/category/outdoor-living': '/blog/category/built-ins-storage',
  '/blog/category/treasure-valley-locations': '/blog/category/local-guides',
};

export function allContentRedirects(): ContentRedirect[] {
  const maps = [
    GUIDE_REDIRECTS,
    BLOG_REDIRECTS,
    BLOG_REMOVAL_REDIRECTS,
    CATEGORY_REDIRECTS,
  ];
  const out: ContentRedirect[] = [];
  for (const map of maps) {
    for (const [source, destination] of Object.entries(map)) {
      out.push({ source, destination });
    }
  }
  return out;
}
