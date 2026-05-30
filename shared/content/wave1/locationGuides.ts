import { buildSectionsHtml, CITIES_LIST, PILLAR_COST, type ContentSection } from './snippets';
import { expandLocation } from '../contentFactory';

const tvSections: ContentSection[] = [
  {
    h2: 'Why the Treasure Valley is a distinct remodeling market',
    paragraphs: [
      `Boise Remodeling Co serves homeowners across ${CITIES_LIST}—Ada and Canyon Counties—with design-build kitchen, bathroom, whole-home, addition, and ADU projects.`,
      'This master guide anchors our location hub: city guides, neighborhood notes, and links to service-area pages.',
      'Remodeling costs, permits, housing stock, and HOA rules vary by city more than many homeowners expect.',
    ],
  },
  {
    h2: 'Cities we serve and how to use this guide',
    paragraphs: [
      'Jump to your city guide for housing context and local links:',
      'Each guide connects to <a href="/areas">area pages</a> and city-specific service URLs.',
    ],
    list: [
      '<a href="/guides/boise-remodeling-guide">Boise Remodeling Guide</a>',
      '<a href="/guides/meridian-remodeling-guide">Meridian</a>',
      '<a href="/guides/eagle-remodeling-guide">Eagle</a>',
      '<a href="/guides/kuna-remodeling-guide">Kuna</a>',
      '<a href="/guides/nampa-remodeling-guide">Nampa</a>',
      '<a href="/guides/star-remodeling-guide">Star</a>',
      '<a href="/guides/middleton-remodeling-guide">Middleton</a>',
    ],
  },
  {
    h2: 'Ada County vs Canyon County permits',
    paragraphs: [
      'Boise, Meridian, Eagle, Kuna, and Star primarily use Ada County processes for many residential permits. Nampa, Middleton, and Caldwell are in Canyon County.',
      'See <a href="/blog/ada-vs-canyon-county-permit-timelines">permit timeline comparison</a> and our <a href="' + PILLAR_COST + '">remodeling cost guide</a>.',
    ],
  },
  {
    h2: 'Treasure Valley housing stock overview',
    paragraphs: [
      'North End bungalows, Bench ranches, 1990s Meridian subdivisions, Eagle executive homes, and Kuna/Star newer builds each imply different remodel approaches and budgets.',
    ],
  },
  {
    h2: 'Climate and exterior work',
    paragraphs: [
      'Dry summers and cold winters affect scheduling for additions, roofing tie-ins, and exterior concrete. Plan exterior scopes for stable weather windows when possible.',
    ],
  },
  {
    h2: 'Cost planning for valley-wide projects',
    paragraphs: [
      'Start with the <a href="' + PILLAR_COST + '">Boise Remodeling Cost Guide</a> and room-specific articles on kitchen, bath, whole-home, and addition budgets.',
    ],
  },
  {
    h2: 'Design-build remodeling across the valley',
    paragraphs: [
      'One team for design, permits, and construction reduces risk. Explore <a href="/services/kitchen-remodel">kitchen</a>, <a href="/services/bathroom-remodel">bathroom</a>, <a href="/services/whole-home-remodel">whole-home</a>, <a href="/services/room-addition">additions</a>, and <a href="/services/adu">ADUs</a>.',
    ],
  },
];

const boiseSections: ContentSection[] = [
  {
    h2: 'Remodeling in Boise: neighborhoods and housing types',
    paragraphs: [
      'Boise spans the North End, Boise Bench, Harris Ranch, East Boise, and Downtown-adjacent infill. Each has different eras of construction, setback patterns, and design expectations.',
      'We work in Ada County with in-house permit coordination for layout changes, additions, and structural kitchen/bath remodels.',
    ],
  },
  {
    h2: 'North End and Bench: older housing considerations',
    paragraphs: [
      'Smaller footprints and galley kitchens are common. Electrical panels, insulation, and creative storage matter. Respect neighborhood scale when considering second stories.',
      'Neighborhood guides: <a href="/guides/north-end-remodeling-guide">North End</a> and <a href="/guides/boise-bench-remodeling-guide">Boise Bench</a> (publishing soon).',
    ],
  },
  {
    h2: 'Harris Ranch and East Boise',
    paragraphs: [
      'Newer homes may still benefit from open-kitchen conversions, mudroom additions, and primary suite upgrades. HOAs may review exterior materials.',
      '<a href="/guides/harris-ranch-remodeling-guide">Harris Ranch guide</a>.',
    ],
  },
  {
    h2: 'Boise remodel costs and timelines',
    paragraphs: [
      'Use our <a href="' + PILLAR_COST + '">cost guide</a> and <a href="/blog/kitchen-remodel-cost-boise">kitchen</a> / <a href="/blog/bathroom-remodel-cost-boise">bathroom</a> cost articles for planning bands.',
    ],
  },
  {
    h2: 'Boise services by type',
    paragraphs: [
      '<a href="/services/kitchen-remodel/boise">Kitchen remodel Boise</a>, <a href="/services/bathroom-remodel/boise">Bathroom</a>, <a href="/services/whole-home-remodel/boise">Whole-home</a>, <a href="/services/room-addition/boise">Additions</a>, <a href="/areas/boise">Boise area page</a>.',
    ],
  },
  {
    h2: 'Nearby cities',
    paragraphs: [
      'Also serving <a href="/areas/meridian">Meridian</a>, <a href="/areas/eagle">Eagle</a>, <a href="/areas/kuna">Kuna</a>, <a href="/areas/star">Star</a>, <a href="/areas/middleton">Middleton</a>, <a href="/areas/nampa">Nampa</a>, and <a href="/areas/caldwell">Caldwell</a>—see <a href="/guides/treasure-valley-remodeling-guide">Treasure Valley guide</a>.',
    ],
  },
];

export const TREASURE_VALLEY_GUIDE_HTML = expandLocation(
  buildSectionsHtml(tvSections),
  'treasure-valley-remodeling-guide',
  179,
);
export const BOISE_GUIDE_HTML = expandLocation(
  buildSectionsHtml(boiseSections),
  'boise-remodeling-guide',
  111,
);

export const TV_QUICK_ANSWER =
  'The Treasure Valley remodeling market covers Boise, Meridian, Eagle, Kuna, Star, Middleton, Nampa, and Caldwell across Ada and Canyon Counties—with distinct permits, housing stock, and cost bands. Use city guides and the Boise Remodeling Cost Guide for planning.';

export const BOISE_QUICK_ANSWER =
  'Boise remodeling spans historic North End bungalows, Bench ranches, and newer subdivisions like Harris Ranch—each with different layout, electrical, and permit needs. Plan budgets with our cost guide and city-specific service pages.';

export const TV_TAKEAWAYS = [
  'Ada and Canyon Counties use different permit paths.',
  'Pick a city guide for housing and HOA context.',
  'Costs are local—use Treasure Valley planning ranges.',
];

export const BOISE_TAKEAWAYS = [
  'Neighborhood era drives scope and electrical needs.',
  'North End and Bench often need creative kitchen layouts.',
  'Link city services for kitchen, bath, whole-home, and additions.',
];
