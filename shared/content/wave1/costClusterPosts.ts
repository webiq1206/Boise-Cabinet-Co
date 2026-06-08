import { buildSectionsHtml, CITIES_LIST, PILLAR_COST, type ContentSection } from './snippets';

function clusterSections(topic: string, extra: ContentSection[]): ContentSection[] {
  const intro: ContentSection[] = [
    {
      h2: `Quick planning overview for ${topic}`,
      paragraphs: [
        `Homeowners in ${CITIES_LIST} ask us about ${topic.toLowerCase()} more than almost any other line item on a cabinet budget. This article is part of our <a href="${PILLAR_COST}">Boise Cabinet Cost Guide</a>, the definitive hub for Treasure Valley cabinet costs.`,
        `Numbers below are planning ranges from cabinet design and installation consultations, not advertisements. Your home, layout, and finish level will move you within or beyond these bands.`,
        `Use our <a href="/#calculator">project estimator</a> for a rough range, then request an in-home visit for written scope.`,
      ],
    },
  ];
  return [...intro, ...extra];
}

const kitchenExtra: ContentSection[] = [
  {
    h2: 'What is a typical kitchen cabinets budget in Boise?',
    paragraphs: [
      'Most full kitchen cabinetss we plan in Ada County fall between roughly $45,000 and $120,000+, with layout changes and custom cabinetry at the upper end. Cosmetic refreshes, doors, counters, backsplash, can land lower if plumbing and gas stay put.',
      'Meridian and Eagle kitchens often include larger islands, walk-in pantries, and panel-ready appliances. Kuna and Star homes may have builder-grade layouts worth reconfiguring for open concept living.',
    ],
  },
  {
    h2: 'Cost breakdown: cabinets, counters, and labor',
    paragraphs: [
      'Cabinetry commonly represents 30–40% of a full kitchen construction budget. Value cabinet lines balance selection flexibility with lead time; fully custom shops extend design time but fit odd ceiling lines in North End homes.',
      'Quartz and quartzite countertops range widely; waterfall edges and thick mitered builds add fabrication labor. Tile backsplashes, under-cabinet lighting, and recessed cans are frequently underestimated.',
    ],
    table: {
      className: 'cost-table',
      headers: ['Line item', 'Typical share of kitchen budget'],
      rows: [
        ['Cabinetry & install', '30 – 40%'],
        ['Countertops & backsplash', '15 – 20%'],
        ['Labor (demo, MEP, finish)', '25 – 35%'],
        ['Flooring, paint, trim', '10 – 15%'],
        ['Appliances (client-supplied)', 'Separate budget'],
      ],
    },
  },
  {
    h2: 'When layout changes increase price in the Treasure Valley',
    paragraphs: [
      'Moving the sink, dishwasher, or range requires plumbing and often electrical panel work. Removing a wall may need a beam, engineering, and Ada County plan review.',
      'Open concept requests from Boise Bench homeowners frequently combine kitchen, dining, and living flooring transitions, another cost layer beyond cabinets.',
    ],
  },
  {
    h2: 'Timeline and how it affects cash flow',
    paragraphs: [
      'kitchen cabinetss typically run 8–16 weeks after permits and materials are released. Long-lead cabinets can add 8–12 weeks to the front of the schedule, order at design lock.',
    ],
    table: {
      className: 'timeline-table',
      headers: ['Phase', 'Duration'],
      rows: [
        ['Design & selections', '4 – 8 weeks'],
        ['Permits (if layout/MEP)', '2 – 6 weeks'],
        ['Construction', '6 – 12 weeks'],
      ],
    },
  },
  {
    h2: 'Boise, Meridian, Eagle, and Nampa: local notes',
    paragraphs: [
      'Ada County cities share many permit conventions; Canyon County (Nampa, Middleton, Caldwell) uses different portals. HOA review in Eagle may add design time without changing construction unit costs dramatically.',
      '<a href="/cabinets/kitchen">Kitchen cabinets</a> · <a href="/guides/boise-kitchen-cabinet-guide">Kitchen cabinet guide</a> · <a href="/door-styles">Door styles</a>.',
    ],
  },
  {
    h2: 'How to avoid budget surprises',
    paragraphs: [
      'Lock appliance models before rough-in. Confirm soft-close hardware, crown, and filler details at cabinet sign-off. Hold contingency for drywall and subfloor after demo.',
    ],
    list: [
      'Written scope before fabrication contract',
      'Selection schedule with long-lead tracking',
      'Panel check if adding circuits',
      'Contingency for concealed damage',
    ],
  },
  {
    h2: 'Related cost guides',
    paragraphs: [
      'Compare <a href="/blog/bathroom-vanity-cost-boise">bathroom vanity costs</a>, <a href="/blog/whole-home-cabinet-cost-boise">whole-home ranges</a>, and <a href="/blog/what-impacts-cabinet-costs-boise">cost drivers</a> in our cost hub.',
    ],
  },
];

