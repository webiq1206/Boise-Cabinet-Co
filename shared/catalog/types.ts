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
  | "floating-shelf"
  | "panel";

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
  /** True when the catalog lists price as "confirm" rather than a $ tier */
  priceConfirm?: boolean;
  /** Plain color grouping for filtering; unset when the swatch must define it */
  colorFamily?: string;
  /** True when this finish is currently stocked/available */
  onSiteNow?: boolean;
  compatibleDoorStyleIds: string[];
  compatibleCollectionIds: string[];
  /** Real on-disk swatch image; unset finishes render a flat colorFamily tile. */
  imagePath?: string;
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

/** A single physical dimension. `variable` means cut-to-fit (trim/panel). */
export interface CabinetDimension {
  min: number | null;
  max: number | null;
  variable: boolean;
}

export interface CabinetDimensions {
  width: CabinetDimension;
  height: CabinetDimension;
  depth: CabinetDimension;
}

export interface CabinetProduct {
  id: string;
  slug: string;
  /** Internal manufacturing code - never render in customer-facing UI */
  oscCode: string;
  name: string;
  category: CabinetProductCategory;
  description: string;
  widthRange: {
    minInches: number;
    maxInches: number;
    note?: string;
  };
  /** Real per-SKU width/height/depth ranges from the catalog */
  dimensions: CabinetDimensions;
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

/** Site-wide content single-sourced from data/catalog.json `content`. */
export interface CatalogContent {
  warrantyHeadline: string;
  warrantySummary: string;
  leadTime: string;
  estimateDisclaimer: string;
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
