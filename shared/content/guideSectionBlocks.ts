import { CITIES_LIST, PILLAR_COST, type ContentSection } from './wave1/snippets';
import { getClustersForHub } from '../contentHubs';

/** Compact essentials, link out for valley-wide permit/cost depth. */
export function pillarEssentialsSection(topic: string): ContentSection {
  const t = topic.toLowerCase();
  return {
    h2: 'Planning essentials',
    paragraphs: [
      `Budget, permits, and selections drive ${t} timelines in ${CITIES_LIST}, not a single sticker price.`,
      `Use the <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a> for ranges, the <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley guide</a> for local context, and the <a href="/guides/cabinet-project-process-guide">cabinet process guide</a> for milestones.`,
    ],
    list: [
      'Hold 10–15% contingency for field adjustments',
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
    'built-ins-storage': 'home-additions',
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
            'Ranches, split-levels, and 1990s subdivisions each have different wall and panel constraints. Opening a kitchen often means beams, Ada County sheets, and revised electrical, not just cabinetry.',
            '<a href="/blog/kitchen-layout-ideas-boise-homes">Layout ideas</a> · <a href="/blog/open-kitchen-cabinet-storage">Open kitchen storage</a>.',
          ],
        },
        {
          h2: 'Cabinets, islands, and appliance planning',
          paragraphs: [
            'Order cabinets at design lock; lead times often exceed eight weeks. Islands need clearance for dishwasher swings and walkways, not just catalog depth.',
            'Appliances are usually client-supplied; we coordinate rough-in. Budget suites separately, often $8,000–$25,000 for a full kitchen.',
          ],
        },
        {
          h2: 'Door styles and finishes from our catalog',
          paragraphs: [
            'These OSC profiles and finishes are the same options shown in Design Studio and your client portal:',
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
            '<a href="/blog/kitchen-cabinet-timeline-boise">Kitchen cabinet timeline</a> · <a href="/blog/kitchen-cabinet-cost-boise">Kitchen cabinet cost in Boise</a>.',
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
    case 'home-additions':
      return [
        {
          h2: 'Setbacks, soil, and feasibility',
          paragraphs: [
            'Eagle Foothills and hillside lots may change foundation type early. ADUs need utility, fire separation, and zoning study, not just desired square footage.',
          ],
        },
        {
          h2: 'Second story vs rear addition',
          paragraphs: [
            'Second stories require engineering and longer Ada review. Rear mudrooms and family entries are common in Meridian lots with side or alley access.',
            '<a href="/cabinets/built-ins">Built-in catalog</a> · <a href="/blog/garage-storage-cabinet-systems">Garage storage cabinets</a>.',
          ],
        },
        {
          h2: 'Addition planning timeline',
          table: {
            className: 'timeline-table',
            headers: ['Phase', 'Duration'],
            rows: [
              ['Feasibility & design', '4–12 weeks'],
              ['Permits', '2–10+ weeks'],
              ['Construction', '3–9 months'],
            ],
          },
          paragraphs: [],
        },
      ];
    case 'whole-home-cabinetry':
      return [
        {
          h2: 'Whole-home sequencing',
          paragraphs: [
            'Lock structural, panel, and HVAC decisions before house-wide finish selections. Phasing spreads cost but adds mobilization, use a master finish plan.',
          ],
        },
        {
          h2: 'Living through construction',
          paragraphs: [
            'Temporary kitchens, dust barriers, and utility shutoffs should be planned before demo, not negotiated mid-project.',
            '<a href="/blog/whole-home-cabinet-cost-boise">Whole-home cabinet cost guide</a>.',
          ],
        },
        {
          h2: 'When contingency matters most',
          paragraphs: [
            '1970s–1990s valley homes often need surprises addressed behind drywall, hold 10–15% until conditions are documented.',
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
            '<a href="/guides/cabinet-project-process-guide">Cabinet process guide</a> · <a href="/blog/cabinet-fabrication-installation">Fabrication & installation</a>.',
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
            '<a href="/blog/kitchen-cabinet-roi-boise">Kitchen cabinet ROI</a> · <a href="/blog/bathroom-vanity-roi-boise">Bathroom vanity ROI</a>.',
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
            '<a href="/blog/decks-vs-patios-boise">Decks vs patios</a> · <a href="/blog/outdoor-kitchens-boise">Outdoor kitchens</a>.',
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
    .map((c) => `<a href="/blog/${c.replacesSlug ?? c.slug}">${c.title}</a>`);
  if (items.length === 0) return null;
  return {
    h2: 'Go deeper: related articles',
    paragraphs: ['Topic-specific articles with more detail than this overview:'],
    list: items,
  };
}
