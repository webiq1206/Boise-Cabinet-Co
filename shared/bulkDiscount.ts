/**
 * Bulk lead purchase discount tiers. Single source of truth for UI display and
 * API charge calculations — thresholds and percentages must stay in sync.
 */
export const BULK_DISCOUNT_TIERS = [
  { minCount: 10, percent: 20, label: "10+" },
  { minCount: 5, percent: 10, label: "5+" },
  { minCount: 3, percent: 5, label: "3+" },
] as const;

/** Whole-number discount percent (0–20) for display. */
export function getBulkDiscountPercent(count: number): number {
  for (const tier of BULK_DISCOUNT_TIERS) {
    if (count >= tier.minCount) return tier.percent;
  }
  return 0;
}

/** Fractional discount (0–0.2) for price math in APIs. */
export function getBulkDiscountFraction(count: number): number {
  return getBulkDiscountPercent(count) / 100;
}

export const BULK_DISCOUNT_COPY = "Buy 3+ for 5% off · 5+ for 10% off · 10+ for 20% off";
