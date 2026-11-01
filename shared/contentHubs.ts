/**
 * Topical authority registry, single source of truth for hubs and content manifest.
 */
import { isMergedBlogSlug } from './content/blogMerges';

export type ContentType = 'pillar' | 'cluster' | 'location' | 'neighborhood' | 'master';
export type ContentStatus = 'planned' | 'draft' | 'published';

/** Default status for manifest entries, cabinet migration finalized */
const PUBLISHED: ContentStatus = 'published';
export type ContentRoute = 'guide' | 'blog';

export interface ContentHub {
  hubSlug: string;
  title: string;
  categoryLabel: string;
  pillarSlug: string;
  pillarRoute: ContentRoute;
  description: string;
  priorityTier: 1 | 2 | 3 | 4 | 5;
  catalogRoomSlugs?: string[];
}

export interface ContentManifestEntry {
  slug: string;
  title: string;
  hubSlug: string;
  contentType: ContentType;
  route: ContentRoute;
  status: ContentStatus;
  replacesSlug?: string;
  primaryKeyword?: string;
}

export const CONTENT_HUBS: ContentHub[] = [
  {
    hubSlug: 'cabinet-costs',
    title: 'Boise cabinet costs',
    categoryLabel: 'Boise cabinet costs',
    pillarSlug: 'boise-cabinet-cost-guide',
    pillarRoute: 'guide',
    description: 'Planning ranges, cost drivers, and budgeting for custom cabinets in the Treasure Valley.',
    priorityTier: 1,
    catalogRoomSlugs: ['kitchen', 'bathroom', 'laundry', 'mudroom', 'pantry', 'closet', 'garage', 'built-ins'],
  },
  {
    hubSlug: 'kitchen-cabinets',
    title: 'Kitchen cabinets',
    categoryLabel: 'Kitchen cabinets',
    pillarSlug: 'boise-kitchen-cabinet-guide',
    pillarRoute: 'guide',
    description: 'Layouts, door styles, finishes, and timelines for custom kitchen cabinetry in Boise.',
    priorityTier: 2,
    catalogRoomSlugs: ['kitchen', 'pantry'],
  },
  {
    hubSlug: 'bathroom-vanities',
    title: 'Bathroom vanities',
    categoryLabel: 'Bathroom vanities',
    pillarSlug: 'boise-bathroom-vanity-guide',
    pillarRoute: 'guide',
    description: 'Vanity layouts, storage, aging-in-place, and bath cabinet ROI.',
    priorityTier: 2,
    catalogRoomSlugs: ['bathroom'],
  },
  {
    hubSlug: 'built-ins-storage',
    title: 'Built-in storage',
    categoryLabel: 'Built-in storage',
    pillarSlug: 'built-in-cabinet-guide',
    pillarRoute: 'guide',
    description: 'Entertainment centers, mudroom lockers, pantries, outdoor kitchens, and custom built-ins.',
    priorityTier: 2,
    catalogRoomSlugs: ['built-ins', 'entertainment', 'mudroom', 'closet', 'garage', 'outdoor', 'pantry', 'home-office', 'wet-bar'],
  },
  {
    hubSlug: 'whole-home-cabinetry',
    title: 'Whole-home cabinetry',
    categoryLabel: 'Whole-home cabinetry',
    pillarSlug: 'whole-home-cabinetry-guide',
    pillarRoute: 'guide',
    description: 'Coordinated cabinet packages across kitchen, bath, laundry, mudroom, and built-ins.',
    priorityTier: 2,
    catalogRoomSlugs: ['kitchen', 'bathroom', 'laundry', 'mudroom', 'pantry', 'closet', 'garage', 'built-ins', 'home-office', 'entertainment'],
  },
  {
    hubSlug: 'choosing-cabinet-company',
    title: 'Choosing a cabinet company',
    categoryLabel: 'Choosing a cabinet company',
    pillarSlug: 'choose-cabinet-company-boise',
    pillarRoute: 'guide',
    description: 'How to vet, compare quotes, and choose a custom cabinet partner.',
    priorityTier: 1,
    catalogRoomSlugs: ['kitchen', 'bathroom', 'built-ins'],
  },
  {
    hubSlug: 'cabinet-project-process',
    title: 'Cabinet project process',
    categoryLabel: 'Cabinet project process',
    pillarSlug: 'cabinet-project-process-guide',
    pillarRoute: 'guide',
    description: 'Design, fabrication, delivery, installation, and warranty for custom cabinets.',
    priorityTier: 3,
    catalogRoomSlugs: ['kitchen', 'bathroom', 'built-ins'],
  },
  {
    hubSlug: 'cabinet-roi',
    title: 'Cabinet ROI & home value',
    categoryLabel: 'Cabinet ROI & home value',
    pillarSlug: 'cabinet-roi-guide-boise',
    pillarRoute: 'guide',
    description: 'Cabinet upgrades that return value in the Treasure Valley market.',
    priorityTier: 3,
    catalogRoomSlugs: ['kitchen', 'bathroom', 'built-ins', 'outdoor'],
  },
  {
    hubSlug: 'local-guides',
    title: 'Treasure Valley cabinet guides',
    categoryLabel: 'Local guides',
    pillarSlug: '',
    pillarRoute: 'guide',
    description: 'Treasure Valley and Boise cabinet guides, no category pillar; master and location guides only.',
    priorityTier: 1,
    catalogRoomSlugs: ['kitchen', 'bathroom', 'built-ins', 'closet', 'garage', 'mudroom', 'laundry'],
  },
];

