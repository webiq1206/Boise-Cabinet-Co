import type { RoomCategory } from "./roomCategories";

export interface RoomFaq {
  question: string;
  answer: string;
}

/**
 * Room-specific FAQs for /cabinets/[room] pages. Two to three unique
 * questions per room, topped up with shared service-area, cost, and
 * timeline answers so every money page carries a visible FAQ block
 * plus FAQPage schema.
 */
const ROOM_SPECIFIC_FAQS: Record<string, RoomFaq[]> = {
  kitchen: [
    {
      question: "How much do custom kitchen cabinets cost in Boise?",
      answer:
        "Most Treasure Valley kitchen cabinet packages plan from roughly $15,000 to $45,000+ installed, depending on linear footage, door style, finish tier, and interior accessories. See our Boise Cabinet Cost Guide for detailed planning bands.",
    },
    {
      question: "Can you design around my existing kitchen layout?",
      answer:
        "Yes. Because every box is built to order, we work with your existing plumbing and appliance locations, or help you rework the layout. Galley kitchens in older Boise homes and open island plans in newer Meridian and Eagle builds both fit our process.",
    },
    {
      question: "Do you build kitchen islands and panel-ready appliance cabinets?",
      answer:
        "Yes. Island bases with seating overhangs, appliance panels for refrigerators and dishwashers, and tall pantry surrounds are all standard parts of our kitchen programs.",
    },
  ],
  bathroom: [
    {
      question: "How much does a custom bathroom vanity cost in Boise?",
      answer:
        "Single-vanity packages often plan from roughly $2,500 to $8,000+; double vanities and linen towers increase the investment. Finish tier and drawer interiors matter more than width alone.",
    },
    {
      question: "Are your vanity cabinets moisture resistant?",
      answer:
        "Yes. Vanity boxes use moisture-resistant construction and finishes suited to daily steam and splashing, with soft-close hardware rated for bathroom conditions.",
    },
  ],
  laundry: [
    {
      question: "Can you fit cabinets around my washer and dryer?",
      answer:
        "Yes. We measure your machines and build uppers, folding counters, and pull-out hamper bases to fit, including stacked units and pedestal heights.",
    },
    {
      question: "What makes a laundry cabinet hold up to steam and leaks?",
      answer:
        "Moisture-resistant box options and durable finishes protect against steam and the occasional plumbing leak, a common request in Idaho laundry rooms.",
    },
  ],
  mudroom: [
    {
      question: "What goes into a mudroom locker system?",
      answer:
        "Bench seating with boot storage below, open or doored cubbies per family member, hooks, and upper cabinets for seasonal gear. We size lockers to your hallway or garage-entry footprint.",
    },
    {
      question: "Will mudroom cabinets survive boots, skis, and daily traffic?",
      answer:
        "Yes. We spec durable finishes and heavy-duty hardware for mudrooms because they take more abuse than any other cabinet in the house, ski edges, cleats, and wet gear included.",
    },
  ],
  "home-office": [
    {
      question: "Can you build a desk and shelving into my home office?",
      answer:
        "Yes. Built-in desks, file drawers, printer cabinets, and open shelving are designed as one system, with cable management integrated so cords stay hidden.",
    },
    {
      question: "Do office built-ins help or hurt resale?",
      answer:
        "Well-proportioned office built-ins read as a feature, not a liability, especially with remote work common across Meridian, Nampa, and Caldwell. We design them to suit the room if a future owner repurposes it.",
    },
  ],
  entertainment: [
    {
      question: "Can you build around my TV and audio equipment?",
      answer:
        "Yes. We coordinate with your AV equipment specs, including ventilation clearances, wire management, and component drawers, so everything fits from day one.",
    },
    {
      question: "Do you build fireplace surrounds and media walls?",
      answer:
        "Yes. Fireplace surrounds, floating shelves, and full media walls are among our most requested built-ins, designed to match your door style and finish selections.",
    },
  ],
  "built-ins": [
    {
      question: "What kinds of built-ins do you make?",
      answer:
        "Window seats, bookcases, window benches, alcove cabinets, and architectural millwork. Built-to-order sizing handles out-of-plumb walls and uneven floors common in pre-1980 Treasure Valley homes.",
    },
    {
      question: "Can built-ins work in an older home with uneven walls?",
      answer:
        "Yes, that is exactly where custom built-ins beat stock furniture. We scribe-fit every unit to your walls and floors so reveals stay clean even when the house has settled.",
    },
  ],
  pantry: [
    {
      question: "What is the difference between a pantry wall and a walk-in pantry?",
      answer:
        "A pantry wall is a run of tall cabinets with adjustable shelving and roll-outs along one kitchen wall. A walk-in pantry is a dedicated room we fit with open shelving, counters, and appliance garages. We build both.",
    },
    {
      question: "How do you keep deep pantry shelves usable?",
      answer:
        "Pull-out shelves, roll-out trays, and door racks keep items visible and reachable so nothing gets lost behind the cereal boxes.",
    },
  ],
  closet: [
    {
      question: "Do you build full closet systems or just cabinets?",
      answer:
        "Full systems: hanging sections at single and double heights, drawer stacks, shoe shelving, and accessory storage, designed around your wardrobe and the closet's real dimensions.",
    },
    {
      question: "Can you upgrade a builder-grade wire-shelf closet?",
      answer:
        "Yes. Replacing wire shelving with a custom system is one of the highest-impact storage upgrades in newer Treasure Valley homes, especially primary suites.",
    },
  ],
  garage: [
    {
      question: "Are garage cabinets different from kitchen cabinets?",
      answer:
        "Yes. Garage systems use durable boxes and finishes built for tools, gear, and Idaho temperature swings, with heavy-duty hardware and worktop options.",
    },
    {
      question: "Can you include a workbench in a garage system?",
      answer:
        "Yes. Workbench counters, tall storage for ladders and seasonal gear, and locking cabinets for chemicals are common parts of our garage programs.",
    },
  ],
  outdoor: [
    {
      question: "Can cabinets survive Idaho winters outdoors?",
      answer:
        "Outdoor kitchens need weather-appropriate materials and detailing for Treasure Valley freeze-thaw cycles. We spec outdoor-rated construction and walk through covered versus exposed placement during design.",
    },
    {
      question: "Do you coordinate outdoor cabinets with grills and appliances?",
      answer:
        "Yes. We build around your grill, refrigeration, and sink specs with the right clearances, and flag any HOA review that exterior work can trigger in communities like Hidden Springs or Harris Ranch.",
    },
  ],
  "wet-bar": [
    {
      question: "What goes into a wet bar cabinet design?",
      answer:
        "Bar sink bases, glass or open display uppers, wine and beverage refrigeration surrounds, and counter-depth storage for bottles and barware, finished to match adjacent living spaces.",
    },
    {
      question: "Can a wet bar match my kitchen cabinets?",
      answer:
        "Yes. Same door styles and finishes across our catalog, so your bar can match the kitchen exactly or take a deliberate accent finish.",
    },
  ],
  bedroom: [
    {
      question: "What bedroom cabinetry do you build?",
      answer:
        "Wardrobe walls, window seats, built-in dressers, and media units, sized to your room so furniture-style storage uses every inch without crowding the space.",
    },
    {
      question: "Can you build a wardrobe wall where there is no closet?",
      answer:
        "Yes. Floor-to-ceiling wardrobe systems add closet function to older homes and guest rooms that lack built-in storage.",
    },
  ],
};

const SHARED_FAQS = (roomName: string): RoomFaq[] => [
  {
    question: `What areas do you serve for ${roomName.toLowerCase()} cabinets?`,
    answer:
      "We design, build, and install across the Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell in Ada and Canyon Counties.",
  },
  {
    question: `How long does a ${roomName.toLowerCase()} cabinet project take?`,
    answer:
      "Typically 4 to 8 weeks from approved design to installation, depending on scope and finish selection. Your client portal shows real-time status from design review through install.",
  },
  {
    question: "Is installation included?",
    answer:
      "Yes. Our quotes cover fabrication, delivery, and professional installation by our own team, backed by a limited lifetime workmanship warranty.",
  },
];

export function getRoomFaqs(room: RoomCategory): RoomFaq[] {
  const specific = ROOM_SPECIFIC_FAQS[room.slug] ?? [];
  return [...specific, ...SHARED_FAQS(room.name)];
}
