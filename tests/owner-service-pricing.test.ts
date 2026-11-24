import assert from "node:assert/strict";
import test from "node:test";
import {
  applyOwnerServicesToEstimate,
  calculateOwnerServicePricing,
  LEGACY_DIRECT_COST_FACTOR,
  OWNER_SERVICES,
  OWNER_SERVICE_RATE,
  PROJECT_MILESTONES,
} from "../shared/ownerServicePricing";
import {
  DEFAULT_SELECTIONS,
  calculateCombinedEstimate,
  calculateEstimate,
  getDefaultSelectionsForProject,
} from "../shared/estimateEngine";
import { designToEstimateSelections, getDesignEstimate } from "../lib/design/designToEstimate";
import type { DesignState } from "../components/design-studio/DesignStudioProvider";

const hoursByCode = (result: ReturnType<typeof calculateOwnerServicePricing>) =>
  Object.fromEntries(OWNER_SERVICES.map((service) => [
    service.code,
    result.lines.filter((line) => line.code === service.code).reduce((sum, line) => sum + line.hours, 0),
  ]));

test("small projects receive one project-level minimum, not a minimum per milestone", () => {
  const result = calculateOwnerServicePricing({ baseDirectCost: 0 });
  assert.equal(result.totalAmount, 60);
  assert.deepEqual(hoursByCode(result), {
    "01-31-03": 0.25,
    "01-31-04": 0.125,
    "01-31-05": 0.125,
  });
  assert.equal(result.lines.length, OWNER_SERVICES.length * PROJECT_MILESTONES.length);
  assert.ok(result.lines.every((line) => line.hours > 0 && line.rate === 120));
});

test("large projects use the authorized per-thousand rates at exact client pricing", () => {
  const result = calculateOwnerServicePricing({ baseDirectCost: 50_000 });
  assert.deepEqual(hoursByCode(result), {
    "01-31-03": 25,
    "01-31-04": 10,
    "01-31-05": 5,
  });
  assert.equal(result.grossAmount, 4_800);
  assert.equal(result.lines[0].rate, OWNER_SERVICE_RATE);
  assert.deepEqual(
    Object.fromEntries(OWNER_SERVICES.map((service) => [
      service.code,
      result.lines.find((line) => line.code === service.code)?.qboItemId,
    ])),
    { "01-31-03": 48, "01-31-04": 49, "01-31-05": 47 },
  );
});

test("final owner-service rates are appended after P5 markup, not marked up again", () => {
  const base = {
    directCost: 50_000,
    contractPrice: 80_000,
    planningRange: { low: 72_000, high: 90_000 },
    planningBandHigh: 90_000,
    lines: [{ id: "base", description: "Field installation", category: "field-labor", cost: 50_000 }],
  };
  const result = applyOwnerServicesToEstimate(base);
  assert.equal(result.contractPrice, 84_800);
  assert.equal(result.planningRange.low, 76_800);
  assert.equal(result.planningRange.high, 94_800);
  assert.equal(result.ownerServices.lines.find((line) => line.code === "01-31-03")?.rate, 120);
  assert.equal(result.ownerServiceReconciliation, 0);
});

test("detailed direct costs split hours proportionally across their milestones", () => {
  const result = calculateOwnerServicePricing({
    lines: [
      { id: "plan", category: "engineering-design", cost: 1_000 },
      { id: "install", category: "field-labor", cost: 3_000 },
    ],
  });
  const management = result.lines.filter((line) => line.code === "01-31-03");
  assert.equal(management.length, 2);
  assert.equal(management.find((line) => line.milestone === "planning")?.hours, 2 * 0.25);
  assert.equal(management.find((line) => line.milestone === "execution")?.hours, 2 * 0.75);
  assert.equal(result.lines.reduce((sum, line) => sum + line.amount, 0), 384);
});

test("manual internal milestone hours override the default allocation", () => {
  const result = calculateOwnerServicePricing({
    baseDirectCost: 1_000,
    overrides: { "01-31-03": { planning: 1.25 } },
  });
  const management = result.lines.filter((line) => line.code === "01-31-03");
  assert.equal(management.reduce((sum, line) => sum + line.hours, 0), 1.25);
  assert.equal(management.find((line) => line.milestone === "planning")?.hours, 1.25);
  assert.throws(() => calculateOwnerServicePricing({
    baseDirectCost: 1_000,
    overrides: { "01-31-03": { planning: 0 } },
  }), /must be positive hours/);
});

