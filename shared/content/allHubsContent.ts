/**
 * Generated hub content — cabinet-focused pillars and cluster posts.
 * Cluster slugs align with shared/contentHubs.ts CONTENT_MANIFEST.
 */
import { buildClusterPost, buildPillarGuide } from './contentFactory';
import { SITE_CONFIG } from '../siteConfig';
import type { BlogPostData } from '../blogContent';
import type { GuidePageData } from '../guideContent';

const k = '/cabinets/kitchen';
const b = '/cabinets/bathroom';
const bi = '/cabinets/built-ins';
const out = '/cabinets/outdoor';

// —— Kitchen cabinets ——
export const KITCHEN_PILLAR = buildPillarGuide({
  slug: 'boise-kitchen-cabinet-guide',
  title: 'Boise Kitchen Cabinet Guide',
  seoTitle: 'Boise Kitchen Cabinet Guide | Treasure Valley',
  metaDescription:
    'Definitive kitchen cabinet guide for Boise and the Treasure Valley: layouts, door styles, finishes, timelines, and custom cabinetry planning.',
  excerpt:
    'Plan custom kitchen cabinets in Boise, Meridian, or Eagle with layouts, door styles, finishes, and local delivery timelines.',
  hubSlug: 'kitchen-cabinets',
  tags: ['kitchen', 'cabinets', 'boise'],
  quickAnswer:
    'Treasure Valley kitchen cabinets typically plan $15,000–$45,000+ for semi-custom to custom lines, with lead times of 6–12 weeks after design lock depending on scope and finishes.',
  takeaways: [
    'Lock layout before ordering cabinets.',
    'Cabinet lead times drive the calendar—order at design lock.',
    'Match door style and finish across kitchen and adjacent spaces.',
    'Panel-ready appliances need rough-in dimensions early.',
  ],
  linkedClusterSlugs: [
    'kitchen-cabinet-timeline-boise',
    'kitchen-layout-ideas-boise-homes',
    'kitchen-cabinet-trends',
    'open-kitchen-cabinet-storage',
    'kitchen-island-design-guide',
    'walk-in-pantry-design-guide',
    'cabinet-door-styles-guide',
    'cabinet-finishes-colors-guide',
    'cabinet-hardware-guide',
  ],
  linkedServices: ['kitchen'],
});

const kitchenClusters = [
  ['kitchen-cabinet-timeline-boise', 'Kitchen Cabinet Timeline Boise', 'Typical kitchen cabinet phases in Boise from design through installation.'],
  ['kitchen-layout-ideas-boise-homes', 'Kitchen Layout Ideas for Boise Homes', 'Layouts for ranches, split-levels, and open kitchens in the Treasure Valley.'],
  ['kitchen-cabinet-trends', 'Kitchen Cabinet Trends', 'Cabinet styles and storage trends popular in Meridian, Eagle, and Boise.'],
  ['open-kitchen-cabinet-storage', 'Open Kitchen Cabinet Storage', 'Cabinet planning when opening kitchen to living space—storage, islands, and sight lines.'],
  ['kitchen-island-design-guide', 'Kitchen Island Design Guide', 'Sizing islands for Boise ranches and newer Meridian floor plans.'],
  ['walk-in-pantry-design-guide', 'Walk-In Pantry Design Guide', 'Pantry cabinet layouts, shelving, and traffic flow for Idaho homes.'],
] as const;

export const KITCHEN_CLUSTER_POSTS: BlogPostData[] = kitchenClusters.map(([slug, title, excerpt]) =>
  buildClusterPost({
    slug,
    title,
    seoTitle: `${title} | ${SITE_CONFIG.name}`,
    metaDescription: `${excerpt} Serving Boise, Meridian, Eagle, Nampa, and the Treasure Valley.`,
    excerpt,
    hubSlug: 'kitchen-cabinets',
    tags: ['kitchen', 'cabinets', 'boise'],
    quickAnswer: excerpt,
    takeaways: [excerpt, 'Order cabinets at design lock to protect your schedule.', 'Compare planning ranges before final selections.'],
    serviceUrl: k,
  }),
);

