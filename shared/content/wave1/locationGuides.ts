import { buildSectionsHtml, CITIES_LIST, type ContentSection } from './snippets';
import { expandLocation } from '../contentFactory';

const PILLAR_COST = '/guides/boise-cabinet-cost-guide';
const PILLAR_TV = '/guides/treasure-valley-cabinet-guide';
const PILLAR_BOISE = '/guides/boise-cabinet-guide';

const tvSections: ContentSection[] = [
  {
    h2: 'Why the Treasure Valley is a distinct cabinet market',
    paragraphs: [
      `We serve ${CITIES_LIST} across Ada and Canyon Counties with custom kitchen, bath, laundry, mudroom, built-in, and storage cabinetry.`,
      'Home styles, ceiling heights, and layout quirks vary by city, use this hub to pick your Boise cabinet guide, then the room catalog that matches your project.',
    ],
  },
  {
    h2: 'City and neighborhood context',
    list: [
      `<a href="${PILLAR_BOISE}">Boise</a>`,
      '<a href="/guides/meridian-remodeling-guide">Meridian</a>',
      '<a href="/guides/eagle-remodeling-guide">Eagle</a>',
      '<a href="/guides/kuna-remodeling-guide">Kuna</a>',
      '<a href="/guides/nampa-remodeling-guide">Nampa</a>',
      '<a href="/guides/star-remodeling-guide">Star</a>',
      '<a href="/guides/middleton-remodeling-guide">Middleton</a>',
      'Caldwell and Canyon County homes (see cost and catalog links below)',
    ],
    paragraphs: ['Removed city guides redirect here, local notes live in Boise and valley-wide articles.'],
  },
  {
    h2: 'Ada County vs Canyon County',
    paragraphs: [
      'Boise, Meridian, Eagle, Kuna, and Star are primarily in Ada County. Nampa, Middleton, and Caldwell are in Canyon County.',
      'Delivery and installation are available throughout both counties.',
    ],
  },
  {
    h2: 'Planning ranges by cabinet type',
    table: {
      className: 'cost-table',
      headers: ['Room', 'Planning note'],
      rows: [
        ['Kitchen', 'Linear footage and island layout drive budget'],
        ['Bathroom', 'Vanity width and storage towers differ'],
        ['Built-ins', 'Entertainment and mudroom lockers vary by wall'],
        ['Closet / garage', 'System depth and accessory packages matter'],
      ],
    },
    paragraphs: [`Full bands: <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`],
  },
  {
    h2: 'Cabinet guides by topic',
    list: [
      '<a href="/guides/boise-kitchen-cabinets-guide">Kitchen cabinets</a>',
      '<a href="/guides/boise-bathroom-vanities-guide">Bathroom vanities</a>',
      '<a href="/guides/boise-home-addition-guide">Built-ins & storage</a>',
      '<a href="/guides/whole-home-cabinetry-guide">Whole-home cabinetry</a>',
      '<a href="/guides/choose-cabinet-company-boise">Choosing a cabinet company</a>',
      '<a href="/guides/boise-cabinet-project-process-guide">Cabinet project process</a>',
      '<a href="/guides/best-cabinet-roi-boise">Cabinet ROI</a>',
    ],
    paragraphs: ['Legacy guide URLs redirect to updated cabinet pillar slugs.'],
  },
  {
    h2: 'Explore the catalog',
    list: [
      '<a href="/cabinets/kitchen">Kitchen</a>',
      '<a href="/cabinets/bathroom">Bathroom</a>',
      '<a href="/cabinets/mudroom">Mudroom</a>',
      '<a href="/cabinets/built-ins">Built-ins</a>',
      '<a href="/cabinets/outdoor">Outdoor</a>',
      '<a href="/cabinets">All rooms</a>',
    ],
    paragraphs: [],
  },
  {
    h2: 'Next steps',
    paragraphs: [
      `<a href="/design-studio">Design studio</a> · <a href="/contact">Consultation</a> · <a href="${PILLAR_COST}">Cost guide</a>.`,
    ],
  },
];

const boiseSections: ContentSection[] = [
  {
    h2: 'Boise neighborhoods at a glance',
    paragraphs: [
      'North End bungalows, Bench ranches, Harris Ranch, and East Boise infill each need different cabinet sizing and filler strategies.',
      'We measure on site and build to your room, not catalog-only stock widths.',
    ],
  },
  {
    h2: 'North End and Bench',
    paragraphs: [
      'Smaller footprints and galley kitchens are common, tall pantry cabinets, pull-out bases, and custom widths maximize storage.',
      '<a href="/guides/north-end-remodeling-guide">North End notes</a> · <a href="/guides/boise-bench-remodeling-guide">Bench notes</a> (redirect to this guide).',
    ],
  },
  {
    h2: 'Harris Ranch and East Boise',
    paragraphs: [
      'Larger kitchens, mudrooms, and butler pantries are frequent. HOAs may review visible exterior cabinetry.',
      '<a href="/guides/harris-ranch-remodeling-guide">Harris Ranch</a> · <a href="/guides/east-boise-remodeling-guide">East Boise</a> (redirect here).',
    ],
  },
  {
    h2: 'Costs and catalog in Boise',
    paragraphs: [
      'Kitchen cabinet packages often plan from roughly $15,000–$45,000+; vanities vary with width and finish tier.',
      `<a href="${PILLAR_COST}">Cost guide</a> · <a href="/cabinets/kitchen">Kitchen catalog</a> · <a href="/cabinets/bathroom">Bath catalog</a> · <a href="${PILLAR_TV}">Treasure Valley hub</a>.`,
    ],
  },
  {
    h2: 'Boise cabinet planning checklist',
    list: [
      'Measure ceiling height and soffits before ordering',
      'Confirm appliance specs for panel-ready units',
      'Select door style and finish early for lead time',
      'Compare quotes with identical scope and hardware tier',
    ],
    paragraphs: [],
  },
  {
    h2: 'Next steps in Boise',
    paragraphs: [
      '<a href="/contact">Consultation</a> · <a href="/design-studio">Design studio</a> · <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley hub</a>.',
    ],
  },
];

export const TREASURE_VALLEY_GUIDE_HTML = expandLocation(
  buildSectionsHtml(tvSections),
  'treasure-valley-cabinet-guide',
);
export const BOISE_GUIDE_HTML = expandLocation(buildSectionsHtml(boiseSections), 'boise-cabinet-guide');

export const TV_QUICK_ANSWER =
  'The Treasure Valley covers Boise, Meridian, Eagle, Kuna, Star, Middleton, Nampa, and Caldwell. Boise Cabinet Co builds and installs custom cabinets valley-wide, start with our catalog and cost guide for your room.';

export const BOISE_QUICK_ANSWER =
  'Boise spans North End, Bench, Harris Ranch, and East Boise, each with different layout and storage needs. Browse kitchen and bath catalog pages and our cabinet cost guide before your consultation.';

export const TV_TAKEAWAYS = [
  'Eight cities across Ada and Canyon Counties.',
  'Catalog covers kitchen, bath, mudroom, built-ins, and more.',
  'Use the cabinet cost guide for planning bands.',
];

export const BOISE_TAKEAWAYS = [
  'Neighborhood era drives cabinet sizing and filler needs.',
  'North End and Bench benefit from custom widths and tall storage.',
  'Link to kitchen and bath catalog pages for each project type.',
];
