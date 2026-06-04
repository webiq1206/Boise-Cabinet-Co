/**
 * Room categories for catalog browsing and default collection recommendations.
 */

export interface RoomCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  heroImage: string;
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
    heroImage: "/images/catalog/rooms/kitchen.webp",
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
    defaultCollectionId: "custom",
    typicalCabinetTypes: ["base", "wall", "wine-tall"],
  },
  {
    id: "bedroom",
    slug: "bedroom",
    name: "Bedroom",
    description:
      "Dresser bases, wardrobe towers, and nightstand cabinets that complement primary and guest suites. Soft-close drawers and coordinated finishes tie bedroom storage to en-suite bath selections.",
    heroImage: "/images/catalog/rooms/bedroom.webp",
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