test("taxes, indirect charges, owner allowances and the two legacy owner rows are excluded; outside supervision remains", () => {
  const result = calculateOwnerServicePricing({
    baseDirectCost: 1_000,
    lines: [
      { id: "materials", category: "materials", cost: 1_000 },
      { id: "tax", description: "Sales tax", cost: 200 },
      { id: "overhead", description: "Overhead recovery", cost: 300 },
      { id: "prior-service", code: "01-31-03", cost: 120 },
      { id: "prior-supervision", code: "01-31-01", cost: 700 },
      { id: "salary-supervision", code: "01-31-02", cost: 800 },
      { id: "outside-supervision", category: "project-supervision", description: "Outside subcontractor supervision", cost: 400 },
    ],
  });
  assert.equal(result.baseDirectCost, 1_400);
  assert.equal(result.ownerLaborCredits.length, 2);
  assert.equal(result.creditAmount, 134.4);
  assert.ok(result.milestoneWeights.execution >= 400);
  assert.ok(Math.abs(result.totalAmount - (result.grossAmount - result.creditAmount)) < 0.005);
});

test("existing owner-service lines are replaced, while legacy owner-time charges offset the new total once", () => {
  const base = {
    directCost: 1_210,
    contractPrice: 2_420,
    planningRange: { low: 1_820, high: 2_920 },
    planningBandHigh: 2_920,
    lines: [
      { id: "materials", description: "Cabinet materials", category: "materials", cost: 1_000 },
      { id: "01-31-03", code: "01-31-03", description: "Old project management service", cost: 10, sellingAmount: 20 },
      { id: "01-31-01", code: "01-31-01", description: "Prior owner time allowance", cost: 200, sellingAmount: 400 },
    ],
  };
  const result = applyOwnerServicesToEstimate(base);
  assert.equal(result.directCost, 1_000);
  assert.deepEqual(result.lines.map((line) => line.id), ["materials", "01-31-01"]);
  assert.equal(result.ownerServices.baseDirectCost, 1_000);
  assert.equal(result.ownerServices.creditAmount, 99);
  assert.equal(result.ownerServices.totalAmount, 0);
  assert.equal(result.contractPrice, 2_400);
});

test("the local cabinet range adds project services once, including on multi-room plans", () => {
  const base = calculateEstimate(DEFAULT_SELECTIONS)!;
  const priced = calculateEstimate(DEFAULT_SELECTIONS, 0, { includeOwnerServices: true })!;
  const expectedLowFee = calculateOwnerServicePricing({
    fallbackDirectCost: ((base.priceLow + base.priceHigh) / 2) / LEGACY_DIRECT_COST_FACTOR,
  }).totalAmount;
  assert.equal(priced.priceLow, Math.round((base.priceLow + expectedLowFee) / 100) * 100);
  assert.ok(priced.priceHigh > base.priceHigh);

  const rooms = [DEFAULT_SELECTIONS, getDefaultSelectionsForProject("bathroom")];
  const baseCombined = calculateCombinedEstimate(rooms)!;
  const pricedCombined = calculateCombinedEstimate(rooms, { includeOwnerServices: true })!;
  const expectedCombinedFee = calculateOwnerServicePricing({
    fallbackDirectCost: ((baseCombined.priceLow + baseCombined.priceHigh) / 2) / LEGACY_DIRECT_COST_FACTOR,
  }).totalAmount;
  assert.equal(pricedCombined.priceLow, Math.round((baseCombined.priceLow + expectedCombinedFee) / 100) * 100);
  assert.equal(pricedCombined.priceLow, pricedCombined.rooms.reduce((sum, room) => sum + room.priceLow, 0));
});

test("the design-studio estimate also includes one project-level owner-service addition", () => {
  const design = {
    roomType: "bathroom",
    modules: [],
    roomBounds: null,
    roomMeta: null,
    layout: null,
    doorStyle: null,
    finish: null,
  } as unknown as DesignState;
  const selections = designToEstimateSelections(design, { size: 10 });
  const base = calculateEstimate(selections, 0)!;
  const priced = getDesignEstimate(design, { size: 10 })!;
  const fee = calculateOwnerServicePricing({
    fallbackDirectCost: ((base.priceLow + base.priceHigh) / 2) / LEGACY_DIRECT_COST_FACTOR,
  }).totalAmount;
  assert.equal(priced.priceLow, Math.round((base.priceLow + fee) / 100) * 100);
  assert.equal(priced.priceHigh, Math.round((base.priceHigh + fee) / 100) * 100);
});
