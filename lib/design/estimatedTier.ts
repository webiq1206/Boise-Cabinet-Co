import { COLLECTION_BY_SLUG, type PriceTier } from "@/shared/catalog/collections";
import { FINISH_BY_SLUG, type FinishTier } from "@/shared/catalog/finishes";

/** Friendly label + ordinal weight for an estimated price tier. */
export interface EstimatedTier {
  label: string;
  weight: number;
}

const COLLECTION_WEIGHT: Record<PriceTier, number> = {
  entry: 1,
  mid: 2,
  premium: 3,
  luxury: 4,
};

const FINISH_WEIGHT: Record<FinishTier, number> = {
  standard: 0,
  premium: 1,
  reserve: 2,
};

const TIER_LABELS = [
  "Value",
  "Smart",
  "Mid-range",
  "Premium",
  "Luxury",
  "Signature",
];

/**
 * Derive a single estimated price tier from the chosen collection and finish.
 * Combines the collection's base price tier with the finish upgrade level so a
 * premium finish on a mid collection nudges the estimate upward.
 */
export function getEstimatedTier(
  collectionSlug: string | null,
  finishSlug: string | null,
): EstimatedTier {
  if (!collectionSlug) {
    return { label: "Not set", weight: 0 };
  }
  const collection = COLLECTION_BY_SLUG[collectionSlug];
  if (!collection) {
    return { label: "Not set", weight: 0 };
  }
  const finish = finishSlug ? FINISH_BY_SLUG[finishSlug] : undefined;

  const base = COLLECTION_WEIGHT[collection.priceTier] ?? 1;
  const bump = finish ? FINISH_WEIGHT[finish.tier] ?? 0 : 0;
  const weight = base + bump;
  const label = TIER_LABELS[Math.min(weight, TIER_LABELS.length - 1)];

  return { label, weight };
}