export const TREASURE_VALLEY_CITIES = [
  'Boise',
  'Meridian',
  'Eagle',
  'Kuna',
  'Star',
  'Middleton',
  'Nampa',
  'Caldwell',
] as const;

function hubPillar(hubSlug: string): Pick<ContentManifestEntry, 'hubSlug' | 'contentType' | 'route'> {
  const hub = CONTENT_HUBS.find((h) => h.hubSlug === hubSlug)!;
  return {
    hubSlug,
    contentType: 'pillar',
    route: hub.pillarRoute,
  };
}

function cluster(
  slug: string,
  title: string,
  hubSlug: string,
  status: ContentStatus = PUBLISHED,
  replacesSlug?: string,
): ContentManifestEntry {
  return {
    slug,
    title,
    hubSlug,
    contentType: 'cluster',
    route: 'blog',
    status,
    replacesSlug,
  };
}

function guide(
  slug: string,
  title: string,
  hubSlug: string,
  contentType: ContentType,
  status: ContentStatus = PUBLISHED,
  replacesSlug?: string,
): ContentManifestEntry {
  return {
    slug,
    title,
    hubSlug,
    contentType,
    route: 'guide',
    status,
    replacesSlug,
  };
}

/** Cabinet-focused content manifest (published only, new slugs) */
const CONTENT_MANIFEST_SOURCE: ContentManifestEntry[] = [
  // Hub 1, Cabinet costs
  { slug: 'boise-cabinet-cost-guide', title: 'Boise Cabinet Cost Guide', ...hubPillar('cabinet-costs'), status: PUBLISHED, replacesSlug: 'boise-cabinet-cost-guide' },
  cluster('kitchen-cabinet-cost-boise', 'Kitchen Cabinet Cost Boise', 'cabinet-costs', PUBLISHED, 'kitchen-remodel-cost-boise'),
  cluster('bathroom-vanity-cost-boise', 'Bathroom Vanity Cost Boise', 'cabinet-costs', PUBLISHED, 'bathroom-remodel-cost-boise'),
  cluster('whole-home-cabinet-cost-boise', 'Whole Home Cabinet Cost Boise', 'cabinet-costs', PUBLISHED, 'whole-home-remodel-cost-boise'),
  cluster('luxury-custom-cabinet-cost-boise', 'Luxury Custom Cabinet Cost Boise', 'cabinet-costs', PUBLISHED, 'luxury-remodel-cost-boise'),
  cluster('cabinet-cost-per-linear-foot', 'Cabinet Cost Per Linear Foot', 'cabinet-costs', PUBLISHED, 'remodel-cost-per-square-foot-boise'),
  cluster('what-impacts-cabinet-costs-boise', 'What Impacts Cabinet Costs in Boise', 'cabinet-costs', PUBLISHED, 'what-impacts-cabinet-costs-boise'),
  cluster('how-to-budget-cabinets-boise', 'How to Budget for Cabinets in Boise', 'cabinet-costs', PUBLISHED, 'how-to-budget-remodel-boise'),

  // Hub 2, Kitchen cabinets
  { slug: 'boise-kitchen-cabinet-guide', title: 'Boise kitchen cabinet guide', ...hubPillar('kitchen-cabinets'), status: PUBLISHED, replacesSlug: 'boise-kitchen-cabinets-guide' },
  cluster('kitchen-cabinet-trends', 'Kitchen cabinet trends', 'kitchen-cabinets'),
  cluster('walk-in-pantry-design-guide', 'Walk-In Pantry Design Guide', 'kitchen-cabinets'),
  cluster('kitchen-island-design-guide', 'Kitchen island cabinet design guide', 'kitchen-cabinets'),
  cluster('kitchen-layout-ideas-boise-homes', 'Kitchen Layout Ideas for Boise Homes', 'kitchen-cabinets'),
  cluster('kitchen-cabinet-timeline-boise', 'Kitchen cabinet timeline Boise', 'kitchen-cabinets', PUBLISHED, 'kitchen-remodel-timeline-boise'),
  cluster('open-kitchen-cabinet-storage', 'Open Kitchen Cabinet Storage', 'kitchen-cabinets', PUBLISHED, 'open-concept-kitchen-remodeling'),
  cluster('cabinet-door-styles-guide', 'Cabinet Door Styles Guide', 'kitchen-cabinets'),
  cluster('cabinet-finishes-colors-guide', 'Cabinet Finishes & Colors Guide', 'kitchen-cabinets'),
  cluster('cabinet-hardware-guide', 'Cabinet Hardware Guide', 'kitchen-cabinets'),

  // Hub 3, Bathroom vanities
  { slug: 'boise-bathroom-vanity-guide', title: 'Boise bathroom vanity guide', ...hubPillar('bathroom-vanities'), status: PUBLISHED, replacesSlug: 'boise-bathroom-vanities-guide' },
  cluster('luxury-bathroom-vanity-guide', 'Luxury Bathroom Vanity Guide', 'bathroom-vanities', PUBLISHED, 'luxury-bathroom-features'),
  cluster('small-bathroom-vanity-ideas', 'Small bathroom vanity ideas', 'bathroom-vanities', PUBLISHED, 'small-bathroom-remodel-ideas'),
  cluster('accessible-bathroom-vanity-guide', 'Accessible bathroom vanity guide', 'bathroom-vanities', PUBLISHED, 'aging-in-place-bathroom-design'),
  cluster('bathroom-vanity-layout-guide', 'Bathroom vanity layout guide', 'bathroom-vanities', PUBLISHED, 'bathroom-layout-planning-guide'),

  // Hub 4, Built-ins & storage
  { slug: 'built-in-cabinet-guide', title: 'Built-in cabinet guide', ...hubPillar('built-ins-storage'), status: PUBLISHED, replacesSlug: 'boise-home-addition-guide' },
  cluster('primary-suite-closet-cabinets', 'Primary Suite Closet Cabinets', 'built-ins-storage', PUBLISHED, 'primary-suite-additions'),
  cluster('garage-storage-cabinet-systems', 'Garage Storage Cabinet Systems', 'built-ins-storage', PUBLISHED, 'garage-conversions'),
  cluster('multi-room-cabinet-planning', 'Multi-Room Cabinet Planning', 'built-ins-storage', PUBLISHED, 'multigenerational-living-remodels'),
  cluster('outdoor-kitchen-cabinets-boise', 'Outdoor kitchen cabinets Boise', 'built-ins-storage', PUBLISHED, 'outdoor-kitchens-boise'),
  cluster('outdoor-bar-cabinet-storage', 'Outdoor Bar Cabinet Storage', 'built-ins-storage', PUBLISHED, 'outdoor-entertaining-spaces'),
  cluster('premium-outdoor-cabinetry', 'Premium Outdoor Cabinetry', 'built-ins-storage', PUBLISHED, 'luxury-outdoor-living'),

  // Hub 5, Whole-home cabinetry
  { slug: 'whole-home-cabinetry-guide', title: 'Whole Home Cabinetry Guide', ...hubPillar('whole-home-cabinetry'), status: PUBLISHED, replacesSlug: 'whole-home-cabinetry-guide' },
  cluster('cabinet-project-planning-guide', 'Cabinet Project Planning Guide', 'whole-home-cabinetry', PUBLISHED, 'remodel-planning-guide'),
  cluster('cabinet-buying-mistakes', 'Cabinet buying mistakes to avoid', 'whole-home-cabinetry', PUBLISHED, 'remodeling-mistakes-to-avoid'),
  cluster('whole-home-cabinet-timeline', 'Whole Home Cabinet Timeline', 'whole-home-cabinetry', PUBLISHED, 'whole-home-remodel-timeline'),
  cluster('living-through-cabinet-installation', 'Living through cabinet installation', 'whole-home-cabinetry', PUBLISHED, 'living-through-a-remodel'),
  cluster('cabinet-refresh-vs-replace-vs-moving', 'Cabinet Refresh vs Replace vs Moving', 'whole-home-cabinetry', PUBLISHED, 'remodeling-vs-moving'),
  cluster('custom-cabinet-design-process', 'Custom Cabinet Design Process', 'whole-home-cabinetry', PUBLISHED, 'design-build-process-guide'),
  cluster('cabinet-planning-checklist', 'Cabinet planning checklist', 'whole-home-cabinetry', PUBLISHED, 'whole-home-remodel-planning-checklist'),

  // Hub 6, Choosing a cabinet company
  { slug: 'choose-cabinet-company-boise', title: 'How to choose a cabinet company in Boise', ...hubPillar('choosing-cabinet-company'), status: PUBLISHED, replacesSlug: 'choose-cabinet-company-boise' },
  cluster('questions-to-ask-cabinet-company', 'Questions to ask a cabinet company', 'choosing-cabinet-company', PUBLISHED, 'questions-to-ask-remodeling-contractor'),
  cluster('cabinet-company-red-flags', 'Cabinet Company Red Flags', 'choosing-cabinet-company', PUBLISHED, 'remodeling-contractor-red-flags'),
  cluster('what-makes-great-cabinet-company', 'What Makes a Great Cabinet Company', 'choosing-cabinet-company', PUBLISHED, 'what-makes-great-remodeling-contractor'),
  cluster('how-to-compare-cabinet-quotes', 'How to compare cabinet quotes', 'choosing-cabinet-company', PUBLISHED, 'how-to-compare-remodeling-estimates'),
  cluster('cabinet-consultation-process', 'Cabinet consultation process', 'choosing-cabinet-company', PUBLISHED, 'consultation-process-remodeling'),
  cluster('custom-cabinet-shop-vs-big-box', 'Custom Cabinet Shop vs Big Box', 'choosing-cabinet-company', PUBLISHED, 'design-build-vs-general-contractor'),
  cluster('fixed-price-vs-cost-plus', 'Fixed Price vs Cost Plus Cabinet Quotes', 'choosing-cabinet-company'),
  cluster('why-cabinet-quotes-vary', 'Why Cabinet Quotes Vary So Much', 'choosing-cabinet-company', PUBLISHED, 'why-remodeling-bids-vary'),
  cluster('custom-vs-reserve-cabinets', 'What makes our Custom Cabinets different', 'choosing-cabinet-company'),
  cluster('stock-vs-custom-cabinets-boise', 'Stock vs Custom Cabinets Boise', 'choosing-cabinet-company'),
  cluster('cabinet-construction-quality-guide', 'Cabinet Construction Quality Guide', 'choosing-cabinet-company'),
  cluster('cabinet-materials-labels-certifications', "What's Inside Your Cabinet Boxes", 'choosing-cabinet-company'),

  // Hub 7, Cabinet project process
  { slug: 'cabinet-project-process-guide', title: 'Boise cabinet project process guide', ...hubPillar('cabinet-project-process'), status: PUBLISHED, replacesSlug: 'boise-cabinet-project-process-guide' },
  cluster('cabinet-finishes-door-styles-guide', 'Cabinet Finishes & Door Styles Selection', 'cabinet-project-process', PUBLISHED, 'material-selection-guide'),
  cluster('cabinet-measurement-design-phase', 'Cabinet Measurement & Design Phase', 'cabinet-project-process', PUBLISHED, 'preconstruction-guide'),
  cluster('cabinet-design-development', 'Cabinet Design Development', 'cabinet-project-process', PUBLISHED, 'design-development-guide'),
  cluster('cabinet-fabrication-installation', 'Cabinet Fabrication & Installation', 'cabinet-project-process', PUBLISHED, 'construction-phase-guide'),
  cluster('cabinet-installation-punch-list', 'Cabinet Installation Punch List', 'cabinet-project-process', PUBLISHED, 'punch-list-guide'),
  cluster('cabinet-warranty-guide', 'Cabinet Warranty Guide', 'cabinet-project-process', PUBLISHED, 'warranty-guide-remodeling'),

  // Hub 8, Cabinet ROI
  { slug: 'cabinet-roi-guide-boise', title: 'Best cabinet upgrades for ROI in Boise', ...hubPillar('cabinet-roi'), status: PUBLISHED, replacesSlug: 'best-cabinet-roi-boise' },
  cluster('kitchen-cabinet-roi-boise', 'Kitchen cabinet ROI Boise', 'cabinet-roi', PUBLISHED, 'kitchen-roi-remodeling'),
  cluster('bathroom-vanity-roi-boise', 'Bathroom Vanity ROI Boise', 'cabinet-roi', PUBLISHED, 'bathroom-roi-remodeling'),
  cluster('built-in-storage-roi', 'Built-In Storage ROI', 'cabinet-roi', PUBLISHED, 'addition-roi-remodeling'),
  cluster('outdoor-cabinet-roi', 'Outdoor Cabinet ROI', 'cabinet-roi', PUBLISHED, 'outdoor-living-roi'),
  cluster('cabinet-upgrades-before-selling', 'Cabinet upgrades before selling', 'cabinet-roi', PUBLISHED, 'remodeling-before-selling'),
  cluster('cabinets-for-long-term-living', 'Cabinets for Long-Term Living', 'cabinet-roi', PUBLISHED, 'remodeling-long-term-living'),

  // Local guides (no pillar)
  guide('treasure-valley-cabinet-guide', 'Treasure Valley Cabinet Guide', 'local-guides', 'master', PUBLISHED, 'treasure-valley-cabinet-guide'),
  guide('boise-cabinet-guide', 'Boise custom cabinet guide', 'local-guides', 'location', PUBLISHED, 'boise-remodeling-guide'),
  guide('meridian-cabinet-guide', 'Meridian Custom Cabinet Guide', 'local-guides', 'location', PUBLISHED, 'meridian-remodeling-guide'),
  guide('eagle-cabinet-guide', 'Eagle Custom Cabinet Guide', 'local-guides', 'location', PUBLISHED, 'eagle-remodeling-guide'),
  guide('nampa-cabinet-guide', 'Nampa Custom Cabinet Guide', 'local-guides', 'location', PUBLISHED, 'nampa-remodeling-guide'),
  guide('kuna-cabinet-guide', 'Kuna Custom Cabinet Guide', 'local-guides', 'location', PUBLISHED, 'kuna-remodeling-guide'),
  guide('star-cabinet-guide', 'Star Custom Cabinet Guide', 'local-guides', 'location', PUBLISHED, 'star-remodeling-guide'),
  guide('caldwell-cabinet-guide', 'Caldwell Custom Cabinet Guide', 'local-guides', 'location', PUBLISHED),
  guide('middleton-cabinet-guide', 'Middleton Custom Cabinet Guide', 'local-guides', 'location', PUBLISHED, 'middleton-remodeling-guide'),
];

