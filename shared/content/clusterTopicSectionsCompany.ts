import type { ContentSection } from './wave1/snippets';

/**
 * Slug-specific topic depth for choosing-a-company, project-process, and
 * ROI cluster posts, plus tier-1 catalog education articles.
 */
export const COMPANY_TOPIC_SECTIONS: Record<string, ContentSection[]> = {
  'questions-to-ask-cabinet-company': [
    {
      h2: 'Questions about the cabinets themselves',
      list: [
        'What is the box construction: plywood or particleboard, and what thickness?',
        'Are soft-close hinges and full-extension drawer slides standard or upgrades?',
        'How many door styles and finishes can I actually order?',
        'Are cabinets built to order for my dimensions, or modified stock sizes?',
        'Can I see and keep physical finish samples at home before sign-off?',
      ],
      paragraphs: [
        'Compare answers against our published <a href="/construction">construction standards</a>; any company should answer these without hedging.',
      ],
    },
    {
      h2: 'Questions about scope and money',
      list: [
        'Is the quote line-item: cabinets, delivery, installation, accessories separated?',
        'What exactly is excluded (counters, plumbing, electrical, disposal)?',
        'How are change orders priced and approved?',
        'What deposit schedule do you use, and what triggers each payment?',
      ],
      paragraphs: [
        'Mismatched scope is why quotes vary wildly; see <a href="/blog/how-to-compare-cabinet-quotes">how to compare cabinet quotes</a>.',
      ],
    },
    {
      h2: 'Questions about process and accountability',
      list: [
        'Who is my single point of contact from design through installation?',
        'How often will I get written status updates?',
        'Who does the installation: your employees or subcontractors?',
        'What does your workmanship warranty cover, in writing?',
        'How do you handle punch-list items after install?',
      ],
      paragraphs: [
        'The answers reveal more than any showroom visit. Whether you are interviewing companies in Boise, Meridian, or Nampa, a company that cannot name your project manager or produce a written warranty is telling you how the project will go.',
      ],
    },
    {
      h2: 'Questions about local experience',
      list: [
        'How many kitchens have you installed in my city in the last 12 months?',
        'Do you handle Ada County and Canyon County permits when layout work is involved?',
        'Can you reference a project similar to my home era and layout?',
        'How do you scribe-fit cabinets to out-of-plumb walls common in older Boise homes?',
      ],
      paragraphs: [
        'Local experience shows up in field measures, permit fluency, and realistic timelines. Review our city guides at <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley</a>, <a href="/guides/boise-cabinet-guide">Boise</a>, and <a href="/guides/meridian-cabinet-guide">Meridian</a> for the housing context your bidder should recognize.',
      ],
    },
    {
      h2: 'Bring this checklist to every consultation',
      paragraphs: [
        'Print or save these questions and leave space for written answers. Companies that hesitate on box construction, warranty terms, or installation scope are saving those details for change orders later.',
        'After interviews, compare responses with <a href="/blog/how-to-compare-cabinet-quotes">how to compare cabinet quotes</a> and <a href="/blog/cabinet-company-red-flags">cabinet company red flags</a> before you sign.',
      ],
    },
  ],
  'cabinet-company-red-flags': [
    {
      h2: 'Red flags before you sign',
      paragraphs: [
        'Pressure to sign at the first visit, a verbal-only estimate, a deposit demand above half the project value, and no physical address or license information are the classic warning signs in any market, including Boise and the Treasure Valley.',
        'A bid dramatically below the others is not a bargain; it is missing scope you will pay for later as change orders.',
      ],
    },
    {
      h2: 'Red flags in the paperwork',
      paragraphs: [
        'No line-item scope, no written change-order process, vague warranty language ("lifetime" with no document), and contracts that let the company substitute materials without approval all shift risk onto you.',
        'Compare paperwork quality across bidders; it predicts communication quality after the deposit clears.',
      ],
    },
    {
      h2: 'Red flags during the project',
      paragraphs: [
        'Going dark between milestones, crews that change weekly, and surprise costs presented after work is done are recoverable only if your contract has the protections above. Weekly written updates should be the baseline, which is why we put them in writing for every project.',
        'Vet companies with our <a href="/blog/questions-to-ask-cabinet-company">questions checklist</a> before the deposit, not after.',
      ],
    },
  ],
  'what-makes-great-cabinet-company': [
    {
      h2: 'Craft is table stakes; systems are the difference',
      paragraphs: [
        'Most established Treasure Valley cabinet shops can build a good box. What separates a great company is everything around the box: accurate field measurement, honest lead-time promises, written scope, proactive communication, and a warranty that gets honored without a fight.',
      ],
    },
    {
      h2: 'The five markers we would look for',
      list: [
        'Written line-item scope before fabrication, every time',
        'One accountable project manager from consult to walkthrough',
        'In-house installers rather than rotating subcontractors',
        'A written workmanship warranty with a named process for claims',
        'Published construction standards you can verify, like our <a href="/construction">construction page</a>',
      ],
      paragraphs: [],
    },
    {
      h2: 'Local fluency matters',
      paragraphs: [
        'A great Treasure Valley company knows Ada and Canyon County permit triggers, HOA review habits in Eagle and Hidden Springs, and how pre-1980 Boise walls behave during installation. That local fluency shows up as schedules that hold.',
        'See <a href="/guides/choose-cabinet-company-boise">how to choose a cabinet company in Boise</a> for the full evaluation framework.',
      ],
    },
  ],
  'how-to-compare-cabinet-quotes': [
    {
      h2: 'Align scope before comparing numbers',
      paragraphs: [
        'Two Boise cabinet quotes are only comparable when box construction, door style, finish tier, hardware, interior accessories, delivery, and installation all match. Build a one-page matrix and force every bid into the same rows before looking at totals.',
      ],
    },
    {
      h2: 'The comparison matrix',
      table: {
        className: 'cost-table',
        headers: ['Line item', 'What to verify on each quote'],
        rows: [
          ['Box construction', 'Plywood vs particleboard, thickness'],
          ['Hardware', 'Soft-close standard? Slide rating?'],
          ['Interior accessories', 'Roll-outs, trash pull-out, organizers included?'],
          ['Delivery & install', 'Included, itemized, or excluded?'],
          ['Warranty', 'Written? Years? Workmanship and materials?'],
          ['Exclusions', 'Counters, disposal, plumbing, electrical'],
        ],
      },
      paragraphs: [
        'Most "cheap" quotes lose their advantage by the third row.',
      ],
    },
    {
      h2: 'Normalize the timeline too',
      paragraphs: [
        'A quote with a 16-week lead time and a quote with 6 weeks are different products. Ask what drives each company\'s lead time and what happens to your schedule if fabrication slips.',
        'Background reading: <a href="/blog/why-cabinet-quotes-vary">why cabinet quotes vary</a> and <a href="/blog/fixed-price-vs-cost-plus">fixed price vs cost plus</a>.',
      ],
    },
    {
      h2: 'Red flags in a low quote',
      paragraphs: [
        'Quotes that exclude installation, use vague "allowance" language for hardware, or omit interior accessory counts will rise once the project starts. Another flag: no shop drawings before fabrication, which means you are buying a price, not a defined product.',
        'Use our <a href="/blog/questions-to-ask-cabinet-company">questions to ask a cabinet company</a> checklist during the interview phase so scope gaps surface before you sign.',
      ],
    },
    {
      h2: 'Example: comparing two Boise kitchen bids',
      paragraphs: [
        'Bid A at $22,000 and Bid B at $31,000 look 40 percent apart until you line them up: Bid A uses particleboard boxes with partial-extension slides and excludes install; Bid B uses plywood, soft-close everything, and includes delivery and installation. Normalized, they are often within 10 to 15 percent, with Bid B carrying less homeowner risk.',
        'Anchor your matrix against the planning bands in the <a href="/guides/boise-cabinet-cost-guide">Boise Cabinet Cost Guide</a> so outliers are obvious before you negotiate.',
      ],
    },
  ],
  'why-cabinet-quotes-vary': [
    {
      h2: 'The four real drivers of quote spread',
      paragraphs: [
        'When three Boise cabinet quotes land 40 percent apart, the spread almost always traces to four things: box construction tier, what hardware and interior accessories are standard versus upgrade, whether installation and delivery are inside the number, and how much risk contingency the company carries for your specific house.',
      ],
    },
    {
      h2: 'Construction tier is invisible on paper',
      paragraphs: [
        'A particleboard box with basic slides and a plywood box with soft-close, full-extension hardware can wear the same door photo. The quote difference is real product difference; verify against published <a href="/construction">construction standards</a>.',
      ],
    },
    {
      h2: 'Old-house risk pricing',
      paragraphs: [
        'Experienced installers price pre-1980 North End and Bench homes with field-condition contingency: out-of-plumb walls, sloped floors, surprise framing. A bid that ignores those realities is a bid that becomes change orders.',
        'Use the matrix in <a href="/blog/how-to-compare-cabinet-quotes">how to compare cabinet quotes</a> to expose what each number really contains.',
      ],
    },
  ],
  'cabinet-consultation-process': [
    {
      h2: 'What happens at the consultation',
      paragraphs: [
        'Our free consultation runs 60 to 90 minutes at your home, anywhere from Boise to Caldwell: we walk the space, measure, discuss how the room fails you today, review door style and finish directions with physical samples, and leave you with a realistic planning range, in writing, with zero obligation.',
      ],
    },
    {
      h2: 'How to get the most from it',
      list: [
        'Have your inspiration photos and a list of daily frustrations ready',
        'Know your rough budget comfort zone (the <a href="/guides/boise-cabinet-cost-guide">cost guide</a> helps)',
        'Flag appliance plans, especially panel-ready or new sizes',
        'Ask about lead times against any date that matters to you',
      ],
      paragraphs: [],
    },
    {
      h2: 'What it is not',
      paragraphs: [
        'No close-tonight pricing games and no pressure scripts. The consultation exists to produce an accurate plan; if we are not the right fit, you still leave with useful planning numbers and a clearer scope. That is the standard any company should meet.',
      ],
    },
  ],
  'custom-cabinet-shop-vs-big-box': [
    {
      h2: 'What big-box stores do well',
      paragraphs: [
        'Home Depot, Lowe\'s, and IKEA offer fast availability on stock sizes, national-brand financing, and low entry prices for simple, rectangular kitchens. For a rental refresh or a flip on a tight budget, stock lines have a legitimate place.',
      ],
    },
    {
      h2: 'Where the model breaks down',
      paragraphs: [
        'Stock sizes jump in 3-inch increments, so real Boise kitchens, with soffits, off-square corners, and 9-foot ceilings, end up wrapped in filler strips and dead space. Measurement, delivery, and installation are typically separate vendors, which means separate accountability when something does not fit.',
        'Lead-time reality also surprises buyers: special-order big-box cabinets often take as long as custom fabrication without the custom fit.',
      ],
    },
    {
      h2: 'What a local custom shop changes',
      paragraphs: [
        'Built-to-order sizing uses every inch, one team owns measure-build-install accountability, and finish options expand from a dozen to hundreds, compare our <a href="/catalog">299 finishes</a> and six door styles. Warranty service comes from people who will still be in Meridian next decade.',
      ],
    },
    {
      h2: 'The honest decision rule',
      paragraphs: [
        'Simple rectangular kitchen, standard ceiling, tight budget: stock may serve. Anything with character, age, height, or a layout change: custom pays for itself in fit and storage. Run both against <a href="/blog/stock-vs-custom-cabinets-boise">stock vs custom in Boise</a>.',
      ],
    },
    {
      h2: 'Visiting showrooms vs seeing your home measured',
      paragraphs: [
        'Big-box displays sell aspiration; they rarely show how stock widths land on a 1958 Bench ranch wall. A local shop should measure your actual room, bring finish samples to your lighting, and produce dimensioned drawings before you commit.',
        'Schedule a consultation through <a href="/contact">our contact page</a> or use the <a href="/estimate">project estimator</a> to set a planning range before you tour any showroom.',
      ],
    },
  ],
  'fixed-price-vs-cost-plus': [
    {
      h2: 'The two pricing models',
      paragraphs: [
        'Fixed price: one number for defined scope, with the company carrying estimating risk. Cost plus: you pay actual costs plus a stated margin, carrying the risk yourself in exchange for transparency. Cabinet projects in Boise and across the valley, unlike full remodels, almost always belong in fixed price because scope is definable up front.',
      ],
    },
    {
      h2: 'Why cabinets fit fixed pricing',
      paragraphs: [
        'A measured layout with locked selections is a fully definable product. We quote fixed numbers from shop drawings, and any mid-project change requires a written change order you approve first, the structure that keeps surprises off your invoice.',
      ],
    },
    {
      h2: 'When you encounter cost plus',
      paragraphs: [
        'Cost-plus appears in whole-home remodels where cabinet work rides inside a general contract. If your cabinet line is cost plus, demand the cabinet allowance in writing and check it against the <a href="/guides/boise-cabinet-cost-guide">cost guide</a> ranges; vague allowances are where budgets quietly break.',
      ],
    },
  ],
  'custom-vs-reserve-cabinets': [
    {
      h2: 'Built to your exact specifications',
      paragraphs: [
        'Every Boise Cabinet Co cabinet is made to order: your dimensions, your door style, your finish, your interior configuration. There is no warehouse of pre-built boxes being trimmed to fit; fabrication starts from your approved shop drawings.',
      ],
    },
    {
      h2: 'What built-to-order solves',
      paragraphs: [
        'Odd ceiling lines in North End bungalows, tight galley clearances, 9 and 10-foot ceilings in newer Eagle builds, and out-of-plumb walls everywhere: custom sizing addresses each without filler-strip compromises.',
        'It also means selections are real choices, six <a href="/catalog">door styles</a>, 299 <a href="/catalog">finishes in the catalog</a>, and interior accessories configured per cabinet.',
      ],
    },
    {
      h2: 'How to compare against other models',
      paragraphs: [
        'When comparing us against semi-custom or stock lines, compare warranty, box construction, and install scope, not door photos. Our <a href="/compare">comparison page</a> and <a href="/construction">construction standards</a> lay out exactly what is in every box.',
      ],
    },
  ],
  'stock-vs-custom-cabinets-boise': [
    {
      h2: 'The practical differences',
      table: {
        className: 'cost-table',
        headers: ['Factor', 'Stock', 'Custom'],
        rows: [
          ['Sizing', '3-inch increments, fillers required', 'Built to your walls'],
          ['Finishes', 'A dozen or so', 'Hundreds (we offer 299)'],
          ['Lead time', 'Days to 10+ weeks (special order)', 'Typically 4-8 weeks'],
          ['Accountability', 'Store + installer + manufacturer', 'One local team'],
          ['Fit in older homes', 'Poor without carpentry workarounds', 'Designed for it'],
        ],
      },
      paragraphs: [],
    },
    {
      h2: 'Boise housing makes the choice sharper',
      paragraphs: [
        'Much of Boise\'s charm housing predates square walls. Stock boxes in a 1955 Bench ranch mean visible gaps or hours of installer improvisation; built-to-order boxes are dimensioned from field measurements instead.',
        'Newer Meridian and Kuna subdivisions are friendlier to stock sizing, which is where the budget math gets a genuine comparison.',
      ],
    },
    {
      h2: 'Blended strategies',
      paragraphs: [
        'Some projects sensibly blend: custom perimeter where fit shows, simpler storage in the garage or laundry. We will tell you when a simpler product serves a space; see <a href="/blog/custom-cabinet-shop-vs-big-box">custom shop vs big box</a> for the vendor-level comparison.',
      ],
    },
    {
      h2: 'Total cost of ownership over 10 years',
      paragraphs: [
        'Stock boxes that swell at the sink line, slides that sag, and finishes that peel at joints often trigger a second replacement within a decade. Custom plywood boxes with full-extension soft-close slides and a written workmanship warranty amortize across daily use in a primary kitchen you will not revisit for 15 to 20 years.',
        'When comparing bids, ask each company what happens at year five if a drawer front delaminates or a hinge fails. Local accountability matters more than entry price in Boise\'s dry, wide-swing humidity climate.',
      ],
    },
    {
      h2: 'When stock is the right call in the Treasure Valley',
      paragraphs: [
        'Rental turnovers, garage laundry zones, and flip properties where the kitchen already functions can justify stock or value lines. If the goal is a neutral refresh before listing in Nampa or Caldwell, match neighborhood comps rather than overbuilding for Eagle-level finish expectations.',
      ],
    },
  ],
  'cabinet-construction-quality-guide': [
    {
      h2: 'Reading a cabinet spec sheet',
      paragraphs: [
        'Quality lives in the boring lines: box material and thickness, back-panel construction, drawer-box joinery, slide ratings, and hinge brand. Two Boise cabinet quotes with identical doors can hide a decade of durability difference in those rows.',
      ],
    },
    {
      h2: 'The specs that predict lifespan',
      list: [
        'Plywood box construction resists moisture where particleboard swells',
        'Dovetail or doweled drawer boxes outlast stapled corners',
        'Full-extension, soft-close slides rated 75 lbs+ for daily drawers',
        'Adjustable, metal-clip shelf systems instead of plastic pins',
        'Finish warrantied against peeling, not just "factory applied"',
      ],
      paragraphs: [
        'Our <a href="/construction">construction standards page</a> documents what we build into every box, use it as your checklist against any competing quote.',
      ],
    },
    {
      h2: 'Idaho-specific durability',
      paragraphs: [
        'Treasure Valley homes run dry, with big seasonal humidity swings. Quality finishes and engineered panels handle that movement; bargain finishes crack at joints within a few winters. Ask any bidder how their finish behaves in a 20 percent humidity January.',
      ],
    },
  ],
  'cabinet-finishes-door-styles-guide': [
    {
      h2: 'Sequence the decision',
      paragraphs: [
        'Choose in this order: door profile, finish family (matte, gloss, woodgrain), exact finish from physical samples in your home, hardware last. Sequencing prevents the showroom overwhelm of facing 299 finishes at once.',
        'Start the shortlist online with the <a href="/catalog">catalog</a>, then confirm with samples in your actual light.',
      ],
    },
    {
      h2: 'Matching profile to home era',
      paragraphs: [
        'Simple shaker profiles suit nearly every Treasure Valley home. Slab doors fit contemporary Eagle and Star builds; 3 Piece and wider-rail shakers sit comfortably in transitional Meridian subdivisions. Heavily ornamented doors fight the clean-lined architecture most valley homes share.',
      ],
    },
    {
      h2: 'Finish families in practice',
      paragraphs: [
        'Matte hides fingerprints and suits family kitchens; gloss amplifies light in smaller or darker rooms but shows prints on dark tones; woodgrain brings warmth and pairs beautifully as an island accent against a painted perimeter. Browse all three in the <a href="/catalog">catalog</a>.',
      ],
    },
  ],
  'cabinet-measurement-design-phase': [
    {
      h2: 'What we measure and why',
      paragraphs: [
        'Field measurement records wall lengths at multiple heights, floor level across the run, ceiling height at each corner, window and door casings, plumbing and electrical locations, and existing soffits. Cabinets are dimensioned from this reality, not from builder prints that rarely match it.',
      ],
    },
    {
      h2: 'Old Boise vs new Meridian',
      paragraphs: [
        'In pre-1980 homes, an inch of wall lean over an 8-foot run is normal; scribe allowances and custom widths absorb it invisibly. In newer construction, measurement mostly confirms the print, but island electrical and vent routing still earn verification before drawings.',
      ],
    },
    {
      h2: 'Your role in the design phase',
      paragraphs: [
        'Review drawings against how you actually cook and store: does every base have the drawer-vs-door choice you want, is the trash pull-out beside the prep zone, do appliance panels match confirmed models? Drawing changes are free; post-release changes restart lead time.',
        'Continue with <a href="/blog/cabinet-design-development">design development</a> for the drawing-to-approval stage.',
      ],
    },
  ],
  'cabinet-design-development': [
    {
      h2: 'From concept to shop drawings',
      paragraphs: [
        'Design development turns the agreed concept into dimensioned shop drawings: every cabinet, filler, panel, and clearance specified. Whether the project is a Boise bungalow kitchen or a Meridian whole-home program, this is where it becomes buildable, and where careful review pays the highest dividend of the entire process.',
      ],
    },
    {
      h2: 'What to check on your drawings',
      list: [
        'Cabinet widths against the measured plan, including fillers',
        'Drawer vs door configuration for every base cabinet',
        'Appliance openings against confirmed model specs',
        'Outlet, switch, and vent locations relative to backsplash runs',
        'Crown, light rail, and end-panel details at exposed sides',
      ],
      paragraphs: [],
    },
    {
      h2: 'Locking selections',
      paragraphs: [
        'Door style, finish, and hardware lock at drawing approval because fabrication purchases materials from those selections. We require physical sample review at home before this gate, the step that prevents nearly every finish regret.',
        'Next in the series: <a href="/blog/cabinet-fabrication-installation">fabrication and installation</a>.',
      ],
    },
  ],
  'cabinet-fabrication-installation': [
    {
      h2: 'What happens during fabrication',
      paragraphs: [
        'After drawing approval, materials are ordered and your cabinets are built to order over 4 to 8 weeks: panels cut, boxes assembled, doors finished, hardware fitted, and every unit quality-checked against the drawings before delivery is scheduled.',
        'Your client portal shows status through fabrication, so "is it on track" never requires a phone call.',
      ],
    },
    {
      h2: 'Installation week',
      paragraphs: [
        'Installation runs 2 to 5 days for most kitchens: protection down, bases set level against the measured datum, uppers hung, panels and fillers scribed, doors and drawers adjusted, hardware aligned. Out-of-level floors, normal in older Boise homes, are absorbed at the base so counters land flat.',
      ],
    },
    {
      h2: 'After cabinets land',
      paragraphs: [
        'Counter templating follows base installation, with fabrication and install adding 1 to 2 weeks before full kitchen function. Final adjustment and the punch-list walkthrough close the project; see the <a href="/blog/cabinet-installation-punch-list">punch list article</a> for that stage.',
      ],
    },
  ],
  'cabinet-installation-punch-list': [
    {
      h2: 'What belongs on a cabinet punch list',
      paragraphs: [
        'Door and drawer alignment, consistent reveals, hardware placement, soft-close operation on every hinge and slide, scribe and caulk lines at walls and ceilings (especially in older Boise homes), finish touch-ups, and interior accessory operation. Walk every cabinet, open everything, and look down sight lines where reveals show.',
      ],
    },
    {
      h2: 'How our closeout works',
      paragraphs: [
        'We walk the punch list together at final walkthrough and log items in your client portal with photos. Items get scheduled, completed, and marked off in the portal, no hallway-conversation promises that evaporate. Warranty service requests after closeout flow through the same system.',
      ],
    },
    {
      h2: 'Seasonal settling',
      paragraphs: [
        'Idaho\'s humidity swing means doors may need one alignment touch-up after a season or two, normal wood and hardware behavior, covered under workmanship warranty. See the <a href="/blog/cabinet-warranty-guide">cabinet warranty guide</a> for what is covered long-term.',
      ],
    },
  ],
  'cabinet-warranty-guide': [
    {
      h2: 'What a real cabinet warranty covers',
      paragraphs: [
        'A meaningful warranty names three things in writing: workmanship (joinery, installation, alignment), materials (boxes, doors, finish adhesion), and hardware (hinges and slides, often carrying the manufacturer\'s own lifetime coverage). "Lifetime warranty" without a document is a slogan, not coverage.',
      ],
    },
    {
      h2: 'Our coverage',
      paragraphs: [
        'Boise Cabinet Co cabinets carry a limited lifetime warranty to the original homeowner on workmanship and materials, with service requests handled through your client portal. The full terms live on our <a href="/warranty">warranty page</a>, published, not produced on request.',
      ],
    },
    {
      h2: 'What typically is not covered, anywhere',
      paragraphs: [
        'Damage from water leaks, impact, modifications by others, and normal wear of finish at high-touch areas sit outside virtually every cabinet warranty. Knowing the exclusions up front is part of comparing companies honestly; ask every bidder for their written terms next to ours.',
      ],
    },
    {
      h2: 'What to expect in the first season, and how to file',
      paragraphs: [
        'New wood cabinets settle. In the first months, doors and drawer fronts can shift slightly with humidity swings and normal use, so a minor reveal adjustment is routine, not a defect. Our soft-close hinges are six-way adjustable, which lets a technician re-align a door in minutes.',
        'Because of that settling, door warping and finish-adhesion issues carry a defined coverage window (180 days) on top of the general workmanship terms, and service requests are filed through your client portal rather than a phone-tag process. Keep your project details handy and a request takes only a few minutes to log.',
      ],
    },
  ],
  'kitchen-cabinet-roi-boise': [
    {
      h2: 'What kitchen cabinets return in the Boise market',
      paragraphs: [
        'National Cost vs. Value data has minor kitchen remodels in the Mountain region recouping roughly 85 to 96 percent at resale in recent years, with cabinets the largest single line in that scope. In the Treasure Valley\'s supply-tight market, a current kitchen is often the difference between list price and over-ask.',
        'Full replacements recoup less on paper but carry the living-value years you actually use the kitchen.',
      ],
    },
    {
      h2: 'Where the ROI concentrates',
      paragraphs: [
        'Buyers respond to finish currency (current colors and profiles), visible storage (pantry walls, drawer bases, islands), and condition. A mid-tier custom package aligned to the neighborhood beats a luxury package the street cannot support, over-improving past comps caps your return.',
      ],
    },
    {
      h2: 'Matching investment to neighborhood',
      paragraphs: [
        'A $30,000 kitchen makes sense in Harris Ranch or Eagle; the same spend in an entry-level Kuna starter may exceed what comps return. Check the <a href="/guides/cabinet-roi-guide-boise">Boise cabinet ROI guide</a> and the <a href="/guides/boise-cabinet-cost-guide">cost guide</a> to position your spend.',
      ],
    },
    {
      h2: 'Cost vs. Value context for Idaho homeowners',
      paragraphs: [
        'Remodeling Magazine\'s Cost vs. Value report for the Mountain region is the most cited benchmark for kitchen and bath returns. Minor kitchen remodels with cabinet-forward scopes have recently recouped roughly 85 to 96 percent at resale, while you still capture years of daily use if you are staying put.',
        'Treat ROI as a positioning tool, not a guarantee: list when the kitchen is the objection, stay when the layout fails your family every morning. Pair numbers with <a href="/blog/cabinets-for-long-term-living">cabinets for long-term living</a> if you are not selling soon.',
      ],
    },
  ],
  'bathroom-vanity-roi-boise': [
    {
      h2: 'Vanity ROI in perspective',
      paragraphs: [
        'Mid-range bath remodels recoup roughly 70 to 85 percent in Mountain-region Cost vs. Value data, and the vanity is the visual anchor of that scope. Because vanity projects cost a fraction of full bath remodels, a vanity-led refresh is one of the highest-leverage updates before listing a Treasure Valley home.',
      ],
    },
    {
      h2: 'Which baths to prioritize',
      paragraphs: [
        'The primary bath drives buyer perception; the guest bath matters when it serves visitors and listing photos. Dated cultured-marble single vanities from the 1990s and 2000s, common across Meridian and Nampa subdivisions, are exactly the swap that photographs well.',
      ],
    },
    {
      h2: 'Spending the right amount',
      paragraphs: [
        'Guest baths reward simple, current vanities; primary suites support doubles with real storage. Planning bands live in the <a href="/guides/boise-bathroom-vanity-guide">Boise vanity guide</a>; resale positioning in <a href="/blog/cabinet-upgrades-before-selling">cabinet upgrades before selling</a>.',
      ],
    },
  ],
  'built-in-storage-roi': [
    {
      h2: 'How built-ins create value',
      paragraphs: [
        'Built-ins return value two ways: as finished square footage that works harder (a mudroom that ends entry clutter, an office that earns its room), and as the move-in-ready impression buyers pay premiums for. Appraisers credit quality built-ins as home improvements, not furniture.',
      ],
    },
    {
      h2: 'The built-ins buyers notice',
      paragraphs: [
        'In Treasure Valley listings: mudroom lockers in family neighborhoods, closet systems in primary suites, and media walls in great rooms photograph and show best. Garage systems impress in truck-and-toys markets like Kuna and Star.',
        'See <a href="/cabinets/built-ins">built-in options</a> and <a href="/cabinets/mudroom">mudroom systems</a> for scope ideas.',
      ],
    },
    {
      h2: 'ROI discipline for built-ins',
      paragraphs: [
        'Built-ins should solve a daily problem first and a resale story second; hyper-personalized configurations narrow your buyer pool. Keep systems adaptable, adjustable shelving, standard zones, and they sell as flexibility rather than someone else\'s habits.',
      ],
    },
  ],
  'outdoor-cabinet-roi': [
    {
      h2: 'Outdoor living value in the valley',
      paragraphs: [
        'Treasure Valley summers make outdoor living space genuinely usable five-plus months a year, and listings lean on patio photography accordingly. An outdoor kitchen reads as lifestyle square footage, strongest in Eagle, Star, and foothills markets where entertaining space is expected.',
      ],
    },
    {
      h2: 'Where outdoor cabinets hold value',
      paragraphs: [
        'Durability is the ROI guard: outdoor-rated construction that still looks right after five winters protects the investment, while failed bargain cabinetry actively hurts a listing. Covered installations hold value best; see <a href="/cabinets/outdoor">outdoor cabinet options</a>.',
      ],
    },
    {
      h2: 'Sizing the spend',
      paragraphs: [
        'A grill run with storage and counter space captures most of the buyer impression at a fraction of a full outdoor-room budget. Scale up only when the neighborhood supports it; <a href="/blog/premium-outdoor-cabinetry">premium outdoor cabinetry</a> covers the high end.',
      ],
    },
  ],
  'cabinet-upgrades-before-selling': [
    {
      h2: 'The pre-listing decision',
      paragraphs: [
        'Selling soon changes cabinet math entirely: you are buying buyer perception, not living value. The kitchen photo is the most-viewed image in every Boise and Meridian listing, and dated oak or worn thermofoil in that photo costs showings.',
      ],
    },
    {
      h2: 'High-leverage moves by budget',
      table: {
        className: 'cost-table',
        headers: ['Budget level', 'Move', 'Best when'],
        rows: [
          ['Low', 'Hardware swap + deep clean and touch-up', 'Boxes and finish are sound'],
          ['Medium', 'Vanity replacements + kitchen refresh', 'Baths date the house most'],
          ['Higher', 'Kitchen cabinet replacement', 'Kitchen is the obvious objection'],
        ],
      },
      paragraphs: [
        'Ask your agent which objection actually kills offers on comparable listings before choosing the tier.',
      ],
    },
    {
      h2: 'Timing and neutrality',
      paragraphs: [
        'Allow 8 to 12 weeks before listing for a cabinet replacement, and choose neutral, current finishes that photograph cleanly rather than personal statements. Pair this with <a href="/blog/kitchen-cabinet-roi-boise">kitchen cabinet ROI</a> for the return math.',
      ],
    },
  ],
  'cabinets-for-long-term-living': [
    {
      h2: 'Designing for the next 20 years',
      paragraphs: [
        'If this is your long-term home, in Boise, Star, Middleton, or anywhere in the valley, optimize for daily function and adaptability instead of resale photos: drawer bases everywhere (easier reach at every age), pull-down or reachable upper storage, and task lighting built into the plan.',
      ],
    },
    {
      h2: 'Aging-in-place, designed invisibly',
      paragraphs: [
        'Comfort-height counters, D-pulls instead of knobs, blocking for future grab bars, and a vanity layout that can accept a roll-under section later cost almost nothing during initial construction and everything as a retrofit. They read as good design, not medical equipment.',
        'See the <a href="/blog/accessible-bathroom-vanity-guide">accessible vanity guide</a> for bathroom specifics.',
      ],
    },
    {
      h2: 'Durability as the long-term strategy',
      paragraphs: [
        'Twenty-year cabinets mean plywood boxes, premium slides rated for decades of cycles, and finishes that handle Idaho\'s humidity swings, the construction tier where quality differences actually compound. Our <a href="/construction">construction standards</a> and <a href="/warranty">lifetime warranty</a> are built for exactly this owner.',
      ],
    },
  ],
};
