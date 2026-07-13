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
    h2: 'City cabinet guides across the Treasure Valley',
    list: [
      `<a href="${PILLAR_BOISE}">Boise cabinet guide</a>`,
      '<a href="/guides/meridian-cabinet-guide">Meridian cabinet guide</a>',
      '<a href="/guides/eagle-cabinet-guide">Eagle cabinet guide</a>',
      '<a href="/guides/kuna-cabinet-guide">Kuna cabinet guide</a>',
      '<a href="/guides/star-cabinet-guide">Star cabinet guide</a>',
      '<a href="/guides/nampa-cabinet-guide">Nampa cabinet guide</a>',
      '<a href="/guides/middleton-cabinet-guide">Middleton cabinet guide</a>',
      '<a href="/guides/caldwell-cabinet-guide">Caldwell cabinet guide</a>',
    ],
    paragraphs: [
      'Each city guide covers local housing stock, common cabinet projects, permits, and planning ranges. Ada County cities: Boise, Meridian, Eagle, Kuna, and Star. Canyon County: Nampa, Middleton, and Caldwell.',
    ],
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
      '<a href="/guides/boise-kitchen-cabinet-guide">Kitchen cabinets</a>',
      '<a href="/guides/boise-bathroom-vanity-guide">Bathroom vanities</a>',
      '<a href="/guides/built-in-cabinet-guide">Built-ins & storage</a>',
      '<a href="/guides/whole-home-cabinetry-guide">Whole-home cabinetry</a>',
      '<a href="/guides/choose-cabinet-company-boise">Choosing a cabinet company</a>',
      '<a href="/guides/cabinet-project-process-guide">Cabinet project process</a>',
      '<a href="/guides/cabinet-roi-guide-boise">Cabinet ROI</a>',
    ],
    paragraphs: ['Each topic guide links to the matching room catalog and cost bands.'],
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
      `<a href="/estimate">Get an estimate</a> · <a href="/contact">Consultation</a> · <a href="${PILLAR_COST}">Cost guide</a>.`,
    ],
  },
];

const boiseSections: ContentSection[] = [
  {
    h2: 'Boise neighborhoods at a glance',
    paragraphs: [
      'Boise is not one cabinet market, it is half a dozen. North End bungalows, Bench ranches, Harris Ranch and East Boise newer builds, Southeast Boise family subdivisions, and foothills view homes each bring different ceiling heights, wall conditions, and storage needs.',
      'We measure on site and build every box to your room, not catalog-only stock widths. That matters more in Boise than anywhere else in the valley because so much of the housing stock predates 1980.',
    ],
  },
  {
    h2: 'North End and Hyde Park: bungalow kitchens',
    paragraphs: [
      'Craftsman bungalows and early-1900s cottages around Hyde Park have compact galley kitchens with plaster walls and original soffits. Tall pantry cabinets, pull-out bases, and custom widths recover storage stock sizing wastes.',
      'Historic district character matters: simpler door profiles like <a href="/catalog">Thin Shaker</a> and painted matte finishes tend to suit these homes better than heavy ornamentation.',
    ],
  },
  {
    h2: 'Boise Bench: mid-century ranches',
    paragraphs: [
      'Bench ranches from the 1950s through 1970s are prime candidates for opening the kitchen to the living space, and for cabinet runs that work with lower 8-foot ceilings. Full-height pantry units and drawer bases do the storage work shallow original cabinets never could.',
      'When walls open during a Bench project, panel and insulation surprises are common; our written scope and change-order process keep those discoveries from derailing the cabinet schedule.',
    ],
  },
  {
    h2: 'Harris Ranch and East Boise',
    paragraphs: [
      'Harris Ranch, Barber Valley, and East Boise infill bring larger kitchens, butler pantries, and mudroom lockers. Many homes are under 25 years old, so projects are upgrade-driven: taller uppers, working islands with seating, and <a href="/cabinets/mudroom">mudroom systems</a> where garage traffic enters.',
      'Harris Ranch HOAs may review exterior-visible work such as outdoor kitchens; interior cabinetry is normally exempt. We build review time into the plan when it applies.',
    ],
  },
  {
    h2: 'Southeast Boise and the foothills',
    paragraphs: [
      'Southeast Boise subdivisions near Bown Crossing favor family storage: pantry walls, <a href="/cabinets/laundry">laundry rooms</a> with folding counters, and <a href="/cabinets/home-office">home office built-ins</a>. Foothills and view homes trend toward entertaining spaces, wet bars, media walls, and kitchens with paneled appliances.',
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
      'Check historic district or HOA rules before exterior-visible work',
    ],
    paragraphs: [],
  },
  {
    h2: 'Next steps in Boise',
    paragraphs: [
      '<a href="/contact">Consultation</a> · <a href="/estimate">Get an estimate</a> · <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley hub</a>.',
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
