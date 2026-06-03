/**
 * Central catalog query layer - single source for all surfaces
 */

import { COLLECTIONS } from "./collections";
import { DOOR_STYLES } from "./doorStyles";
import { DOOR_STYLE_BY_SLUG } from "./generated/doorStyles";
import { FINISHES } from "./finishes";
import { FINISH_BY_SLUG } from "./generated/finishes";
import { CABINET_PRODUCTS } from "./cabinetProducts";
import { OSC_CONSTRUCTION } from "./construction";
import type {
  CabinetCollection,
  CabinetProduct,
  CabinetProductCategory,
  CatalogSearchFacets,
  DoorStyle,
  Finish,
  FinishCategory,
} from "./types";
import { COLLECTION_BY_SLUG } from "./generated/collections";

function getCollectionBySlug(slug: string) {
  return COLLECTION_BY_SLUG[slug];
}

function getDoorStyleBySlug(slug: string) {
  return DOOR_STYLE_BY_SLUG[slug];
}

function getFinishBySlug(slug: string) {
  return FINISH_BY_SLUG[slug];
}

export function getFinishesForDoorStyle(doorStyleSlug: string): Finish[] {
  const doorStyle = getDoorStyleBySlug(doorStyleSlug);
  if (!doorStyle) return [];
  return FINISHES.filter((f) => f.compatibleDoorStyleIds.includes(doorStyle.id));
}

export function getDoorStylesForFinish(finishSlug: string): DoorStyle[] {
  const finish = getFinishBySlug(finishSlug);
  if (!finish) return [];
  return DOOR_STYLES.filter((d) => finish.compatibleDoorStyleIds.includes(d.id));
}

export function getCollectionsForDoorStyle(doorStyleSlug: string): CabinetCollection[] {
  const style = getDoorStyleBySlug(doorStyleSlug);
  if (!style) return [];
  return COLLECTIONS.filter((c) => style.availableInCollections.includes(c.id));
}

export function getCollectionsForFinish(finishSlug: string): CabinetCollection[] {
  const finish = getFinishBySlug(finishSlug);
  if (!finish) return COLLECTIONS;
  return COLLECTIONS.filter((c) => finish.compatibleCollectionIds.includes(c.id));
}

export function getProductCountForDoorStyle(doorStyleSlug: string): number {
  const style = getDoorStyleBySlug(doorStyleSlug);
  if (!style) return 0;
  return CABINET_PRODUCTS.filter((p) => p.compatibleDoorStyleIds.includes(style.id)).length;
}

export function getProductsForDoorStyle(doorStyleSlug: string, limit = 12): CabinetProduct[] {
  const style = getDoorStyleBySlug(doorStyleSlug);
  if (!style) return [];
  return CABINET_PRODUCTS.filter((p) => p.compatibleDoorStyleIds.includes(style.id)).slice(
    0,
    limit,
  );
}

export function getProductsByCategory(
  category: CabinetProductCategory,
  limit = 24,
): CabinetProduct[] {
  return CABINET_PRODUCTS.filter((p) => p.category === category).slice(0, limit);
}

export function getSimilarFinishes(finishSlug: string, limit = 6): Finish[] {
  const finish = getFinishBySlug(finishSlug);
  if (!finish) return [];
  return FINISHES.filter(
    (f) =>
      f.slug !== finish.slug &&
      f.category === finish.category &&
      (f.panelBrand === finish.panelBrand || f.panelSeries === finish.panelSeries),
  ).slice(0, limit);
}

export function getConstructionForCollection(_collectionSlug: string) {
  return OSC_CONSTRUCTION;
}

export interface NarrowCatalogInput {
  room?: string;
  doorStyle?: string;
  finishCategory?: FinishCategory;
  collection?: string;
  productCategory?: CabinetProductCategory;
  budgetTier?: number;
}

export function narrowCatalog(input: NarrowCatalogInput) {
  let finishes = [...FINISHES];
  let doorStyles = [...DOOR_STYLES];
  let products = [...CABINET_PRODUCTS];

  if (input.doorStyle) {
    finishes = getFinishesForDoorStyle(input.doorStyle);
    products = products.filter((p) => p.compatibleDoorStyleIds.includes(input.doorStyle!));
  }
  if (input.finishCategory) {
    finishes = finishes.filter((f) => f.category === input.finishCategory);
    doorStyles = doorStyles.filter((d) =>
      d.compatibleFinishCategories.includes(input.finishCategory!),
    );
  }
  if (input.collection) {
    finishes = finishes.filter((f) => f.compatibleCollectionIds.includes(input.collection!));
    products = products.filter((p) => p.compatibleCollectionIds.includes(input.collection!));
  }
  if (input.productCategory) {
    products = products.filter((p) => p.category === input.productCategory);
  }
  if (input.budgetTier != null) {
    finishes = finishes.filter((f) => f.priceTierMarker <= input.budgetTier!);
  }

  return { finishes, doorStyles, products, collections: COLLECTIONS };
}

export type CatalogSearchResultType =
  | "collection"
  | "doorStyle"
  | "finish"
  | "room"
  | "accessory"
  | "hardware"
  | "cabinetType"
  | "cabinetProduct";

export interface CatalogSearchResult {
  type: CatalogSearchResultType;
  slug: string;
  name: string;
  description: string;
  score: number;
}

export function searchCatalogWithFacets(
  query: string,
  facets?: CatalogSearchFacets,
): CatalogSearchResult[] {
  const q = query.trim().toLowerCase();
  const narrowed = narrowCatalog({
    doorStyle: facets?.doorStyle,
    finishCategory: facets?.finishCategory,
    collection: facets?.collection,
    productCategory: facets?.productCategory,
    budgetTier: facets?.budgetTier,
  });

  const results: CatalogSearchResult[] = [];
  const score = (text: string, slug: string, name: string): number => {
    if (!q) return 1;
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

  for (const c of narrowed.collections) {
    const text = [c.name, c.tagline, c.description, ...c.features].join(" ");
    const s = score(text, c.slug, c.name);
    if (s > 0 || !q) {
      results.push({ type: "collection", slug: c.slug, name: c.name, description: c.tagline, score: s || 1 });
    }
  }

  for (const d of narrowed.doorStyles) {
    const text = [d.name, d.description, d.constructionNotes, d.oscName].join(" ");
    const s = score(text, d.slug, d.name);
    if (s > 0 || !q) {
      results.push({ type: "doorStyle", slug: d.slug, name: d.name, description: d.description, score: s || 1 });
    }
  }

  for (const f of narrowed.finishes) {
    const text = [f.name, f.oscName, f.category, f.panelBrand, f.panelSeries].join(" ");
    const s = score(text, f.slug, f.name);
    if (s > 0 || !q) {
      results.push({
        type: "finish",
        slug: f.slug,
        name: f.name,
        description: `${f.category} · ${f.panelSeries}`,
        score: s || 1,
      });
    }
  }

  for (const p of narrowed.products) {
    const text = [p.name, p.oscCode, p.description, p.category].join(" ");
    const s = score(text, p.slug, p.name);
    if (s > 0 || !q) {
      results.push({
        type: "cabinetProduct",
        slug: p.slug,
        name: p.oscCode,
        description: p.description.slice(0, 100),
        score: s || 1,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Recommended path for guided wizard */
export function getRecommendations(input: NarrowCatalogInput) {
  const { finishes, doorStyles, products } = narrowCatalog(input);
  return {
    topFinishes: finishes.slice(0, 8),
    topDoorStyles: doorStyles.slice(0, 6),
    topProducts: products.slice(0, 6),
  };
}
