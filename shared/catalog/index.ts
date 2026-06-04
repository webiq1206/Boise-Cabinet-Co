/**
 * Boise Cabinet Co product catalog, collections, finishes, door styles, and lookup helpers.
 */

export type { PriceTier, CabinetCollection } from "./collections";
export {
  COLLECTIONS,
  COLLECTION_BY_SLUG,
  COLLECTION_BY_ID,
} from "./collections";

export type { FinishCategory, DoorStyle } from "./doorStyles";
export {
  DOOR_STYLES,
  DOOR_STYLE_BY_SLUG,
  DOOR_STYLE_BY_ID,
  resolveDoorStyleSlug,
} from "./doorStyles";

export type { FinishTier, FinishSheen, Finish } from "./finishes";
export {
  FINISHES,
  FINISH_BY_SLUG,
  FINISH_BY_ID,
  FINISHES_BY_CATEGORY,
  resolveFinishSlug,
} from "./finishes";

export type { RoomCategory } from "./roomCategories";
export {
  ROOM_CATEGORIES,
  ROOM_BY_SLUG,
  ROOM_BY_ID,
} from "./roomCategories";

export type { AccessoryCategory, Accessory, AccessoryFamily } from "./accessories";
export {
  ACCESSORIES,
  ACCESSORY_BY_SLUG,
  ACCESSORY_BY_ID,
  ACCESSORY_FAMILIES,
  ACCESSORY_FAMILY_BY_SLUG,
  ACCESSORY_SLUG_TO_FAMILY,
  getAccessoryFamilyForSlug,
  filterProductsByAccessoryFamily,
} from "./accessories";

export type { HardwareCategory, HardwareFinish, HardwareOption } from "./hardware";
export {
  HARDWARE_OPTIONS,
  HARDWARE_BY_SLUG,
  HARDWARE_BY_ID,
} from "./hardware";

export {
  getHardwareImagePath,
  getAccessoryImagePath,
  getAccessoryFamilyImagePath,
  getCatalogProductAlt,
  HARDWARE_IMAGE_FILES,
} from "./catalogImages";

export {
  getDoorStyleImages,
  getFinishImages,
  getProductImages,
  pickSearchResultImage,
} from "./entityImages";
export type {
  DoorStyleImages,
  FinishImages,
  ProductImages,
  SearchResultImageInput,
} from "./entityImages";

export type {
  CabinetCategory,
  DimensionRange,
  NomenclaturePattern,
  CabinetType,
} from "./cabinetTypes";
export {
  CABINET_TYPES,
  CABINET_TYPE_BY_SLUG,
  CABINET_TYPE_BY_ID,
  CABINET_TYPES_BY_CATEGORY,
  formatCabinetCode,
} from "./cabinetTypes";

export type {
  ComparisonValue,
  ComparisonFeature,
  CollectionComparisonMatrix,
} from "./comparison";
export {
  PRICE_TIER_ORDER,
  COLLECTION_COMPARISON,
  DOOR_STYLE_COMPARISON,
  FINISH_TIER_COMPARISON,
  ALL_COMPARISON_MATRICES,
  getComparisonValue,
  collectionHasFeature,
} from "./comparison";

export type { CabinetLayout, LayoutSlug } from "./layouts";
export {
  CABINET_LAYOUTS,
  LAYOUT_BY_SLUG,
  getLayoutsForRoom,
} from "./layouts";

export type {
  CabinetProduct,
  CabinetProductCategory,
  CatalogSearchFacets,
} from "./types";
export {
  CABINET_PRODUCTS,
  CABINET_PRODUCT_BY_SLUG,
  CABINET_PRODUCTS_BY_CATEGORY,
  getCabinetProductBySlug,
  getCabinetProductsByCategory,
} from "./cabinetProducts";

export { OSC_CONSTRUCTION } from "./construction";
export { OSC_HARDWARE_SPEC } from "./generated/hardwareSpec";
export { CATALOG_CONTENT } from "./generated/content";
export type { CatalogContent } from "./types";