// —— Bathroom vanities ——
export const BATHROOM_PILLAR = buildPillarGuide({
  slug: 'boise-bathroom-vanity-guide',
  title: 'Boise Bathroom Vanity Guide',
  seoTitle: 'Boise Bathroom Vanity Guide | Treasure Valley',
  metaDescription:
    'Master and guest bath vanity cabinets in Boise: layouts, storage, finishes, aging-in-place, and local installation.',
  excerpt: 'Complete bathroom vanity cabinet guide for Treasure Valley homeowners.',
  hubSlug: 'bathroom-vanities',
  tags: ['bathroom', 'vanity', 'cabinets'],
  quickAnswer:
    'Guest bath vanity cabinets often plan $3,500–$12,000 installed; master vanity suites with double sinks and custom storage commonly reach $8,000–$25,000+ in Ada and Canyon County.',
  takeaways: [
    'Vanity height and depth affect comfort and storage.',
    'Moisture-resistant finishes matter in Idaho baths.',
    'Accessible design can look residential, not institutional.',
  ],
  linkedClusterSlugs: [
    'luxury-bathroom-vanity-guide',
    'small-bathroom-vanity-ideas',
    'accessible-bathroom-vanity-guide',
    'bathroom-vanity-layout-guide',
  ],
  linkedServices: ['bathroom'],
});

const bathSlugs = [
  ['luxury-bathroom-vanity-guide', 'Luxury Bathroom Vanity Guide'],
  ['small-bathroom-vanity-ideas', 'Small Bathroom Vanity Ideas'],
  ['accessible-bathroom-vanity-guide', 'Accessible Bathroom Vanity Guide'],
  ['bathroom-vanity-layout-guide', 'Bathroom Vanity Layout Guide'],
] as const;

export const BATHROOM_CLUSTER_POSTS: BlogPostData[] = bathSlugs.map(([slug, title]) =>
  buildClusterPost({
    slug,
    title,
    seoTitle: `${title} | ${SITE_CONFIG.name}`,
    metaDescription: `${title} for Boise, Meridian, Eagle, and the Treasure Valley.`,
    excerpt: `Expert ${title.toLowerCase()} advice for Idaho homeowners.`,
    hubSlug: 'bathroom-vanities',
    tags: ['bathroom', 'vanity', 'cabinets'],
    quickAnswer: `Local custom vanity guidance for ${title.toLowerCase()} in the Treasure Valley.`,
    takeaways: ['Plan storage before selecting door style.', 'Match finishes to the rest of your home.'],
    serviceUrl: b,
  }),
);

// —— Built-ins & storage ——
export const BUILT_INS_PILLAR = buildPillarGuide({
  slug: 'built-in-cabinet-guide',
  title: 'Built-In Cabinet Guide',
  seoTitle: 'Built-In Cabinet Guide | Boise Treasure Valley',
  metaDescription:
    'Entertainment centers, mudroom lockers, closets, garage storage, and outdoor kitchen cabinets in Boise and the Treasure Valley.',
  excerpt: 'Plan built-in and specialty cabinets that match your home and maximize storage.',
  hubSlug: 'built-ins-storage',
  tags: ['built-ins', 'storage', 'cabinets'],
  quickAnswer:
    'Built-in cabinet programs in the Treasure Valley often plan $5,000–$35,000+ per room depending on size, finish, and hardware—outdoor and garage walls can run higher.',
  takeaways: [
    'Measure traffic paths before locking locker depth.',
    'Match door style to kitchen and bath for resale cohesion.',
    'Outdoor cabinets need weather-rated materials and finishes.',
  ],
  linkedClusterSlugs: [
    'primary-suite-closet-cabinets',
    'garage-storage-cabinet-systems',
    'multi-room-cabinet-planning',
    'outdoor-kitchen-cabinets-boise',
    'outdoor-bar-cabinet-storage',
    'premium-outdoor-cabinetry',
  ],
  linkedServices: ['built-ins'],
});

const builtInSlugs = [
  ['primary-suite-closet-cabinets', 'Primary Suite Closet Cabinets'],
  ['garage-storage-cabinet-systems', 'Garage Storage Cabinet Systems'],
  ['multi-room-cabinet-planning', 'Multi-Room Cabinet Planning'],
  ['outdoor-kitchen-cabinets-boise', 'Outdoor Kitchen Cabinets Boise'],
  ['outdoor-bar-cabinet-storage', 'Outdoor Bar Cabinet Storage'],
  ['premium-outdoor-cabinetry', 'Premium Outdoor Cabinetry'],
] as const;

