/**
 * Answer-first ledes, phrase H1s and the posts' own questions for the sixteen
 * short May 2026 posts (SEO audit CAB-T1 / CAB-S3, 20 November 2026).
 *
 * The cluster factory gave these posts template copy: ledes such as "Expert
 * {title} advice for Idaho homeowners.", keyword-fragment H1s such as "Kitchen
 * cabinet ROI Boise", and three generated FAQ items per post ("{Title}: what
 * should Treasure Valley homeowners know?", "What matters most when planning
 * {title}?", "What else should I plan for with {title}?"). Everything below is
 * taken from each post's own body: no new figure, claim or local fact.
 *
 * What does not change: the URL, the title tag (seoTitle, left as it was
 * because Search Console data in the repo covers only two of these posts, both
 * kept by blogMerges.ts), the body and the merge rule in blogMerges.ts.
 */
import type { BlogPostData } from '../blogContent';

type Faq = { question: string; answer: string };

export interface ShortPostRewrite {
  /** The visible H1, as a full phrase. Omitted where the title already reads as one. */
  title?: string;
  excerpt: string;
  quickAnswer?: string;
  keyTakeaways?: string[];
  /** The post's own buyer questions; they replace the three generated ones. */
  faqs: Faq[];
  /** Rotated hub questions that are off topic for this post. */
  dropQuestions?: string[];
}

/** The three question templates contentFactory.ts used to generate. */
export function isGeneratedQuestion(question: string): boolean {
  return (
    /: what should Treasure Valley homeowners know\?$/.test(question) ||
    /^What matters most when planning /.test(question) ||
    /^What else should I plan for with /.test(question) ||
    /^How much do .+: .+ cost in Boise\?$/.test(question)
  );
}