export {
  getFinishesForDoorStyle,
  getDoorStylesForFinish,
  getCollectionsForDoorStyle,
  getCollectionsForFinish,
  getProductCountForDoorStyle,
  getProductsForDoorStyle,
  getProductsByCategory,
  getSimilarFinishes,
  getConstructionForCollection,
  narrowCatalog,
  searchCatalogWithFacets,
  getRecommendations,
} from "./queries";

export type { CatalogSearchResult as CatalogSearchResultExtended } from "./queries";

export type { ProjectSelections } from "./projectSelections";
export { isProjectSelections, toProjectSelections } from "./projectSelections";

import { COLLECTION_BY_SLUG, COLLECTIONS, type CabinetCollection } from "./collections";
import {
  DOOR_STYLE_BY_SLUG,
  DOOR_STYLES,
  type DoorStyle,
  type FinishCategory,
} from "./doorStyles";
import { FINISH_BY_SLUG, FINISHES, type Finish } from "./finishes";
import { ROOM_BY_SLUG, ROOM_CATEGORIES, type RoomCategory } from "./roomCategories";
import { ACCESSORIES, type Accessory } from "./accessories";
import { HARDWARE_OPTIONS, type HardwareOption } from "./hardware";
import { CABINET_TYPES, type CabinetType } from "./cabinetTypes";
import { CABINET_PRODUCTS } from "./cabinetProducts";
import type { CabinetProduct, CabinetDimension } from "./types";
import { searchCatalogWithFacets } from "./queries";

// ── Lookup helpers ──────────────────────────────────────────────────────────

export function getCollectionBySlug(slug: string): CabinetCollection | undefined {
  return COLLECTION_BY_SLUG[slug];
}

export function getDoorStyleBySlug(slug: string): DoorStyle | undefined {
  return DOOR_STYLE_BY_SLUG[slug];
}

export function getFinishBySlug(slug: string): Finish | undefined {
  return FINISH_BY_SLUG[slug];
}

export function getRoomBySlug(slug: string): RoomCategory | undefined {
  return ROOM_BY_SLUG[slug];
}

export function getAccessoryBySlug(slug: string): Accessory | undefined {
  return ACCESSORIES.find((a) => a.slug === slug);
}

export function getHardwareBySlug(slug: string): HardwareOption | undefined {
  return HARDWARE_OPTIONS.find((h) => h.slug === slug);
}

export function getCabinetTypeBySlug(slug: string): CabinetType | undefined {
  return CABINET_TYPES.find((c) => c.slug === slug);
}

/** Door styles that accept a given finish category */
export function getDoorStylesForFinishCategory(category: FinishCategory): DoorStyle[] {
  return DOOR_STYLES.filter((d) => d.compatibleFinishCategories.includes(category));
}

/** Format one dimension; returns null when the dimension is cut-to-fit / variable. */
export function formatCabinetDimension(d: CabinetDimension): string | null {
  if (d.variable || d.min == null) return null;
  if (d.max == null || d.max === d.min) return `${d.min}"`;
  return `${d.min}-${d.max}"`;
}

/** Human-readable W · H · D string; "Cut to fit" when every dimension is variable. */
export function formatCabinetDimensions(product: CabinetProduct): string {
  const axes: Array<[ReturnType<typeof formatCabinetDimension>, string]> = [
    [formatCabinetDimension(product.dimensions.width), "W"],
    [formatCabinetDimension(product.dimensions.height), "H"],
    [formatCabinetDimension(product.dimensions.depth), "D"],
  ];
  // When every axis is variable, the whole cabinet is cut to fit.
  if (axes.every(([value]) => !value)) return "Cut to fit";
  // Show known axes; mark each variable axis as "Cut to fit" so none reads as missing.
  return axes
    .map(([value, label]) => (value ? `${value} ${label}` : `Cut to fit ${label}`))
    .join(" · ");
}

