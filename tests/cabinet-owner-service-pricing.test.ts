import assert from "node:assert/strict";
import test from "node:test";
import { addCabinetOwnerServices, applyOwnerServicesForManualReview } from "../lib/p5/cabinetOwnerServicePricing";
import { OWNER_SERVICE_PRICING_VERSION } from "../shared/ownerServicePricing";

test("the local document pricing path adds owner services once and keeps QBO details internal", () => {
  const input = {
    internal: {
      directCost: 1_000,
      contractPrice: 2_000,
      planningRange: { low: 1_500, high: 2_500 },
      planningBandHigh: 2_500,
      lines: [{
        id: "materials",
        description: "Cabinet materials",
        trade: "Cabinetry",
        category: "materials",
        quantity: 1,
        unit: "lot",
        unitCost: 1_000,
        cost: 1_000,
        sellingAmount: 2_000,
        sellingUnitPrice: 2_000,
      }],
    },
    customer: {
      range: { low: 1_500, high: 2_500 },
      lineItems: [{ id: "materials", category: "Cabinetry", description: "Cabinet materials", quantity: 1, low: 1_500, high: 2_500, unitLow: 1_500, unitHigh: 2_500 }],
      categoryRanges: [{ category: "Cabinetry", low: 1_500, high: 2_500 }],
    },
  };
  const result = addCabinetOwnerServices(input);
  const addition = result.internal.ownerServices.totalAmount;
  assert.ok(addition > 0);
  assert.equal(result.customer.range.low, 1_500 + addition);
  assert.equal(result.customer.range.high, 2_500 + addition);
  assert.equal(result.customer.lineItems!.reduce((sum, line) => sum + (line.low || 0), 0), result.customer.range.low);
  assert.equal(result.customer.lineItems!.reduce((sum, line) => sum + (line.high || 0), 0), result.customer.range.high);
  assert.equal("ownerServices" in result.customer, false);
  assert.equal(result.internal.ownerServices.lines[0].rate, 120);
  assert.deepEqual(result.internal.ownerServices.lines.map((line: any) => line.qboItemId).filter((id: number, index: number, all: number[]) => all.indexOf(id) === index), [48, 49, 47]);
});

test("saved pre-change P5 reviews keep their price; newly saved reviews apply the versioned schedule", () => {
  const estimate = {
    directCost: 0,
    contractPrice: 1_000,
    planningRange: { low: 1_000, high: 1_000 },
    planningBandHigh: 1_000,
    lines: [],
  };
  assert.equal(applyOwnerServicesForManualReview(estimate, {}), estimate);
  const current = applyOwnerServicesForManualReview(estimate, { ownerServicePricingVersion: OWNER_SERVICE_PRICING_VERSION });
  assert.ok("ownerServices" in current);
  assert.equal(current.contractPrice, 1_060);
});