export const BUILT_INS_CLUSTER_POSTS: BlogPostData[] = builtInSlugs.map(([slug, title]) =>
  buildClusterPost({
    slug,
    title,
    seoTitle: `${title} | ${SITE_CONFIG.name}`,
    metaDescription: `${title} in Boise, Meridian, Eagle, Kuna, and the Treasure Valley.`,
    excerpt: `Planning ${title.toLowerCase()} with local design and installation.`,
    hubSlug: 'built-ins-storage',
    tags: ['built-ins', 'storage', 'cabinets'],
    quickAnswer: `${title} in Idaho starts with how you use the space, then door style, finish, and hardware selections.`,
    takeaways: ['Design storage to the activity.', 'Coordinate finish with adjacent rooms.'],
    serviceUrl: slug.includes('outdoor') ? out : bi,
  }),
);

// —— Whole-home cabinetry ——
export const WHOLE_HOME_PILLAR = buildPillarGuide({
  slug: 'whole-home-cabinetry-guide',
  title: 'Whole-Home Cabinetry Guide',
  seoTitle: 'Whole-Home Cabinetry Guide Boise',
  metaDescription:
    'Coordinated cabinet packages across kitchen, bath, laundry, mudroom, and built-ins in Idaho.',
  excerpt: 'Coordinate whole-home cabinets as one program—not mismatched rooms.',
  hubSlug: 'whole-home-cabinetry',
  tags: ['whole-home', 'cabinets'],
  quickAnswer:
    'Whole-home cabinet packages in the Treasure Valley often span $40,000–$120,000+ depending on room count, line, and finish—phased delivery can spread investment.',
  takeaways: [
    'Pick one door style and finish family early.',
    'Sequence rooms by construction schedule.',
    'Hold contingency for field adjustments at install.',
  ],
  linkedClusterSlugs: [
    'cabinet-project-planning-guide',
    'cabinet-buying-mistakes',
    'whole-home-cabinet-timeline',
    'living-through-cabinet-installation',
    'cabinet-refresh-vs-replace-vs-moving',
    'custom-cabinet-design-process',
    'cabinet-planning-checklist',
  ],
  linkedServices: ['kitchen'],
});

const wholeSlugs = [
  ['cabinet-project-planning-guide', 'Cabinet Project Planning Guide'],
  ['cabinet-buying-mistakes', 'Cabinet Buying Mistakes to Avoid'],
  ['whole-home-cabinet-timeline', 'Whole Home Cabinet Timeline'],
  ['living-through-cabinet-installation', 'Living Through Cabinet Installation'],
  ['cabinet-refresh-vs-replace-vs-moving', 'Cabinet Refresh vs Replace vs Moving'],
  ['custom-cabinet-design-process', 'Custom Cabinet Design Process'],
  ['cabinet-planning-checklist', 'Cabinet Planning Checklist'],
] as const;

export const WHOLE_HOME_CLUSTER_POSTS: BlogPostData[] = wholeSlugs.map(([slug, title]) =>
  buildClusterPost({
    slug,
    title,
    seoTitle: `${title} | ${SITE_CONFIG.name}`,
    metaDescription: `${title} for Treasure Valley homeowners.`,
    excerpt: `${title}: practical Idaho advice for coordinated cabinetry.`,
    hubSlug: 'whole-home-cabinetry',
    tags: ['whole-home', 'cabinets'],
    quickAnswer: `${title} should account for Treasure Valley home values, lead times, and how you use each room.`,
    takeaways: ['Plan one master specification.', 'Use a written selections schedule.'],
    serviceUrl: k,
  }),
);

