/**
 * OSC cabinet SKU catalog
 */

export type { CabinetProduct, CabinetProductCategory, CabinetProductConfiguration } from "./types";

export {
  CABINET_PRODUCTS,
  CABINET_PRODUCT_BY_SLUG,
} from "./generated/cabinetProducts";

import { CABINET_PRODUCTS } from "./generated/cabinetProducts";
import type { CabinetProductCategory } from "./types";

export const CABINET_PRODUCT_BY_ID = Object.fromEntries(
  CABINET_PRODUCTS.map((p) => [p.id, p]),
) as Record<string, import("./types").CabinetProduct>;

export const CABINET_PRODUCTS_BY_CATEGORY = CABINET_PRODUCTS.reduce(
  (acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  },
  {} as Record<CabinetProductCategory, typeof CABINET_PRODUCTS>,
);

export function getCabinetProductBySlug(slug: string) {
  return CABINET_PRODUCTS.find((p) => p.slug === slug);
}

export function getCabinetProductsByCategory(category: CabinetProductCategory) {
  return CABINET_PRODUCTS.filter((p) => p.category === category);
}
