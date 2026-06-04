/**
 * Interior cabinet accessories - exactly the catalog accessory families.
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
  /** When sourced from supplier catalog extraction */
  oscCodePattern?: string;
  exampleSkus?: string[];
}

/** @deprecated Prefer ACCESSORY_FAMILIES - legacy slugs mapped to family ids */
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
    compatibleCollectionIds: ["custom"],
    oscCodePattern: family.oscCodePattern,
    exampleSkus: [...family.exampleSkus],
  };
}

const familyAccessories = ACCESSORY_FAMILIES.map(familyToAccessory);

/** Exactly the catalog accessory families - no legacy marketing extras. */
export const ACCESSORIES: Accessory[] = [...familyAccessories];

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

/** Resolve legacy slug aliases to supplier accessory families */
export function getAccessoryFamilyForSlug(slug: string): AccessoryFamily | undefined {
  const familyId = ACCESSORY_SLUG_TO_FAMILY[slug] ?? slug;
  return ACCESSORY_FAMILY_BY_SLUG[familyId];
}

/** Filter cabinet products to those matching an accessory family slug */
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
