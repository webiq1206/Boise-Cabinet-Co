import {
  calculateCombinedEstimate,
  PROJECT_LABELS,
  type EstimateSelections,
  type ProjectType,
} from "@/shared/estimateEngine";
import {
  calculateOwnerServicePricing,
  LEGACY_DIRECT_COST_FACTOR,
  type OwnerServicePricing,
} from "@/shared/ownerServicePricing";
import { buildEstimateRecord, type EstimateRecord } from "@/shared/estimateRecord";

type EstimateSummary = {
  project: string;
  finish: string;
  priceLow: number;
  priceHigh: number;
  roi: number;
  sizeLabel?: string;
  confidenceLabel?: string;
  rooms?: Array<{ project: string; finish: string; sizeLabel: string; priceLow: number; priceHigh: number }>;
} | null | undefined;

function selectionFromRecordRoom(room: Record<string, unknown>): EstimateSelections {
  const project = String(room.project || "");
  if (!Object.hasOwn(PROJECT_LABELS, project)) throw new Error("The saved estimate contains an unsupported project type.");
  const numberOrNull = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
  return {
    project: project as ProjectType,
    layout: typeof room.layout === "string" ? room.layout : "",
    size: numberOrNull(room.sizeBaseLf),
    sizeUpper: numberOrNull(room.sizeUpperLf),
    doorStyle: typeof room.doorStyle === "string" ? room.doorStyle : "",
    finishSlug: typeof room.finishSlug === "string" ? room.finishSlug : "",
    finishCategory: ["matte", "woodgrain", "gloss"].includes(String(room.finishCategory))
      ? room.finishCategory as EstimateSelections["finishCategory"]
      : "",
    finishTier: ["standard", "premium", "reserve"].includes(String(room.finishTier))
      ? room.finishTier as EstimateSelections["finishTier"]
      : "",
    construction: ["good", "better", "best"].includes(String(room.construction))
      ? room.construction as EstimateSelections["construction"]
      : "",
  };
}

/**
 * Recompute only current local-estimator records (version 2). Version 1
 * snapshots include prices already shown to the homeowner and remain immutable.
 */
export function repriceOwnerServiceSubmission<T extends EstimateRecord>(input: {
  estimate: EstimateSummary;
  record: T | null | undefined;
}): { estimate: EstimateSummary; record: T | null | undefined; ownerServices: OwnerServicePricing | null } {
  const record = input.record;
  if (!record || record.version < 2 || !Array.isArray(record.rooms) || record.rooms.length === 0) {
    return { estimate: input.estimate, record, ownerServices: null };
  }
  const rooms = record.rooms.map((room) => selectionFromRecordRoom(room as unknown as Record<string, unknown>));
  const base = calculateCombinedEstimate(rooms);
  const priced = calculateCombinedEstimate(rooms, { includeOwnerServices: true });
  if (!base || !priced) throw new Error("The saved estimate selections are incomplete and cannot be repriced.");
  const rebuilt = buildEstimateRecord({
    rooms,
    capturedAt: record.capturedAt,
    includeOwnerServices: true,
    budget: record.budget,
    notes: record.notes,
    propertyAddress: record.propertyAddress,
  });
  if (!rebuilt) throw new Error("The saved estimate selections are incomplete and cannot be repriced.");
  const ownerServices = calculateOwnerServicePricing({
    fallbackDirectCost: ((base.priceLow + base.priceHigh) / 2) / LEGACY_DIRECT_COST_FACTOR,
  });
  const estimate: EstimateSummary = {
    project: input.estimate?.project || priced.rooms.map((room) => room.projectLabel).join(", "),
    finish: input.estimate?.finish || "",
    priceLow: priced.priceLow,
    priceHigh: priced.priceHigh,
    roi: input.estimate?.roi || 0,
    sizeLabel: input.estimate?.sizeLabel || `${priced.rooms.length} room${priced.rooms.length === 1 ? "" : "s"}`,
    confidenceLabel: priced.confidenceLabel,
    rooms: priced.rooms.map((room) => ({
      project: room.projectLabel,
      finish: input.estimate?.finish || "",
      sizeLabel: room.sizeLabel,
      priceLow: room.priceLow,
      priceHigh: room.priceHigh,
    })),
  };
  return {
    estimate,
    record: { ...record, ...rebuilt } as T,
    ownerServices,
  };
}
