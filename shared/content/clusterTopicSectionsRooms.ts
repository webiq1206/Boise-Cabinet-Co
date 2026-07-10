import type { ContentSection } from './wave1/snippets';

/**
 * Slug-specific topic depth for kitchen, bathroom, built-ins/outdoor, and
 * whole-home cluster posts. Replaces the generic defaultTopicSections
 * fallback so each post carries unique, substantive local content.
 */
export const ROOM_TOPIC_SECTIONS: Record<string, ContentSection[]> = {
  'kitchen-cabinet-timeline-boise': [
    {
      h2: 'The realistic Boise kitchen cabinet timeline',
      paragraphs: [
        'Plan 8 to 14 weeks from first consultation to installed cabinets for a typical Treasure Valley kitchen. Design and selections take 2 to 4 weeks, fabrication 4 to 8 weeks from approved drawings, and installation 2 to 5 days for most kitchens.',
        'The biggest schedule killer is late selections. Door style and finish lock fabrication; changing either after approval restarts the lead-time clock.',
      ],
    },
    {
      h2: 'Phase by phase',
      table: {
        className: 'timeline-table',
        headers: ['Phase', 'Typical duration', 'What happens'],
        rows: [
          ['Consultation & measure', '1-2 weeks', 'In-home measure, goals, planning range'],
          ['Design & selections', '1-3 weeks', 'Layout, door style, finish, hardware sign-off'],
          ['Fabrication', '4-8 weeks', 'Built to order after approved drawings'],
          ['Delivery & install', '2-5 days', 'Professional installation and walkthrough'],
        ],
      },
      paragraphs: [
        'Countertops template after base cabinets are set, so add 1 to 2 weeks before the kitchen is fully functional.',
      ],
    },
    {
      h2: 'What changes the timeline in Boise',
      paragraphs: [
        'Wall removals add Ada County permit and engineering time before cabinets can even be ordered. Older North End and Bench homes can surprise you behind drywall; newer Meridian and Kuna builds rarely do.',
        'Summer is peak season for Treasure Valley trades. If you want a kitchen done before the holidays, start design before late summer.',
      ],
    },
    {
      h2: 'How to protect your schedule',
      paragraphs: [
        'Order cabinets at design lock, make finish and hardware selections early, and resolve appliance specs before drawings are approved. Panel-ready appliances especially must be confirmed before fabrication.',
        'Browse <a href="/cabinets/kitchen">kitchen cabinets</a> and <a href="/finishes">finishes</a> ahead of your consultation so selections do not stall the calendar.',
      ],
    },
    {
      h2: 'Kitchen timeline by Treasure Valley city',
      paragraphs: [
        'Meridian and Kuna builder-grade upgrades often move fastest because layouts are rectangular and walls are square. North End and Bench Boise kitchens add a week or two for custom filler planning and soffit decisions. Eagle whole-kitchen programs with butler pantries and mudroom lockers run toward the long end of the 8 to 14 week band because selections span multiple rooms.',
        'Read the <a href="/guides/boise-cabinet-guide">Boise cabinet guide</a> or your city guide for housing-specific notes before you set a target install month.',
      ],
    },
    {
      h2: 'What to do while cabinets are in fabrication',
      paragraphs: [
        'Use the fabrication window to finalize counters, backsplash, and appliance delivery dates. Schedule any plumbing or electrical rough-in that must finish before bases land. If you are living in the home, set up a temporary kitchen zone so install week is the only disruptive stretch.',
        'Your client portal shows fabrication status; we send written Friday updates so you always know whether the project is on track for the scheduled delivery date.',
      ],
    },
  ],
  'kitchen-layout-ideas-boise-homes': [
    {
      h2: 'Layouts by Boise housing era',
      paragraphs: [
        'Boise housing falls into a few layout families. North End and Bench homes from the 1920s to 1970s usually have galley or L-shaped kitchens in closed rooms. 1990s to 2010s subdivisions in Meridian, Kuna, and Nampa have open L-plus-island plans. Newer Eagle and Star builds trend toward large single-wall runs with oversized islands.',
        'The best layout upgrade respects the era: a galley kitchen rarely wants an island, and an open great-room plan rarely wants more walls.',
      ],
    },
    {
      h2: 'Galley and L-shaped kitchens',
      paragraphs: [
        'In compact galleys, go vertical: ceiling-height uppers, a full-height pantry cabinet at one end, and drawer bases instead of door-and-shelf bases. Custom widths eliminate filler strips that waste inches you cannot spare.',
        'Keep the work triangle tight, sink, range, and refrigerator within a few steps, and resist crowding a peninsula into a walkway under 42 inches.',
      ],
    },
    {
      h2: 'Island kitchens',
      paragraphs: [
        'Islands need 42 inches of clearance on working sides (48 inches with two cooks or an open dishwasher). Size the island for storage first, drawers, trash pull-out, and appliance garage, with seating overhang second.',
        'See the <a href="/blog/kitchen-island-design-guide">kitchen island design guide</a> for clearances and our <a href="/cabinets/kitchen">kitchen catalog</a> for island base options.',
      ],
    },
    {
      h2: 'Corner and dead-space strategies',
      paragraphs: [
        'Lazy susans, blind-corner pull-outs, and angled cabinets each solve corners differently. In older homes with out-of-plumb walls, built-to-order sizing keeps corner reveals clean where stock cabinets show gaps.',
      ],
    },
  ],
  'kitchen-cabinet-trends': [
    {
      h2: 'What Treasure Valley homeowners are choosing now',
      paragraphs: [
        'Across our Boise, Meridian, and Eagle projects, the strongest current patterns are matte painted finishes in warm neutrals, slim shaker profiles, and mixed-finish kitchens that pair a painted perimeter with a woodgrain island.',
        'Hardware is trending toward longer bar pulls in brushed brass and matte black, often mixed by zone rather than one finish everywhere.',
      ],
    },
    {
      h2: 'Door styles: shaker evolves, slab grows',
      paragraphs: [
        'Classic shaker still leads, but thinner rails are gaining: compare <a href="/door-styles/thin-shaker">Thin Shaker</a> and <a href="/door-styles/modern-shaker">Modern Shaker</a> profiles. Flat <a href="/door-styles/slab">slab doors</a> keep growing in newer Eagle and Star builds with contemporary architecture.',
      ],
    },
    {
      h2: 'Storage trends that outlast color trends',
      paragraphs: [
        'Drawer bases instead of doors, full-height pantry walls, appliance garages that hide the toaster and coffee station, and trash pull-outs are now baseline expectations, not upgrades. These survive every color cycle.',
        'Browse <a href="/accessories">cabinet accessories</a> to see the interior systems behind the trend photos.',
      ],
    },
    {
      h2: 'Trends worth skipping',
      paragraphs: [
        'Ultra-trendy colors on the full kitchen age fastest. If you want a bold color, put it on the island or a bar zone where refinishing later is a small project, and keep the perimeter timeless.',
      ],
    },
  ],
  'kitchen-island-design-guide': [
    {
      h2: 'Island sizing rules that actually matter',
      paragraphs: [
        'Minimum useful island: about 24 by 48 inches. Comfortable seating needs 24 inches of width per person and a 12 to 15 inch overhang. Keep 42 inches of clearance on working sides and 48 inches where two cooks pass or appliance doors open.',
        'In most Boise ranches, that math caps the island around 4 by 7 feet. Sprawling 12-foot islands belong to newer Eagle and Star great rooms with the floor area to support them.',
      ],
    },
    {
      h2: 'What goes inside the island',
      paragraphs: [
        'Treat the island as your highest-value storage: deep drawer stacks for pots, a trash and recycling pull-out near the prep zone, and a shallow drawer for utensils. If the sink or cooktop moves to the island, plan venting and plumbing early because both affect cabinet layout.',
        'See <a href="/cabinets/kitchen">island base options</a> in the kitchen catalog.',
      ],
    },
    {
      h2: 'Island finish strategy',
      paragraphs: [
        'A contrasting island finish is the lowest-risk way to add color: woodgrain or a deep tone against a light painted perimeter. Match counter stone and hardware across both finishes so the contrast reads intentional.',
      ],
    },
    {
      h2: 'When not to add an island',
      paragraphs: [
        'If clearances fall under 42 inches, a rolling cart or peninsula serves better. Forcing an island into a galley footprint is the most common layout mistake we talk homeowners out of.',
      ],
    },
  ],
  'walk-in-pantry-design-guide': [
    {
      h2: 'Walk-in pantry layout basics',
      paragraphs: [
        'A useful walk-in pantry starts at about 4 by 4 feet with shelving on two walls; 5 by 5 feet allows a U-shape. Keep aisle width at 36 inches minimum so two people can pass and door swings stay clear.',
        'Shelf depth matters more than count: 12 inches for cans and boxes, 16 to 20 inches for small appliances and bulk goods, with the deep shelves below counter height where you can see into them.',
      ],
    },
    {
      h2: 'Shelving, counters, and appliance garages',
      paragraphs: [
        'Adjustable shelving earns its cost the first time your storage needs change. A small counter run at 36 inches creates a landing zone for groceries and a home for the mixer or air fryer, with outlets so appliances work where they live.',
        'Appliance garages keep the kitchen proper clear; see <a href="/cabinets/pantry">pantry cabinet options</a> for tall units and roll-out configurations.',
      ],
    },
    {
      h2: 'Pantry walls when a walk-in does not fit',
      paragraphs: [
        'A 24-inch-deep tall cabinet run with roll-out trays delivers most of a walk-in pantry\'s function in a fraction of the footprint, the standard answer in Boise Bench ranches and North End bungalows without room to borrow.',
      ],
    },
    {
      h2: 'Treasure Valley pantry habits',
      paragraphs: [
        'Costco runs and garden harvests are real planning inputs here. Star and Middleton acreage households routinely ask for double-depth bulk shelving and second-refrigerator alcoves; we size for how your household actually shops.',
      ],
    },
  ],
  'luxury-bathroom-vanity-guide': [
    {
      h2: 'What makes a vanity read as luxury',
      paragraphs: [
        'Furniture details separate luxury vanities from builder boxes: full-height side panels, integrated lighting, floating installs with hidden cleats, and drawer interiors fitted for grooming tools with in-drawer outlets.',
        'Finish does the visual work: high-gloss, textured woodgrain, or deep matte tones paired with stone that wraps a waterfall edge. Browse <a href="/finishes/gloss">gloss</a> and <a href="/finishes/woodgrain">woodgrain finishes</a> to see the range.',
      ],
    },
    {
      h2: 'Primary suite vanity programs',
      paragraphs: [
        'Eagle and foothills primary baths typically run double vanities of 72 to 120 inches with a seated makeup zone between, linen towers on the ends, and hamper pull-outs. Mounting height is moving up: 36 inches standard, with floating units set to the owner\'s preference.',
      ],
    },
    {
      h2: 'Details worth the money',
      paragraphs: [
        'Heated towel storage, mirrored interior outlets, charging drawers, and soft-close everything. Skip in-cabinet mini fridges unless you genuinely use them; they cost storage and add service points.',
        'See <a href="/cabinets/bathroom">bathroom vanity options</a> and pair selections with the <a href="/guides/boise-bathroom-vanity-guide">Boise bathroom vanity guide</a>.',
      ],
    },
  ],
  'small-bathroom-vanity-ideas': [
    {
      h2: 'Getting storage from a small footprint',
      paragraphs: [
        'In a 5 by 8 bath, the vanity is the only real storage. Choose drawers over doors, a 21-inch-deep custom box where stock 22-inch units crowd the door swing, and full-height side storage if the layout allows a 12-inch tower.',
        'Wall-hung vanities visually enlarge small rooms and free floor area for cleaning, common in North End and downtown Boise condos.',
      ],
    },
    {
      h2: 'Custom widths beat stock sizes',
      paragraphs: [
        'Stock vanities jump in 6-inch increments; small baths lose usable inches at every jump. A built-to-order 27 or 33-inch vanity uses exactly the wall you have. See <a href="/cabinets/bathroom">vanity options</a> for configurations.',
      ],
    },
    {
      h2: 'Small-bath finish choices',
      paragraphs: [
        'Light matte finishes and minimal hardware keep small rooms calm. If the bath lacks natural light, avoid high-gloss fronts that show every water spot under artificial lighting.',
      ],
    },
  ],
  'accessible-bathroom-vanity-guide': [
    {
      h2: 'Accessible vanity dimensions',
      paragraphs: [
        'Roll-under vanities need 27 inches of knee clearance height, 30 inches of width, and plumbing set back or protected. Comfort-height storage flanking the roll-under section keeps everyday items between 15 and 48 inches off the floor.',
        'Lever or touch faucets, D-shaped pulls instead of knobs, and motion-sensing lighting complete the package without reading as institutional.',
      ],
    },
    {
      h2: 'Aging-in-place without the clinical look',
      paragraphs: [
        'The best accessible vanities look like furniture: a seated makeup-height section doubles as roll-under clearance, and drawer bases put contents at reachable height for everyone. We design these details into the original plan rather than retrofitting later.',
        'Pair this with our <a href="/blog/cabinets-for-long-term-living">cabinets for long-term living</a> article when planning a whole-home approach.',
      ],
    },
    {
      h2: 'When to plan accessibility',
      paragraphs: [
        'If you intend to stay in your Boise, Meridian, or Nampa home past retirement, build blocking for future grab bars and choose vanity layouts that adapt, during this remodel, when it costs nearly nothing.',
      ],
    },
  ],
  'bathroom-vanity-layout-guide': [
    {
      h2: 'Vanity layout by bathroom type',
      paragraphs: [
        'Guest and hall baths: a single 36 to 48-inch vanity with drawer storage handles most needs. Primary baths: double vanities from 60 inches (shared counter) to 72-plus inches (true two-sink), or two separated singles when the room allows.',
        'Powder rooms reward small furniture-style vanities where finish quality shows at close range.',
      ],
    },
    {
      h2: 'Clearances and mounting heights',
      paragraphs: [
        'Keep 30 inches of clear floor in front of the vanity, 15 inches minimum from sink centerline to a side wall, and 36-inch counter height as the modern standard. Floating vanities can fine-tune height to the household.',
      ],
    },
    {
      h2: 'Storage planning before style',
      paragraphs: [
        'Count what actually lives in the bathroom, hair tools, towels, paper goods, then allocate: shallow top drawers for daily items, deep drawers for dryers and supplies, a linen tower if towels store in-room. Style choices come easier once storage is solved.',
        'Browse <a href="/cabinets/bathroom">vanity configurations</a> and the <a href="/guides/boise-bathroom-vanity-guide">Boise vanity guide</a> for cost bands.',
      ],
    },
  ],
  'primary-suite-closet-cabinets': [
    {
      h2: 'From wire shelves to a real closet system',
      paragraphs: [
        'Most Treasure Valley primary closets, even in newer Meridian and Kuna builds, ship with a single wire shelf and rod. A custom system typically doubles usable capacity in the same footprint: double-hang sections for shirts, long-hang for dresses and coats, drawer stacks, and shoe shelving.',
      ],
    },
    {
      h2: 'Planning the system around your wardrobe',
      paragraphs: [
        'We inventory by category: how much double-hang, long-hang, folded storage, and shoes you own, then size sections to the real numbers plus growth room. Islands with drawers work in walk-ins over roughly 7 by 10 feet.',
        'See <a href="/cabinets/closet">closet systems</a> in the catalog for configurations.',
      ],
    },
    {
      h2: 'Details that make it feel built-in',
      paragraphs: [
        'Backing panels, crown to the ceiling, integrated LED rods, and a finish that matches your bedroom trim turn storage into a furniture-grade room. Drawer stacks with felt-lined top drawers handle watches and jewelry without a separate case.',
      ],
    },
  ],
  'garage-storage-cabinet-systems': [
    {
      h2: 'Garage systems for Idaho conditions',
      paragraphs: [
        'Treasure Valley garages swing from below freezing to over 100 degrees. Cabinet boxes and finishes must be specified for that range, which is why kitchen cabinets moved to the garage fail. Purpose-built garage systems use durable construction and hardware rated for heavy loads.',
      ],
    },
    {
      h2: 'Zoning the garage',
      paragraphs: [
        'Plan zones before boxes: a workbench wall with counters and tool storage, tall cabinets for ladders and seasonal gear, locking cabinets for chemicals away from kids, and open-floor parking clearance, in Kuna and Star, often for a truck.',
        'See <a href="/cabinets/garage">garage cabinet options</a> for bench, tall, and wall configurations.',
      ],
    },
    {
      h2: 'Floor clearance and moisture',
      paragraphs: [
        'Mount cabinets on legs or raised bases so snowmelt and hose water never wick into boxes. A 4-inch toe clearance also keeps sweeping and floor coatings simple.',
      ],
    },
  ],
  'multi-room-cabinet-planning': [
    {
      h2: 'Why plan rooms together',
      paragraphs: [
        'Cabinets ordered room by room from different vendors drift in finish, door style, and quality. Planning kitchen, baths, laundry, and built-ins as one program keeps finishes cohesive, consolidates lead times, and usually installs in fewer mobilizations.',
        'Start with the <a href="/guides/whole-home-cabinetry-guide">whole-home cabinetry guide</a> for the full framework.',
      ],
    },
    {
      h2: 'A practical sequencing plan',
      paragraphs: [
        'Kitchen first (longest lead, most decisions), baths second, then laundry, mudroom, closets, and media built-ins. Selections made once, door style, finish family, hardware, cascade to every room and cut decision fatigue dramatically.',
      ],
    },
    {
      h2: 'Phasing without losing cohesion',
      paragraphs: [
        'If budget spreads work across years, lock the finish and door-style program now and order rooms in phases. We keep your selections on file so a vanity ordered next year matches the kitchen installed this year.',
        'See <a href="/cabinets">all room categories</a> to scope your full program.',
      ],
    },
  ],
  'outdoor-kitchen-cabinets-boise': [
    {
      h2: 'Outdoor cabinets that survive Boise winters',
      paragraphs: [
        'Treasure Valley freeze-thaw cycles, dry summer heat, and patio dust demand outdoor-rated materials. Standard interior boxes fail outdoors within seasons; outdoor-rated construction with weather-appropriate detailing is the spec from day one.',
        'Covered patios extend material options; fully exposed installations narrow them. Placement is the first design decision, not the last.',
      ],
    },
    {
      h2: 'Designing around grill and appliances',
      paragraphs: [
        'Grills, side burners, outdoor refrigeration, and sinks each carry clearance and ventilation specs. We build cabinet runs around confirmed appliance models so cutouts, heat shielding, and gas and water lines land correctly.',
        'See <a href="/cabinets/outdoor">outdoor kitchen cabinets</a> and pair with <a href="/blog/outdoor-bar-cabinet-storage">outdoor bar storage</a> for entertaining zones.',
      ],
    },
    {
      h2: 'Permits and HOA review',
      paragraphs: [
        'Gas and electrical for outdoor kitchens trigger Ada or Canyon County permits, and exterior structures can trigger HOA review in communities like Hidden Springs and Harris Ranch. Both belong in the schedule before fabrication.',
      ],
    },
    {
      h2: 'Season planning',
      paragraphs: [
        'Outdoor kitchen demand peaks in spring. Design in winter to be grilling by June; winterization, water lines drained, refrigeration handled per spec, keeps the investment healthy.',
      ],
    },
    {
      h2: 'Outdoor cabinet cost bands in Boise',
      paragraphs: [
        'Most Treasure Valley outdoor kitchen cabinet programs plan from roughly $8,000 to $30,000+ installed, depending on linear footage, appliance cutouts, and whether the run is covered or exposed. Grill surrounds with storage and counter space capture most of the function at the lower end of the band.',
        'Anchor your budget with the <a href="/guides/boise-cabinet-cost-guide">Boise Cabinet Cost Guide</a> outdoor row and the June 2026 cost index midpoint (~$16,000) before you finalize appliance packages.',
      ],
    },
  ],
  'outdoor-bar-cabinet-storage': [
    {
      h2: 'Outdoor bar zones that work',
      paragraphs: [
        'A working outdoor bar needs covered storage for glassware and barware, weather-rated refrigeration, and counter depth for serving. Position the bar to serve both patio seating and the kitchen pass-through if one exists.',
      ],
    },
    {
      h2: 'Storage that handles the off-season',
      paragraphs: [
        'October to April, outdoor bars in the Treasure Valley sit idle. Sealed cabinet storage protects bottles and equipment from dust and freeze cycles; drainable refrigeration lines and removable accessories simplify winterization.',
        'See <a href="/cabinets/wet-bar">wet bar cabinets</a> and <a href="/cabinets/outdoor">outdoor cabinetry</a> for configurations.',
      ],
    },
    {
      h2: 'Matching the bar to the house',
      paragraphs: [
        'Outdoor bars read best when they echo interior finishes, the same door profile in an outdoor-rated finish ties patio and kitchen together, a detail that matters for Eagle and foothills entertaining homes.',
      ],
    },
    {
      h2: 'Sizing a working outdoor bar',
      paragraphs: [
        'For real entertaining, plan on 24 to 30 inches of serving counter per guest zone, a weather-rated undercounter refrigerator or ice bin within a step of the bartender, and at least one bank of sealed drawers for tools and linens. Bar-height counters run 42 inches; a 12 to 16 inch overhang seats stools comfortably.',
        'Keep the bar within a short walk of the grill and the pass-through to the indoor kitchen so a host is never carrying loads across the whole patio.',
      ],
    },
  ],
  'premium-outdoor-cabinetry': [
    {
      h2: 'What premium means outdoors',
      paragraphs: [
        'Premium outdoor cabinetry is engineering first: marine-grade or outdoor-rated box construction, hardware that shrugs off temperature swings, and finishes warrantied for UV exposure. The luxury look fails fast without the materials science underneath.',
      ],
    },
    {
      h2: 'Full outdoor rooms, not just grill runs',
      paragraphs: [
        'Foothills and Eagle projects increasingly treat the patio as a second kitchen: refrigeration, ice, storage walls, and bar seating under a covered structure. These programs deserve the same layout discipline as interior kitchens, zones, clearances, and lighting planned together.',
        'Start with <a href="/cabinets/outdoor">outdoor cabinets</a> and the <a href="/blog/outdoor-kitchen-cabinets-boise">Boise outdoor kitchen article</a>.',
      ],
    },
    {
      h2: 'How Treasure Valley weather tests outdoor cabinets',
      paragraphs: [
        'Our climate is hard on outdoor cabinetry: 90 to 100 degree dry summers, sub-freezing winters with snow, and big day-to-night temperature swings that make materials expand and contract constantly. High-altitude UV also fades and chalks anything not rated for it.',
        'That is why premium outdoor boxes use marine-grade polymer (HDPE) or powder-coated stainless rather than standard cabinet materials, with sealed or gasketed doors and stainless hardware. Uncovered patios need the most weatherproof spec; a covered structure dramatically extends the life of everything under it.',
      ],
    },
    {
      h2: 'Investment perspective',
      paragraphs: [
        'Premium outdoor programs are entertainment infrastructure. Our <a href="/blog/outdoor-cabinet-roi">outdoor cabinet ROI</a> article covers where the value holds in the Treasure Valley market.',
      ],
    },
  ],
  'cabinet-project-planning-guide': [
    {
      h2: 'Plan in this order',
      paragraphs: [
        'Scope, budget, selections, schedule. Decide which rooms are in scope, set a planning range per room from the <a href="/guides/boise-cabinet-cost-guide">cost guide</a>, make door and finish selections early, then build the calendar around fabrication lead time.',
        'Homeowners who reverse the order, picking install dates before selections exist, are the ones who end up disappointed by lead-time math.',
      ],
    },
    {
      h2: 'Budget structure that prevents surprises',
      paragraphs: [
        'Cabinets, counters, appliances, and trades are separate budget lines. Hold 5 to 10 percent contingency, more for pre-1980 Boise homes where opened walls reveal surprises. Written line-item scope before fabrication is your protection.',
      ],
    },
    {
      h2: 'Decision checklist before fabrication',
      list: [
        'Layout approved against measured field dimensions',
        'Door style and finish locked with physical samples seen at home',
        'Appliance models confirmed (especially panel-ready)',
        'Hardware selected and counted',
        'Counter material chosen so overhangs and supports are designed in',
      ],
      paragraphs: [
        'Our <a href="/blog/cabinet-planning-checklist">cabinet planning checklist</a> expands each item.',
      ],
    },
  ],
  'cabinet-buying-mistakes': [
    {
      h2: 'The expensive mistakes, ranked',
      paragraphs: [
        'The costliest mistakes we see in Boise, Meridian, and Eagle projects: comparing quotes with mismatched scope, choosing finish from a tiny sample under showroom light, ignoring interior storage while obsessing over door fronts, and ordering before appliance specs are final.',
      ],
    },
    {
      h2: 'Scope mismatch: the quote trap',
      paragraphs: [
        'A low quote that excludes delivery, installation, or interior accessories is not lower, it is incomplete. Demand line-item scope on every bid; our <a href="/blog/how-to-compare-cabinet-quotes">quote comparison article</a> shows exactly what to align.',
      ],
    },
    {
      h2: 'Sample and lighting mistakes',
      paragraphs: [
        'Finishes shift dramatically between showroom and home lighting. View full-size door samples in your actual kitchen, morning and evening, before sign-off. Idaho\'s bright, dry light flattens some tones and warms others.',
      ],
    },
    {
      h2: 'Storage and spec mistakes',
      paragraphs: [
        'Buying doors instead of drawers for base cabinets is the storage regret we hear most. And panel-ready appliances ordered after cabinet fabrication are a guaranteed change order; lock specs first.',
      ],
    },
  ],
  'whole-home-cabinet-timeline': [
    {
      h2: 'Whole-home program timelines',
      paragraphs: [
        'A coordinated kitchen, bath, laundry, and built-in program in a Boise or Meridian home typically runs 3 to 6 months from first consultation to final walkthrough: 3 to 6 weeks of design and selections across all rooms, 6 to 10 weeks of fabrication, and staged installation by room.',
        'The win versus sequential single-room projects: selections happen once, fabrication batches together, and trades mobilize fewer times.',
      ],
    },
    {
      h2: 'Staging installation by room',
      paragraphs: [
        'Kitchen installs first while the household runs on a temporary setup; baths follow one at a time so a working bathroom always exists; laundry, mudroom, closets, and media units slot between. We sequence around how your family actually lives.',
        'Read <a href="/blog/living-through-cabinet-installation">living through cabinet installation</a> for day-to-day expectations.',
      ],
    },
    {
      h2: 'Schedule risks specific to whole-home work',
      paragraphs: [
        'One late selection holds an entire fabrication batch. We lock the full selection program, door style, finishes, hardware for every room, before release. Counters template per room after bases set, adding a week per zone.',
        'See the <a href="/guides/whole-home-cabinetry-guide">whole-home cabinetry guide</a> for the planning framework.',
      ],
    },
  ],
  'living-through-cabinet-installation': [
    {
      h2: 'What installation actually feels like',
      paragraphs: [
        'Cabinet installation is the calm end of remodeling: no demolition dust storms, mostly daytime work, rooms usable each evening. A typical Boise or Nampa kitchen takes 2 to 5 install days; expect tool noise, protected floors and pathways, and a crew that resets the space nightly.',
      ],
    },
    {
      h2: 'Kitchen survival plan',
      paragraphs: [
        'Set up a temporary kitchen before demo day: microwave, coffee, a folding table, and a wash station at the laundry sink. Plan simple meals for install week; counters template after bases set, so full function returns 1 to 2 weeks after cabinets land.',
      ],
    },
    {
      h2: 'Pets, kids, and work-from-home',
      paragraphs: [
        'Gate pets away from work zones, walk kids through what is off-limits, and if you work from home, expect intermittent noise from 8 to 5; schedule calls away from install days when you can. Our Friday written updates tell you exactly which days matter.',
      ],
    },
    {
      h2: 'Daily rhythm with our crew',
      paragraphs: [
        'You will know each day\'s plan in advance, who is coming, what gets installed, and any decisions needed. Punch-list items get logged through your client portal so nothing rides on a hallway conversation. See the <a href="/blog/cabinet-installation-punch-list">punch list article</a> for closeout details.',
      ],
    },
  ],
  'cabinet-refresh-vs-replace-vs-moving': [
    {
      h2: 'The three-way decision',
      paragraphs: [
        'When the kitchen stops working, homeowners in Boise, Meridian, and Kuna weigh three paths: refresh (paint or hardware on existing boxes), replace (new cabinets in the existing home), or move. The right answer depends on box condition, layout fit, and what comparable homes cost.',
      ],
    },
    {
      h2: 'When a refresh is enough',
      paragraphs: [
        'Refresh works when boxes are sound plywood, the layout already functions, and the problem is cosmetic. It fails when drawers are failing, the layout fights daily life, or particleboard boxes have moisture damage, paint cannot fix structure.',
      ],
    },
    {
      h2: 'Why replacement usually beats moving here',
      paragraphs: [
        'Moving costs in the Treasure Valley, agent fees, moving expenses, and the rate gap on a new mortgage, often exceed a full cabinet replacement before you unpack a single box. If the neighborhood, schools, and commute work, new cabinets in the current home keep those advantages and add exactly the kitchen you want.',
        'Run your numbers against the <a href="/guides/boise-cabinet-cost-guide">cost guide</a> and the <a href="/blog/cabinet-upgrades-before-selling">selling-prep article</a> if a sale is still on the table.',
      ],
    },
  ],
  'custom-cabinet-design-process': [
    {
      h2: 'How custom design actually works',
      paragraphs: [
        'Our design process runs in five steps: in-home consultation and measure, concept layout, selections (door style, finish, hardware, interiors), detailed shop drawings, and final sign-off. Each step has a deliverable you approve in writing before the next begins.',
      ],
    },
    {
      h2: 'The measure is the foundation',
      paragraphs: [
        'Field measurement captures what stock cabinets ignore: out-of-plumb walls, floor slope, window casing positions, and ceiling variation. In pre-1980 Boise homes these variances decide cabinet sizing; in newer Meridian builds they confirm the plan matches the print.',
      ],
    },
    {
      h2: 'Selections without overwhelm',
      paragraphs: [
        'Six door styles and 299 finishes sound overwhelming until they are sequenced: door profile first, finish family second, exact finish from physical samples at home third, hardware last. Use the <a href="/finder">finish finder</a> to shortlist before your appointment.',
      ],
    },
    {
      h2: 'Shop drawings and sign-off',
      paragraphs: [
        'Dimensioned elevations show every cabinet, filler, and panel before fabrication. Changes at the drawing stage cost nothing; changes after release restart lead time. Read the <a href="/blog/cabinet-measurement-design-phase">measurement and design phase article</a> for what to check on your drawings.',
      ],
    },
  ],
  'cabinet-planning-checklist': [
    {
      h2: 'Before you call anyone',
      list: [
        'Photograph your current space and list what fails daily',
        'Measure rough room dimensions and ceiling height',
        'Set a planning range from the <a href="/guides/boise-cabinet-cost-guide">cost guide</a>',
        'Collect 5 to 10 inspiration photos and note what they share',
        'Decide scope: one room or a multi-room program',
      ],
      paragraphs: [],
    },
    {
      h2: 'During design',
      list: [
        'Confirm appliance models, especially panel-ready units',
        'Choose drawers vs doors for every base cabinet deliberately',
        'View finish samples in your home lighting, morning and evening',
        'Verify trash, recycling, and small-appliance homes exist in the plan',
        'Check drawings against field measurements before sign-off',
      ],
      paragraphs: [],
    },
    {
      h2: 'Before fabrication release',
      list: [
        'Written line-item scope signed',
        'Hardware selected and counted',
        'Counter material chosen (affects overhang support)',
        'Install dates and household logistics planned',
        'Contingency held: 5 to 10 percent, more for older Boise homes',
      ],
      paragraphs: [
        'Print this against our <a href="/blog/cabinet-project-planning-guide">project planning guide</a> for the full narrative version.',
      ],
    },
  ],
};