export const SHORT_POST_REWRITES: Record<string, ShortPostRewrite> = {
  'kitchen-cabinet-timeline-boise': {
    title: 'Kitchen cabinet timeline in Boise',
    excerpt:
      'Most Boise kitchen cabinet projects take 8 to 14 weeks from first consultation to installed cabinets, and late selections slow them down more than anything else.',
    quickAnswer:
      'Plan 8 to 14 weeks from first consultation to installed cabinets for a typical Treasure Valley kitchen: 2 to 4 weeks for design and selections, 4 to 8 weeks of fabrication from approved drawings, and 2 to 5 days of installation.',
    keyTakeaways: [
      'Fabrication takes 4 to 8 weeks from approved drawings.',
      'Changing door style or finish after approval restarts the lead-time clock.',
      'Countertops template after base cabinets are set, so allow 1 to 2 more weeks.',
    ],
    faqs: [
      {
        question: 'What are the phases of a Boise kitchen cabinet project?',
        answer:
          'Consultation and measure (1 to 2 weeks), design and selections (1 to 3 weeks), fabrication (4 to 8 weeks from approved drawings), then delivery and installation (2 to 5 days). Countertops template after the base cabinets are set.',
      },
      {
        question: 'What slows a kitchen cabinet timeline down?',
        answer:
          'Late selections. Door style and finish lock fabrication, so changing either after approval restarts the lead-time clock. Wall removals also add Ada County permit and engineering time before cabinets can be ordered.',
      },
      {
        question: 'When should I start if I want the kitchen done before the holidays?',
        answer: 'Start design before late summer. Summer is peak season for Treasure Valley trades.',
      },
    ],
  },
  'kitchen-cabinet-roi-boise': {
    title: 'Kitchen cabinet ROI in Boise',
    excerpt:
      'Kitchen cabinets return the most in Boise when the package matches the neighborhood: a mid-tier custom kitchen aligned to local comps beats a luxury package the street cannot support.',
    quickAnswer:
      "Remodeling Magazine's Cost vs. Value report has minor kitchen remodels in the Mountain region recouping roughly 85 to 96 percent at resale in recent years, with cabinets the largest single line in that scope. Your own return depends on local comps, finish level and how long you stay.",
    keyTakeaways: [
      'Buyers respond to current finishes, visible storage and condition.',
      'Over-improving past neighborhood comps caps your return.',
      'Treat ROI as a positioning tool, not a guarantee.',
    ],
    faqs: [
      {
        question: 'Do kitchen cabinets pay off at resale in Boise?',
        answer:
          "Often, when the scope matches the neighborhood. Remodeling Magazine's Cost vs. Value report has minor kitchen remodels in the Mountain region recouping roughly 85 to 96 percent at resale in recent years, with cabinets the largest single line in that scope.",
      },
      {
        question: 'What do Boise buyers notice first in a kitchen?',
        answer:
          'Finish currency (current colors and profiles), visible storage such as pantry walls, drawer bases and islands, and condition.',
      },
      {
        question: 'How much should I spend on kitchen cabinets for resale?',
        answer:
          'Match the spend to your street. A $30,000 kitchen makes sense in Harris Ranch or Eagle; the same spend in an entry-level Kuna starter may exceed what comps return.',
      },
    ],
  },
  'outdoor-kitchen-cabinets-boise': {
    title: 'Outdoor kitchen cabinets in Boise',
    excerpt:
      'Outdoor cabinets in the Treasure Valley face dry 100 degree summers and freeze-thaw winters, so the box, door and hardware spec matters more than the color.',
    quickAnswer:
      'Outdoor kitchen cabinets in Boise need outdoor-rated construction from day one: standard interior boxes fail outdoors within seasons. Most Treasure Valley outdoor cabinet programs plan from roughly $8,000 to $30,000+ installed in 2026, depending on linear footage, appliance cutouts and whether the run is covered or exposed.',
    keyTakeaways: [
      'Placement, covered or exposed, is the first design decision.',
      'Gas and electrical trigger Ada or Canyon County permits, and some communities add HOA review.',
      'Design in winter to be grilling by June, and winterize every fall.',
    ],
    faqs: [
      {
        question: 'What cabinets hold up outdoors in Boise?',
        answer:
          'Outdoor-rated construction with weather-appropriate detailing. Freeze-thaw cycles, dry summer heat, patio dust and high-altitude UV wear out standard interior boxes within seasons.',
      },
      {
        question: 'How much do outdoor kitchen cabinets cost in Boise?',
        answer:
          'Most Treasure Valley outdoor kitchen cabinet programs plan from roughly $8,000 to $30,000+ installed in 2026, depending on linear footage, appliance cutouts and whether the run is covered or exposed.',
      },
      {
        question: 'Does an outdoor kitchen need a permit in the Treasure Valley?',
        answer:
          'Gas and electrical for outdoor kitchens trigger Ada or Canyon County permits, and exterior structures can trigger HOA review in communities like Hidden Springs and Harris Ranch.',
      },
    ],
    dropQuestions: ['Can you integrate laundry room cabinetry?'],
  },
  'bathroom-vanity-cost-boise': {
    title: 'Bathroom vanity cost in Boise: guest vs primary',
    excerpt:
      'Guest bath vanities in the Treasure Valley often plan $3,500 to $12,000 installed, while primary suite vanities with double sinks and custom storage commonly reach $8,000 to $25,000+ (2026).',
    faqs: [
      {
        question: 'How much does a bathroom vanity cost in Boise?',
        answer:
          'Guest bath vanity cabinets often plan $3,500 to $12,000 installed; primary suite vanities with double sinks and custom storage commonly reach $8,000 to $25,000+ in Idaho (2026, plumbing separate).',
      },
    ],
  },
  'accessible-bathroom-vanity-guide': {
    excerpt:
      'An accessible vanity needs 27 inches of knee clearance height and 30 inches of width at its roll-under section, with the plumbing set back or protected.',
    quickAnswer:
      'Roll-under vanities need 27 inches of knee clearance height, 30 inches of width and plumbing set back or protected. Comfort-height storage beside the roll-under section keeps everyday items 15 to 48 inches off the floor, and drawer bases put contents within reach for everyone.',
    keyTakeaways: [
      'Plan 27 inches of knee clearance and 30 inches of width for a roll-under section.',
      'Lever or touch faucets and D-shaped pulls work better than knobs.',
      'Add blocking for future grab bars during this project, when it costs nearly nothing.',
    ],
    faqs: [
      {
        question: 'What clearance does an accessible bathroom vanity need?',
        answer:
          'A roll-under section needs 27 inches of knee clearance height and 30 inches of width, with the plumbing set back or protected. Storage beside it should keep everyday items between 15 and 48 inches off the floor.',
      },
      {
        question: 'How do you keep an accessible vanity from looking clinical?',
        answer:
          'Design it like furniture: a seated makeup-height section that doubles as roll-under clearance, drawer bases, lever or touch faucets and D-shaped pulls. Planned from the start, the details read as residential, not institutional.',
      },
      {
        question: 'When should I plan a bathroom for accessibility?',
        answer:
          'If you intend to stay in your home past retirement, add blocking for future grab bars and choose a vanity layout that adapts during this project, when it costs nearly nothing.',
      },
    ],
  },
  'bathroom-vanity-layout-guide': {
    excerpt:
      'Most guest baths need a single 36 to 48-inch vanity with drawers, while primary baths take a double vanity from 60 inches with a shared counter to 72-plus inches for two true sinks.',
    quickAnswer:
      'Plan the vanity layout by bathroom type: a single 36 to 48-inch vanity for guest and hall baths, a double vanity from 60 to 72-plus inches for a primary bath. Keep 30 inches of clear floor in front, 15 inches from sink centerline to a side wall, and a 36-inch counter height.',
    keyTakeaways: [
      'Guest baths: one 36 to 48-inch vanity with drawer storage.',
      'Keep 30 inches of clear floor in front and 15 inches from sink centerline to a side wall.',
      'Count what lives in the bathroom before choosing a style.',
    ],
    faqs: [
      {
        question: 'What size vanity fits a guest bathroom?',
        answer:
          'A single 36 to 48-inch vanity with drawer storage handles most guest and hall baths. Powder rooms suit small furniture-style vanities, where finish quality shows at close range.',
      },
      {
        question: 'How much clearance does a bathroom vanity need?',
        answer:
          'Keep 30 inches of clear floor in front of the vanity and at least 15 inches from the sink centerline to a side wall. A 36-inch counter height is the modern standard, and a floating vanity can be set to suit the household.',
      },
      {
        question: 'How wide is a double vanity?',
        answer:
          'From 60 inches with a shared counter to 72-plus inches for two true sinks. Two separate single vanities also work when the room allows.',
      },
    ],
  },
  'small-bathroom-vanity-ideas': {
    excerpt:
      'In a small bath the vanity is the only real storage, so choose drawers over doors and a vanity built to the width of your wall instead of the next stock size down.',
    quickAnswer:
      'In a 5 by 8 bath, the vanity is the only real storage. Choose drawers over doors, a 21-inch-deep custom box where a stock 22-inch unit crowds the door swing, and a built-to-order 27 or 33-inch width that uses exactly the wall you have.',
    keyTakeaways: [
      'Drawers beat doors in a small vanity.',
      'Stock vanities jump in 6-inch increments; a built-to-order width uses the whole wall.',
      'Light matte finishes keep a small room calm; skip high gloss in a bath without daylight.',
    ],
    faqs: [
      {
        question: 'What vanity works best in a small bathroom?',
        answer:
          'One with drawers rather than doors, a 21-inch-deep box where a stock 22-inch unit crowds the door swing, and a 12-inch side tower if the layout allows.',
      },
      {
        question: 'Should a small bath get a stock or a custom vanity?',
        answer:
          'Stock vanities jump in 6-inch increments, so a small bath loses usable inches at every jump. A built-to-order 27 or 33-inch vanity uses exactly the wall you have.',
      },
      {
        question: 'Do wall-hung vanities make a small bathroom feel bigger?',
        answer:
          'Yes. A wall-hung vanity visually enlarges a small room and frees floor area for cleaning, which is why it is common in North End and downtown Boise condos.',
      },
    ],
  },
  'cabinet-buying-mistakes': {
    excerpt:
      'The costliest cabinet buying mistake is comparing quotes with mismatched scope: a low quote that leaves out delivery, installation or interior accessories is incomplete, not cheaper.',
    keyTakeaways: [
      'Ask for line-item scope on every quote.',
      'View full-size door samples in your own kitchen, morning and evening.',
      'Choose drawers over doors for base cabinets, and lock appliance specs before the order.',
    ],
    faqs: [
      {
        question: 'What is the most expensive cabinet buying mistake?',
        answer:
          'Comparing quotes with mismatched scope. A low quote that excludes delivery, installation or interior accessories is not lower, it is incomplete, so ask for line-item scope on every quote.',
      },
      {
        question: 'Why should I see cabinet finish samples at home?',
        answer:
          "Finishes shift between showroom and home lighting. Idaho's bright, dry light flattens some tones and warms others, so view full-size door samples in your own kitchen, morning and evening, before sign-off.",
      },
      {
        question: 'Should base cabinets have doors or drawers?',
        answer:
          'Drawers, in most places. Choosing doors instead of drawers for base cabinets is the storage regret we hear most.',
      },
    ],
  },
  'cabinet-consultation-process': {
    excerpt:
      'Our free cabinet consultation runs 60 to 90 minutes at your home: we measure, review door styles and finishes with physical samples, and leave you a written planning range with no obligation.',
    quickAnswer:
      'A cabinet consultation with Boise Cabinet Co is free and runs 60 to 90 minutes at your home. We walk the space, measure, talk through what the room does not do for you today, review door style and finish directions with physical samples, and leave a realistic planning range in writing, with no obligation.',
    keyTakeaways: [
      'Bring inspiration photos and a list of daily frustrations.',
      'Know your rough budget comfort zone before the visit.',
      'Flag appliance plans and any date that matters to you.',
    ],
    faqs: [
      {
        question: 'What happens at a cabinet design consultation?',
        answer:
          'We walk the space, measure, discuss what the room does not do for you today, review door style and finish directions with physical samples, and leave you a realistic planning range in writing. It takes 60 to 90 minutes at your home.',
      },
      {
        question: 'How should I prepare for a cabinet consultation?',
        answer:
          'Have inspiration photos and a list of daily frustrations ready, know your rough budget comfort zone (the cost guide helps), flag appliance plans, especially panel-ready or new sizes, and ask about lead times against any date that matters to you.',
      },
      {
        question: 'Is there any obligation after the consultation?',
        answer:
          'No. The consultation exists to produce an accurate plan. If we are not the right fit, you still leave with useful planning numbers and a clearer scope.',
      },
    ],
  },
  'cabinet-planning-checklist': {
    excerpt:
      'Plan cabinets in this order: scope, budget, selections, schedule. Measure the room and ceiling height first, and build the calendar around fabrication lead time last.',
    keyTakeaways: [
      'Decide which rooms are in scope before setting a budget.',
      'Confirm appliance models, especially panel-ready units, during design.',
      'Hold a 5 to 10 percent contingency, more for older Boise homes.',
    ],
    faqs: [
      {
        question: 'What should I do before I call a cabinet company?',
        answer:
          'Photograph your current space and list what fails daily, measure rough room dimensions and ceiling height, set a planning range from the cost guide, collect 5 to 10 inspiration photos, and decide whether the project is one room or several.',
      },
      {
        question: 'What should be final before cabinets are ordered?',
        answer:
          'A signed line-item scope, hardware selected and counted, the counter material chosen (it affects overhang support), install dates and household logistics planned, and a 5 to 10 percent contingency held.',
      },
      {
        question: 'In what order should I plan a cabinet project?',
        answer:
          'Scope, budget, selections, schedule. Homeowners who pick install dates before selections exist are the ones disappointed by lead-time math.',
      },
    ],
  },
  'cabinet-upgrades-before-selling': {
    excerpt:
      'Before you sell, cabinet money buys buyer perception: the kitchen photo is the most-viewed image in a Boise or Meridian listing, so fix what that photo shows first.',
    quickAnswer:
      'Match the upgrade to the objection buyers will raise: a hardware swap, deep clean and touch-up when boxes and finish are sound; vanity replacements and a kitchen refresh when the baths date the house; full kitchen cabinet replacement only when the kitchen is the obvious objection. Allow 8 to 12 weeks before listing for a replacement.',
    keyTakeaways: [
      'Ask your agent which objection kills offers on comparable listings.',
      'Allow 8 to 12 weeks before listing for a cabinet replacement.',
      'Choose neutral, current finishes that photograph cleanly.',
    ],
    faqs: [
      {
        question: 'Which cabinet upgrades are worth doing before selling?',
        answer:
          'The one that answers the objection on comparable listings: a hardware swap, deep clean and touch-up when the boxes and finish are sound, vanity replacements and a kitchen refresh when the baths date the house, and kitchen cabinet replacement when the kitchen is the obvious objection.',
      },
      {
        question: 'How long before listing should I replace cabinets?',
        answer: 'Allow 8 to 12 weeks before listing for a cabinet replacement.',
      },
      {
        question: 'What finishes should I choose before selling?',
        answer:
          'Neutral, current finishes that photograph cleanly, rather than personal statements. Dated oak or worn thermofoil in the kitchen photo costs showings.',
      },
    ],
  },
  'how-to-compare-cabinet-quotes': {
    excerpt:
      'Two cabinet quotes are only comparable when box construction, door style, finish tier, hardware, accessories, delivery and installation all match, so put every bid in the same rows before you compare totals.',
    quickAnswer:
      'Compare cabinet quotes line by line. Put every bid into one matrix (box construction, hardware, interior accessories, delivery and installation, warranty and exclusions) before you look at totals. Bids that look 40 percent apart are often within 10 to 15 percent once aligned.',
    keyTakeaways: [
      'Build a one-page matrix and force every bid into the same rows.',
      'Compare lead times too: 6 weeks and 16 weeks are different products.',
      'A quote without shop drawings buys a price, not a defined product.',
    ],
    faqs: [
      {
        question: 'How do I compare two cabinet quotes fairly?',
        answer:
          'Put both into one matrix: box construction, hardware, interior accessories, delivery and installation, warranty and exclusions. Only compare totals once every bid fills the same rows.',
      },
      {
        question: 'Why can two cabinet quotes look so far apart?',
        answer:
          'Mismatched scope. A $22,000 bid with particleboard boxes, partial-extension slides and no installation and a $31,000 bid with plywood, soft-close hardware, delivery and installation look 40 percent apart; normalized, bids like these are often within 10 to 15 percent.',
      },
      {
        question: 'Should a cabinet quote be fixed price or cost plus?',
        answer:
          'Fixed price, almost always: a measured layout with locked selections is a fully definable product. If a cabinet line is cost plus, ask for the cabinet allowance in writing.',
      },
    ],
  },
  'questions-to-ask-cabinet-company': {
    excerpt:
      'Ask a cabinet company four kinds of questions: what the cabinets are made of, what the quote includes, who is accountable from design to installation, and how well they know homes in your city.',
    quickAnswer:
      'Before you hire a cabinet company, ask about box construction (plywood or particleboard, and thickness), whether soft-close hinges and full-extension slides are standard, what the quote excludes, how change orders are approved, who your single point of contact is, and what the workmanship warranty covers in writing.',
    keyTakeaways: [
      'Ask whether cabinets are built to order for your dimensions or modified stock sizes.',
      'Ask what is excluded: counters, plumbing, electrical, disposal.',
      'A company that cannot name your project manager or show a written warranty is telling you how the project will go.',
    ],
    faqs: [
      {
        question: 'What should I ask a cabinet company about the cabinets?',
        answer:
          'Ask what the box construction is (plywood or particleboard, and what thickness), whether soft-close hinges and full-extension slides are standard, how many door styles and finishes you can order, whether cabinets are built to order for your dimensions, and whether you can keep finish samples at home before sign-off.',
      },
      {
        question: 'What should I ask about the quote and payments?',
        answer:
          'Ask whether the quote is line-item, what exactly is excluded (counters, plumbing, electrical, disposal), how change orders are priced and approved, and what deposit schedule they use and what triggers each payment.',
      },
      {
        question: 'What paperwork red flags should I watch for?',
        answer:
          'No line-item scope, no written change-order process, vague warranty language such as "lifetime" with no document, and contracts that let the company substitute materials without approval.',
      },
    ],
  },
  'kitchen-cabinet-trends': {
    excerpt:
      'The kitchen cabinet trends we see most in Boise, Meridian and Eagle are matte painted finishes in warm neutrals, slim shaker profiles, and a painted perimeter paired with a woodgrain island.',
    quickAnswer:
      'Treasure Valley kitchens are moving to matte painted finishes in warm neutrals, thinner shaker rails, flat slab doors in contemporary builds, and longer bar pulls in brushed brass or matte black. Storage trends such as drawer bases, full-height pantry walls and appliance garages outlast every color cycle.',
    keyTakeaways: [
      'Classic shaker still leads, with thinner rails gaining.',
      'Drawer bases, pantry walls and trash pull-outs are now baseline expectations.',
      'Put a bold color on the island, not the whole kitchen.',
    ],
    faqs: [
      {
        question: 'What kitchen cabinet styles are popular in Boise now?',
        answer:
          'Matte painted finishes in warm neutrals, slim shaker profiles, and mixed-finish kitchens that pair a painted perimeter with a woodgrain island. Flat slab doors keep growing in newer Eagle and Star builds with contemporary architecture.',
      },
      {
        question: 'Which kitchen cabinet trends last longest?',
        answer:
          'Storage trends: drawer bases instead of doors, full-height pantry walls, appliance garages and trash pull-outs. They survive every color cycle.',
      },
      {
        question: 'Which kitchen cabinet trends should I skip?',
        answer:
          'Ultra-trendy colors on the whole kitchen age fastest. Put a bold color on the island or a bar zone, where refinishing later is a small project, and keep the perimeter timeless.',
      },
    ],
  },
  'kitchen-island-design-guide': {
    excerpt:
      'A useful kitchen island starts at about 24 by 48 inches and needs 42 inches of clearance on its working sides, which in most Boise ranches caps the island around 4 by 7 feet.',
    quickAnswer:
      'Size the island to the room: about 24 by 48 inches is the smallest useful island, each seat needs 24 inches of width and a 12 to 15 inch overhang, and working sides need 42 inches of clearance, 48 where two cooks pass or appliance doors open.',
    keyTakeaways: [
      'Keep 42 inches of clearance on working sides, 48 where two cooks pass.',
      'Treat the island as your highest-value storage: deep drawers and a trash pull-out.',
      'Under 42 inches of clearance, a cart or peninsula serves better.',
    ],
    faqs: [
      {
        question: 'How big should a kitchen island be?',
        answer:
          'At least about 24 by 48 inches, with 24 inches of width per seat, a 12 to 15 inch overhang and 42 inches of clearance on working sides. In most Boise ranches that caps the island around 4 by 7 feet.',
      },
      {
        question: 'What should go inside a kitchen island?',
        answer:
          'Deep drawer stacks for pots, a trash and recycling pull-out near the prep zone and a shallow utensil drawer. If the sink or cooktop moves to the island, plan venting and plumbing early because both change the cabinet layout.',
      },
      {
        question: 'When should a kitchen skip the island?',
        answer:
          'When clearances fall under 42 inches. A rolling cart or a peninsula serves better than an island forced into a galley footprint.',
      },
    ],
  },
  'living-through-cabinet-installation': {
    excerpt:
      'Most Boise and Nampa kitchens take 2 to 5 days to install, and you can usually stay home: the work is mostly daytime and the rooms are usable each evening.',
    keyTakeaways: [
      'Set up a temporary kitchen before demo day.',
      'Counters template after bases are set, so full function returns 1 to 2 weeks after cabinets land.',
      'Keep pets and kids away from work zones on install days.',
    ],
    faqs: [
      {
        question: 'How long does cabinet installation take?',
        answer:
          'A typical Boise or Nampa kitchen takes 2 to 5 install days. Counters template after the base cabinets are set, so the kitchen works fully again 1 to 2 weeks after the cabinets land.',
      },
      {
        question: 'Can I stay home during cabinet installation?',
        answer:
          'Usually, yes. Installation is mostly daytime work with protected floors and pathways, and the crew resets the space each night. Expect tool noise and a temporary loss of kitchen or bath storage.',
      },
      {
        question: 'How do I set up a temporary kitchen?',
        answer:
          'Before demo day, set up a microwave, coffee, a folding table and a wash station at the laundry sink, and plan simple meals for install week.',
      },
    ],
  },
};

/** Apply a post's rewrite. Posts without one are returned unchanged. */
export function applyShortPostRewrite(post: BlogPostData): BlogPostData {
  const rewrite = SHORT_POST_REWRITES[post.slug];
  if (!rewrite) return post;
  const own = new Set(rewrite.faqs.map((faq) => faq.question.toLowerCase()));
  const drop = new Set((rewrite.dropQuestions ?? []).map((q) => q.toLowerCase()));
  const kept = post.faqs.filter((faq) => {
    const key = faq.question.toLowerCase();
    return !isGeneratedQuestion(faq.question) && !own.has(key) && !drop.has(key);
  });
  return {
    ...post,
    title: rewrite.title ?? post.title,
    excerpt: rewrite.excerpt,
    quickAnswer: rewrite.quickAnswer ?? post.quickAnswer,
    keyTakeaways: rewrite.keyTakeaways ?? post.keyTakeaways,
    faqs: [...rewrite.faqs, ...kept],
  };
}
