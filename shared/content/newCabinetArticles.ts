/**
 * Tier 1 cabinet education articles, catalog and comparison focused.
 * Slugs align with CONTENT_MANIFEST; not duplicated in allHubsContent cluster maps.
 */
import { buildClusterPost } from './contentFactory';
import type { BlogPostData } from '../blogContent';

const catalogLinks =
  'Explore <a href="/compare">custom vs semi-custom</a>, <a href="/collections">collections</a>, <a href="/door-styles">door styles</a>, <a href="/finishes">finishes</a>, <a href="/hardware">hardware</a>, and <a href="/construction">construction details</a>.';

const tier1Articles = [
  {
    slug: 'custom-vs-semi-custom-cabinets',
    title: 'Custom vs Semi-Custom Cabinets',
    hubSlug: 'choosing-cabinet-company',
    serviceUrl: '/cabinets/kitchen',
    quickAnswer:
      'Custom cabinets are built to your exact sizes and specifications; semi-custom uses standard boxes with flexible fronts and modifications, semi-custom often balances lead time and budget in Treasure Valley kitchens.',
    takeaways: [
      'Custom fits odd ceiling lines and tight clearances.',
      'Semi-custom offers faster lead times on many lines.',
      'Compare warranty and install scope, not door photos alone.',
    ],
    tags: ['custom', 'semi-custom', 'compare'],
    extraParagraph: catalogLinks,
  },
  {
    slug: 'cabinet-door-styles-guide',
    title: 'Cabinet Door Styles Guide',
    hubSlug: 'kitchen-cabinets',
    serviceUrl: '/cabinets/kitchen',
    quickAnswer:
      'Shaker, slab, and raised-panel doors remain the most requested styles in Boise, pick a profile that matches your home era and coordinate bath and built-ins for a cohesive look.',
    takeaways: [
      'Shaker suits both modern and transitional homes.',
      'Slab reads contemporary; mind fingerprinting on dark finishes.',
      'Glass inserts need interior cabinet planning.',
    ],
    tags: ['door styles', 'design'],
    extraParagraph:
      'Browse <a href="/door-styles">door styles</a> and <a href="/collections">collections</a> to compare profiles side by side.',
  },
  {
    slug: 'cabinet-finishes-colors-guide',
    title: 'Cabinet Finishes & Colors Guide',
    hubSlug: 'kitchen-cabinets',
    serviceUrl: '/cabinets/kitchen',
    quickAnswer:
      'Painted cabinets, stained wood, and thermally fused finishes each wear differently in Idaho’s dry climate, sample doors in your actual kitchen light before final sign-off.',
    takeaways: [
      'Painted finishes show fewer grain variations.',
      'Stains highlight wood movement and character.',
      'Match sheen across kitchen, bath, and mudroom.',
    ],
    tags: ['finishes', 'color'],
    extraParagraph:
      'See <a href="/finishes">finish options</a> and pair with <a href="/hardware">hardware</a> early in design.',
  },
  {
    slug: 'cabinet-hardware-guide',
    title: 'Cabinet Hardware Guide',
    hubSlug: 'kitchen-cabinets',
    serviceUrl: '/cabinets/kitchen',
    quickAnswer:
      'Pulls vs knobs, center-to-center spacing, and soft-close hinges should be selected with door style, hardware is often 3–5% of cabinet budget but defines daily feel.',
    takeaways: [
      'Consistent bar pulls simplify cleaning.',
      'Soft-close is standard on quality lines.',
      'Order extra hardware for future repairs.',
    ],
    tags: ['hardware', 'hinges'],
    extraParagraph: 'Compare <a href="/hardware">hardware collections</a> with your door and finish samples.',
  },
  {
    slug: 'cabinet-construction-quality-guide',
    title: 'Cabinet Construction Quality Guide',
    hubSlug: 'choosing-cabinet-company',
    serviceUrl: '/cabinets/kitchen',
    quickAnswer:
      'Plywood boxes, solid wood frames, dovetail drawers, and full-extension guides signal durable construction, ask what is standard vs upgrade on any Treasure Valley quote.',
    takeaways: [
      'All-plywood boxes resist moisture better than particleboard.',
      'Full-extension drawers improve usable storage.',
      'Confirm install methods for heavy stone tops.',
    ],
    tags: ['construction', 'quality'],
    extraParagraph:
      'Review <a href="/construction">construction standards</a> and <a href="/compare">line comparisons</a> before you sign.',
  },
  {
    slug: 'cabinet-cost-per-linear-foot',
    title: 'Cabinet Cost Per Linear Foot in Boise',
    hubSlug: 'cabinet-costs',
    serviceUrl: '/cabinets/kitchen',
    quickAnswer:
      'Kitchen cabinet cost per linear foot in Boise often plans $400–$1,200+ installed depending on line, finish, and interior accessories, use LF only with a defined elevation, not as a whole-home shortcut.',
    takeaways: [
      'Linear foot pricing needs a measured run list.',
      'Islands and tall units may price separately.',
      'See our cost guide for room-level planning bands.',
    ],
    tags: ['cost', 'linear foot', 'boise'],
    extraParagraph:
      'Pair with <a href="/guides/boise-cabinet-cost-guide">Boise Cabinet Cost Guide</a> and <a href="/blog/kitchen-cabinet-cost-boise">kitchen cabinet cost</a> for full context.',
  },
  {
    slug: 'stock-vs-custom-cabinets-boise',
    title: 'Stock vs Custom Cabinets in Boise',
    hubSlug: 'choosing-cabinet-company',
    serviceUrl: '/cabinets/kitchen',
    quickAnswer:
      'Stock cabinets fit standard sizes with limited modifications; custom cabinets are built for your space, many Treasure Valley projects blend stock pantries with custom perimeter runs.',
    takeaways: [
      'Stock works for simple rectangular kitchens.',
      'Custom solves soffits, uneven walls, and tall ceilings.',
      'Lead times differ sharply between paths.',
    ],
    tags: ['stock', 'custom', 'boise'],
    extraParagraph: catalogLinks,
  },
] as const;

export const NEW_CABINET_ARTICLES: BlogPostData[] = tier1Articles.map((article) =>
  buildClusterPost({
    slug: article.slug,
    title: article.title,
    seoTitle: `${article.title} | Boise Cabinet Co`,
    metaDescription: `${article.title} for Boise, Meridian, Eagle, and the Treasure Valley. ${article.quickAnswer.slice(0, 120)}…`,
    excerpt: article.quickAnswer,
    hubSlug: article.hubSlug,
    tags: [...article.tags, 'cabinets', 'boise'],
    quickAnswer: article.quickAnswer,
    takeaways: [...article.takeaways, 'Schedule a consultation for written scope on your home.'],
    serviceUrl: article.serviceUrl,
    extraSections: [
      {
        h2: 'What to explore next',
        paragraphs: [article.extraParagraph],
      },
    ],
  }),
);