const bathroomExtra: ContentSection[] = [
  {
    h2: 'Guest bath vs master bath costs in Idaho',
    paragraphs: [
      'Guest baths and powder rooms in Star, Middleton, and Kuna often land between $18,000 and $45,000 for a full refresh. Master suites with curbless showers, niches, and premium tile commonly reach $35,000–$85,000+.',
    ],
  },
  {
    h2: 'Walk-in and curbless shower cost drivers',
    paragraphs: [
      'Linear drains, large-format tile, and frameless glass increase labor. Waterproofing and flood testing are non-negotiable for inspectors in Ada and Canyon County.',
    ],
  },
  {
    h2: 'Ventilation, heat, and electrical',
    paragraphs: [
      'Proper exhaust prevents mold in Idaho’s dry-but-steamy bath cycles. Radiant floor heat adds electrical load and thermostat zones, popular in Eagle and Boise Foothills master baths.',
    ],
  },
  {
    h2: 'Permits for layout changes',
    paragraphs: [
      'Relocating a toilet or expanding a footprint triggers plan review. Factor 2–6 weeks in Ada County depending on complexity.',
    ],
  },
  {
    h2: 'City-specific service links',
    paragraphs: [
      '<a href="/cabinets/bathroom">Bathroom vanity cabinets</a> · <a href="/guides/boise-bathroom-vanity-guide">Bathroom vanity guide</a> · <a href="/finishes">Finishes</a>.',
    ],
  },
  {
    h2: 'Budgeting tips',
    paragraphs: [
      'Bundle vanity fixtures at one finish level. Match cabinet hardware across baths. See <a href="/blog/how-to-budget-cabinets-boise">cabinet budgeting guide</a>.',
    ],
  },
];

const wholeHomeExtra: ContentSection[] = [
  {
    h2: 'What defines a whole-home cabinetry budget?',
    paragraphs: [
      'Whole-home programs in Boise and Meridian often span $150,000–$400,000+ depending on square footage affected, structural work, and number of wet areas.',
    ],
  },
  {
    h2: 'Phasing vs single mobilization',
    paragraphs: [
      'Phasing can spread cash flow but adds mobilization cost. Single-phase work is efficient when temporary housing is arranged.',
    ],
  },
  {
    h2: 'Electrical, HVAC, and envelope upgrades',
    paragraphs: [
      'Older North End and Bench homes may need panel upgrades and insulation when walls are open, budget these early, not as change orders.',
    ],
  },
  {
    h2: 'Contingency for concealed conditions',
    paragraphs: [
      'Hold 10–15% for unknowns behind walls. Whole-home demos reveal framing, plumbing, and wiring surprises.',
    ],
  },
  {
    h2: 'Links',
    paragraphs: [
      '<a href="/cabinets/kitchen">Kitchen cabinets</a>, <a href="/cabinets/bathroom">Bathroom vanities</a>, <a href="/guides/whole-home-cabinetry-guide">Whole-home cabinetry guide</a>.',
    ],
  },
];

const additionExtra: ContentSection[] = [
  {
    h2: 'built-in storage cost ranges in the Treasure Valley',
    paragraphs: [
      'Ground-floor additions often run $80,000–$250,000+ including design, permits, foundation, framing, MEP, and finish. Second stories can exceed this when structural retrofits are required.',
    ],
  },
  {
    h2: 'Foundation and site work',
    paragraphs: [
      'Soils, setbacks, and utility locations in Eagle and Hidden Springs affect foundation type. Rock and drainage add site cost in Foothills lots.',
    ],
  },
  {
    h2: 'Matching architecture',
    paragraphs: [
      'Roof lines, siding, and window rhythm must match or intentionally contrast per HOA and city design standards.',
    ],
  },
  {
    h2: 'ADU comparison',
    paragraphs: [
      'Garage and mudroom built-ins often pair with new living space, see <a href="/cabinets/built-ins">built-in cabinetry</a> and <a href="/guides/built-in-cabinet-guide">built-in cabinet guide</a>.',
    ],
  },
  {
    h2: 'Service areas',
    paragraphs: [
      '<a href="/cabinets/kitchen">Kitchen cabinets</a> · <a href="/cabinets/built-ins">Built-ins</a> · <a href="/guides/built-in-cabinet-guide">Built-in guide</a> · <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley hub</a>.',
    ],
  },
];

