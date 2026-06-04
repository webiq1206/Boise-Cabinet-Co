/** Hub-specific FAQs for cabinet planning guides. */

export function getHubPillarFaqs(hubSlug: string): Array<{ question: string; answer: string }> {
  const faqs: Record<string, Array<{ question: string; answer: string }>> = {
    'kitchen-cabinets': [
      {
        question: 'How much do kitchen cabinets cost in Boise?',
        answer:
          'Most Treasure Valley kitchen cabinet projects plan between roughly $15,000 and $65,000+ for cabinetry alone, depending on line, door style, interior accessories, and linear footage. Full kitchen programs with countertops and installation run higher.',
      },
      {
        question: 'How long does a kitchen cabinet project take?',
        answer:
          'Expect 2 to 6 weeks for design and selections, then a 4-8 week cabinet lead time for fabrication, followed by installation. Lead times vary by finish and scope.',
      },
      {
        question: 'Do I need permits for new kitchen cabinets in Ada County?',
        answer:
          'Cabinet-only replacements often need minimal review. Relocating plumbing, adding circuits, or removing walls may require Ada County or city plan review. We coordinate when installation scope includes trade work.',
      },
      {
        question: 'Are appliances included in cabinet quotes?',
        answer:
          'Appliances are usually client-supplied. We coordinate rough-in dimensions and panel-ready openings in your cabinet design.',
      },
      {
        question: 'Can you design cabinets for an open kitchen layout?',
        answer:
          'Yes. Islands, tall pantries, and appliance walls are planned in our Design Studio with clearances verified before order.',
      },
      {
        question: 'What makes your Custom Cabinets different?',
        answer:
          'Custom Cabinets are built to your exact dimensions, details, and finish specifications, with hundreds of finishes and six door styles to choose from.',
      },
      {
        question: 'When should I order kitchen cabinets?',
        answer:
          'At design lock, after layout, appliance locations, and finish selections are confirmed. Popular lines can exceed eight weeks.',
      },
      {
        question: 'How do I compare cabinet company bids?',
        answer:
          'Match box construction, finish level, hardware, installation, haul-off, and warranty. Line-item cabinet price alone rarely tells the full story.',
      },
    ],
    'bathroom-vanities': [
      {
        question: 'How much do bathroom vanities cost in Meridian or Boise?',
        answer:
          'Single vanity refreshes often plan $2,500 to $8,000 for cabinetry. Double vanities with custom storage and mirrors commonly reach $6,000 to $18,000+ before tops and plumbing.',
      },
      {
        question: 'What should I plan for a floating vanity?',
        answer:
          'Blocking, drain location, and drawer depth must be confirmed before shop drawings. We verify wall structure during design.',
      },
      {
        question: 'Can vanities include aging-in-place features?',
        answer:
          'Yes. Comfort-height bases, pull-out trays, and blocking for grab bars can be designed with normal door styles and finishes.',
      },
      {
        question: 'Do vanity installations need permits in the Treasure Valley?',
        answer:
          'Cabinet set and top install may not require permits. Plumbing moves and new circuits typically do. We clarify scope during consultation.',
      },
      {
        question: 'How long does a vanity project take?',
        answer:
          'Often 3 to 8 weeks from design lock through installation, depending on custom lead times and countertop templating.',
      },
      {
        question: 'Should guest and master bath vanities share one budget?',
        answer:
          'No. Size, storage, and finish level differ too much to combine into one number.',
      },
      {
        question: 'What countertop options pair with your vanities?',
        answer:
          'Quartz, natural stone, and solid surface are common. We coordinate cutouts and overhangs with your cabinet order.',
      },
      {
        question: 'How do I start a vanity project with Boise Cabinet Co?',
        answer:
          'Schedule a design consultation or use our estimator for a planning range, then approve written scope before shop release.',
      },
    ],
    'built-ins-storage': [
      {
        question: 'How much do built-ins and closet systems cost in Boise?',
        answer:
          'Reach-in closets often plan $1,500 to $5,000. Full wall units, mudroom lockers, and pantry systems commonly run $4,000 to $25,000+ depending on size and finish.',
      },
      {
        question: 'What rooms benefit most from custom built-ins?',
        answer:
          'Mudrooms, pantries, home offices, entertainment walls, and primary closets deliver the strongest daily-use value in Treasure Valley homes.',
      },
      {
        question: 'Can built-ins match existing trim and paint?',
        answer:
          'Yes. We specify finish, profile, and hardware to align with your home or create a deliberate contrast feature.',
      },
      {
        question: 'Do closet systems need permits?',
        answer:
          'Freestanding and fastened casework typically does not. Electrical for lighting inside units may. We flag requirements during design.',
      },
      {
        question: 'How long do built-in projects take?',
        answer:
          'Many single-room programs complete in 4 to 10 weeks from design lock through installation.',
      },
      {
        question: 'What organization accessories should I include?',
        answer:
          'Pull-out pantries, spice racks, shoe shelves, and hamper pull-outs are planned per room during selections.',
      },
      {
        question: 'Can you integrate laundry room cabinetry?',
        answer:
          'Yes. Folding surfaces, appliance panels, and supply storage are common in Idaho laundry rooms.',
      },
      {
        question: 'How do I measure for built-ins?',
        answer:
          'We template on site or use Design Studio dimensions. Accurate ceiling height and outlet locations prevent field surprises.',
      },
    ],
    'whole-home-cabinetry': [
      {
        question: 'How much does whole-home cabinetry cost in the Treasure Valley?',
        answer:
          'Multi-room programs often plan $40,000 to $150,000+ depending on room count, line, and finish consistency across spaces.',
      },
      {
        question: 'Should I order cabinets room by room or as one program?',
        answer:
          'One master finish and hardware schedule keeps adjacent spaces cohesive and can reduce mobilization cost.',
      },
      {
        question: 'Can I stay in my home during cabinet installation?',
        answer:
          'Usually yes room by room. We sequence kitchens, baths, and storage areas to limit downtime.',
      },
      {
        question: 'What should be decided before finish selections?',
        answer:
          'Floor plan, appliance locations, and lighting plans should be stable when multiple rooms share one palette.',
      },
      {
        question: 'How much contingency should I hold?',
        answer:
          '5 to 10% is prudent when opening walls or coordinating trades beyond cabinetry scope.',
      },
      {
        question: 'Do whole-home cabinet programs need permits?',
        answer:
          'Cabinet-only work may not. Trade work bundled with install may. We outline requirements in written scope.',
      },
      {
        question: 'Can you coordinate hardware house-wide?',
        answer:
          'Yes. One hardware schedule across kitchen, baths, and built-ins is standard on whole-home programs.',
      },
      {
        question: 'How do I budget whole-home cabinetry?',
        answer:
          'Start with our cabinet cost guide, then schedule a consultation for room-by-room written scope.',
      },
    ],
    'choosing-cabinet-company': [
      {
        question: 'How do I compare cabinet companies in Boise fairly?',
        answer:
          'Align box construction, finish, warranty, installation, and lead times before comparing price.',
      },
      {
        question: 'What red flags should I avoid?',
        answer:
          'Unclear line specifications, no shop drawings, and quotes that omit installation or haul-off.',
      },
      {
        question: 'Is it better to buy cabinets direct or through a local company?',
        answer:
          'Local design, templating, and installation accountability reduce field errors and warranty gaps.',
      },
      {
        question: 'What should be in a cabinet contract?',
        answer:
          'Written scope, line and finish, payment schedule, lead time, change-order terms, and warranty language.',
      },
      {
        question: 'Do you provide references and insurance certificates?',
        answer:
          'Yes. Professional cabinet companies should provide both before you sign.',
      },
      {
        question: 'How many bids should I get?',
        answer:
          'Two to three aligned proposals are enough when scope and line are documented.',
      },
      {
        question: 'Why do Boise cabinet bids vary so much?',
        answer:
          'Different construction, finish tier, and installation assumptions, not always different quality.',
      },
      {
        question: 'What questions should I ask in the first meeting?',
        answer:
          'Ask about shop capabilities, Design Studio process, lead times, and who manages installation punch list.',
      },
    ],
    'cabinet-project-process': [
      {
        question: 'What are the steps in a cabinet project with Boise Cabinet Co?',
        answer:
          'Consultation, design and selections, shop drawings, fabrication, delivery, installation, and final walkthrough.',
      },
      {
        question: 'When should shop drawings be approved?',
        answer:
          'Before fabrication begins. Dimensions, fillers, and finished ends are locked at approval.',
      },
      {
        question: 'Can I use my kitchen during cabinet installation?',
        answer:
          'Often with a temporary setup. We protect floors and adjacent rooms and communicate utility shutoff windows.',
      },
      {
        question: 'How are selections tracked?',
        answer:
          'Door style, finish, hardware, and accessories are documented in scope so upgrades are intentional.',
      },
      {
        question: 'What is a punch list?',
        answer:
          'A documented list of adjustment items to complete before final payment and warranty walkthrough.',
      },
      {
        question: 'How long does fabrication take?',
        answer:
          'Often 4 to 12 weeks depending on collection and finish. Rush options vary by line.',
      },
      {
        question: 'Who coordinates countertop templating?',
        answer:
          'Our team schedules templating after base cabinets are set when countertops are in scope.',
      },
      {
        question: 'What happens if a wall is out of plumb?',
        answer:
          'Field conditions are documented and scribe fillers or adjustments are planned before panels are cut.',
      },
    ],
    'cabinet-roi': [
      {
        question: 'Which cabinet upgrades have the best ROI in Boise?',
        answer:
          'Quality kitchen cabinets and primary bath vanities often align with neighborhood comps. Avoid finish levels far above the street.',
      },
      {
        question: 'Should I upgrade cabinets before selling in Meridian?',
        answer:
          'Target what buyers expect in your subdivision. Agent input and local comps should drive scope.',
      },
      {
        question: 'Does a luxury kitchen always return on resale?',
        answer:
          'Not always. Finish level should match the neighborhood, especially in Eagle and Harris Ranch.',
      },
      {
        question: 'Is ROI the right metric for a long-term home?',
        answer:
          'Daily function and storage may justify projects with modest resale payback if you plan to stay.',
      },
      {
        question: 'Do vanity updates help resale in Nampa?',
        answer:
          'Updated baths often help buyer appeal when consistent with home price band in Canyon County.',
      },
      {
        question: 'What pre-sale cabinet projects should I skip?',
        answer:
          'Over-custom features well above comps rarely return dollar for dollar.',
      },
      {
        question: 'How do I research comps for cabinet decisions?',
        answer:
          'Use recent sales on your street and subdivision, not broad Treasure Valley averages.',
      },
      {
        question: 'Can pantry and mudroom storage improve buyer appeal?',
        answer:
          'Organized storage and drop zones are strong selling points in family-oriented Treasure Valley listings.',
      },
    ],
    'cabinet-costs': [
      {
        question: 'What drives cabinet cost the most?',
        answer:
          'Line tier, door style, finish, interior accessories, and linear footage. Installation and tops are separate line items.',
      },
      {
        question: 'How accurate is an online cabinet estimate?',
        answer:
          'Estimates are planning ranges. Written scope after design is required for firm pricing.',
      },
      {
        question: 'Do prices include installation?',
        answer:
          'Quotes specify whether installation, haul-off, and trade coordination are included. Match assumptions when comparing bids.',
      },
      {
        question: 'When do cabinet prices change?',
        answer:
          'Supplier and material adjustments can affect quotes held beyond their expiration date.',
      },
      {
        question: 'Can I phase cabinet work by room?',
        answer:
          'Yes. A master plan keeps finishes aligned across phases.',
      },
      {
        question: 'What financing options exist for cabinetry?',
        answer:
          'Options vary by project size. Ask during consultation for current programs.',
      },
      {
        question: 'How do value and custom cabinets compare on cost?',
        answer:
          'Value cabinetry is typically lower per linear foot with faster lead times. Custom Cabinets cost more for exact sizing and details.',
      },
      {
        question: 'Where can I see Treasure Valley cabinet cost ranges?',
        answer:
          'Our cabinet cost guide breaks down typical ranges by room.',
      },
    ],
    'treasure-valley-locations': [],
    'local-guides': [],
  };

  return faqs[hubSlug] ?? [];
}

