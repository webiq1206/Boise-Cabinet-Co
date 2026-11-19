/**
 * Room categories for catalog browsing and default collection recommendations.
 */

export interface RoomCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  /** Neutral description of the photograph. Falls back to the room name. */
  imageAlt?: string;
  defaultCollectionId: string;
  /** Typical cabinet types used in this room */
  typicalCabinetTypes: string[];
}

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "kitchen",
    slug: "kitchen",
    name: "Kitchen",
    description:
      "The heart of Treasure Valley homes deserves cabinets built for daily cooking, entertaining, and Idaho's dry-climate swings. From galley layouts in Boise Bench bungalows to sprawling islands in Eagle estates, we design base runs, uppers, pantries, and appliance panels as one coordinated system.",
    heroImage: "/images/catalog/rooms/kitchen-walnut-mountain.webp",
    imageAlt: "Kitchen with flat-panel oak cabinets, a walnut drawer island and white countertops",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "tall", "island-base"],
  },
  {
    id: "bathroom",
    slug: "bathroom",
    name: "Bathroom",
    description:
      "Vanity cabinets engineered for moisture resistance and daily use. We size drawers for grooming storage, integrate hamper pull-outs in primary baths, and match finishes to tile and stone selections documented in your written scope.",
    heroImage: "/images/catalog/rooms/bathroom.webp",
    imageAlt: "Bathroom with an oak double vanity, two mirrors and wall-mounted brass faucets",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["vanity", "wall", "linen-tall"],
  },
  {
    id: "laundry",
    slug: "laundry",
    name: "Laundry",
    description:
      "Folding surfaces, pull-out hampers, and upper storage sized for full-size washers and dryers. Moisture-resistant box options protect against steam and occasional plumbing leaks common in Idaho laundry rooms.",
    heroImage: "/images/catalog/rooms/laundry.webp",
    imageAlt: "Laundry room with sage green cabinets around a front-loading washer and dryer",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "tall"],
  },
  {
    id: "mudroom",
    slug: "mudroom",
    name: "Mudroom",
    description:
      "Bench seating with boot storage, coat cubbies, and locker systems that handle Idaho winters. Durable finishes and heavy-duty hardware stand up to skis, cleats, and daily family traffic.",
    heroImage: "/images/catalog/rooms/mudroom.webp",
    imageAlt: "Mudroom with a built-in bench, white lockers and a coat on a hook",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "locker-tall", "bench-base"],
  },
  {
    id: "home-office",
    slug: "home-office",
    name: "Home Office",
    description:
      "Built-in desks, file drawers, and shelving that hide cables and printers while keeping workspaces calm. Ideal for remote workers across Meridian, Nampa, and Caldwell who need a dedicated room without sacrificing resale appeal.",
    heroImage: "/images/catalog/rooms/home-office.webp",
    imageAlt: "Home office with a built-in oak desk, white upper cabinets and open shelves",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "desk-base"],
  },
  {
    id: "entertainment",
    slug: "entertainment",
    name: "Entertainment",
    description:
      "Media centers, fireplace surrounds, and bar areas with integrated wire management and ventilation clearances. We coordinate with AV installers so your Boise Cabinet Co built-ins fit equipment specs from day one.",
    heroImage: "/images/catalog/rooms/entertainment.webp",
    imageAlt: "Oak built-in media wall with a television, open shelves and lower cabinets",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "tall"],
  },
  {
    id: "built-ins",
    slug: "built-ins",
    name: "Built-Ins",
    description:
      "Window seats, bookcases, window benches, and architectural millwork that make awkward alcoves functional. Built-to-order sizing handles out-of-plumb walls and uneven floors common in pre-1980 Treasure Valley homes.",
    heroImage: "/images/catalog/rooms/built-ins.webp",
    imageAlt: "Oak built-in shelves and cabinets on both sides of a plaster fireplace",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "tall"],
  },
  {
    id: "pantry",
    slug: "pantry",
    name: "Pantry",
    description:
      "Walk-in and reach-in pantries with adjustable shelving, appliance garages, and bulk storage. Pull-out systems keep deep shelves accessible without losing items behind cereal boxes.",
    heroImage: "/images/catalog/rooms/pantry.webp",
    imageAlt: "Pantry with white drawer cabinets, oak shelves and glass jars",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["tall", "base", "wall"],
  },
  {
    id: "closet",
    slug: "closet",
    name: "Closet",
    description:
      "Reach-in and walk-in closet systems with double-hang sections, shoe towers, and jewelry drawers. We integrate with closet rod heights and lighting plans for primary suites and guest rooms.",
    heroImage: "/images/catalog/rooms/closet.webp",
    imageAlt: "Closet with oak wardrobe cabinets, open hanging space and drawers",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["tall", "base", "wall"],
  },
  {
    id: "garage",
    slug: "garage",
    name: "Garage",
    description:
      "Overhead storage, tool cabinets, and slatwall-compatible units for organized garages. Durable finishes and plywood construction handle temperature swings from Boise summers to winter freeze-thaw cycles.",
    heroImage: "/images/catalog/rooms/garage.webp",
    imageAlt: "Garage with charcoal cabinets along two walls",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "tall"],
  },
  {
    id: "outdoor",
    slug: "outdoor",
    name: "Outdoor Kitchen",
    description:
      "Weather-rated cabinetry for covered patios and outdoor kitchens. Marine-grade plywood boxes, stainless hardware, and cedar or teak finishes handle Idaho sun and occasional rain under roof overhangs.",
    heroImage: "/images/catalog/rooms/outdoor.webp",
    imageAlt: "Outdoor kitchen with wood cabinets, a built-in grill and a stainless steel refrigerator",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "grill-base"],
  },
  {
    id: "wet-bar",
    slug: "wet-bar",
    name: "Wet Bar",
    description:
      "Beverage centers with wine storage, glassware dividers, and optional sink bases. Compact footprints fit basement finishes and main-floor entertaining nooks in newer Star and Middleton builds.",
    heroImage: "/images/catalog/rooms/wet-bar.webp",
    imageAlt: "Wet bar with dark wood cabinets, a tile backsplash and a wine refrigerator",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "wine-tall"],
  },
  {
    id: "bedroom",
    slug: "bedroom",
    name: "Bedroom",
    description:
      "Dresser bases, wardrobe towers, and nightstand cabinets that complement primary and guest suites. Soft-close drawer options and coordinated finishes tie bedroom storage to en-suite bath selections.",
    heroImage: "/images/catalog/rooms/bedroom.webp",
    imageAlt: "Bedroom with oak wardrobe cabinets built around the bed",
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "tall"],
  },
];

export const ROOM_BY_SLUG = Object.fromEntries(
  ROOM_CATEGORIES.map((r) => [r.slug, r]),
) as Record<string, RoomCategory>;

export const ROOM_BY_ID = Object.fromEntries(
  ROOM_CATEGORIES.map((r) => [r.id, r]),
) as Record<string, RoomCategory>;