const luxuryExtra: ContentSection[] = [
  {
    h2: 'What counts as a luxury cabinet program in Boise and Eagle?',
    paragraphs: [
      'Custom millwork, book-matched stone, integrated lighting scenes, and high-performance windows define luxury programs, often $200,000–$600,000+ for multi-room scope.',
    ],
  },
  {
    h2: 'Design development investment',
    paragraphs: [
      'Luxury projects require longer design phases, mock-ups, and vendor coordination. That front-loaded time reduces expensive field changes.',
    ],
  },
  {
    h2: 'HOA and design review',
    paragraphs: [
      'Harris Ranch, Hidden Springs, and Eagle Foothills HOAs add calendar time; budget holding costs if carrying two homes.',
    ],
  },
  {
    h2: 'Without a dedicated luxury service page',
    paragraphs: [
      'We deliver luxury cabinetry through <a href="/cabinets/kitchen">kitchen</a>, <a href="/cabinets/bathroom">bathroom</a>, and <a href="/guides/whole-home-cabinetry-guide">whole-home</a> programs, one custom cabinet partner.',
    ],
  },
];

const perSqFtExtra: ContentSection[] = [
  {
    h2: 'When cost per square foot helps, and when it misleads',
    paragraphs: [
      '$/SF is useful for whole-home and addition planning after preliminary design. It misleads when comparing a kitchen to a carpet refresh.',
    ],
  },
  {
    h2: 'Sample planning bands',
    paragraphs: ['See table in our <a href="' + PILLAR_COST + '">main cost guide</a>.'],
    table: {
      className: 'cost-table',
      headers: ['Context', '$/SF (indicative)'],
      rows: [
        ['Whole-home major remodel', '$100 – $200+'],
        ['Addition new construction portion', '$200 – $350+'],
        ['Mid kitchen (room SF only)', '$250 – $450+'],
      ],
    },
  },
  {
    h2: 'Boise market factors in 2026',
    paragraphs: [
      'Labor demand, material lead times, and insurance rebuild costs influence $/SF. Localize numbers, national blogs understate Idaho plumbing and electrical rates.',
    ],
  },
];

const impactsExtra: ContentSection[] = [
  {
    h2: 'Top 10 variables that move your cabinet project price',
    paragraphs: ['Ranked from what we see on Treasure Valley jobs:'],
    list: [
      'Layout and structural changes',
      'Cabinetry and millwork level',
      'Tile complexity and wet-area waterproofing',
      'Existing conditions (rot, panel, asbestos surveys)',
      'Permit jurisdiction and review cycles',
      'Material lead times and freight',
      'Finish level (fixtures, lighting, hardware)',
      'Occupied vs vacant construction',
      'cabinet design and installation vs separated contracts',
      'Change orders from late selections',
    ],
  },
  {
    h2: 'Ada vs Canyon permit cost and time',
    paragraphs: [
      'Plan review fees and timelines differ. Structural additions almost always extend both counties’ schedules.',
      '<a href="/guides/cabinet-project-process-guide">Cabinet project process guide</a>.',
    ],
  },
  {
    h2: 'How to control cost without cutting quality',
    paragraphs: [
      'Lock scope early, batch selections, and avoid layout changes after permit submission. Value-engineer finishes before shrinking waterproofing or structure.',
    ],
  },
];

const budgetExtra: ContentSection[] = [
  {
    h2: 'Step-by-step cabinet budget framework',
    paragraphs: [
      '1) Define must-haves. 2) Get planning ranges per room. 3) Add soft costs (housing, storage). 4) Hold contingency. 5) Compare only aligned bids.',
    ],
  },
  {
    h2: 'Sample budget allocation',
    paragraphs: ['Illustrative split for a $120,000 kitchen + bath program:'],
    table: {
      className: 'cost-table',
      headers: ['Category', 'Share'],
      rows: [
        ['cabinet contract', '70 – 75%'],
        ['Appliances & furnishings', '10 – 15%'],
        ['Contingency', '10 – 15%'],
        ['Temporary housing (if any)', 'Case by case'],
      ],
    },
  },
  {
    h2: 'Financing and timing',
    paragraphs: [
      'HELOCs and project financing are common. Align draw schedules with installation milestones in your contract.',
    ],
  },
  {
    h2: 'Work with a local cabinet team',
    paragraphs: [
      '<a href="/contact">Contact Boise Cabinet Co</a> for a consultation across Boise, Meridian, Eagle, Kuna, Star, Middleton, Nampa, and Caldwell.',
      '<a href="/cabinets">Cabinet catalog</a> · <a href="/estimate">Get an estimate</a> · <a href="/guides/boise-cabinet-cost-guide">Cost guide</a>.',
    ],
  },
];