export function getLocationFaqs(
  cityName: string,
  _citySlug: string,
  county: 'ada' | 'canyon',
): Array<{ question: string; answer: string }> {
  const countyLabel = county === 'ada' ? 'Ada County' : 'Canyon County';
  return [
    {
      question: `Do you install cabinets in ${cityName}?`,
      answer: `Yes. We serve ${cityName} with kitchen cabinets, bathroom vanities, built-ins, closet systems, and storage solutions. See our ${cityName} area page for local services.`,
    },
    {
      question: `What permits apply in ${cityName} for cabinet work?`,
      answer: `${cityName} projects in ${countyLabel} may need review when installation includes plumbing, electrical, or structural changes. Cabinet-only replacements often move faster.`,
    },
    {
      question: `How much do cabinets cost in ${cityName}?`,
      answer:
        'Use our Treasure Valley Cabinet Cost Guide for planning bands by room type, then schedule a consultation for written scope tied to your home.',
    },
    {
      question: `What cabinet projects are most common in ${cityName}?`,
      answer:
        'Kitchen cabinet upgrades, vanity replacements, pantry and mudroom storage, and home office built-ins are frequent. Scope depends on housing era in your neighborhood.',
    },
    {
      question: 'How long do local cabinet projects take?',
      answer:
        'Timelines follow design, selections, and fabrication lead times, often several weeks from order to installation completion.',
    },
    {
      question: 'Do you offer design and installation in my neighborhood?',
      answer:
        'Yes. One team handles design, ordering, and professional installation with local experience in your city.',
    },
  ];
}
