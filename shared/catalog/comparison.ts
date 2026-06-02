/**
 * Side-by-side feature comparison matrices for Boise Cabinet Co collections.
 */

import type { PriceTier } from "./collections";

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
  title: "Collection Comparison",
  description:
    "Compare Boise Cabinet Co cabinet lines at a glance. Every collection includes professional installation, soft-close hinges on doors, and our written workmanship guarantee.",
  features: [
    {
      id: "custom-sizing",
      label: "Custom sizing",
      description: "Ability to specify non-standard widths, heights, and depths.",
      values: {
        "full-custom": "Any dimension within shop limits",
        "semi-custom": "1-inch width increments",
        reserve: "1-inch width increments",
        "spec-grade": "Fixed module sizes only",
      },
    },
    {
      id: "door-styles",
      label: "Door styles available",
      values: {
        "full-custom": "All 6 profiles",
        "semi-custom": "5 profiles",
        reserve: "5 profiles (incl. Alpha & Beta Shaker)",
        "spec-grade": "4 profiles",
      },
    },
    {
      id: "finish-count",
      label: "Finish options",
      values: {
        "full-custom": "Full library + custom color match",
        "semi-custom": "42 finishes",
        reserve: "42 finishes (Reserve exclusives included)",
        "spec-grade": "12 core finishes",
      },
    },
    {
      id: "box-construction",
      label: "Box construction",
      values: {
        "full-custom": "Plywood or furniture-grade ply",
        "semi-custom": "Plywood with hardwood/MDF fronts",
        reserve: "Premium plywood, dovetail drawers",
        "spec-grade": "Plywood with moisture-resistant option",
      },
    },
    {
      id: "drawer-box",
      label: "Drawer box",
      values: {
        "full-custom": "Dovetail hardwood or ply",
        "semi-custom": "Dovetail or dowel (configurable)",
        reserve: "Dovetail standard",
        "spec-grade": "Dowel construction",
      },
    },
    {
      id: "soft-close-hinges",
      label: "Soft-close hinges",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": true,
      },
    },
    {
      id: "soft-close-drawers",
      label: "Soft-close drawer slides",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": "Optional upgrade",
      },
    },
    {
      id: "design-consultation",
      label: "In-home design consultation",
      values: {
        "full-custom": "Included with 3D layout option",
        "semi-custom": "Included",
        reserve: "Included with sample kit",
        "spec-grade": "Remote or template-based",
      },
    },
    {
      id: "shop-drawings",
      label: "Shop drawings for approval",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": "Standard elevations only",
      },
    },
    {
      id: "lead-time",
      label: "Typical lead time",
      values: {
        "full-custom": "10–14 weeks",
        "semi-custom": "6–8 weeks",
        reserve: "5–7 weeks",
        "spec-grade": "3–5 weeks",
      },
    },
    {
      id: "warranty",
      label: "Workmanship warranty",
      values: {
        "full-custom": "5 years",
        "semi-custom": "5 years",
        reserve: "5 years",
        "spec-grade": "3 years",
      },
    },
    {
      id: "volume-pricing",
      label: "Volume / builder pricing",
      values: {
        "full-custom": "Project-based",
        "semi-custom": "10+ units",
        reserve: "Whole-home packages",
        "spec-grade": "10+ units standard",
      },
    },
    {
      id: "accessories",
      label: "Full accessory catalog",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": "Core accessories only",
      },
    },
    {
      id: "outdoor-rated",
      label: "Outdoor-rated options",
      values: {
        "full-custom": true,
        "semi-custom": "Limited finishes",
        reserve: true,
        "spec-grade": false,
      },
    },
    {
      id: "integrated-lighting",
      label: "Integrated LED channels",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": false,
      },
    },
  ],
};

export const DOOR_STYLE_COMPARISON: CollectionComparisonMatrix = {
  id: "door-style-fit",
  title: "Door Style by Collection",
  description: "Which door profiles are available in each cabinet line.",
  features: [
    {
      id: "slab",
      label: "Slab",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": true,
      },
    },
    {
      id: "three-piece",
      label: "Three-Piece",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": false,
      },
    },
    {
      id: "modern-shaker",
      label: "Modern Shaker",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": true,
      },
    },
    {
      id: "thin-shaker",
      label: "Thin Shaker",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": true,
      },
    },
    {
      id: "alpha-shaker",
      label: "Alpha Shaker",
      values: {
        "full-custom": true,
        "semi-custom": false,
        reserve: true,
        "spec-grade": false,
      },
    },
    {
      id: "beta-shaker",
      label: "Beta Shaker",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": false,
      },
    },
  ],
};

export const FINISH_TIER_COMPARISON: CollectionComparisonMatrix = {
  id: "finish-tier-access",
  title: "Finish Tier Access",
  description: "Which finish tiers are included or available per collection.",
  features: [
    {
      id: "standard-finishes",
      label: "Standard finishes",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": true,
      },
    },
    {
      id: "premium-finishes",
      label: "Premium finishes",
      values: {
        "full-custom": true,
        "semi-custom": true,
        reserve: true,
        "spec-grade": "Upgrade fee",
      },
    },
    {
      id: "reserve-finishes",
      label: "Reserve-exclusive finishes",
      values: {
        "full-custom": true,
        "semi-custom": "Upgrade fee",
        reserve: true,
        "spec-grade": false,
      },
    },
    {
      id: "custom-color-match",
      label: "Custom color match",
      values: {
        "full-custom": true,
        "semi-custom": "Project add-on",
        reserve: false,
        "spec-grade": false,
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