/** Price tier shown to customers as $-$$$$$ ; "Price on request" when unconfirmed. */
export function formatPriceTier(finish: { priceTierMarker: number; priceConfirm?: boolean }): string {
  if (finish.priceConfirm) return "Price on request";
  const n = Math.min(5, Math.max(1, finish.priceTierMarker || 1));
  return "$".repeat(n);
}

export interface CatalogSearchResult {
  type:
    | "collection"
    | "doorStyle"
    | "finish"
    | "room"
    | "accessory"
    | "hardware"
    | "cabinetType"
    | "cabinetProduct";
  slug: string;
  name: string;
  description: string;
  score: number;
  imagePath?: string;
}

/**
 * Search the full catalog by keyword. Matches name, slug, description, and feature text.
 * Results sorted by relevance score (higher = better match).
 */
export function searchCatalog(query: string, facets?: import("./types").CatalogSearchFacets): CatalogSearchResult[] {
  if (facets) {
    return searchCatalogWithFacets(query, facets) as CatalogSearchResult[];
  }
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: CatalogSearchResult[] = [];

  const score = (text: string, slug: string, name: string): number => {
    const lower = text.toLowerCase();
    let s = 0;
    if (slug === q) s += 100;
    if (name.toLowerCase() === q) s += 90;
    if (slug.startsWith(q)) s += 50;
    if (name.toLowerCase().startsWith(q)) s += 40;
    if (slug.includes(q)) s += 30;
    if (name.toLowerCase().includes(q)) s += 25;
    if (lower.includes(q)) s += 10;
    return s;
  };

  for (const c of COLLECTIONS) {
    const text = [c.name, c.tagline, c.description, ...c.features].join(" ");
    const s = score(text, c.slug, c.name);
    if (s > 0) {
      results.push({
        type: "collection",
        slug: c.slug,
        name: c.name,
        description: c.tagline,
        score: s,
      });
    }
  }

  for (const d of DOOR_STYLES) {
    const text = [d.name, d.description, d.constructionNotes].join(" ");
    const s = score(text, d.slug, d.name);
    if (s > 0) {
      results.push({
        type: "doorStyle",
        slug: d.slug,
        name: d.name,
        description: d.description,
        score: s,
      });
    }
  }

  for (const f of FINISHES) {
    const text = [f.name, f.category, f.sheen, f.description ?? ""].join(" ");
    const s = score(text, f.slug, f.name);
    if (s > 0) {
      results.push({
        type: "finish",
        slug: f.slug,
        name: f.name,
        description: f.description ?? `${f.category} · ${f.sheen}`,
        score: s,
      });
    }
  }

  for (const r of ROOM_CATEGORIES) {
    const s = score(r.description, r.slug, r.name);
    if (s > 0) {
      results.push({
        type: "room",
        slug: r.slug,
        name: r.name,
        description: r.description.slice(0, 120) + (r.description.length > 120 ? "…" : ""),
        score: s,
      });
    }
  }

  for (const a of ACCESSORIES) {
    const s = score(a.description, a.slug, a.name);
    if (s > 0) {
      results.push({
        type: "accessory",
        slug: a.slug,
        name: a.name,
        description: a.description,
        score: s,
      });
    }
  }

  for (const h of HARDWARE_OPTIONS) {
    const s = score(h.description, h.slug, h.name);
    if (s > 0) {
      results.push({
        type: "hardware",
        slug: h.slug,
        name: h.name,
        description: h.description,
        score: s,
      });
    }
  }

  for (const c of CABINET_TYPES) {
    const s = score(c.description, c.slug, c.name);
    if (s > 0) {
      results.push({
        type: "cabinetType",
        slug: c.slug,
        name: c.name,
        description: c.description.slice(0, 120) + (c.description.length > 120 ? "…" : ""),
        score: s,
      });
    }
  }

  for (const p of CABINET_PRODUCTS) {
    const s = score([p.oscCode, p.description].join(" "), p.slug, p.oscCode);
    if (s > 0) {
      results.push({
        type: "cabinetProduct",
        slug: p.slug,
        name: p.oscCode,
        description: p.description.slice(0, 100),
        score: s,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
