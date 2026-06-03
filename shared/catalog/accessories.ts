/**
 * Interior cabinet accessories and organizational upgrades.
 */

export type AccessoryCategory =
  | "storage"
  | "organization"
  | "waste"
  | "lighting"
  | "specialty";

export interface Accessory {
  id: string;
  slug: string;
  name: string;
  category: AccessoryCategory;
  description: string;
  /** Minimum cabinet width in inches, if applicable */
  minCabinetWidth?: number;
  compatibleCabinetTypes: string[];
  compatibleCollectionIds: string[];
}

export const ACCESSORIES: Accessory[] = [
  {
    id: "pull-out-shelf",
    slug: "pull-out-shelf",
    name: "Full-Extension Pull-Out Shelf",
    category: "storage",
    description:
      "A single full-extension shelf on 100 lb-rated slides, ideal for heavy mixers, pots, and small appliances tucked in base cabinets.",
    minCabinetWidth: 12,
    compatibleCabinetTypes: ["base", "tall", "pantry-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "pull-out-pantry",
    slug: "pull-out-pantry",
    name: "Pantry Pull-Out System",
    category: "storage",
    description:
      "Multi-tier pull-out columns for tall cabinets with adjustable shelves and soft-close slides. Brings deep pantry storage forward so nothing hides in the back.",
    minCabinetWidth: 18,
    compatibleCabinetTypes: ["tall", "pantry-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "lazy-susan",
    slug: "lazy-susan",
    name: "Lazy Susan",
    category: "storage",
    description:
      "Full-circle or kidney-shaped rotating trays for corner base cabinets. Durable polymer or maple options with adjustable height posts.",
    minCabinetWidth: 33,
    compatibleCabinetTypes: ["base", "corner-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "blind-corner-pullout",
    slug: "blind-corner-pullout",
    name: "Blind Corner Pull-Out",
    category: "storage",
    description:
      "LeMans-style or magic-corner hardware that swings shelves into the opening for blind corner bases, higher access than traditional lazy susans.",
    minCabinetWidth: 36,
    compatibleCabinetTypes: ["base", "corner-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "spice-rack-pullout",
    slug: "spice-rack-pullout",
    name: "Spice Rack Pull-Out",
    category: "organization",
    description:
      "Narrow pull-out rack sized for 3-inch or 9-inch base fillers beside ranges and refrigerators. Tiered shelves hold standard spice jars at a glance.",
    minCabinetWidth: 3,
    compatibleCabinetTypes: ["base", "filler-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "utensil-divider",
    slug: "utensil-divider",
    name: "Drawer Utensil Divider",
    category: "organization",
    description:
      "Adjustable maple or bamboo dividers for wide utensil drawers. Keeps spatulas, ladles, and gadgets sorted without rattling on soft-close slides.",
    compatibleCabinetTypes: ["base", "drawer-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "peg-board-drawer",
    slug: "peg-board-drawer",
    name: "Peg Board Drawer Organizer",
    category: "organization",
    description:
      "Customizable peg system for plate and bowl storage in deep drawers. Popular for dishware drawers replacing upper cabinets in open kitchens.",
    compatibleCabinetTypes: ["base", "drawer-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "trash-pullout",
    slug: "trash-pullout",
    name: "Double Trash Pull-Out",
    category: "waste",
    description:
      "Two-bin pull-out for waste and recycling with soft-close slides and removable liners. Sized for 18-inch or wider base cabinets.",
    minCabinetWidth: 15,
    compatibleCabinetTypes: ["base", "sink-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "cutting-board-insert",
    slug: "cutting-board-insert",
    name: "Cutting Board Insert",
    category: "specialty",
    description:
      "Sliding cutting board that stores above a base drawer or pull-out trash. Maple or composite board with finger pull and moisture-resistant finish.",
    minCabinetWidth: 18,
    compatibleCabinetTypes: ["base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "mixer-lift",
    slug: "mixer-lift",
    name: "Mixer Lift",
    category: "specialty",
    description:
      "Spring-assisted platform that raises stand mixers to counter height and lowers them for storage. Rated for appliances up to 60 lbs.",
    minCabinetWidth: 24,
    compatibleCabinetTypes: ["base", "appliance-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "tip-out-tray",
    slug: "tip-out-tray",
    name: "Tip-Out Tray",
    category: "organization",
    description:
      "Hinged tray behind false drawer fronts at sinks for sponges, scrubbers, and small cleaning supplies. Keeps counters clear.",
    compatibleCabinetTypes: ["sink-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "vertical-divider",
    slug: "vertical-divider",
    name: "Vertical Tray Divider",
    category: "organization",
    description:
      "Adjustable vertical slots for baking sheets, cutting boards, and platters in base or tall cabinets. Maple or metal dividers with customizable spacing.",
    minCabinetWidth: 15,
    compatibleCabinetTypes: ["base", "tall", "wall"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "drawer-organizer-kit",
    slug: "drawer-organizer-kit",
    name: "Drawer Organizer Kit",
    category: "organization",
    description:
      "Modular bins and dividers for junk drawers, office supplies, and vanity grooming storage. Cut-to-fit for any drawer box depth.",
    compatibleCabinetTypes: ["base", "vanity", "drawer-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "led-strip-channel",
    slug: "led-strip-channel",
    name: "LED Strip Channel",
    category: "lighting",
    description:
      "Routed aluminum channel in upper cabinets or under-cabinet valances for integrated LED tape. Dimmable driver options and diffuser covers included.",
    compatibleCabinetTypes: ["wall", "tall", "vanity"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "pull-out-hamper",
    slug: "pull-out-hamper",
    name: "Pull-Out Hamper",
    category: "waste",
    description:
      "Canvas or wire hamper on full-extension slides for laundry rooms and primary bath vanities. Removable bag for easy carry to the washer.",
    minCabinetWidth: 18,
    compatibleCabinetTypes: ["base", "vanity", "tall"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "wine-rack-insert",
    slug: "wine-rack-insert",
    name: "Wine Rack Insert",
    category: "specialty",
    description:
      "Horizontal or X-style wine storage for base or tall cabinets. Holds standard 750 ml bottles with ventilation clearance per Idaho building practice.",
    minCabinetWidth: 15,
    compatibleCabinetTypes: ["base", "tall", "wine-tall"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "appliance-garage",
    slug: "appliance-garage",
    name: "Appliance Garage",
    category: "specialty",
    description:
      "Lift-up or tambour door enclosure on the counter for toasters, coffee makers, and stand mixers. Keeps small appliances accessible but off the countertop.",
    minCabinetWidth: 24,
    compatibleCabinetTypes: ["wall", "counter-wall"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
];

export const ACCESSORY_BY_SLUG = Object.fromEntries(
  ACCESSORIES.map((a) => [a.slug, a]),
) as Record<string, Accessory>;

export const ACCESSORY_BY_ID = Object.fromEntries(
  ACCESSORIES.map((a) => [a.id, a]),
) as Record<string, Accessory>;
