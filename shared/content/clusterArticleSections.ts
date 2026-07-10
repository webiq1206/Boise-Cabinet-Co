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
  'cabinet-hardware-guide': [
    {
      h2: 'Pulls or knobs, and where does each belong?',
      paragraphs: [
        'A simple rule holds up in most Treasure Valley kitchens: knobs on doors, pulls on drawers. Knobs read cleaner on upper doors, while pulls give you a confident grip on heavy, fully loaded drawer boxes. Many homeowners now run pulls on both doors and drawers for a uniform, modern look, especially with slab and Shaker fronts.',
        'Size the pull to the drawer, not the other way around. As a starting point, use 3 to 4 inch (96mm) center-to-center pulls on standard doors and small drawers, 5 inch (128mm) on wider drawers, and long appliance or bar pulls (12 to 18 inches) on refrigerator and freezer panels. Getting spacing right at design lock avoids re-drilling finished fronts.',
      ],
    },
    {
      h2: 'Which hardware finish should you choose?',
      paragraphs: [
        'We stock decorative hardware in matte black, brushed nickel, brushed gold, polished chrome, and stainless. Matte black and brushed gold are the two most requested finishes in newer Meridian and Eagle builds; brushed nickel remains the timeless pick that hides water spots in busy kitchens.',
        'Coordinate hardware with the fixtures you use every day, faucet, lighting, and appliance handles, rather than trying to match the cabinet finish exactly. A slight contrast (black hardware on a light finish, or warm gold on a deep green) usually looks more intentional than a perfect match. Browse the options on our <a href="/hardware">cabinet hardware</a> page.',
      ],
    },
    {
      h2: 'Why soft-close hardware is worth it',
      paragraphs: [
        'Every cabinet we build uses soft-close hinges and full-extension soft-close drawer slides as standard, not an upgrade. Six-way adjustable hinges let our installers dial in door reveals precisely on site, and full-extension slides let you reach the very back of a deep drawer instead of losing that space.',
        'This is the feature clients notice first at the final walkthrough. It also protects the finish: doors and drawers that never slam keep their edges and alignment far longer, which matters under our <a href="/warranty">lifetime workmanship warranty</a>.',
      ],
    },
    {
      h2: 'How much should you budget for hardware?',
      paragraphs: [
        'Decorative hardware is usually 3 to 5 percent of the cabinet budget, but it defines the daily feel of the kitchen, so it is a reasonable place to spend a little more. A mid-size kitchen with 30 to 40 pulls and knobs typically lands in the low hundreds to around a thousand dollars depending on the line.',
        'Functional hardware (hinges and slides) is included in our cabinet pricing. When you request an <a href="/estimate">estimate</a>, hardware allowances are called out so nothing is a surprise at design lock.',
      ],
    },
  ],
  'cabinet-finishes-colors-guide': [
    {
      h2: 'Matte, gloss, or woodgrain: what is the difference?',
      paragraphs: [
        'We offer 299 finishes across three families. Matte finishes hide fingerprints and everyday smudges, which makes them the most forgiving choice for busy family kitchens. Gloss finishes bounce light around and can make a small Boise galley feel larger and brighter, but they show prints and need more wiping. Woodgrain finishes bring warmth and texture and read well in transitional and craftsman homes.',
        'See swatches and color families on the <a href="/finishes">finishes</a> page, then request sample doors before you sign off.',
      ],
    },
    {
      h2: 'How do you pick a color that works?',
      paragraphs: [
        'Start from the two surfaces you cannot easily change: countertop and flooring. Pull the cabinet color from an undertone already in those materials so the room reads as one palette instead of three competing ones. Whites and warm neutrals stay the safest resale choice; deep greens, navies, and charcoals work beautifully on islands or lower runs as a two-tone.',
        'Two-tone kitchens (a colored island or base with lighter uppers) are among the most requested looks in newer Meridian and Eagle homes because they add depth without committing the whole room to a bold color.',
      ],
    },
    {
      h2: 'Why sample doors matter in Idaho light',
      paragraphs: [
        'The Treasure Valley gets bright, high-altitude daylight, and a finish that looked perfect on a screen can shift noticeably in your actual kitchen. Painted, stained, and thermally fused finishes each reflect that light differently. View a real sample door on your own wall, in morning and evening light, before final sign-off.',
        'Idaho\'s dry climate also matters for solid wood: natural wood moves seasonally, so stained doors can show slight seam movement that painted and thermally fused finishes will not. We account for this in door construction, but it is worth knowing when you compare finish types.',
      ],
    },
    {
      h2: 'Coordinating finishes across rooms',
      paragraphs: [
        'If your project includes a kitchen plus bathrooms or built-ins, decide early whether you want them to match or intentionally differ. A common approach: keep the kitchen and any open-concept built-ins in one family, then let a primary bath vanity go a shade richer for contrast. Locking this at design sign-off keeps the whole home cohesive.',
      ],
    },
  ],
  'cabinet-door-styles-guide': [
    {
      h2: 'Which door styles do we build?',
      paragraphs: [
        'Our lineup covers a slab (flat, frameless-modern), a three-piece, and a family of Shaker profiles, Modern, Thin, Alpha, and Beta Shaker, that range from crisp and contemporary to more traditional. Slab doors suit modern and mid-century homes and newer builds; Shaker profiles are the most versatile and sit comfortably in craftsman, transitional, and farmhouse kitchens across the valley.',
        'Compare profiles and see which finishes pair with each on the <a href="/door-styles">door styles</a> page.',
      ],
    },
    {
      h2: 'How do you match a door style to your home?',
      paragraphs: [
        'Let the era and architecture lead. Boise Bench and North End homes from the mid-century read well with a slab or a clean Modern Shaker; newer Meridian, Eagle, and Kuna builds take almost any profile, so the choice becomes about the look you want. When in doubt, a Shaker is the lowest-risk choice for resale because it dates the slowest.',
        'Coordinate the door style across the whole home. Using the same profile in the kitchen, bathrooms, and built-ins is what makes a remodel feel designed rather than assembled room by room.',
      ],
    },
    {
      h2: 'Framed or frameless construction?',
      paragraphs: [
        'We build frameless (full-access) cabinets, which give you wider drawers and doors and easier reach into the box than traditional framed construction. The door style you choose sits on top of that frameless box, so you get a modern, efficient interior with whatever door look fits your home.',
        'Drawer fronts follow the door: slab boxes get slab drawer fronts, while Shaker doors can pair with a matching five-piece or a simpler slab drawer front depending on the look you want.',
      ],
    },
    {
      h2: 'Door style and cost',
      paragraphs: [
        'Door style has a real but moderate effect on price. Slab and simple Shaker profiles are typically the most cost-effective; more detailed profiles and specialty finishes add to the door line. Because door style also drives the whole look, it is worth choosing the profile first and letting it guide finish and hardware. Get a tailored range with our <a href="/estimate">estimate tool</a>.',
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
    // The intro previously repeated `excerpt` (shown as the subtitle) and
    // `quickAnswer` (shown in the Quick Answer box) as an "About" section - a
    // 3x above-the-fold duplication across every post. Removed so the body opens
    // with unique topic content. (Body depth is a separate content-expansion task.)
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
