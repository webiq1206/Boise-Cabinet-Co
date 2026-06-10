import { CITIES_LIST, PILLAR_COST, type ContentSection } from './wave1/snippets';
import { COMPANY_TOPIC_SECTIONS } from './clusterTopicSectionsCompany';
import { ROOM_TOPIC_SECTIONS } from './clusterTopicSectionsRooms';
import { getHubBySlug, guidePath } from '../contentHubs';
export interface ClusterArticleConfig {
  slug: string;
  title: string;
  excerpt: string;
  quickAnswer: string;
  hubSlug: string;
  serviceUrl?: string;
  cityServiceUrl?: string;
  extraSections?: ContentSection[];
}

/** Topic-specific depth for cluster blog posts (not full pillar duplication). */

const SLUG_SECTIONS: Record<string, ContentSection[]> = {
  'kitchen-cabinet-cost-boise': [
    {
      h2: 'What drives kitchen cost in Boise?',
      paragraphs: [
        'Cabinet line, layout moves, and structural beams are the top variables. Appliance packages are usually separate from cabinet contracts.',
        'See the <a href="/guides/boise-cabinet-cost-guide">full cost guide</a> for cross-room comparisons.',
      ],
    },
    {
      h2: 'Kitchen timeline and lead times',
      paragraphs: [
        'Order cabinets at design lock; eight-week lead times are common. Permit review adds weeks when walls are removed.',
      ],
    },
  ],
  'open-kitchen-cabinet-storage': [
    {
      h2: 'Replacing wall cabinets with working storage',
      paragraphs: [
        'When a load-bearing wall comes out, you lose upper and base runs on that line. Plan compensating storage on remaining walls, in the island, and in a pantry before demolition.',
        'Review <a href="/cabinets/kitchen">kitchen cabinet options</a> early so door style, depth, and interior accessories are locked at design sign-off.',
      ],
    },
    {
      h2: 'Island cabinets as the new anchor',
      paragraphs: [
        'In open layouts the island often becomes the main prep zone and visual divider. Size base cabinets for drawers, trash pullouts, and appliance garages, not just seating overhang.',
        'See our <a href="/blog/kitchen-island-design-guide">kitchen island design guide</a> for clearances on Boise ranches and newer Meridian floor plans.',
      ],
    },
    {
      h2: 'Upper cabinets and sight lines',
      paragraphs: [
        'Shorter uppers, glass doors, or open shelving keep the living room in view while preserving dish and pantry storage. Align finished heights with windows and beam lines after structural engineering.',
      ],
    },
    {
      h2: 'Structural checks before demo',
      paragraphs: [
        'Verify beam sizing and point loads for Boise ranches and split-levels. Ada County sheets should be approved before demolition.',
      ],
    },
  ],
  'walk-in-shower-guide': [
    {
      h2: 'Waterproofing and inspection sequence',
      paragraphs: [
        'Flood testing and liner systems must pass before tile. Curbless designs need precise slope to the drain.',
      ],
    },
  ],
  'ada-vs-canyon-county-permit-timelines': [
    {
      h2: 'Ada County review expectations',
      paragraphs: [
        'Boise, Meridian, Eagle, Kuna, and Star projects often route through Ada County for residential cabinet projects with layout changes.',
      ],
    },
    {
      h2: 'Canyon County review expectations',
      paragraphs: [
        'Nampa, Middleton, and Caldwell use Canyon County portals with different fees and comment cycles, do not assume Ada timelines.',
      ],
    },
  ],
};

function defaultTopicSections(title: string, hubSlug: string): ContentSection[] {
  return [
    {
      h2: `Planning ${title.toLowerCase()} in the Treasure Valley`,
      paragraphs: [
        `Homeowners in ${CITIES_LIST} should use local scope, permits, and finish level, not national averages, when budgeting this topic.`,
        `For the full overview, read the hub guide and cost planning resources linked below.`,
      ],
    },
    {
      h2: 'Local permits and housing context',
      paragraphs: [
        'Ada and Canyon Counties use different portals. Older homes may need contingency when walls open.',
        '<a href="/blog/ada-vs-canyon-county-permit-timelines">Compare permit timelines</a>.',
      ],
    },
  ];
}

export function buildClusterArticleSections(config: ClusterArticleConfig): ContentSection[] {
  const hub = getHubBySlug(config.hubSlug)!;
  const pillarUrl = guidePath(hub.pillarSlug);
  const topicSections =
    SLUG_SECTIONS[config.slug] ??
    ROOM_TOPIC_SECTIONS[config.slug] ??
    COMPANY_TOPIC_SECTIONS[config.slug] ??
    defaultTopicSections(config.title, config.hubSlug);

  return [
    {
      h2: `About ${config.title}`,
      paragraphs: [config.excerpt, config.quickAnswer],
    },
    ...topicSections,
    ...(config.extraSections ?? []),
    {
      h2: 'Full guide and cost planning',
      paragraphs: [
        `<a href="${pillarUrl}">${hub.title}</a> · <a href="${PILLAR_COST}">Cabinet cost guide</a> · <a href="/blog/category/${config.hubSlug}">More articles</a>.`,
      ],
    },
    {
      h2: 'Explore the catalog',
      paragraphs: [
        '<a href="/cabinets">Cabinet rooms</a> · <a href="/collections">Collections</a> · <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley cabinet guide</a>.',
      ],
    },
    {
      h2: 'Next steps',
      paragraphs: [
        '<a href="/#calculator">Estimator</a> · <a href="/contact">Schedule consultation</a>.',
      ],
    },
  ];
}