// —— Choosing a cabinet company ——
export const CONTRACTOR_PILLAR = buildPillarGuide({
  slug: 'choose-cabinet-company-boise',
  title: 'How to Choose a Cabinet Company in Boise',
  seoTitle: 'Choose a Cabinet Company Boise | Treasure Valley',
  metaDescription:
    'Vet custom cabinet companies in Boise: shop vs dealer, quotes, red flags, consultations, and written scope.',
  excerpt: 'Choose a Treasure Valley cabinet partner with aligned scope—not just the lowest bid.',
  hubSlug: 'choosing-cabinet-company',
  tags: ['contractor', 'cabinets'],
  quickAnswer:
    'Choose a Boise cabinet company with written scope, local install experience, clear communication, verified insurance, and realistic lead-time commitments.',
  takeaways: [
    'Compare quotes only when scope, line, and hardware match.',
    'Custom shop vs dealer affects design flexibility and lead time.',
    'Red flags include vague specifications and large upfront cash demands.',
  ],
  linkedClusterSlugs: [
    'questions-to-ask-cabinet-company',
    'cabinet-company-red-flags',
    'what-makes-great-cabinet-company',
    'how-to-compare-cabinet-quotes',
    'why-cabinet-quotes-vary',
    'cabinet-consultation-process',
    'custom-cabinet-shop-vs-big-box',
    'fixed-price-vs-cost-plus',
    'custom-vs-semi-custom-cabinets',
    'stock-vs-custom-cabinets-boise',
    'cabinet-construction-quality-guide',
  ],
  linkedServices: ['kitchen'],
});

const contractorSlugs = [
  ['questions-to-ask-cabinet-company', 'Questions to Ask a Cabinet Company'],
  ['cabinet-company-red-flags', 'Cabinet Company Red Flags'],
  ['what-makes-great-cabinet-company', 'What Makes a Great Cabinet Company'],
  ['how-to-compare-cabinet-quotes', 'How to Compare Cabinet Quotes'],
  ['why-cabinet-quotes-vary', 'Why Cabinet Quotes Vary So Much'],
  ['cabinet-consultation-process', 'Cabinet Consultation Process'],
  ['custom-cabinet-shop-vs-big-box', 'Custom Cabinet Shop vs Big Box'],
  ['fixed-price-vs-cost-plus', 'Fixed Price vs Cost Plus Cabinet Quotes'],
] as const;

export const CONTRACTOR_CLUSTER_POSTS: BlogPostData[] = contractorSlugs.map(([slug, title]) =>
  buildClusterPost({
    slug,
    title,
    seoTitle: `${title} | ${SITE_CONFIG.name}`,
    metaDescription: `${title} in Boise and the Treasure Valley.`,
    excerpt: title,
    hubSlug: 'choosing-cabinet-company',
    tags: ['contractor', 'cabinets'],
    quickAnswer: `${title}: educate yourself before signing a cabinet contract in Idaho.`,
    takeaways: ['Get specifications in writing.', 'Verify local references and install track record.'],
    serviceUrl: k,
  }),
);

// —— Cabinet project process ——
export const PROCESS_PILLAR = buildPillarGuide({
  slug: 'cabinet-project-process-guide',
  title: 'Boise Cabinet Project Process Guide',
  seoTitle: 'Boise Cabinet Project Process Guide',
  metaDescription:
    'End-to-end cabinet process: consultation, design, fabrication, delivery, installation, punch list, and warranty in Idaho.',
  excerpt: 'Understand every phase of a Treasure Valley custom cabinet project before you start.',
  hubSlug: 'cabinet-project-process',
  tags: ['process', 'cabinets'],
  quickAnswer:
    'A typical Boise cabinet project moves from consultation and measure, through design and approvals, into fabrication, delivery, and installation—with one team accountable at each phase.',
  takeaways: [
    'Field measure after rough construction is complete when possible.',
    'Selections should be locked before fabrication.',
    'Punch list and warranty should be defined in contract.',
  ],
  linkedClusterSlugs: [
    'cabinet-finishes-door-styles-guide',
    'cabinet-measurement-design-phase',
    'cabinet-design-development',
    'cabinet-fabrication-installation',
    'cabinet-installation-punch-list',
    'cabinet-warranty-guide',
  ],
  linkedServices: ['kitchen'],
});

const processSlugs = [
  ['cabinet-finishes-door-styles-guide', 'Cabinet Finishes & Door Styles Selection'],
  ['cabinet-measurement-design-phase', 'Cabinet Measurement & Design Phase'],
  ['cabinet-design-development', 'Cabinet Design Development'],
  ['cabinet-fabrication-installation', 'Cabinet Fabrication & Installation'],
  ['cabinet-installation-punch-list', 'Cabinet Installation Punch List'],
  ['cabinet-warranty-guide', 'Cabinet Warranty Guide'],
] as const;

