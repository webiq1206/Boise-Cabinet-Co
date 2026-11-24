import {
  applyOwnerServicesToEstimate,
  OWNER_SERVICE_PRICING_VERSION,
  type EstimateWithOwnerServices,
  type OwnerServicePricing,
  type OwnerServiceOverrides,
} from "@/shared/ownerServicePricing";

type CustomerLine = { category?: string; low?: number; high?: number; quantity?: number; unitLow?: number; unitHigh?: number; [key: string]: unknown };
type CabinetPricingResult = {
  internal: any;
  customer: {
    range?: { low: number; high: number } | null;
    lineItems?: CustomerLine[];
    categoryRanges?: Array<{ category: string; low: number; high: number }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function applyOwnerServicesForManualReview<T extends EstimateWithOwnerServices>(
  estimate: T,
  input: { ownerServicePricingVersion?: string; ownerServiceOverrides?: OwnerServiceOverrides },
): T | (T & { ownerServices: OwnerServicePricing; ownerServiceReconciliation: number }) {
  if (input.ownerServicePricingVersion !== OWNER_SERVICE_PRICING_VERSION) return estimate;
  return applyOwnerServicesToEstimate(estimate, input.ownerServiceOverrides);
}

function apportionAddedAmount<T extends { low?: number; high?: number; quantity?: number; unitLow?: number; unitHigh?: number }>(items: T[], amount: number, key: "low" | "high"): T[] {
  if (!items.length || amount === 0) return items;
  const weights = items.map((item) => Math.max(0, Number(item[key]) || 0));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let assigned = 0;
  return items.map((item, index) => {
    const share = index === items.length - 1
      ? amount - assigned
      : total > 0 ? Math.round((amount * weights[index] / total) * 100) / 100 : Math.round((amount / items.length) * 100) / 100;
    assigned += share;
    const next = { ...item, [key]: Math.max(0, Number(item[key]) || 0) + share } as T;
    if (typeof next.quantity === "number" && next.quantity > 0) {
      if (key === "low") next.unitLow = Number(next.low) / next.quantity;
      else next.unitHigh = Number(next.high) / next.quantity;
    }
    return next;
  });
}

/** Adds Cabinet owner services after the P5 cost engine's markup calculation. */
export function addCabinetOwnerServices<T extends CabinetPricingResult>(priced: T): T {
  if (!priced.customer?.range || !priced.internal?.lines || !Array.isArray(priced.internal.lines)) return priced;
  const internal = applyOwnerServicesToEstimate(priced.internal);
  const amount = internal.ownerServices.totalAmount;
  const low = priced.customer.range.low + amount;
  const high = priced.customer.range.high + amount;
  const sourceLines = priced.customer.lineItems || [];
  const lowAdjusted = apportionAddedAmount(sourceLines, amount, "low");
  const highAdjusted = apportionAddedAmount(sourceLines, amount, "high");
  const lineItems = sourceLines.map((line, index) => ({
    ...line,
    ...(typeof lowAdjusted[index]?.low === "number" ? { low: lowAdjusted[index].low, unitLow: lowAdjusted[index].unitLow } : {}),
    ...(typeof highAdjusted[index]?.high === "number" ? { high: highAdjusted[index].high, unitHigh: highAdjusted[index].unitHigh } : {}),
  }));
  const categoryRanges = priced.customer.categoryRanges?.map((category) => ({
    ...category,
    low: lineItems.filter((line) => line.category === category.category).reduce((sum, line) => sum + (Number(line.low) || 0), 0),
    high: lineItems.filter((line) => line.category === category.category).reduce((sum, line) => sum + (Number(line.high) || 0), 0),
  }));
  return {
    ...priced,
    internal,
    customer: {
      ...priced.customer,
      range: { low, high },
      ...(priced.customer.lineItems ? { lineItems } : {}),
      ...(categoryRanges ? { categoryRanges } : {}),
    },
  };
}
