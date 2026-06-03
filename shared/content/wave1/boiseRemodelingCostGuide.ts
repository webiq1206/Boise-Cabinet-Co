import { buildSectionsHtml, CITIES_LIST, PILLAR_BOISE, PILLAR_TV, type ContentSection } from './snippets';

const sections: ContentSection[] = [
  {
    h2: 'What should Treasure Valley homeowners budget for custom cabinets in 2026?',
    paragraphs: [
      `Most cabinet packages we scope across ${CITIES_LIST} fall into planning bands, not single sticker prices. A laundry refresh in Meridian is not priced like a large custom kitchen in the North End. National averages rarely account for Ada County plan review, Canyon County submission portals, Idaho labor markets, or the finish level common in Eagle and Hidden Springs.`,
      `This guide is the pillar for our <strong>Boise Cabinet Costs</strong> hub. Use it to understand typical ranges, then read the linked articles on kitchen, bathroom, whole-home, built-in, and luxury cabinet costs for project-specific detail.`,
      `For a rough planning number before design, start with our <a href="/#calculator">project estimator</a>, then schedule a consultation for a written scope.`,
    ],
  },
  {
    h2: 'Typical custom cabinet cost ranges by project type in Boise',
    paragraphs: [
      'The table below reflects planning ranges we use with homeowners in consultations. Your home, linear footage, door style, and interior accessories will move you within or beyond these bands.',
    ],
    table: {
      className: 'cost-table',
      headers: ['Project type', 'Typical planning range', 'Typical timeline'],
      rows: [
        ['Kitchen cabinets (full)', '$15,000 – $45,000+', '6 – 14 weeks'],
        ['Bathroom vanity (guest)', '$4,000 – $12,000', '3 – 6 weeks'],
        ['Bathroom vanity (master)', '$8,000 – $25,000+', '4 – 10 weeks'],
        ['Whole-home cabinet package', '$40,000 – $120,000+', '8 – 20 weeks'],
        ['Built-ins & closet systems', '$3,000 – $35,000+', '4 – 12 weeks'],
        ['Outdoor kitchen cabinets', '$8,000 – $30,000+', '6 – 12 weeks'],
        ['Luxury custom cabinetry', '$50,000 – $150,000+', '10 – 24 weeks'],
      ],
    },
  },
  {
    h2: 'How much do kitchen cabinets cost in Boise?',
    paragraphs: [
      'Kitchen cabinets are the most common inquiry in Boise and Meridian. Layout changes, adding an island, extending uppers, or reworking the sink wall, drive both design time and field measure complexity. Cabinet line (stock, value, custom), door style, and interior organizers compound quickly.',
      'Preview a common OSC door and finish pairing from our catalog:',
      '[[catalog door modern-shaker]]',
      '[[catalog finish woodgrain-canyon-oak]]',
      'Countertops, appliances, and plumbing are typically coordinated separately; we guide rough-in and cabinet openings but do not supply stone or appliances. Budget those separately, often $8,000–$25,000 for a full appliance suite.',
      'Read our dedicated article: <a href="/blog/kitchen-cabinet-cost-boise">Kitchen Cabinet Cost Boise</a>. Explore <a href="/cabinets/kitchen">kitchen cabinet catalog</a> and <a href="/guides/boise-kitchen-cabinet-guide">Boise kitchen cabinet guide</a>.',
    ],
  },
  {
    h2: 'How much do bathroom vanities cost in the Treasure Valley?',
    paragraphs: [
      'Powder-room vanities in Star, Middleton, and Kuna often land in the mid four figures for value cabinet lines with quartz tops coordinated by others. Master vanities with wide drawers, tower storage, and layout changes commonly reach higher four-figure or five-figure ranges.',
      'Floating vanities and curbless-adjacent bath layouts require precise wall blocking and plumbing locations that affect both shop drawings and installation.',
      'See <a href="/blog/bathroom-vanity-cost-boise">Bathroom Vanity Cost Boise</a> and <a href="/cabinets/bathroom">bathroom vanity catalog</a>.',
    ],
  },
  {
    h2: 'Whole-home cabinet costs across Ada and Canyon County',
    paragraphs: [
      'Whole-home programs coordinate door style, finish, and hardware across kitchen, baths, laundry, mudroom, and built-ins under one specification. Sequencing matters: lock the master palette before fabrication starts on the first room.',
      'Older Treasure Valley homes may need field scribing and filler strategies when walls are out of plumb, hold contingency for adjustments at install.',
      'Our <a href="/blog/whole-home-cabinet-cost-boise">whole-home cabinet cost guide</a> and <a href="/guides/whole-home-cabinetry-guide">whole-home cabinetry guide</a> go deeper.',
    ],
  },
  {
    h2: 'Built-in and storage cabinet costs in Idaho',
    paragraphs: [
      'Entertainment centers, mudroom lockers, pantry systems, and closet built-ins scale with linear footage and hardware. Matching existing trim profiles in Eagle and Boise Bench homes adds shop time.',
      'Outdoor kitchen and bar cabinets need weather-rated materials and often longer lead times.',
      'Review <a href="/guides/built-in-cabinet-guide">built-in cabinet guide</a>, <a href="/cabinets/built-ins">built-in catalog</a>, and <a href="/blog/luxury-custom-cabinet-cost-boise">luxury custom cabinet costs</a>.',
    ],
  },
  {
    h2: 'What does luxury custom cabinetry cost in Eagle and the Foothills?',
    paragraphs: [
      'Luxury cabinet programs emphasize fully custom construction, specialty finishes, integrated lighting, and meticulous install in occupied homes. HOA design review in Harris Ranch, Hidden Springs, and Eagle Foothills adds weeks to front-end scheduling.',
      'Expect dedicated design development, sample doors, and white-glove protection of finished floors. A single luxury kitchen can exceed mid-range whole-home cabinet budgets when millwork and hardware are complex.',
      'Read <a href="/blog/luxury-custom-cabinet-cost-boise">luxury custom cabinet cost in Boise</a> for finish-level breakdowns.',
    ],
  },
  {
    h2: 'Cabinet cost per linear foot in Boise, is it useful?',
    paragraphs: [
      'Cost per linear foot is a shorthand, not a contract price. It varies by line, door style, interior accessories, and whether installation is included. Pantry walls and islands count differently than base runs alone.',
      'For whole-home or large kitchen planning, many homeowners ask for a $/LF range after preliminary design. We publish realistic bands in <a href="/blog/cabinet-cost-per-linear-foot">cabinet cost per linear foot in Boise</a>.',
    ],
    table: {
      className: 'cost-table',
      headers: ['Project context', 'Planning $/LF (cabinet boxes + install)'],
      rows: [
        ['Stock / builder-grade replacement', '$250 – $450'],
        ['Value kitchen package', '$450 – $750+'],
        ['Custom kitchen', '$750 – $1,200+'],
        ['Built-in wall (entertainment / office)', '$400 – $900+'],
      ],
    },
  },
  {
    h2: 'What impacts cabinet costs in Boise more than anywhere else?',
    paragraphs: [
      'Local drivers include: shop capacity, material lead times, field conditions at measure, door style and finish tier, and whether you buy through a dealer or a local custom shop.',
      'Layout changes, soffit removal, and panel upgrades add design and install time. Interior accessories (pull-outs, spice trays, appliance garages) move budget without changing room size.',
      'Our article <a href="/blog/what-impacts-cabinet-costs-boise">what impacts cabinet costs in Boise</a> ranks the top variables homeowners control.',
    ],
  },
  {
    h2: 'How to budget for cabinets in the Treasure Valley',
    paragraphs: [
      'Start with priorities: which rooms are must-haves vs phased later. Allocate design, fabrication, delivery, installation, hardware, and contingency separately instead of one opaque number.',
      'Temporary kitchen setups and storage are often overlooked during a full kitchen cabinet replacement. Phased room delivery can reduce disruption but may extend calendar time.',
      'Follow the step-by-step framework in <a href="/blog/how-to-budget-cabinets-boise">how to budget for cabinets in Boise</a>.',
    ],
    list: [
      'Define must-have rooms and phased work',
      'Get a planning range from a written preliminary scope',
      'Hold 10–15% contingency for field adjustments at install',
      'Budget countertops, appliances, and plumbing separately',
      'Plan for shop lead times before demo day',
    ],
  },
  {
    h2: 'Cabinet timeline expectations in Boise, Meridian, and Nampa',
    paragraphs: [
      'Timelines depend on design duration, shop backlog, material lead times, and install sequencing, not just installation days. Kitchen packages with layout changes often need field measure after rough work is complete.',
    ],
    table: {
      className: 'timeline-table',
      headers: ['Phase', 'Typical duration'],
      rows: [
        ['Design & selections', '2 – 8 weeks'],
        ['Fabrication', '4 – 12 weeks'],
        ['Delivery & installation (kitchen)', '3 – 10 days'],
        ['Whole-home phased program', '2 – 6 months'],
      ],
    },
  },
  {
    h2: 'Permits and coordination: Ada County vs Canyon County',
    paragraphs: [
      'Boise, Meridian, Eagle, Kuna, and Star fall under Ada County for most residential work. Nampa, Middleton, and Caldwell are in Canyon County with different portals and review cadence.',
      'Cabinet-only replacements often need minimal permit review; moving plumbing, gas, or structural elements requires coordinated plans and inspections.',
      'We coordinate permits when scope includes layout changes. See <a href="/guides/cabinet-project-process-guide">cabinet project process guide</a> for timelines and milestones.',
    ],
  },
  {
    h2: 'Custom shop vs big box: what it means for your number',
    paragraphs: [
      'A local custom shop offers layout flexibility, shop drawings, and install accountability. Big-box and stock lines can look cheaper on paper but often shift field labor, fillers, and revision risk to the homeowner.',
      'When comparing quotes, match line items: measure, shop drawings, delivery, install, hardware, and warranty. Our <a href="/guides/choose-cabinet-company-boise">choose a cabinet company guide</a> covers vetting in depth.',
    ],
  },
  {
    h2: 'How Boise housing stock affects cabinet price',
    paragraphs: [
      'North End bungalows and Boise Bench ranches often need creative filler and scribe strategies. 1990s–2010s subdivisions in Meridian, Kuna, and Star may have builder-grade boxes worth replacing with full-height uppers and better organizers.',
      'Eagle and Foothills homes frequently feature larger kitchens, butler pantries, and HOA standards that influence exterior-adjacent casework and timeline.',
    ],
  },
  {
    h2: 'Climate and seasonal considerations in Idaho',
    paragraphs: [
      'Dry summers favor exterior-adjacent casework delivery; winter installs require heat and humidity control for wood movement. Freeze-thaw cycles matter for outdoor kitchen bases and drainage.',
      'Book design early if you want installation complete before holidays or school years, shop schedules tighten in peak months across the valley.',
    ],
  },
  {
    h2: 'ROI and resale: what cabinet upgrades return in the Treasure Valley',
    paragraphs: [
      'Kitchen and bath cabinet updates generally offer strong lifestyle return; resale math depends on neighborhood comps in Boise, Meridian, and Eagle. Over-improving relative to the street rarely pays off.',
      'Coordinated whole-home palettes can help resale presentation when finishes feel intentional, not piecemeal.',
      'We address ROI by project type in our <a href="/guides/cabinet-roi-guide-boise">cabinet ROI guide</a>.',
    ],
  },
  {
    h2: 'Common budgeting mistakes Treasure Valley homeowners make',
    paragraphs: [
      'Underestimating shop lead time, delaying hardware selections until fabrication, and assuming the lowest bid includes install and warranty are the top three issues we see after a project starts.',
      'Another mistake is ignoring temporary kitchen setup during a full cabinet replacement. Phased delivery can reduce disruption but may extend calendar time.',
    ],
    list: [
      'Skipping written specifications before signing',
      'Comparing quotes with different lines and hardware',
      'Leaving finish selections to “later”',
      'Forgetting field measure timing relative to rough construction',
      'No contingency for out-of-plumb walls at install',
    ],
  },
  {
    h2: 'Expert recommendations from Boise Cabinet Co',
    paragraphs: [
      'We are a custom cabinet company serving homeowners throughout the Treasure Valley. Our process: consultation, field measure, design approvals, fabrication, delivery, installation, and warranty walkthrough.',
      'We do not publish bait pricing or “starting at” numbers without seeing your space. We do publish honest planning ranges so you can decide whether to invest in design before you commit to fabrication.',
    ],
  },
  {
    h2: 'Boise-specific considerations for 2026 cabinet planning',
    paragraphs: [
      'Material lead times and local labor demand still influence 2026 budgets. Tariffs and supply chains affect specialty hardware and imported components, lock long-lead items early in design.',
      'If you are in a mapped floodplain or hillside overlay (common near the Bench and Foothills), coordinate structural and casework dimensions before pricing is firm.',
      `For city-level context, read <a href="${PILLAR_BOISE}">Boise Custom Cabinet Guide</a> and the <a href="${PILLAR_TV}">Treasure Valley Cabinet Guide</a>.`,
    ],
  },
  {
    h2: 'Next steps: from planning range to written scope',
    paragraphs: [
      'Use the cost cluster articles linked from this hub for room-by-room detail. When you are ready, schedule a consultation, we will walk your space, discuss goals, and outline a realistic path from design through installation.',
      'Explore cabinetry by room: <a href="/cabinets">cabinet catalog</a>, <a href="/collections">collections</a>, <a href="/cabinets/kitchen">kitchen</a>, <a href="/cabinets/bathroom">bathroom</a>, and <a href="/compare">compare lines</a>.',
    ],
  },
];

export const BOISE_REMODELING_COST_GUIDE_HTML = buildSectionsHtml(sections);

export const BOISE_REMODELING_COST_QUICK_ANSWER =
  'Treasure Valley custom cabinets in 2026 typically range from about $4,000 for a small vanity refresh to $120,000+ for whole-home packages, with most full kitchens between $15,000 and $45,000 and master vanities from $8,000 to $25,000+. Exact cost depends on linear footage, door style, interior accessories, install complexity, and shop lead times, not national averages.';

export const BOISE_REMODELING_COST_TAKEAWAYS = [
  'Use planning ranges by room type, not a single $/LF number for every cabinet project.',
  'Shop lead time and selections lock before fabrication drive calendar success.',
  'Hold contingency for field scribing and out-of-plumb walls in older Treasure Valley homes.',
  'Countertops, appliances, and plumbing are often separate from cabinet contracts.',
  'Compare quotes only after line, hardware, and install scope are aligned.',
];
