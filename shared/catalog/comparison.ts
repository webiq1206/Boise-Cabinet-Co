/**
 * Side-by-side feature comparison matrices for Boise Cabinet Co cabinets.
 *
 * Single line: Custom Cabinets, built to order.
 * Six door styles: Slab, 3 Piece, Modern Shaker, Thin Shaker, Alpha Shaker, Beta Shaker.
 */

import type { PriceTier } from "./collections";
import { CATALOG_CONTENT } from "./generated/content";

export type ComparisonValue = boolean | string | number;

export interface ComparisonFeature {
  id: string;
  label: string;
  description?: string;
  /** Values keyed by collection id */
  values: Record<string, ComparisonValue>;
}

export interface CollectionComparisonMatrix {
  id: string;
  title: string;
  description: string;
  features: ComparisonFeature[];
}

/** Quick-reference tier ordering for UI sort */
export const PRICE_TIER_ORDER: Record<PriceTier, number> = {
  entry: 1,
  mid: 2,
  premium: 3,
  luxury: 4,
};

export const COLLECTION_COMPARISON: CollectionComparisonMatrix = {
  id: "collection-overview",
  title: "What's Included",
  description:
    "What comes standard on every cabinet we build. Each one is made to order with professional installation, soft-close hinges on doors, and our written workmanship guarantee.",
  features: [
    {
      id: "custom-sizing",
      label: "Custom sizing",
      description: "Cabinets built to your room's exact widths, heights, and depths.",
      values: {
        custom: "Built to order for your space",
      },
    },
    {
      id: "door-styles",
      label: "Door styles available",
      values: {
        custom: "Slab, 3 Piece, Modern Shaker, Thin Shaker, Alpha Shaker, Beta Shaker",
      },
    },
    {
      id: "finish-palette",
      label: "Finish palette",
      values: {
        custom: "Full matte, gloss, and woodgrain library",
      },
    },
    {
      id: "box-construction",
      label: "Box construction",
      values: {
        custom: "Plywood boxes",
      },
    },
    {
      id: "soft-close-hinges",
      label: "Soft-close hinges",
      values: {
        custom: true,
      },
    },
    {
      id: "soft-close-drawers",
      label: "Soft-close drawer slides",
      values: {
        custom: true,
      },
    },
    {
      id: "smart-storage",
      label: "Smart Storage accessories",
      description: "Roll-out trays, trash pull-outs, lazy susans, and corner solutions.",
      values: {
        custom: true,
      },
    },
    {
      id: "design-consultation",
      label: "In-home design consultation",
      values: {
        custom: "Included",
      },
    },
    {
      id: "shop-drawings",
      label: "Shop drawings for approval",
      values: {
        custom: true,
      },
    },
    {
      id: "sample-kit",
      label: "Complimentary finish sample kit",
      values: {
        custom: "On request",
      },
    },
    {
      id: "lead-time",
      label: "Typical lead time",
      values: {
        custom: CATALOG_CONTENT.leadTime,
      },
    },
    {
      id: "warranty",
      label: "Warranty",
      values: {
        custom: CATALOG_CONTENT.warrantyHeadline,
      },
    },
  ],
};

export const DOOR_STYLE_COMPARISON: CollectionComparisonMatrix = {
  id: "door-style-fit",
  title: "Door Styles",
  description: "Every door profile is available on every cabinet we build.",
  features: [
    {
      id: "slab",
      label: "Slab",
      values: {
        custom: true,
      },
    },
    {
      id: "three-piece",
      label: "3 Piece",
      values: { custom: true },
    },
    {
      id: "modern-shaker",
      label: "Modern Shaker",
      values: { custom: true },
    },
    {
      id: "thin-shaker",
      label: "Thin Shaker",
      values: { custom: true },
    },
    {
      id: "alpha-shaker",
      label: "Alpha Shaker",
      values: { custom: true },
    },
    {
      id: "beta-shaker",
      label: "Beta Shaker",
      values: { custom: true },
    },
  ],
};

export const FINISH_TIER_COMPARISON: CollectionComparisonMatrix = {
  id: "finish-tier-access",
  title: "Finish Access",
  description: "Every finish category is available on every cabinet we build.",
  features: [
    {
      id: "matte-finishes",
      label: "Matte finishes",
      values: {
        custom: true,
      },
    },
    {
      id: "gloss-finishes",
      label: "High-gloss finishes",
      values: {
        custom: true,
      },
    },
    {
      id: "woodgrain-finishes",
      label: "Woodgrain finishes",
      values: {
        custom: true,
      },
    },
  ],
};

export const ALL_COMPARISON_MATRICES: CollectionComparisonMatrix[] = [
  COLLECTION_COMPARISON,
  DOOR_STYLE_COMPARISON,
  FINISH_TIER_COMPARISON,
];

/** Get comparison value for a specific collection and feature */
export function getComparisonValue(
  matrix: CollectionComparisonMatrix,
  featureId: string,
  collectionId: string,
): ComparisonValue | undefined {
  const feature = matrix.features.find((f) => f.id === featureId);
  return feature?.values[collectionId];
}

/** Check if a collection supports a boolean comparison feature */
export function collectionHasFeature(
  matrix: CollectionComparisonMatrix,
  featureId: string,
  collectionId: string,
): boolean {
  const value = getComparisonValue(matrix, featureId, collectionId);
  return value === true || (typeof value === "string" && value.length > 0);
}
