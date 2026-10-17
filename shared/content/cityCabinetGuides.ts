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
      'Meridian is home base for Boise Cabinet Co. Most of our work here upgrades the builder-grade kitchens that went into the city\'s 1990s-to-2010s subdivisions with custom islands, pantry storage and mudroom drop zones, and the typical Meridian house dates to about 2007 (Census ACS 2020–2024). We design, build and install frameless custom cabinets in every Meridian subdivision.',
    takeaways: [
      'Builder-grade kitchen upgrades are the most common Meridian project.',
      'Mudroom lockers and pantry systems suit garage-entry floor plans.',
      'Meridian is in Ada County; cabinet-only projects rarely need permits.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Meridian, our home city',
        paragraphs: [
          `Boise Cabinet Co is headquartered in Meridian, so most of our team measures, delivers, and installs here weekly. We build frameless custom <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/bathroom">bathroom vanities</a>, and <a href="/cabinets/built-ins">built-in storage</a> for homes across the city. For the bigger picture across Ada and Canyon counties, the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a> covers valley-wide context; this page sticks to Meridian.`,
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
      {
        h2: 'Permits for Meridian cabinet projects',
        paragraphs: [
          'Inside Meridian city limits, permits come from the City of Meridian\'s Building Services at 33 E. Broadway Ave., which takes applications through its Citizen Access portal. A property outside city limits follows the county process instead, so check the jurisdiction for the actual address before applying. The city\'s own handout lists painting, papering, tiling, carpeting, cabinets, counter tops and similar finish work as exempt from permits. Replacing cabinets is one job; relocating plumbing, electrical or walls is a different scope, with its own permits, fees, inspection steps and review timing, so settle which ones apply before anything is torn out. The <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> lays out the order.',
        ],
      },
      {
        h2: 'Meridian cabinet costs and planning',
        paragraphs: [
          `Being local doesn't change Meridian material or labor rates; they're the same across the valley. Kitchen packages here commonly plan from about $15,000 to $45,000 and up, with linear footage, door style and accessories deciding where you land, which works out to roughly $450 to $900 per linear foot on our planning figures. Every band is in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>. Looking through door styles and finishes in the <a href="/catalog">catalog</a> before the consultation makes selections go faster.`,
        ],
      },
      {
        h2: 'Next steps',
        paragraphs: [
          'From here you can <a href="/contact">book a free design consultation</a>, <a href="/cabinets">look through cabinets room by room</a>, or open the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.',
        ],
      },
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
          'Meridian prices are Treasure Valley prices. Most kitchen cabinet packages here fall somewhere from about $15,000 to $45,000+, and the spread comes from linear footage, door style and accessories.',
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
          'Usually 4 to 8 weeks after design approval. Since we\'re based in Meridian, delivery and installation here tend to land on the calendar sooner than anywhere else in our service area.',
      },
      {
        question: 'Do you build mudroom and pantry storage in Meridian?',
        answer:
          'Yes. Mudroom lockers, drop zones, and pantry walls are the second most requested Meridian project after kitchens, especially in garage-entry floor plans.',
      },
      {
        question: 'How new are Meridian homes?',
        answer:
          'Mostly 2000s and newer. Census ACS 2020–2024 estimates show about 40% of Meridian homes built in 2010 or later and only about 7% before 1980. Those are the builder-grade kitchens, often with stock heights and basic shelving, that make up most of our Meridian upgrades.',
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
      'Eagle projects run bigger and more finish-driven than anywhere else in the valley: estate kitchens, butler pantries, paneled appliances and whole-home cabinet programs. Census figures (ACS 2020–2024) show Eagle is overwhelmingly owner-occupied, single-family housing. Boise Cabinet Co builds frameless custom cabinetry for those homes, including HOA communities with architectural review.',
    takeaways: [
      'Eagle kitchens favor premium finishes, paneled appliances, and butler pantries.',
      'HOA communities like the Foothills add review time; plan early.',
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
          'BanBury, Legacy, Two Rivers, and Eagle Foothills span custom estates to executive subdivisions. Ten-foot ceilings, oversized islands, and open great rooms are common, which means taller uppers, stacked cabinets, and furniture-grade end panels.',
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
          'The Foothills and several BanBury-area HOAs review exterior-visible work. Interior cabinetry is normally exempt, but outdoor kitchens and garage-facing cabinetry can trigger review. We build review time into the schedule from day one.',
        ],
      },
      {
        h2: 'Permits for Eagle cabinet projects',
        paragraphs: [
          'Eagle\'s Building Division handles permits inside city limits, while property outside them follows the county process, so before you apply, make sure you know which office covers the address. The city builds to the 2018 International Residential Code, and its posted plan review turnaround for residential applications such as additions is 6 weeks, assuming no revisions, so a cabinet job that grows into moving walls needs that time in the plan. Swapping out cabinets is one scope; moving plumbing, electrical or walls is another, and the permits you need, with their fees, inspections and timelines, follow from the work itself. Settle which ones apply before demolition; the <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> shows the order.',
        ],
      },
      {
        h2: 'Eagle cabinet costs and planning',
        paragraphs: [
          `Eagle budgets skew higher because of finish level and scale, not labor rates. Luxury kitchens commonly exceed the valley-typical band; planning detail lives in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a> and our luxury cost article on the <a href="/blog/luxury-custom-cabinet-cost-boise">blog</a>.`,
        ],
      },
      {
        h2: 'Next steps',
        paragraphs: [
          'Choose a starting point: a <a href="/contact">free design consultation</a>, the <a href="/cabinets">room-by-room cabinet pages</a>, or the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Eagle?',
        answer:
          'Yes. Frameless custom cabinets for Eagle homes are something we design, build, and install across the city, including BanBury, Legacy, Two Rivers, and Eagle Foothills.',
      },
      {
        question: 'How much do luxury kitchen cabinets cost in Eagle?',
        answer:
          'Eagle kitchens often exceed the valley-typical $15,000 to $45,000 band because of scale and finish tier. Paneled appliances, stacked uppers, and premium finishes drive the difference more than location.',
      },
      {
        question: 'Do Eagle HOAs review cabinet projects?',
        answer:
          'Interior cabinetry is normally exempt, but outdoor kitchens and exterior-visible work in communities like the Foothills can trigger architectural review. We plan for it from day one.',
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
          'For most Eagle work, count on 4 to 8 weeks after you approve the design. Big whole-home programs and HOA review can push that out.',
      },
      {
        question: 'How new is Eagle\'s housing?',
        answer:
          'Fairly new. Eagle\'s median home was built in 2007, and about 43% are from 2010 or later (ACS 2020–2024). Taller ceilings and open great rooms are common in that stock, which is why stacked uppers and furniture-grade end panels show up so often in our Eagle designs.',
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
      'Nampa has historic bungalows near downtown and subdivisions that keep spreading, so cabinet work here runs from clever small-kitchen layouts to full builder-grade replacements. Roughly a quarter of Nampa homes predate 1980, by Census ACS 2020–2024 estimates. We design, build and install custom cabinets across Nampa and the rest of Canyon County.',
    takeaways: [
      'Older Nampa bungalows reward custom widths and tall storage in compact kitchens.',
      'Newer subdivisions follow the builder-grade upgrade path common across the valley.',
      'Confirm whether your property is within Nampa city limits or unincorporated Canyon County before applying for permits.',
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
      {
        h2: 'Permits for Nampa cabinet projects',
        paragraphs: [
          'If the property is inside Nampa city limits, the city\'s building department is where permits start (<a href="https://www.cityofnampa.us/428/Residential-Permit-Applications">official Nampa permit guidance</a>); outside city limits the county process applies, so confirm the jurisdiction first. Nampa\'s residential FAQ lists cabinets and counter tops, along with painting, floor covering and wall coverings, as exempt interior work, which makes a cabinet swap a different scope from a layout change. You\'ll need a permit once the project strips drywall to the framing, puts up a new wall of any kind, or moves a sink, tub, shower or toilet. Which building and trade permits apply, and what they cost and require, depends on the work and the address, so pin it down before demolition. The <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> walks through the steps.',
        ],
      },
      {
        h2: 'Nampa cabinet costs and planning',
        paragraphs: [
          `Nampa labor and material rates are the same as the rest of the valley; your number comes from finish tier and linear footage. The <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a> has the planning ranges. On value-focused jobs, a mid-tier matte finish paired with drawer-base upgrades where they count goes a long way. Compare options in the <a href="/catalog">catalog</a>.`,
        ],
      },
      {
        h2: 'Next steps',
        paragraphs: [
          'When you\'re ready, <a href="/contact">book a free design consultation</a>, <a href="/cabinets">shop cabinets by room</a>, or check the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Nampa?',
        answer:
          'Yes. We design, build, and install custom cabinets all over Nampa, in historic homes near downtown and in the newer subdivisions of south and west Nampa.',
      },
      {
        question: 'How much do kitchen cabinets cost in Nampa?',
        answer:
          'Nampa pays Treasure Valley rates. A typical kitchen package plans at about $15,000 to $45,000+, and what sets it is linear footage, door style and accessories, not zip code.',
      },
      {
        question: 'Can you fit cabinets in an older Nampa bungalow kitchen?',
        answer:
          'Yes. Custom widths, tall pantry units, and scribe-fit fillers are exactly what compact, out-of-plumb older kitchens need. We measure on site and build to your walls.',
      },
      {
        question: 'Do Nampa cabinet projects need Canyon County permits?',
        answer:
          'Cabinet-only replacements usually don\'t. Moving plumbing or electrical sends the work to permit review, which the City of Nampa handles for in-town addresses and Canyon County handles elsewhere, and Canyon County\'s portals and cadence differ from Ada County\'s. We take care of it.',
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
      {
        question: 'How old are Nampa homes?',
        answer:
          'All ages. Nampa\'s median home dates to 2000, with about 15% built before 1960 and about 22% built in 2010 or later (ACS 2020–2024). That spread is why one Nampa week can include a bungalow galley kitchen and a builder-grade island replacement.',
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
      'Kuna has been one of Idaho\'s fastest-growing cities, and its houses show it: about three in four were built in 2000 or later, a Census ACS 2020–2024 estimate, most with builder-grade cabinet packages. Kitchen upgrades, pantry walls, and mudroom and garage storage are what Kuna families ask us for most. Boise Cabinet Co builds and installs custom frameless cabinets all over Kuna.',
    takeaways: [
      'Most Kuna homes are newer builds with stock cabinet packages ready for upgrades.',
      'Family storage, mudrooms, pantries, and garages, is the signature Kuna request.',
      'Kuna is in Ada County; cabinet-only projects rarely need permits.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Kuna',
        paragraphs: [
          `Kuna has grown faster than almost anywhere in the valley, and most of its housing stock is under 20 years old. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/pantry">pantry systems</a>, and <a href="/cabinets/garage">garage storage</a> for Kuna families. Planning that applies everywhere in the valley sits on the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a>.`,
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
      {
        h2: 'Permits for Kuna cabinet projects',
        paragraphs: [
          'Kuna has its own Building Department at 751 W. 4th St., which handles permits for property inside city limits; land outside them follows the county process, so check which one covers your address before you apply. A straight cabinet swap and a project that relocates plumbing, electrical or walls are different scopes. If a sink moves, for example, Kuna\'s fee schedule charges $65 for a plumbing permit on an existing home, with $10 added per extra fixture, and residential building submittals carry a $70 fee. The specific permits, costs, inspections and timelines hinge on the scope, so confirm them with the city before demolition. Our <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> covers the sequence.',
        ],
      },
      {
        h2: 'Kuna cabinet costs and planning',
        paragraphs: [
          `Kuna pays the same rates as the rest of the valley, and most kitchen upgrades here fall in the value-to-mid band. The <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a> has the full planning ranges.`,
        ],
      },
      {
        h2: 'Next steps',
        paragraphs: [
          'Ready to move? <a href="/contact">Schedule your free design consultation</a>, <a href="/cabinets">see cabinets organized by room</a>, or read the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Kuna?',
        answer:
          'Yes. Frameless custom cabinets go into Kuna homes all the time; we design, build, and install them, mostly for kitchen upgrades and family storage.',
      },
      {
        question: 'How much do kitchen cabinets cost in Kuna?',
        answer:
          'The same as anywhere in the valley. For most Kuna kitchens, a cabinet package plans in the $15,000 to $45,000+ range, set by linear footage, door style and accessories.',
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
          'Cabinet-only replacements rarely do. Plumbing, electrical or structural changes need permit review, by the City of Kuna for addresses in town and by Ada County beyond city limits, and we point out those triggers during design.',
      },
      {
        question: 'How long does a Kuna cabinet project take?',
        answer:
          'Expect 4 to 8 weeks between design approval and installed cabinets; scope and finish selection decide where in that window you fall.',
      },
      {
        question: 'How new are Kuna\'s homes?',
        answer:
          'Very. Kuna\'s median home was built in 2008; about 43% date from 2010 or later and about 15% from 2020 or later (ACS 2020–2024). About 92% are single-family detached houses, which is why builder-package kitchens and garage storage dominate our Kuna work.',
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
      'Star mixes brand-new subdivisions with acreage and estate properties along Highway 44, and more than half its homes were built in 2010 or later (Census ACS 2020–2024). Projects run from a first kitchen upgrade to oversized pantries and shop storage, all of them custom frameless cabinets that we design, build and install ourselves across Star.',
    takeaways: [
      'Star mixes new subdivisions with acreage and estate homes.',
      'Large pantries, mudrooms, and shop or garage storage suit Star lot sizes.',
      'Star is in Ada County; we deliver and install there weekly.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Star',
        paragraphs: [
          `Star has transformed from a small farm town into one of the valley's fastest-growing cities, yet keeps its acreage character along the river and Highway 44 corridor. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/pantry">pantries</a>, and <a href="/cabinets/built-ins">built-ins</a> for both new subdivisions and established acreage properties. If you're planning across the whole valley, the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a> is the better starting point.`,
        ],
      },
      {
        h2: 'Star housing: new builds and acreage properties',
        paragraphs: [
          'Newer Star subdivisions follow the familiar builder-grade pattern, ready for taller uppers, drawer bases, and pantry walls. Acreage and estate homes bring different requests: oversized kitchens for entertaining, big walk-in pantries for bulk storage, and durable cabinetry for shops and outbuildings. Households that buy in bulk or put up garden harvests ask us for deep pantry runs and a second prep zone, and that request comes up in Star more than in any other city we serve.',
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
      {
        h2: 'Permits for Star cabinet projects',
        paragraphs: [
          'Property inside Star city limits is permitted by the City of Star\'s Building Department (<a href="https://www.staridaho.org/1243/Building-Department">official Star permit guidance</a>); unincorporated land follows the county process, and the city\'s FAQ notes that the Ada County Assessor\'s website shows its boundaries. Which building and trade permits you need depends on the work. Star\'s FAQ lists small residential projects at about 2 to 4 weeks of review, issues mechanical, electrical and plumbing permits the same day the related building permit is approved, and requires contractors to hold a current Idaho license to apply. Confirm fees, inspections and current review times for the exact address. Replacing cabinets is one scope and moving plumbing, electrical or walls is another, so pin down the permits before demolition. The <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> has the planning order.',
        ],
      },
      {
        h2: 'Star cabinet costs and planning',
        paragraphs: [
          `Cabinet pricing in Star follows valley rates, and being on acreage or in a subdivision doesn't change it. The <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a> lists planning bands room by room.`,
        ],
      },
      {
        h2: 'Next steps',
        paragraphs: [
          '<a href="/contact">Set up a free design consultation</a>, <a href="/cabinets">browse the catalog room by room</a>, or start with the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Star?',
        answer:
          'Yes. Across Star, from new subdivisions to acreage and estate properties along Highway 44, we take frameless custom cabinets from design through build and installation.',
      },
      {
        question: 'How much do kitchen cabinets cost in Star?',
        answer:
          'Close to the valley norm. Most Star kitchen packages plan around $15,000 to $45,000+; size, door style and accessories make the difference.',
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
          'Usually not for cabinet-only work. Plumbing, electrical or structural changes go through permit review, handled by Star\'s own building department in town and by Ada County outside it, and we flag any triggers while designing.',
      },
      {
        question: 'How long does a Star cabinet project take?',
        answer:
          'From approved design to installation, plan on 4 to 8 weeks. Star sits inside our standard delivery area.',
      },
      {
        question: 'Which county is Star in?',
        answer:
          'Mostly Ada. By Census TIGER boundaries, about 83 percent of Star\'s land area is in Ada County with the remainder in Canyon, so a Star address can fall in either. Inside city limits, permits still go through the City of Star either way.',
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
      'Caldwell pairs a revitalized downtown along Indian Creek and the historic neighborhoods around the College of Idaho with fast-growing subdivisions. Cabinet projects range from careful upgrades in century-old houses to builder-grade replacements in new ones, and roughly one Caldwell home in seven predates 1960 (Census ACS 2020–2024). Boise Cabinet Co serves all of Caldwell and Canyon County.',
    takeaways: [
      'Historic Caldwell homes need custom sizing for plaster walls and odd layouts.',
      'Newer subdivisions follow the standard builder-grade upgrade path.',
      'Caldwell permits run through Canyon County processes.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Caldwell',
        paragraphs: [
          `Caldwell anchors the west end of our service area. The Indian Creek downtown revival has renewed investment in the historic neighborhoods around it and the College of Idaho, while new subdivisions keep growing to the south and east. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a> and <a href="/cabinets/bathroom">vanities</a> across all of it. If you're comparing cities, the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a> has the valley-wide view.`,
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
      {
        h2: 'Permits for Caldwell cabinet projects',
        paragraphs: [
          'Inside Caldwell city limits, permits go through the City of Caldwell\'s building department; unincorporated parcels follow the county process, so confirm which applies to your address first. The city\'s permit packet for homes splits electrical, plumbing and mechanical work into their own permits, separate from the building permit, and says residential review typically takes 5 to 7 working days. A cabinet swap is a different scope from moving plumbing, electrical or walls, so confirm the permits, fees, inspections and current review times that apply before any demolition. The <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> explains the sequence.',
        ],
      },
      {
        h2: 'Caldwell cabinet costs and planning',
        paragraphs: [
          `Caldwell pricing is valley pricing, and travel inside our service area never adds an upcharge. You'll find planning bands in the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>. Shortlist looks in the <a href="/catalog">catalog</a> ahead of your in-home consultation.`,
        ],
      },
      {
        h2: 'Next steps',
        paragraphs: [
          'Two clicks from here: <a href="/contact">a free design consultation</a>, <a href="/cabinets">cabinets sorted by room</a>, or the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Caldwell?',
        answer:
          'Yes. Throughout Caldwell, from historic homes near downtown and the College of Idaho to new subdivisions, we design, build, and install custom cabinets.',
      },
      {
        question: 'How much do kitchen cabinets cost in Caldwell?',
        answer:
          'Treasure Valley rates apply here too. A typical Caldwell kitchen package plans from roughly $15,000 to $45,000+, and linear footage, door style and accessories set the figure.',
      },
      {
        question: 'Can you work in older Caldwell homes with plaster walls?',
        answer:
          'Yes. Our scribe-fit fillers and built-to-order boxes are made for the out-of-plumb walls and settling floors that early-1900s Caldwell houses tend to have.',
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
      {
        question: 'How old is Caldwell\'s housing?',
        answer:
          'Mixed. Caldwell\'s median home dates to 2003, yet close to three in ten were built before 1980, going by Census ACS 2020–2024 numbers. Older houses near downtown and newer subdivisions on the south and east sides call for very different cabinet plans, and we scope each one on site.',
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
      'Middleton is growing along the Highway 44 corridor without losing its small-town, acreage feel, and about 90% of its homes are owner-occupied (Census ACS 2020–2024). Cabinet requests lean practical: hardworking kitchens, big pantries, mudrooms and shop storage. Our team designs, builds and installs custom frameless cabinets in Middleton and across Canyon County.',
    takeaways: [
      'Middleton favors practical, hardworking cabinetry: pantries, mudrooms, and shop storage.',
      'Acreage properties drive demand for garage and outbuilding cabinet systems.',
      'Middleton permits run through Canyon County processes.',
    ],
    sections: [
      {
        h2: 'Custom cabinets in Middleton',
        paragraphs: [
          `Middleton sits between Star and Caldwell on the Highway 44 corridor and keeps more acreage and small-town character than its neighbors. We build frameless <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/pantry">pantries</a>, and <a href="/cabinets/garage">garage storage</a> for Middleton homes. Advice that applies valley-wide lives on the <a href="${PILLAR_TV}">Treasure Valley cabinet hub</a>.`,
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
      {
        h2: 'Permits for Middleton cabinet projects',
        paragraphs: [
          'Within Middleton city limits, permits come from the city\'s Building Department, which runs applications through an online Citizenserve portal (<a href="https://middleton.id.gov/">official Middleton permit guidance</a>). If you\'re not sure a parcel is in town, the city points to the county assessor\'s online map; unincorporated land follows the county process. Under section 4-1-1 of Middleton\'s code, a cabinet replacement that leaves plumbing and electrical alone is exempt. Relocating plumbing, electrical or walls is a separate scope that can need building and trade permits, and the code also requires a demolition permit when part of a structure is torn out. Confirm fees, inspections and review times for the actual address before demolition, and see the <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> for the sequence.',
        ],
      },
      {
        h2: 'Middleton cabinet costs and planning',
        paragraphs: [
          `Middleton is priced like the rest of the valley, and it's inside our service area at standard rates. For planning bands, see the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>.`,
        ],
      },
      {
        h2: 'Next steps',
        paragraphs: [
          'Next, <a href="/contact">request a free design consultation</a>, <a href="/cabinets">explore cabinets by room</a>, or review the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do you build custom cabinets in Middleton?',
        answer:
          'Yes. From in-town houses to acreage properties, we handle Middleton cabinet projects start to finish: frameless custom boxes we design, build, and install.',
      },
      {
        question: 'How much do kitchen cabinets cost in Middleton?',
        answer:
          'About what it costs elsewhere in the Treasure Valley. Most Middleton kitchen packages plan at roughly $15,000 to $45,000+, driven by size, door style and accessories.',
      },
      {
        question: 'Do you build shop and outbuilding cabinets in Middleton?',
        answer:
          'Yes. Durable garage, shop, and outbuilding storage systems are a common request on Middleton acreage properties.',
      },
      {
        question: 'Do Middleton projects need Canyon County permits?',
        answer:
          'Cabinet-only replacements usually don\'t need one. Plumbing, electrical or structural changes need review, from Middleton\'s Building Department in town or from Canyon County on unincorporated land, and we handle it.',
      },
      {
        question: 'Is Middleton inside your standard service area?',
        answer:
          'Yes. Middleton is one of the eight Treasure Valley cities we serve at standard delivery and installation rates.',
      },
      {
        question: 'How long does a Middleton cabinet project take?',
        answer:
          'Allow 4 to 8 weeks between an approved design and installation in Middleton, depending on scope and finish selections.',
      },
      {
        question: 'How new are Middleton homes?',
        answer:
          'Newer than most. The median Middleton home dates to 2009 in Census ACS 2020–2024 estimates, and nearly half were built from 2010 on. Plenty of those kitchens still have their first builder cabinets, which is where most Middleton projects start.',
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
