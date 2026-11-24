import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_SELECTIONS, calculateCombinedEstimate } from "../shared/estimateEngine";
import { buildEstimateRecord } from "../shared/estimateRecord";
import { repriceOwnerServiceSubmission } from "../server/services/ownerServiceEstimate";

test("new local estimate records are recomputed from saved selections and preserve the public range", () => {
  const record = buildEstimateRecord({
    rooms: [DEFAULT_SELECTIONS],
    capturedAt: "2026-11-23T12:00:00.000Z",
    includeOwnerServices: true,
  });
  assert.ok(record);
  assert.equal(record.version, 2);
  const result = repriceOwnerServiceSubmission({
    estimate: { project: "Kitchen", finish: "Matte", priceLow: -1, priceHigh: -1, roi: 0 },
    record,
  });
  const expected = calculateCombinedEstimate([DEFAULT_SELECTIONS], { includeOwnerServices: true });
  assert.ok(expected);
  assert.equal(result.estimate?.priceLow, expected.priceLow);
  assert.equal(result.estimate?.priceHigh, expected.priceHigh);
  assert.equal(result.record?.rangeLow, expected.priceLow);
  assert.ok((result.ownerServices?.totalAmount || 0) > 0);
  assert.deepEqual(result.ownerServices?.lines.map((line) => line.qboItemId).filter((id, index, all) => all.indexOf(id) === index), [48, 49, 47]);
});

test("existing version-one estimate records keep the exact previously shown prices", () => {
  const record = buildEstimateRecord({
    rooms: [DEFAULT_SELECTIONS],
    capturedAt: "2026-11-22T12:00:00.000Z",
  });
  assert.ok(record);
  assert.equal(record.version, 1);
  const result = repriceOwnerServiceSubmission({
    estimate: { project: "Kitchen", finish: "Matte", priceLow: 12345, priceHigh: 23456, roi: 0 },
    record,
  });
  assert.equal(result.estimate?.priceLow, 12345);
  assert.equal(result.estimate?.priceHigh, 23456);
  assert.equal(result.ownerServices, null);
});
