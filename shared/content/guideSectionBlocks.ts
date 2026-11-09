import { CITIES_LIST, PILLAR_COST, type ContentSection } from './wave1/snippets';
import { getClustersForHub } from '../contentHubs';
import { LEAD_TIME_LINE } from './bot05PageCopy';
import { CABINET_WORKMANSHIP_WARRANTY } from '../claims';

/** Compact essentials, link out for valley-wide permit/cost depth. */
export function pillarEssentialsSection(topic: string): ContentSection {
  const t = topic.toLowerCase();
  return {
    h2: 'Planning essentials',
    paragraphs: [
      `Budget, layout, and selections drive ${t} timelines in ${CITIES_LIST}, not a single sticker price.`,
      `Use the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a> for ranges, the <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley guide</a> for local context, and the <a href="/guides/cabinet-project-process-guide">cabinet process guide</a> for milestones.`,
    ],
    list: [
      'Hold 5 to 10% contingency for field adjustments',
      'Lock layout before cabinet fabrication',
      'Match quotes with identical line, finish, and install scope',
    ],
  };
}

export function hubTopicSections(hubSlug: string, topic: string): ContentSection[] {
  const t = topic.toLowerCase();
  const legacyHub: Record<string, string> = {
    'kitchen-cabinets': 'kitchen-cabinets',
    'bathroom-vanities': 'bathroom-vanities',
    'built-ins-storage': 'built-ins-storage',
    'whole-home-cabinetry': 'whole-home-cabinetry',
    'choosing-cabinet-company': 'choosing-cabinet-company',
    'cabinet-project-process': 'cabinet-project-process',
    'cabinet-roi': 'cabinet-roi',
  };
  const resolved = legacyHub[hubSlug] ?? hubSlug;
  switch (resolved) {
    case 'kitchen-cabinets':
      return [
        {
          h2: 'Kitchen layouts that work in Boise homes',
          paragraphs: [
            'Ranches, split-levels, and 1990s subdivisions each have different wall and panel constraints. Opening a kitchen often means beams, Ada County sheets, and revised electrical, not just cabinetry. That is a full remodel, which our sister company Boise Remodeling Co handles: see <a href="https://boiseremodeling.co/services/kitchen-remodel">kitchen remodeling in Boise</a>. We build and install the cabinets inside it.',
            '<a href="/blog/kitchen-cabinet-organization-ideas">Kitchen cabinet organization</a> · <a href="/blog/kitchen-island-design-guide">Kitchen island cabinets</a>.',
          ],
        },
        {
          h2: 'Cabinets, islands, and appliance planning',
          paragraphs: [
            'Order cabinets at design lock; lead times often exceed eight weeks. Islands need clearance for dishwasher swings and walkways, not just catalog depth.',
            'Appliances are usually client-supplied; we coordinate rough-in. Budget suites separately, often $8,000–$35,000 for a full kitchen in 2026.',
          ],
        },
        {
          h2: 'Door styles and finishes from our catalog',
          paragraphs: [
            'These door profiles and finishes are the same options shown in Design Studio and your client portal:',
            '[[catalog door modern-shaker]]',
            '[[catalog finish woodgrain-canyon-oak]]',
          ],
        },
        {
          h2: 'Typical kitchen timeline',
          table: {
            className: 'timeline-table',
            headers: ['Phase', 'Duration'],
            rows: [
              ['Design & selections', '4–10 weeks'],
              ['Permits (layout/MEP)', '2–8 weeks'],
              ['Construction', '8–16 weeks'],
            ],
          },
          paragraphs: [
            '<a href="/blog/kitchen-cabinet-timeline-boise">Kitchen cabinet timeline</a> · <a href="/blog/custom-kitchen-cabinet-cost">Kitchen cabinet cost in Boise</a>.',
          ],
        },
      ];
    case 'bathroom-vanities':
      return [
        {
          h2: 'Guest bath vs master bath scope',
          paragraphs: [
            'Guest refreshes and master suites should not share one budget, waterproofing, layout, and fixture level differ dramatically in Treasure Valley homes.',
          ],
        },
        {
          h2: 'Showers, curbless design, and inspections',
          paragraphs: [
            'Walk-in and curbless showers need slope, drain, and liner systems that pass inspection before tile.',
            '<a href="/cabinets/bathroom">Bathroom vanity catalog</a> · <a href="/blog/bathroom-vanity-layout-guide">Vanity layout guide</a>.',
          ],
        },
        {
          h2: 'Aging-in-place without institutional design',
          paragraphs: [
            'Comfort-height vanities, blocking for grab bars, and wider doorways can look residential, common on the Boise Bench and in North End updates.',
            '<a href="/blog/accessible-bathroom-vanity-guide">Accessible vanity design</a>.',
          ],
        },
      ];
    case 'built-ins-storage':
      // Rewritten in Phase 4: this pillar used to render a home-addition
      // template (setbacks, second stories, a 3 to 9 month build table).
      // Every fact below comes from the room pages, the process steps and
      // the catalog copy already on the site.
      return [
        {
          h2: 'Which rooms get built-in cabinets?',
          paragraphs: [
            'Built-in cabinets cover the rooms beyond the kitchen. Each one has its own page with sizes, storage ideas, and planning notes:',
          ],
          list: [
            '<a href="/cabinets/mudroom">Mudroom cabinets</a>: bench seating, boot storage, coat cubbies, and locker systems',
            '<a href="/cabinets/laundry">Laundry room cabinets</a>: folding surfaces, pull-out hampers, and upper storage over full-size machines',
            '<a href="/cabinets/home-office">Home office cabinets</a>: built-in desks, file drawers, and shelving that hides cables and printers',
            '<a href="/cabinets/entertainment">Entertainment center cabinets</a>: media centers and fireplace surrounds with wire management and ventilation for AV gear',
            '<a href="/cabinets/built-ins">Built-in cabinets</a>: window seats, bookcases, and benches',
            '<a href="/cabinets/closet">Closet cabinets</a>: reach-in and walk-in systems with double-hang sections and shoe towers',
            '<a href="/cabinets/pantry">Pantry cabinets</a>: walk-in and tall pantry storage with pull-out access',
            '<a href="/cabinets/bedroom">Bedroom cabinets</a>: dresser bases, wardrobe towers, and nightstands',
          ],
        },
        {
          h2: 'How do built-ins fit walls that are not square?',
          paragraphs: [
            'Built-ins are sized on site, not from a catalog grid. We measure the room, draw the cabinets to those measurements, then level and scribe them to your walls at installation so gaps stay tight. That matters most in older Treasure Valley homes, where walls are often out of plumb.',
            'Every door style is available on every cabinet we build, so a mudroom, office, or bookcase wall can match the kitchen and baths. See the <a href="/catalog">cabinet catalog</a> for the door styles and finishes.',
          ],
        },
        {
          h2: 'Garage and outdoor cabinets need different materials',
          paragraphs: [
            'Treasure Valley garages swing from freezing cold to summer heat, so garage cabinets use durable finishes over plywood or melamine boxes. Covered patio kitchens need weather-rated cabinet boxes and stainless hardware rather than indoor materials.',
            '<a href="/cabinets/garage">Garage cabinets</a> · <a href="/cabinets/outdoor">Outdoor kitchen cabinets</a> · <a href="/blog/outdoor-kitchen-cabinets-boise">Outdoor kitchen cabinets in Boise</a>.',
          ],
        },
        {
          h2: 'Built-in cabinet timeline',
          table: {
            className: 'timeline-table',
            headers: ['Step', 'What happens'],
            rows: [
              ['Free design consultation', 'A 60 to 90 minute in-home visit to walk the room and talk through what you need to store'],
              ['Layout and selections', 'Drawings, door style, finish, and hardware, settled before anything is ordered'],
              ['Approval and deposit', 'A written proposal with drawings; payment follows the schedule in your signed agreement'],
              ['Built to order', LEAD_TIME_LINE],
              ['Delivery and install', `Our team or a qualified installation partner we manage delivers, levels, and scribes the cabinets and walks the job with you. ${CABINET_WORKMANSHIP_WARRANTY}.`],
            ],
          },
          paragraphs: [
            'See the <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> for each step in detail.',
          ],
        },
      ];
    case 'whole-home-cabinetry':
      // Rewritten in Phase 4: the old sections ("Living through construction",
      // "When contingency matters most", structural and HVAC sequencing) were
      // remodel-generic. These come from the whole-home cluster answers, the
      // cost guide FAQs, and the process copy already on the site.
      return [
        {
          h2: 'How to sequence a whole-home cabinet program',
          paragraphs: [
            'Plan every room\'s layout first, then choose one door style and one finish family for the whole house before any order goes in. Rooms ordered apart can drift in finish, door style, and quality; one written selections schedule keeps the kitchen, baths, laundry, mudroom, and built-ins matched.',
            '<a href="/guides/boise-cabinet-cost-guide">Whole-home cabinet cost</a>.',
          ],
        },
        {
          h2: 'Can you phase rooms and still match?',
          paragraphs: [
            'Yes. Many households install the kitchen first and the baths or built-ins later. A whole-home plan with the finish schedule written down is what keeps a later room matching the first one.',
            `A whole-home timeline covers design, field measurement, selection approval, production, delivery, and installation, with dates tied to approved drawings rather than one generic lead time. ${LEAD_TIME_LINE} Plan room-by-room access so an unfinished space does not block the next trade.`,
          ],
        },
        {
          h2: 'Living at home during installation',
          paragraphs: [
            'You can often stay home while cabinets go in, but plan for noise, dust, delivery access, and a stretch without kitchen or bathroom storage. Ask which rooms stay usable and when water or power must be shut off, and agree on daily cleanup and a temporary food-preparation area before removal starts.',
            '<a href="/blog/living-through-cabinet-installation">Living through cabinet installation</a>.',
          ],
        },
      ];
    case 'choosing-cabinet-company':
      return [
        {
          h2: 'Align scope before price',
          paragraphs: [
            'Demolition, haul-off, permits, engineering, and allowances must match across bids. Ask who owns communication during installation.',
          ],
        },
        {
          h2: 'Vetting questions for Boise-area contractors',
          list: [
            'Written scope and change-order terms',
            'Ada or Canyon permit experience on your address',
            'cabinet design and installation vs separate designer and GC',
            'Insurance, license, and reference checks',
            'Warranty language at closeout',
          ],
          paragraphs: [],
        },
        {
          h2: 'Red flags to avoid',
          paragraphs: [
            'Bait pricing, verbal-only scope, and teams that cannot explain jurisdiction for your lot.',
          ],
        },
      ];
    case 'cabinet-project-process':
      return [
        {
          h2: 'cabinet design and installation milestones',
          paragraphs: [
            'Consultation → preliminary scope → design development → agreement → permits → construction → punch list → warranty walkthrough.',
          ],
        },
        {
          h2: 'Permits and selections order',
          paragraphs: [
            'Submit permits when layout is stable; order long-lead items after rough-in requirements are known.',
            '<a href="/warranty">Cabinet warranty</a> · <a href="/services/cabinet-installation">Cabinet installation</a>.',
          ],
        },
        {
          h2: 'Inspections and closeout',
          paragraphs: [
            'Failed rough inspections should be cleared before cover-up. Punch lists belong in writing before final payment.',
          ],
        },
      ];
    case 'cabinet-roi':
      return [
        {
          h2: 'Match comps on your street',
          paragraphs: [
            'Boise and Meridian resale math depends on subdivision comps, not broad regional averages. Avoid finishing above the street.',
          ],
        },
        {
          h2: 'Pre-sale vs long-term living',
          paragraphs: [
            'Pre-sale updates should mirror buyer expectations. Long-term owners may accept lower resale payback for layout and comfort wins.',
            '<a href="/blog/kitchen-cabinet-roi-boise">Kitchen cabinet ROI</a> · <a href="/blog/cabinet-upgrades-before-selling">Cabinet upgrades before selling</a>.',
          ],
        },
        {
          h2: 'Projects with mixed return',
          paragraphs: [
            'Energy upgrades and outdoor living return varies by buyer pool, prioritize what you will enjoy if payback is uncertain.',
          ],
        },
      ];
    case 'outdoor-living':
      return [
        {
          h2: 'Utilities before hardscape',
          paragraphs: [
            'Outdoor kitchens need gas, electric, and drainage resolved before pavers or concrete. Covered structures tied to the home may need structural permits.',
          ],
        },
        {
          h2: 'Idaho seasons and scheduling',
          paragraphs: [
            'Book exterior concrete and masonry in stable weather windows; plan winter pauses for outdoor kitchens in use.',
            '<a href="/cabinets/outdoor">Decks vs patios</a> · <a href="/blog/outdoor-kitchen-cabinets-boise">Outdoor kitchens</a>.',
          ],
        },
        {
          h2: 'Coordinate with indoor cabinet projects',
          paragraphs: [
            'Shared utilities and traffic flow are easier when indoor kitchen or addition scope is planned together with outdoor entertaining.',
          ],
        },
      ];
    default:
      return [
        {
          h2: `Key topics for ${t}`,
          paragraphs: [
            `Use the articles linked below and our <a href="${PILLAR_COST}">cost guide</a> for Treasure Valley-specific planning.`,
          ],
        },
      ];
  }
}

export function clusterLinksSection(hubSlug: string, linkedSlugs?: string[]): ContentSection | null {
  const clusters = getClustersForHub(hubSlug, true);
  const slugs = linkedSlugs?.length ? new Set(linkedSlugs) : null;
  const items = clusters
    .filter((c) => !slugs || slugs.has(c.slug))
    .slice(0, 8)
    .map((c) => `<a href="/blog/${c.slug}">${c.title}</a>`);
  if (items.length === 0) return null;
  return {
    h2: 'Go deeper: related articles',
    paragraphs: ['Topic-specific articles with more detail than this overview:'],
    list: items,
  };
}
