import { buildSectionsHtml, PILLAR_COST, PILLAR_TV, type ContentSection } from './wave1/snippets';
import type { GuidePageData } from '../guideContent';

/**
 * City location guides for the seven Treasure Valley cities beyond Boise.
 * Each guide has unique housing-stock copy, city-specific FAQs, and links
 * into the catalog and cost pillar (local-guides hub, guideType 'location').
 */

interface CityGuideSpec {
  slug: string;
  cityName: string;
  citySlug: string;
  county: 'ada' | 'canyon';
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  quickAnswer: string;
  takeaways: string[];
  sections: ContentSection[];
  faqs: Array<{ question: string; answer: string }>;
  tags: string[];
  primaryKeyword: string;
}

const NEXT_STEPS: ContentSection = {
  h2: 'Next steps',
  paragraphs: [
    '<a href="/contact">Schedule a free design consultation</a> · <a href="/cabinets">Browse cabinets by room</a> · <a href="/guides/boise-cabinet-cost-guide">Cabinet cost guide</a>.',
  ],
};

function countySection(cityName: string, county: 'ada' | 'canyon'): ContentSection {
  return county === 'ada'
    ? {
        h2: `Ada County permits for ${cityName} cabinet projects`,
        paragraphs: [
          `${cityName} sits in Ada County. Cabinet-only replacements rarely require permits, but projects that move plumbing, electrical, or walls route through Ada County or city plan review. We flag permit triggers during design so your schedule stays realistic.`,
          'See our <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> for how permits fit the overall timeline.',
        ],
      }
    : {
        h2: `Canyon County permits for ${cityName} cabinet projects`,
        paragraphs: [
          `${cityName} uses Canyon County processes, with different portals and review cadence than Boise or Meridian. Cabinet-only swaps usually move fast; tied-in plumbing or electrical work needs review. We work both counties weekly and handle the paperwork.`,
          'Our <a href="/guides/cabinet-project-process-guide">project process guide</a> and the Ada vs Canyon permit flow resource cover the details.',
        ],
      };
}