export const COST_CLUSTER_CONTENT: Record<
  string,
  { html: string; quickAnswer: string; takeaways: string[] }
> = {
  'kitchen-cabinet-cost-boise': {
    html: buildSectionsHtml(clusterSections('kitchen cabinet cost', kitchenExtra)),
    quickAnswer:
      'Kitchen cabinets in Boise and the Treasure Valley typically range from about $15,000 to $45,000+ installed, driven by line, layout complexity, finishes, and interior accessories. Countertops and appliances are usually budgeted separately.',
    takeaways: [
      'Cabinet line and box material are the largest cost swing.',
      'Interior organizers and hardware add up quickly.',
      'Order long-lead cabinets at design lock.',
      'Compare quotes only with matching scope and line.',
    ],
  },
  'bathroom-vanity-cost-boise': {
    html: buildSectionsHtml(clusterSections('bathroom vanity cost', bathroomExtra)),
    quickAnswer:
      'Guest bath vanity cabinets often plan $3,500–$12,000 installed; master vanity suites with double sinks and custom storage commonly reach $8,000–$25,000+ in Idaho.',
    takeaways: [
      'Master and guest vanities should not share one budget number.',
      'Moisture-rated finishes are worth specifying upfront.',
      'Plumbing moves are separate from cabinet install scope.',
    ],
  },
  'whole-home-cabinet-cost-boise': {
    html: buildSectionsHtml(clusterSections('whole-home cabinet cost', wholeHomeExtra)),
    quickAnswer:
      'Whole-home cabinet packages in the Treasure Valley often range from $40,000 to $120,000+ depending on room count, line, finish, and coordinated delivery.',
    takeaways: [
      'Treat whole-home cabinets as one specification.',
      'Hold 10–15% contingency for field adjustments.',
      'Phased delivery can spread investment over time.',
    ],
  },
  'luxury-custom-cabinet-cost-boise': {
    html: buildSectionsHtml(clusterSections('luxury custom cabinet cost', luxuryExtra)),
    quickAnswer:
      'Luxury custom cabinets in Eagle, the Foothills, and premium Boise neighborhoods often exceed $60,000 for multi-room scope, with extended design development and premium finishes.',
    takeaways: [
      'Design time is part of the investment.',
      'HOA review affects calendar, not just aesthetics.',
      'Luxury is delivered through coordinated kitchen, bath, and built-in programs.',
    ],
  },
  'what-impacts-cabinet-costs-boise': {
    html: buildSectionsHtml(clusterSections('cabinet cost drivers', impactsExtra)),
    quickAnswer:
      'The biggest cost drivers for Treasure Valley cabinets are line and box material, finish level, interior accessories, installation complexity, and late selections, not room square footage alone.',
    takeaways: [
      'Scope alignment matters more than a low bid.',
      'Field conditions at install can add labor.',
      'Finish and hardware level move budget without adding cabinets.',
    ],
  },
  'how-to-budget-cabinets-boise': {
    html: buildSectionsHtml(clusterSections('cabinet budgeting', budgetExtra)),
    quickAnswer:
      'Budget Treasure Valley cabinets by defining must-have rooms, getting line-level planning ranges, adding countertops and appliances separately, holding 10–15% contingency, and comparing only aligned written scopes.',
    takeaways: [
      'Separate cabinets, countertops, and contingency.',
      'Lock selections before fabrication to limit change orders.',
      'Use local planning ranges, not national averages.',
    ],
  },
};

const CLUSTER_LINK_FOOTER = `
<h2>More planning resources</h2>
<p>Explore our <a href="/guides/boise-cabinet-cost-guide">Boise Cabinet Cost Guide</a>, <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley guide</a>, <a href="/guides/boise-cabinet-guide">Boise cabinet guide</a>, <a href="/cabinets">cabinet catalog</a>, <a href="/cabinets/kitchen">kitchen cabinets</a>, <a href="/cabinets/bathroom">bathroom vanities</a>, <a href="/estimate">get an estimate</a>, <a href="/contact">schedule a consultation</a>, and <a href="/#calculator">project estimator</a>.</p>`;

export function getExpandedClusterHtml(slug: string): string {
  const base = COST_CLUSTER_CONTENT[slug]?.html ?? '';
  return base + CLUSTER_LINK_FOOTER;
}
