/**
 * Catalog type definitions - aligned with data/supplier-catalog/*.json
 */

export type FinishCategory = "matte" | "gloss" | "woodgrain";
export type PriceTier = "entry" | "mid" | "premium" | "luxury";
export type FinishSheen = "flat" | "matte" | "satin" | "semi-gloss" | "gloss" | "high-gloss";
export type FinishTier = "standard" | "premium" | "reserve";
export type CabinetProductCategory =
  | "base"
  | "wall"
  | "tall"
  | "vanity"
  | "end-panel"
  | "filler"
  | "hood"
  | "floating-shelf";

export interface DoorStyle {
  id: string;
  slug: string;
  name: string;
  oscName: string;
  description: string;
  constructionNotes: string;
  compatibleFinishCategories: FinishCategory[];
  drawerFrontDefault: "slab" | "five-piece";
  panelLine?: string;
  availableInCollections: string[];
  imagePath: string;
}

export interface Finish {
  id: string;
  slug: string;
  name: string;
  oscName: string;
  category: FinishCategory;
  sheen: FinishSheen;
  hexColor: string;
  panelBrand: string;
  panelSeries: string;
  sidedness: "single" | "double";
  priceTierMarker: number;
  compatibleDoorStyleIds: string[];
  compatibleCollectionIds: string[];
  imagePath: string;
  description?: string;
  /** @deprecated use priceTierMarker */
  tier?: FinishTier;
}

export interface CabinetCollection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  leadTime: string;
  priceTier: PriceTier;
  heroImage: string;
  oscLine: string;
}

export interface CabinetProductConfiguration {
  doors?: number;
  drawers?: number;
  shelves?: number;
  rollouts?: number;
  partitions?: number;
}

export interface CabinetProduct {
  id: string;
  slug: string;
  oscCode: string;
  name: string;
  category: CabinetProductCategory;
  description: string;
  widthRange: {
    minInches: number;
    maxInches: number;
    note?: string;
  };
  configuration: CabinetProductConfiguration;
  compatibleCollectionIds: string[];
  compatibleDoorStyleIds: string[];
}

export interface CatalogSearchFacets {
  room?: string;
  doorStyle?: string;
  finishCategory?: FinishCategory;
  collection?: string;
  productCategory?: CabinetProductCategory;
  budgetTier?: number;
}

export interface AccessoryFamily {
  id: string;
  slug: string;
  name: string;
  category: string;
  oscCodePattern: string;
  description: string;
  exampleSkus: string[];
}