const CITY_GUIDE_SPECS: CityGuideSpec[] = [
  {
    slug: 'meridian-cabinet-guide',
    cityName: 'Meridian',
    citySlug: 'meridian',
    county: 'ada',
    seoTitle: 'Meridian Custom Cabinet Guide | Kitchens & Storage',
    metaDescription:
      'Custom cabinets in Meridian, Idaho: builder-grade kitchen upgrades, pantry and mudroom storage for Paramount, Tuscany, and Century Farm homes, costs, and planning.',
    excerpt:
      'Local guide to custom cabinets in Meridian: subdivision housing stock, the most common upgrades, planning ranges, and catalog links.',
    quickAnswer:
      'Meridian is our home base. Most Meridian projects upgrade 1990s to 2010s builder-grade kitchens with custom islands, pantry storage, and mudroom drop zones. Boise Cabinet Co designs, builds, and installs frameless custom cabinets across every Meridian subdivision.',
    takeaways: [
      'Builder-grade kitchen upgrades are the most common Meridian project.',
      'Mudroom lockers and pantry systems suit garage-entry floor plans.',
      'Meridian is in Ada County; cabinet-only projects rarely need permits.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Meridian, our home city',
        paragraphs: [
          'Boise Cabinet Co is headquartered in Meridian, so most of our team measures, delivers, and installs here weekly. We build frameless custom <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/bathroom">bathroom vanities</a>, and <a href="/cabinets/built-ins">built-in storage</a> for homes across the city.',
          `Start with the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a> for valley-wide context, then use this page for Meridian specifics.`,
        ],
      },
      {
        h2: 'Meridian housing stock: builder-grade ready for upgrades',
        paragraphs: [
          'Subdivisions like Paramount, Tuscany, Bridgetower, and Century Farm were built between the late 1990s and 2010s with stock cabinet packages: limited heights, basic shelving, and oak or thermofoil finishes. Those kitchens are now the most common upgrade path in the city.',
          'Homeowners typically want taller uppers, a working island with seating, deeper drawers in place of base shelves, and a pantry wall, all without fighting the open-plan layout the builder established.',
        ],
      },
      {
        h2: 'Popular Meridian cabinet projects',
        list: [
          'Full kitchen cabinet replacement with island and panel-ready appliances',
          'Pantry walls and <a href="/cabinets/pantry">walk-in pantry systems</a>',
          'Mudroom lockers and drop zones where garage traffic meets the kitchen, see <a href="/cabinets/mudroom">mudroom cabinets</a>',
          'Home office built-ins for remote workers, see <a href="/cabinets/home-office">office cabinets</a>',
        ],
        paragraphs: [
          'Rear-entry garages and family-room-adjacent kitchens make storage near the entry the second most requested project after kitchens.',
        ],
      },
      countySection('Meridian', 'ada'),
      {
        h2: 'Meridian cabinet costs and planning',
        paragraphs: [
          `Material and labor rates match the rest of the valley. Kitchen packages commonly plan from roughly $15,000 to $45,000+ depending on linear footage, door style, and accessories. Full bands live in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`,
          'Compare door styles and finishes in the <a href="/catalog">catalog</a> before your consultation to speed up selections.',
        ],
      },
      NEXT_STEPS,
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Meridian?',
        answer:
          'Yes. Meridian is our home base. We design, build, and install frameless custom kitchen cabinets, vanities, pantries, mudroom lockers, and built-ins across every Meridian subdivision.',
      },
      {
        question: 'How much do kitchen cabinets cost in Meridian?',
        answer:
          'Meridian rates match the rest of the Treasure Valley: most kitchen cabinet packages plan from roughly $15,000 to $45,000+ depending on linear footage, door style, and accessories.',
      },
      {
        question: 'Can you upgrade builder-grade cabinets in Paramount or Tuscany?',
        answer:
          'Yes. Replacing 1990s to 2010s builder-grade kitchens with taller uppers, drawer bases, and a working island is our most common Meridian project.',
      },
      {
        question: 'Do Meridian cabinet projects need permits?',
        answer:
          'Cabinet-only replacements rarely need permits. Projects that move plumbing, electrical, or walls route through Ada County or City of Meridian review; we flag triggers during design.',
      },
      {
        question: 'How long does a Meridian cabinet project take?',
        answer:
          'Typically 4 to 8 weeks from approved design to installation. Being based in Meridian, delivery and install scheduling here is usually the fastest in our service area.',
      },
      {
        question: 'Do you build mudroom and pantry storage in Meridian?',
        answer:
          'Yes. Mudroom lockers, drop zones, and pantry walls are the second most requested Meridian project after kitchens, especially in garage-entry floor plans.',
      },
    ],
    tags: ['meridian', 'ada county', 'cabinets', 'idaho'],
    primaryKeyword: 'custom cabinets Meridian',
  },
  {
    slug: 'eagle-cabinet-guide',
    cityName: 'Eagle',
    citySlug: 'eagle',
    county: 'ada',
    seoTitle: 'Eagle Custom Cabinet Guide | Kitchens & Built-Ins',
    metaDescription:
      'Custom cabinets in Eagle, Idaho: luxury kitchens, butler pantries, paneled appliances, and built-ins for BanBury, Eagle Foothills, and Two Rivers homes.',
    excerpt:
      'Local guide to custom cabinets in Eagle: estate-level kitchens, HOA design review, premium finishes, and planning guidance.',
    quickAnswer:
      'Eagle projects trend larger and more finish-driven than anywhere else in the valley: estate kitchens, butler pantries, paneled appliances, and whole-home cabinet programs. Boise Cabinet Co builds frameless custom cabinetry for Eagle homes, including HOA communities with architectural review.',
    takeaways: [
      'Eagle kitchens favor premium finishes, paneled appliances, and butler pantries.',
      'HOA communities like Hidden Springs and the Foothills add review time; plan early.',
      'Whole-home cabinet programs keep finishes cohesive across large floor plans.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Eagle',
        paragraphs: [
          'Eagle homes carry the highest finish expectations in the Treasure Valley. We build frameless custom <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/bathroom">vanities</a>, and <a href="/cabinets/entertainment">entertainment built-ins</a> sized for larger footprints and taller ceilings.',
          `For valley-wide planning, start with the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a>.`,
        ],
      },
      {
        h2: 'Eagle housing: estates, foothills, and executive subdivisions',
        paragraphs: [
          'BanBury, Legacy, Two Rivers, Eagle Foothills, and Hidden Springs span custom estates to executive subdivisions. Ten-foot ceilings, oversized islands, and open great rooms are common, which means taller uppers, stacked cabinets, and furniture-grade end panels.',
          'Hillside and view lots in the Foothills often pair kitchens with wet bars and entertainment walls designed as one coordinated finish package.',
        ],
      },
      {
        h2: 'Popular Eagle cabinet projects',
        list: [
          'Estate kitchens with paneled refrigeration, stacked uppers, and oversized islands',
          'Butler pantries and <a href="/cabinets/pantry">walk-in pantry systems</a>',
          '<a href="/cabinets/wet-bar">Wet bars</a> and <a href="/cabinets/entertainment">media walls</a> for entertaining',
          'Whole-home programs coordinating kitchen, baths, laundry, and closets, see the <a href="/guides/whole-home-cabinetry-guide">whole-home cabinetry guide</a>',
        ],
        paragraphs: [
          'Luxury finish tiers, high-gloss and textured woodgrain, appear more often in Eagle than anywhere else we install. Browse the <a href="/catalog">catalog</a> to shortlist options.',
        ],
      },
      {
        h2: 'HOA design review in Eagle communities',
        paragraphs: [
          'Hidden Springs, the Foothills, and several BanBury-area HOAs review exterior-visible work. Interior cabinetry is normally exempt, but outdoor kitchens and garage-facing cabinetry can trigger review. We build review time into the schedule from day one.',
        ],
      },
      countySection('Eagle', 'ada'),
      {
        h2: 'Eagle cabinet costs and planning',
        paragraphs: [
          `Eagle budgets skew higher because of finish level and scale, not labor rates. Luxury kitchens commonly exceed the valley-typical band; planning detail lives in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a> and our luxury cost article on the <a href="/blog/luxury-custom-cabinet-cost-boise">blog</a>.`,
        ],
      },
      NEXT_STEPS,
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Eagle?',
        answer:
          'Yes. We design, build, and install frameless custom cabinets across Eagle, including BanBury, Legacy, Two Rivers, Eagle Foothills, and Hidden Springs.',
      },
      {
        question: 'How much do luxury kitchen cabinets cost in Eagle?',
        answer:
          'Eagle kitchens often exceed the valley-typical $15,000 to $45,000 band because of scale and finish tier. Paneled appliances, stacked uppers, and premium finishes drive the difference more than location.',
      },
      {
        question: 'Do Eagle HOAs review cabinet projects?',
        answer:
          'Interior cabinetry is normally exempt, but outdoor kitchens and exterior-visible work in communities like Hidden Springs and the Foothills can trigger architectural review. We plan for it from day one.',
      },
      {
        question: 'Can you match cabinets across a whole Eagle home?',
        answer:
          'Yes. Whole-home cabinet programs coordinate kitchen, baths, laundry, closets, and media walls under one finish package, which is a common request in larger Eagle floor plans.',
      },
      {
        question: 'Do you build wet bars and entertainment walls in Eagle?',
        answer:
          'Yes. Wet bars, media walls, and fireplace surrounds with integrated wire management are among our most requested Eagle built-ins.',
      },
      {
        question: 'How long does an Eagle cabinet project take?',
        answer:
          'Plan 4 to 8 weeks from approved design to installation for most projects; large whole-home programs and HOA review can extend the calendar.',
      },
    ],
    tags: ['eagle', 'ada county', 'luxury cabinets', 'idaho'],
    primaryKeyword: 'custom cabinets Eagle',
  },
  {
    slug: 'nampa-cabinet-guide',
    cityName: 'Nampa',
    citySlug: 'nampa',
    county: 'canyon',
    seoTitle: 'Nampa Custom Cabinet Guide | Kitchens & Vanities',
    metaDescription:
      'Custom cabinets in Nampa, Idaho: kitchen upgrades for older bungalows and newer subdivisions, bathroom vanities, Canyon County permits, costs, and planning.',
    excerpt:
      'Local guide to custom cabinets in Nampa: mixed housing stock from historic bungalows to new builds, Canyon County permitting, and planning ranges.',
    quickAnswer:
      'Nampa mixes historic bungalows near downtown with fast-growing subdivisions, so cabinet projects range from creative small-kitchen layouts to full builder-grade replacements. Boise Cabinet Co designs, builds, and installs custom cabinets throughout Nampa and Canyon County.',
    takeaways: [
      'Older Nampa bungalows reward custom widths and tall storage in compact kitchens.',
      'Newer subdivisions follow the builder-grade upgrade path common across the valley.',
      'Nampa permits run through Canyon County, a different process than Ada.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Nampa',
        paragraphs: [
          'Nampa is the largest Canyon County city we serve, and its housing range is the widest: 1900s bungalows near the Nampa Depot and downtown, mid-century ranches, and 2000s-to-current subdivisions. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a> and <a href="/cabinets/bathroom">vanities</a> for all of them.',
          `Valley-wide context lives in the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a>.`,
        ],
      },
      {
        h2: 'Older Nampa homes: small kitchens, big storage gains',
        paragraphs: [
          'Historic bungalows and post-war homes near downtown often have compact, closed kitchens with shallow cabinets and odd wall lengths. Custom widths, tall pantry units, and drawer bases recover storage that stock sizes waste.',
          'Walls in these homes are rarely plumb; built-to-order boxes and scribe-fit fillers make the difference between a clean install and visible gaps.',
        ],
      },
      {
        h2: 'Newer Nampa subdivisions',
        paragraphs: [
          'South and west Nampa grew quickly through the 2000s and 2010s with builder-grade packages. Upgrades follow the valley pattern: taller uppers, working islands, pantry walls, and <a href="/cabinets/laundry">laundry</a> or <a href="/cabinets/garage">garage storage</a> as a second phase.',
        ],
      },
      countySection('Nampa', 'canyon'),
      {
        h2: 'Nampa cabinet costs and planning',
        paragraphs: [
          `Labor and material rates match the rest of the valley; finish tier and linear footage drive your number. Planning bands live in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`,
          'Value-focused projects often pair a mid-tier matte finish with drawer-base upgrades where they matter most. Compare options in the <a href="/catalog">catalog</a>.',
        ],
      },
      NEXT_STEPS,
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Nampa?',
        answer:
          'Yes. We design, build, and install custom cabinets throughout Nampa, from historic homes near downtown to new subdivisions in south and west Nampa.',
      },
      {
        question: 'How much do kitchen cabinets cost in Nampa?',
        answer:
          'Nampa rates match the rest of the Treasure Valley: most kitchen packages plan from roughly $15,000 to $45,000+ based on linear footage, door style, and accessories, not zip code.',
      },
      {
        question: 'Can you fit cabinets in an older Nampa bungalow kitchen?',
        answer:
          'Yes. Custom widths, tall pantry units, and scribe-fit fillers are exactly what compact, out-of-plumb older kitchens need. We measure on site and build to your walls.',
      },
      {
        question: 'Do Nampa cabinet projects need Canyon County permits?',
        answer:
          'Cabinet-only replacements usually do not. Work that moves plumbing or electrical routes through Canyon County review, which has different portals and cadence than Ada County. We handle it.',
      },
      {
        question: 'Do you charge more to deliver and install in Nampa?',
        answer:
          'No. Nampa is inside our standard service area and we install in Canyon County weekly.',
      },
      {
        question: 'What Nampa cabinet projects are most common?',
        answer:
          'Kitchen replacements lead, followed by bathroom vanities, pantry storage, and laundry or garage systems in newer subdivisions.',
      },
    ],
    tags: ['nampa', 'canyon county', 'cabinets', 'idaho'],
    primaryKeyword: 'custom cabinets Nampa',
  },
  {
    slug: 'kuna-cabinet-guide',
    cityName: 'Kuna',
    citySlug: 'kuna',
    county: 'ada',
    seoTitle: 'Kuna Custom Cabinet Guide | Kitchens & Storage',
    metaDescription:
      'Custom cabinets in Kuna, Idaho: builder-grade kitchen upgrades, family storage, mudroom and garage systems for fast-growing Kuna subdivisions.',
    excerpt:
      'Local guide to custom cabinets in Kuna: newer family homes, the most common storage upgrades, Ada County permits, and planning ranges.',
    quickAnswer:
      'Kuna is one of the fastest-growing cities in Idaho, dominated by newer family homes with builder-grade cabinet packages. The most common projects are kitchen upgrades, pantry walls, and mudroom and garage storage. Boise Cabinet Co builds and installs custom frameless cabinets throughout Kuna.',
    takeaways: [
      'Most Kuna homes are newer builds with stock cabinet packages ready for upgrades.',
      'Family storage, mudrooms, pantries, and garages, is the signature Kuna request.',
      'Kuna is in Ada County; cabinet-only projects rarely need permits.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Kuna',
        paragraphs: [
          'Kuna has grown faster than almost anywhere in the valley, and most of its housing stock is under 20 years old. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/pantry">pantry systems</a>, and <a href="/cabinets/garage">garage storage</a> for Kuna families.',
          `Start with the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a> for valley-wide planning.`,
        ],
      },
      {
        h2: 'Kuna housing: new builds with stock packages',
        paragraphs: [
          'Builder packages in Kuna subdivisions favor speed over storage: 30-inch uppers, fixed shelves, and minimal drawers. Swapping to 42-inch uppers, drawer bases, and a real pantry wall transforms how these kitchens work without changing the floor plan.',
          'Larger lots in and around Kuna also drive demand for garage cabinet systems and shop storage that handle tools, sports gear, and seasonal equipment.',
        ],
      },
      {
        h2: 'Popular Kuna cabinet projects',
        list: [
          'Kitchen upgrades from builder-grade to custom heights and drawer bases',
          '<a href="/cabinets/mudroom">Mudroom lockers</a> and family drop zones',
          '<a href="/cabinets/garage">Garage storage systems</a> for larger lots',
          '<a href="/cabinets/laundry">Laundry room cabinets</a> with folding counters',
        ],
        paragraphs: [
          'Young-family floor plans make hardworking storage the priority; see the <a href="/cabinets">full room catalog</a> for ideas.',
        ],
      },
      countySection('Kuna', 'ada'),
      {
        h2: 'Kuna cabinet costs and planning',
        paragraphs: [
          `Rates match the rest of the valley. Most Kuna kitchen upgrades land in the value-to-mid band; full planning ranges live in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`,
        ],
      },
      NEXT_STEPS,
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Kuna?',
        answer:
          'Yes. We design, build, and install frameless custom cabinets across Kuna, with kitchen upgrades and family storage as the most common projects.',
      },
      {
        question: 'How much do kitchen cabinets cost in Kuna?',
        answer:
          'Kuna pricing matches the valley: most kitchen packages plan from roughly $15,000 to $45,000+ depending on linear footage, door style, and accessories.',
      },
      {
        question: 'Can you upgrade builder-grade cabinets in a newer Kuna home?',
        answer:
          'Yes. Replacing 30-inch uppers and fixed shelves with 42-inch uppers, drawer bases, and a pantry wall is the signature Kuna project.',
      },
      {
        question: 'Do you install garage cabinets in Kuna?',
        answer:
          'Yes. Durable garage systems sized for tools, gear, and seasonal storage are a frequent request on Kuna lots.',
      },
      {
        question: 'Do Kuna cabinet projects need permits?',
        answer:
          'Cabinet-only replacements rarely do. Plumbing, electrical, or structural changes route through Ada County review; we flag triggers during design.',
      },
      {
        question: 'How long does a Kuna cabinet project take?',
        answer:
          'Plan 4 to 8 weeks from approved design to installed cabinets, depending on scope and finish selection.',
      },
    ],
    tags: ['kuna', 'ada county', 'cabinets', 'idaho'],
    primaryKeyword: 'custom cabinets Kuna',
  },
  {
    slug: 'star-cabinet-guide',
    cityName: 'Star',
    citySlug: 'star',
    county: 'ada',
    seoTitle: 'Star Custom Cabinet Guide | Kitchens & Built-Ins',
    metaDescription:
      'Custom cabinets in Star, Idaho: kitchens, pantries, and built-ins for new construction and acreage homes along the Highway 44 corridor.',
    excerpt:
      'Local guide to custom cabinets in Star: new construction and acreage properties, popular projects, Ada County permits, and planning ranges.',
    quickAnswer:
      'Star blends brand-new subdivisions with acreage and estate properties along the Highway 44 corridor. Cabinet projects range from first-upgrade kitchens to large pantries and shop storage. Boise Cabinet Co designs, builds, and installs custom frameless cabinets throughout Star.',
    takeaways: [
      'Star mixes new subdivisions with acreage and estate homes.',
      'Large pantries, mudrooms, and shop or garage storage suit Star lot sizes.',
      'Star is in Ada County; we deliver and install there weekly.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Star',
        paragraphs: [
          'Star has transformed from a small farm town into one of the valley\'s fastest-growing cities, yet keeps its acreage character along the river and Highway 44 corridor. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/pantry">pantries</a>, and <a href="/cabinets/built-ins">built-ins</a> for both new subdivisions and established acreage properties.',
          `For valley-wide planning, start at the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a>.`,
        ],
      },
      {
        h2: 'Star housing: new builds and acreage properties',
        paragraphs: [
          'Newer Star subdivisions follow the familiar builder-grade pattern, ready for taller uppers, drawer bases, and pantry walls. Acreage and estate homes bring different requests: oversized kitchens for entertaining, big walk-in pantries for bulk storage, and durable cabinetry for shops and outbuildings.',
          'Households that buy in bulk or process garden harvests ask for deep pantry runs and second-prep zones more often in Star than anywhere else we serve.',
        ],
      },
      {
        h2: 'Popular Star cabinet projects',
        list: [
          'Kitchen upgrades in newer subdivisions',
          'Oversized <a href="/cabinets/pantry">walk-in pantries</a> with bulk storage',
          '<a href="/cabinets/mudroom">Mudroom systems</a> built for boots, gear, and animals',
          '<a href="/cabinets/garage">Garage and shop cabinets</a> on acreage lots',
        ],
        paragraphs: [
          'Browse the <a href="/cabinets">room catalog</a> to see how these systems are configured.',
        ],
      },
      countySection('Star', 'ada'),
      {
        h2: 'Star cabinet costs and planning',
        paragraphs: [
          `Star pricing follows valley rates; lot location does not change cabinet cost. Planning bands by room live in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`,
        ],
      },
      NEXT_STEPS,
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Star?',
        answer:
          'Yes. We design, build, and install frameless custom cabinets across Star, from new subdivisions to acreage and estate properties along Highway 44.',
      },
      {
        question: 'How much do kitchen cabinets cost in Star?',
        answer:
          'Star pricing matches the rest of the valley: most kitchen packages plan from roughly $15,000 to $45,000+ depending on size, door style, and accessories.',
      },
      {
        question: 'Can you build a large walk-in pantry for an acreage home?',
        answer:
          'Yes. Deep pantry runs, bulk storage shelving, and second-prep zones are among our most requested Star projects.',
      },
      {
        question: 'Do you install cabinets in shops and outbuildings?',
        answer:
          'Yes. Durable garage and shop cabinet systems for tools and equipment are a natural fit for Star acreage lots.',
      },
      {
        question: 'Do Star cabinet projects need permits?',
        answer:
          'Cabinet-only work rarely does. Plumbing, electrical, or structural changes route through Ada County review; we flag any triggers during design.',
      },
      {
        question: 'How long does a Star cabinet project take?',
        answer:
          'Plan 4 to 8 weeks from approved design to installation. Star is inside our standard delivery area.',
      },
    ],
    tags: ['star', 'ada county', 'cabinets', 'idaho'],
    primaryKeyword: 'custom cabinets Star Idaho',
  },
  {
    slug: 'caldwell-cabinet-guide',
    cityName: 'Caldwell',
    citySlug: 'caldwell',
    county: 'canyon',
    seoTitle: 'Caldwell Custom Cabinet Guide | Kitchens & Vanities',
    metaDescription:
      'Custom cabinets in Caldwell, Idaho: kitchen upgrades for historic homes near downtown and the College of Idaho, new-build storage, and Canyon County permits.',
    excerpt:
      'Local guide to custom cabinets in Caldwell: historic housing near Indian Creek, newer subdivisions, Canyon County permitting, and planning ranges.',
    quickAnswer:
      'Caldwell pairs a revitalized Indian Creek downtown and historic College of Idaho neighborhoods with fast-growing subdivisions. Cabinet projects span careful upgrades in century-old homes to builder-grade replacements in new builds. Boise Cabinet Co serves all of Caldwell and Canyon County.',
    takeaways: [
      'Historic Caldwell homes need custom sizing for plaster walls and odd layouts.',
      'Newer subdivisions follow the standard builder-grade upgrade path.',
      'Caldwell permits run through Canyon County processes.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Caldwell',
        paragraphs: [
          'Caldwell anchors the west end of our service area. The Indian Creek downtown revival has renewed investment in the historic neighborhoods around it and the College of Idaho, while new subdivisions keep growing to the south and east. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a> and <a href="/cabinets/bathroom">vanities</a> across all of it.',
          `Start with the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a> for valley-wide context.`,
        ],
      },
      {
        h2: 'Historic Caldwell homes',
        paragraphs: [
          'Early-1900s homes near downtown and the college bring plaster walls, settling floors, and compact closed kitchens. Built-to-order boxes, scribe-fit fillers, and tall storage recover space that stock cabinets cannot, while keeping proportions that suit the home\'s character.',
        ],
      },
      {
        h2: 'Newer Caldwell subdivisions',
        paragraphs: [
          'Growth on the south and east sides mirrors the valley pattern: builder-grade kitchens ready for taller uppers, drawer bases, working islands, and pantry walls. <a href="/cabinets/laundry">Laundry</a> and <a href="/cabinets/mudroom">mudroom</a> storage typically follow as a second phase.',
        ],
      },
      countySection('Caldwell', 'canyon'),
      {
        h2: 'Caldwell cabinet costs and planning',
        paragraphs: [
          `Caldwell pricing matches valley rates; travel inside our service area is never an upcharge. Planning bands live in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`,
          'Shortlist looks in the <a href="/catalog">catalog</a> before your in-home consultation.',
        ],
      },
      NEXT_STEPS,
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Caldwell?',
        answer:
          'Yes. We design, build, and install custom cabinets throughout Caldwell, from historic homes near downtown and the College of Idaho to new subdivisions.',
      },
      {
        question: 'How much do kitchen cabinets cost in Caldwell?',
        answer:
          'Caldwell rates match the rest of the Treasure Valley: most kitchen packages plan from roughly $15,000 to $45,000+ based on linear footage, door style, and accessories.',
      },
      {
        question: 'Can you work in older Caldwell homes with plaster walls?',
        answer:
          'Yes. Built-to-order boxes and scribe-fit fillers are designed for out-of-plumb walls and settling floors common in early-1900s Caldwell homes.',
      },
      {
        question: 'Do Caldwell projects use Canyon County permits?',
        answer:
          'Yes. Caldwell routes through Canyon County and city processes, which differ from Ada County. Cabinet-only replacements usually skip permits; tied-in plumbing or electrical work needs review.',
      },
      {
        question: 'Is Caldwell inside your standard service area?',
        answer:
          'Yes. Caldwell anchors the west end of our service area and we deliver and install there at standard rates.',
      },
      {
        question: 'What Caldwell cabinet projects are most common?',
        answer:
          'Kitchen replacements lead, followed by vanities and pantry storage in newer subdivisions, and storage-recovery projects in historic homes.',
      },
    ],
    tags: ['caldwell', 'canyon county', 'cabinets', 'idaho'],
    primaryKeyword: 'custom cabinets Caldwell',
  },
  {
    slug: 'middleton-cabinet-guide',
    cityName: 'Middleton',
    citySlug: 'middleton',
    county: 'canyon',
    seoTitle: 'Middleton Custom Cabinet Guide | Kitchens & Storage',
    metaDescription:
      'Custom cabinets in Middleton, Idaho: kitchens, pantries, mudrooms, and shop storage for small-town and acreage properties in Canyon County.',
    excerpt:
      'Local guide to custom cabinets in Middleton: small-town and acreage housing, popular storage projects, Canyon County permits, and planning ranges.',
    quickAnswer:
      'Middleton keeps a small-town, acreage character while growing along the Highway 44 corridor. Cabinet projects favor hardworking kitchens, big pantries, mudrooms, and shop storage. Boise Cabinet Co designs, builds, and installs custom frameless cabinets throughout Middleton and Canyon County.',
    takeaways: [
      'Middleton favors practical, hardworking cabinetry: pantries, mudrooms, and shop storage.',
      'Acreage properties drive demand for garage and outbuilding cabinet systems.',
      'Middleton permits run through Canyon County processes.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Middleton',
        paragraphs: [
          'Middleton sits between Star and Caldwell on the Highway 44 corridor and keeps more acreage and small-town character than its neighbors. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/pantry">pantries</a>, and <a href="/cabinets/garage">garage storage</a> for Middleton homes.',
          `For valley-wide planning, start at the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a>.`,
        ],
      },
      {
        h2: 'Middleton housing: small-town lots and acreage',
        paragraphs: [
          'Housing splits between established in-town homes, newer subdivisions, and rural acreage. Families here ask for practical storage first: deep pantry runs, mudroom lockers that handle boots and animals, and laundry rooms with real folding counters.',
          'Acreage properties add shop and outbuilding cabinetry, durable boxes and finishes that stand up to tools and temperature swings.',
        ],
      },
      {
        h2: 'Popular Middleton cabinet projects',
        list: [
          'Kitchen upgrades with pantry walls and drawer bases',
          '<a href="/cabinets/mudroom">Mudroom lockers</a> sized for family and farm traffic',
          '<a href="/cabinets/laundry">Laundry cabinets</a> with folding surfaces',
          '<a href="/cabinets/garage">Garage and shop storage systems</a>',
        ],
        paragraphs: [
          'See the <a href="/cabinets">full room catalog</a> and our <a href="/construction">construction standards</a> for what goes into every box.',
        ],
      },
      countySection('Middleton', 'canyon'),
      {
        h2: 'Middleton cabinet costs and planning',
        paragraphs: [
          `Middleton pricing matches the valley; our service area covers it at standard rates. Planning bands live in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`,
        ],
      },
      NEXT_STEPS,
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Middleton?',
        answer:
          'Yes. We design, build, and install frameless custom cabinets throughout Middleton, from in-town homes to acreage properties.',
      },
      {
        question: 'How much do kitchen cabinets cost in Middleton?',
        answer:
          'Middleton rates match the rest of the Treasure Valley: most kitchen packages plan from roughly $15,000 to $45,000+ depending on size, door style, and accessories.',
      },
      {
        question: 'Do you build shop and outbuilding cabinets in Middleton?',
        answer:
          'Yes. Durable garage, shop, and outbuilding storage systems are a common request on Middleton acreage properties.',
      },
      {
        question: 'Do Middleton projects need Canyon County permits?',
        answer:
          'Cabinet-only replacements usually do not. Work involving plumbing, electrical, or structural changes routes through Canyon County review, which we handle.',
      },
      {
        question: 'Is Middleton inside your standard service area?',
        answer:
          'Yes. Middleton is one of the eight Treasure Valley cities we serve at standard delivery and installation rates.',
      },
      {
        question: 'How long does a Middleton cabinet project take?',
        answer:
          'Plan 4 to 8 weeks from approved design to installed cabinets, depending on scope and finish selections.',
      },
    ],
    tags: ['middleton', 'canyon county', 'cabinets', 'idaho'],
    primaryKeyword: 'custom cabinets Middleton',
  },
];

export const CITY_CABINET_GUIDES: GuidePageData[] = CITY_GUIDE_SPECS.map((spec) => ({
  slug: spec.slug,
  title: `${spec.cityName} Custom Cabinet Guide`,
  seoTitle: spec.seoTitle,
  metaDescription: spec.metaDescription,
  excerpt: spec.excerpt,
  content: buildSectionsHtml(spec.sections),
  author: 'Boise Cabinet Co',
  hubSlug: 'local-guides',
  guideType: 'location',
  tags: spec.tags,
  publishedAt: '2026-06-10',
  quickAnswer: spec.quickAnswer,
  keyTakeaways: spec.takeaways,
  faqs: spec.faqs,
  linkedCities: [spec.citySlug],
  relatedLinks: [
    { url: '/guides/treasure-valley-cabinet-guide' },
    { url: '/guides/boise-cabinet-cost-guide' },
    { url: '/cabinets/kitchen' },
    { url: '/cabinets/bathroom' },
    { url: '/estimate' },
    { url: '/contact' },
  ],
  primaryKeyword: spec.primaryKeyword,
}));
