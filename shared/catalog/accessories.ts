/**
 * Interior cabinet accessories — OSC families (generated) plus legacy marketing entries.
 */

import {
  ACCESSORY_FAMILIES,
  ACCESSORY_FAMILY_BY_SLUG,
} from "./generated/accessoryFamilies";
import type { AccessoryFamily, CabinetProduct } from "./types";

export { ACCESSORY_FAMILIES, ACCESSORY_FAMILY_BY_SLUG };
export type { AccessoryFamily };

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
  /** When sourced from OSC catalog extraction */
  oscCodePattern?: string;
  exampleSkus?: string[];
}

/** @deprecated Prefer ACCESSORY_FAMILIES — legacy slugs mapped to family ids */
export const ACCESSORY_SLUG_TO_FAMILY: Record<string, string> = {
  "pull-out-shelf": "rollout-tray",
  "lazy-susan": "lazy-susan",
  "trash-pullout": "trash-pullout",
  "blind-corner-pullout": "blind-corner",
  "vertical-divider": "partition",
};

function familyToAccessory(family: AccessoryFamily): Accessory {
  return {
    id: family.id,
    slug: family.slug,
    name: family.name,
    category: family.category as AccessoryCategory,
    description: family.description,
    compatibleCabinetTypes: ["base", "tall", "wall"],
    compatibleCollectionIds: ["custom", "reserve"],
    oscCodePattern: family.oscCodePattern,
    exampleSkus: [...family.exampleSkus],
  };
}

/** Legacy accessories not represented as OSC SKU families */
const LEGACY_ACCESSORIES: Accessory[] = [
  {
    id: "pull-out-pantry",
    slug: "pull-out-pantry",
    name: "Pantry Pull-Out System",
    category: "storage",
    description:
      "Multi-tier pull-out columns for tall cabinets with adjustable shelves and soft-close slides.",
    minCabinetWidth: 18,
    compatibleCabinetTypes: ["tall", "pantry-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "spice-rack-pullout",
    slug: "spice-rack-pullout",
    name: "Spice Rack Pull-Out",
    category: "organization",
    description:
      "Narrow pull-out rack sized for 3-inch or 9-inch base fillers beside ranges and refrigerators.",
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
      "Adjustable maple or bamboo dividers for wide utensil drawers on soft-close slides.",
    compatibleCabinetTypes: ["base", "drawer-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "peg-board-drawer",
    slug: "peg-board-drawer",
    name: "Peg Board Drawer Organizer",
    category: "organization",
    description: "Customizable peg system for plate and bowl storage in deep drawers.",
    compatibleCabinetTypes: ["base", "drawer-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "cutting-board-insert",
    slug: "cutting-board-insert",
    name: "Cutting Board Insert",
    category: "specialty",
    description:
      "Sliding cutting board that stores above a base drawer or pull-out trash.",
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
      "Spring-assisted platform that raises stand mixers to counter height and lowers them for storage.",
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
      "Hinged tray behind false drawer fronts at sinks for sponges and cleaning supplies.",
    compatibleCabinetTypes: ["sink-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "drawer-organizer-kit",
    slug: "drawer-organizer-kit",
    name: "Drawer Organizer Kit",
    category: "organization",
    description:
      "Modular bins and dividers for junk drawers, office supplies, and vanity grooming storage.",
    compatibleCabinetTypes: ["base", "vanity", "drawer-base"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "led-strip-channel",
    slug: "led-strip-channel",
    name: "LED Strip Channel",
    category: "lighting",
    description:
      "Routed aluminum channel in upper cabinets for integrated LED tape with dimmable drivers.",
    compatibleCabinetTypes: ["wall", "tall", "vanity"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
  {
    id: "pull-out-hamper",
    slug: "pull-out-hamper",
    name: "Pull-Out Hamper",
    category: "waste",
    description:
      "Canvas or wire hamper on full-extension slides for laundry rooms and bath vanities.",
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
      "Horizontal or X-style wine storage for base or tall cabinets.",
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
      "Lift-up or tambour door enclosure on the counter for small appliances.",
    minCabinetWidth: 24,
    compatibleCabinetTypes: ["wall", "counter-wall"],
    compatibleCollectionIds: ["custom", "reserve"],
  },
];

const familyAccessories = ACCESSORY_FAMILIES.map(familyToAccessory);
const familySlugs = new Set(familyAccessories.map((a) => a.slug));

export const ACCESSORIES: Accessory[] = [
  ...familyAccessories,
  ...LEGACY_ACCESSORIES.filter((a) => !familySlugs.has(a.slug)),
];

function buildAccessoryMaps() {
  const bySlug: Record<string, Accessory> = Object.fromEntries(
    ACCESSORIES.map((a) => [a.slug, a]),
  );
  const byId: Record<string, Accessory> = Object.fromEntries(
    ACCESSORIES.map((a) => [a.id, a]),
  );

  for (const [legacySlug, familyId] of Object.entries(ACCESSORY_SLUG_TO_FAMILY)) {
    const family = ACCESSORY_FAMILY_BY_SLUG[familyId];
    if (!family) continue;
    const mapped = familyToAccessory(family);
    if (!bySlug[legacySlug]) bySlug[legacySlug] = { ...mapped, slug: legacySlug, id: legacySlug };
    if (!byId[legacySlug]) byId[legacySlug] = bySlug[legacySlug];
  }

  return { bySlug, byId };
}

const { bySlug, byId } = buildAccessoryMaps();

export const ACCESSORY_BY_SLUG = bySlug as Record<string, Accessory>;
export const ACCESSORY_BY_ID = byId as Record<string, Accessory>;

/** Resolve legacy slug aliases to OSC accessory families */
export function getAccessoryFamilyForSlug(slug: string): AccessoryFamily | undefined {
  const familyId = ACCESSORY_SLUG_TO_FAMILY[slug] ?? slug;
  return ACCESSORY_FAMILY_BY_SLUG[familyId];
}

/** Filter cabinet products to those matching an OSC accessory family slug */
export function filterProductsByAccessoryFamily(
  products: CabinetProduct[],
  familySlug: string,
): CabinetProduct[] {
  const family = ACCESSORY_FAMILY_BY_SLUG[familySlug];
  if (!family) return products;
  const examples = new Set(family.exampleSkus);
  return products.filter(
    (p) =>
      examples.has(p.oscCode) ||
      (family.oscCodePattern.length > 0 && p.oscCode.includes(family.oscCodePattern)),
  );
}