export const PROCESS_CLUSTER_POSTS: BlogPostData[] = processSlugs.map(([slug, title]) =>
  buildClusterPost({
    slug,
    title,
    seoTitle: `${title} | ${SITE_CONFIG.name}`,
    metaDescription: `${title} for Ada and Canyon County cabinet projects.`,
    excerpt: title,
    hubSlug: 'cabinet-project-process',
    tags: ['process', 'cabinets'],
    quickAnswer: `${title} for Treasure Valley homeowners working with custom cabinet teams.`,
    takeaways: ['Build time for fabrication.', 'Document selections and revisions.'],
    serviceUrl: k,
  }),
);

// —— Cabinet ROI ——
export const ROI_PILLAR = buildPillarGuide({
  slug: 'cabinet-roi-guide-boise',
  title: 'Best Cabinet Upgrades for ROI in Boise',
  seoTitle: 'Cabinet ROI Boise | Treasure Valley',
  metaDescription: 'Which cabinet upgrades return value in Boise, Meridian, and Eagle resale markets.',
  excerpt: 'ROI-focused cabinet guidance for Treasure Valley homeowners.',
  hubSlug: 'cabinet-roi',
  tags: ['roi', 'cabinets', 'value'],
  quickAnswer:
    'Kitchen and bath cabinet updates often deliver strong lifestyle value; ROI depends on neighborhood comps—avoid over-improving beyond your street in Boise or Meridian.',
  takeaways: [
    'Match cabinet investment to neighborhood sale prices.',
    'Coordinated finishes read as intentional to buyers.',
    'Quality installation protects cabinet value at resale.',
  ],
  linkedClusterSlugs: [
    'kitchen-cabinet-roi-boise',
    'bathroom-vanity-roi-boise',
    'built-in-storage-roi',
    'outdoor-cabinet-roi',
    'cabinet-upgrades-before-selling',
    'cabinets-for-long-term-living',
  ],
  linkedServices: ['kitchen'],
});

const roiSlugs = [
  ['kitchen-cabinet-roi-boise', 'Kitchen Cabinet ROI Boise'],
  ['bathroom-vanity-roi-boise', 'Bathroom Vanity ROI Boise'],
  ['built-in-storage-roi', 'Built-In Storage ROI'],
  ['outdoor-cabinet-roi', 'Outdoor Cabinet ROI'],
  ['cabinet-upgrades-before-selling', 'Cabinet Upgrades Before Selling'],
  ['cabinets-for-long-term-living', 'Cabinets for Long-Term Living'],
] as const;

export const ROI_CLUSTER_POSTS: BlogPostData[] = roiSlugs.map(([slug, title]) =>
  buildClusterPost({
    slug,
    title,
    seoTitle: `${title} | ${SITE_CONFIG.name}`,
    metaDescription: `${title} in the Treasure Valley real estate context.`,
    excerpt: `${title} considerations for Idaho homeowners.`,
    hubSlug: 'cabinet-roi',
    tags: ['roi', 'cabinets'],
    quickAnswer: `${title} depends on local comps, finish level, and how long you will stay in the home.`,
    takeaways: ['Research neighborhood sales.', 'Prioritize cabinets you will enjoy if ROI is modest.'],
    serviceUrl: slug.includes('outdoor') ? out : k,
  }),
);

export const ALL_HUB_PILLARS: GuidePageData[] = [
  KITCHEN_PILLAR,
  BATHROOM_PILLAR,
  BUILT_INS_PILLAR,
  WHOLE_HOME_PILLAR,
  CONTRACTOR_PILLAR,
  PROCESS_PILLAR,
  ROI_PILLAR,
];

export const ALL_HUB_CLUSTER_POSTS: BlogPostData[] = [
  ...KITCHEN_CLUSTER_POSTS,
  ...BATHROOM_CLUSTER_POSTS,
  ...BUILT_INS_CLUSTER_POSTS,
  ...WHOLE_HOME_CLUSTER_POSTS,
  ...CONTRACTOR_CLUSTER_POSTS,
  ...PROCESS_CLUSTER_POSTS,
  ...ROI_CLUSTER_POSTS,
];