/** Merged posts (shared/content/blogMerges.ts) leave the manifest; they 301. */
export const CONTENT_MANIFEST: ContentManifestEntry[] = CONTENT_MANIFEST_SOURCE.filter(
  (entry) => !(entry.route === 'blog' && isMergedBlogSlug(entry.slug)),
);

export function getHubBySlug(hubSlug: string): ContentHub | undefined {
  return CONTENT_HUBS.find((h) => h.hubSlug === hubSlug);
}

export function getManifestBySlug(slug: string): ContentManifestEntry | undefined {
  return CONTENT_MANIFEST.find((e) => e.slug === slug);
}

export function getPublishedManifest(route?: ContentRoute): ContentManifestEntry[] {
  return CONTENT_MANIFEST.filter(
    (e) => e.status === 'published' && (route === undefined || e.route === route),
  );
}

export function getClustersForHub(hubSlug: string, publishedOnly = false): ContentManifestEntry[] {
  return CONTENT_MANIFEST.filter(
    (e) =>
      e.hubSlug === hubSlug &&
      e.contentType === 'cluster' &&
      (!publishedOnly || e.status === 'published'),
  );
}

export function getHubPillarSlug(hubSlug: string): string {
  return getHubBySlug(hubSlug)?.pillarSlug ?? '';
}

export function guidePath(slug: string): string {
  return `/guides/${slug}`;
}

/** City cabinet guides 308 to /locations/[city]. Link the destination directly. */
export function indexableGuidePath(guide: {
  slug: string;
  guideType?: string;
  linkedCities?: string[];
}): string {
  const city = guide.guideType === 'location' ? guide.linkedCities?.[0] : undefined;
  if (city) return `/locations/${city}`;
  return guidePath(guide.slug);
}

export function blogPath(slug: string): string {
  return `/blog/${slug}`;
}

export function categoryHubPath(hubSlug: string): string {
  return `/blog/category/${hubSlug}`;
}

/** Minimum published cluster count before category hub is indexable */
export const CATEGORY_HUB_MIN_POSTS = 3;

export function isCategoryHubIndexable(hubSlug: string, publishedClusterCount: number): boolean {
  return publishedClusterCount >= CATEGORY_HUB_MIN_POSTS;
}
