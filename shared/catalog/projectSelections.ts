/**
 * Canonical catalog selection shape shared by Design Studio, portal exports, and API payloads.
 */

export interface ProjectSelections {
  roomType: string | null;
  collection: string | null;
  layout: string | null;
  doorStyle: string | null;
  finish: string | null;
  hardware: string | null;
  accessories: string[];
  lineItemSlugs: string[];
}

const PROJECT_SELECTION_KEYS = [
  "roomType",
  "collection",
  "layout",
  "doorStyle",
  "finish",
  "hardware",
  "accessories",
  "lineItemSlugs",
] as const satisfies readonly (keyof ProjectSelections)[];

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === "string");
}

/** Type guard for persisted or API-supplied project selection objects */
export function isProjectSelections(value: unknown): value is ProjectSelections {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  for (const key of PROJECT_SELECTION_KEYS) {
    if (!(key in obj)) return false;
  }
  if (!isNullableString(obj.roomType)) return false;
  if (!isNullableString(obj.collection)) return false;
  if (!isNullableString(obj.layout)) return false;
  if (!isNullableString(obj.doorStyle)) return false;
  if (!isNullableString(obj.finish)) return false;
  if (!isNullableString(obj.hardware)) return false;
  if (!isStringArray(obj.accessories)) return false;
  if (!isStringArray(obj.lineItemSlugs)) return false;
  return true;
}

/** Pick only ProjectSelections fields from a wider object */
export function toProjectSelections(
  input: Partial<ProjectSelections> & Record<string, unknown>,
): ProjectSelections {
  return {
    roomType: isNullableString(input.roomType) ? input.roomType : null,
    collection: isNullableString(input.collection) ? input.collection : null,
    layout: isNullableString(input.layout) ? input.layout : null,
    doorStyle: isNullableString(input.doorStyle) ? input.doorStyle : null,
    finish: isNullableString(input.finish) ? input.finish : null,
    hardware: isNullableString(input.hardware) ? input.hardware : null,
    accessories: isStringArray(input.accessories) ? input.accessories : [],
    lineItemSlugs: isStringArray(input.lineItemSlugs) ? input.lineItemSlugs : [],
  };
}
