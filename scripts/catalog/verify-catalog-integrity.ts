/**
 * Validates data/catalog.json integrity (the single source of truth) and that
 * the generated TS catalog is in sync with it.
 * Run: npm run catalog:verify
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");
const EXPECTED_CODES_PATH = path.join(ROOT, "data/catalog-expected-cabinet-codes.json");
const EXPECTED_DIMS_PATH = path.join(ROOT, "data/catalog-expected-cabinet-dims.json");
const NONTABULATED_PATH = path.join(ROOT, "data/catalog-nontabulated-cabinet-codes.json");
const GEN = path.join(ROOT, "shared/catalog/generated");

function fail(msg: string): never {
  console.error(`catalog:verify FAIL — ${msg}`);
  process.exit(1);
}

interface Cabinet {
  code: string;
  category: string;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  minD: number;
  maxD: number;
  attrs?: Record<string, unknown>;
  boxImage?: string;
}

interface Catalog {
  meta?: {
    doorStyles?: number;
    finishes?: number;
    finishesByCategory?: Record<string, number>;
    accessories?: number;
    cabinets?: number;
    cabinetsByCategory?: Record<string, number>;
  };
  doorStyles: { name: string }[];
  finishes: { name: string; category: string; priceTier: string }[];
  accessories: { name: string }[];
  cabinets: Cabinet[];
  content: Record<string, string>;
  nomenclature?: { tokens: Record<string, string> };
}

// The exact set the build plan locks in; nothing invented, nothing missing.
const ALLOWED_DOOR_STYLES = new Set([
  "Slab",
  "3 Piece",
  "Modern Shaker",
  "Thin Shaker",
  "Alpha Shaker",
  "Beta Shaker",
]);

const ALLOWED_ACCESSORIES = new Set([
  "Roll-Out Tray",
  "Trash Pull-Out",
  "Lazy Susan",
  "Blind Corner Pull-Out",
  "Vertical Partition",
  "Floating Shelf",
]);

// Supplier / material brand strings that must never appear in the data the app
// renders (catalog.json keeps materialLine internal; it is stripped at codegen).
const BANNED_STRINGS = ["OSC", "One Source", "Reserve"];

function countConsts(file: string, token: string): number {
  const src = fs.readFileSync(path.join(GEN, file), "utf8");
  return (src.match(new RegExp(`"${token}":`, "g")) || []).length;
}

function main() {
  const catalog: Catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

  // ── Door styles ─────────────────────────────────────────────────────────
  if (catalog.doorStyles.length !== 6) {
    fail(`Expected 6 door styles, got ${catalog.doorStyles.length}`);
  }
  for (const d of catalog.doorStyles) {
    if (!ALLOWED_DOOR_STYLES.has(d.name)) fail(`Unexpected door style: ${d.name}`);
  }

  // ── Finishes ────────────────────────────────────────────────────────────
  if (catalog.finishes.length !== 299) {
    fail(`Expected 299 finishes, got ${catalog.finishes.length}`);
  }

  // ── Accessories (exactly the 6 kept) ──────────────────────────────────────
  if (catalog.accessories.length !== 6) {
    fail(`Expected 6 accessories, got ${catalog.accessories.length}`);
  }
  for (const a of catalog.accessories) {
    if (!ALLOWED_ACCESSORIES.has(a.name)) fail(`Removed/unknown accessory present: ${a.name}`);
  }

  // ── Cabinets ──────────────────────────────────────────────────────────────
  // The expected code set is locked in a committed golden manifest so parity is
  // proven by exact membership, not just total count (count-only checks pass
  // even when a code is silently substituted). Update the manifest deliberately
  // when the supplier catalog genuinely changes.
  const expectedCodes: string[] = JSON.parse(fs.readFileSync(EXPECTED_CODES_PATH, "utf8"));
  const expectedSet = new Set(expectedCodes);
  if (expectedSet.size !== expectedCodes.length) {
    fail("catalog-expected-cabinet-codes.json contains duplicate codes");
  }
  if (catalog.cabinets.length !== expectedCodes.length) {
    fail(`Expected ${expectedCodes.length} cabinets, got ${catalog.cabinets.length}`);
  }
  const codes = new Set<string>();
  for (const c of catalog.cabinets) {
    if (!c.code) fail("Cabinet missing code");
    if (codes.has(c.code)) fail(`Duplicate cabinet code: ${c.code}`);
    codes.add(c.code);
    if (!c.attrs) fail(`Cabinet ${c.code} missing attrs (needed for box diagram)`);
    if (!c.boxImage) fail(`Cabinet ${c.code} missing boxImage path`);
  }
  // Exact set equality against the golden manifest.
  const missing = expectedCodes.filter((c) => !codes.has(c));
  const unexpected = [...codes].filter((c) => !expectedSet.has(c)).sort();
  if (missing.length) {
    fail(`Cabinet codes missing vs manifest (${missing.length}): ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? " ..." : ""}`);
  }
  if (unexpected.length) {
    fail(`Unexpected cabinet codes not in manifest (${unexpected.length}): ${unexpected.slice(0, 10).join(", ")}${unexpected.length > 10 ? " ..." : ""}`);
  }

  // ── Cabinet dimensions match the supplier PDF spec appendix ───────────────
  // Golden dims are extracted verbatim from the PDF (build-expected-dims.mjs).
  // The appendix tabulates six dims for most codes; a fixed set of box-sharing
  // fronts/panels/fillers/variants is not separately tabulated and is listed in
  // catalog-nontabulated-cabinet-codes.json.
  const expectedDims: Record<string, number[]> = JSON.parse(fs.readFileSync(EXPECTED_DIMS_PATH, "utf8"));
  const nonTabulated: string[] = JSON.parse(fs.readFileSync(NONTABULATED_PATH, "utf8")).codes;
  const dimCodes = new Set(Object.keys(expectedDims));
  const nonTabSet = new Set(nonTabulated);

  // Every golden dim row must be a 6-number tuple and refer to a real catalog code.
  const cabByCode = new Map(catalog.cabinets.map((c) => [c.code, c]));
  for (const [code, t] of Object.entries(expectedDims)) {
    if (!Array.isArray(t) || t.length !== 6 || !t.every((n) => Number.isInteger(n))) {
      fail(`Golden dims for ${code} is not a 6-integer tuple: ${JSON.stringify(t)}`);
    }
    if (!cabByCode.has(code)) fail(`Golden dims contains code not in catalog: ${code}`);
  }

  // Coverage invariant: tabulated ∪ non-tabulated must EXACTLY partition the full
  // cabinet code set. This makes it impossible for dimension coverage to silently
  // shrink (e.g. a PDF re-extraction under-matching) without a loud failure.
  const overlap = [...dimCodes].filter((c) => nonTabSet.has(c));
  if (overlap.length) {
    fail(`Codes in BOTH dims manifest and non-tabulated list (${overlap.length}): ${overlap.slice(0, 10).join(", ")}`);
  }
  const uncovered = [...codes].filter((c) => !dimCodes.has(c) && !nonTabSet.has(c)).sort();
  if (uncovered.length) {
    fail(`Cabinet codes with no dimension coverage (not in dims manifest nor non-tabulated list) (${uncovered.length}): ${uncovered.slice(0, 10).join(", ")}${uncovered.length > 10 ? " ..." : ""}`);
  }
  const staleNonTab = [...nonTabSet].filter((c) => !codes.has(c)).sort();
  if (staleNonTab.length) {
    fail(`Non-tabulated list has codes not in catalog (${staleNonTab.length}): ${staleNonTab.slice(0, 10).join(", ")}`);
  }

  const dimKeys: (keyof Cabinet)[] = ["minW", "maxW", "minH", "maxH", "minD", "maxD"];
  const dimMismatches: string[] = [];
  for (const [code, want] of Object.entries(expectedDims)) {
    const c = cabByCode.get(code)!;
    const have = dimKeys.map((k) => c[k] as number);
    if (have.join(",") !== want.join(",")) {
      dimMismatches.push(`${code} [${have.join(",")}] != PDF [${want.join(",")}]`);
    }
  }
  if (dimMismatches.length) {
    fail(`Cabinet dimensions diverge from supplier PDF (${dimMismatches.length}): ${dimMismatches.slice(0, 8).join("; ")}${dimMismatches.length > 8 ? " ..." : ""}`);
  }

  // ── meta summary counts are derived, never stale ──────────────────────────
  // Guards against meta drifting from the real arrays (run recompute-meta.mjs).
  const meta = catalog.meta ?? {};
  const countBy = (items: { category: string }[]) =>
    items.reduce<Record<string, number>>((acc, it) => {
      acc[it.category] = (acc[it.category] || 0) + 1;
      return acc;
    }, {});
  const eqMap = (a: Record<string, number> = {}, b: Record<string, number> = {}) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every((k) => a[k] === b[k]);
  };
  if (meta.cabinets !== catalog.cabinets.length) {
    fail(`meta.cabinets (${meta.cabinets}) != cabinets.length (${catalog.cabinets.length}); run node scripts/catalog/recompute-meta.mjs`);
  }
  if (meta.finishes !== catalog.finishes.length) {
    fail(`meta.finishes (${meta.finishes}) != finishes.length (${catalog.finishes.length}); run node scripts/catalog/recompute-meta.mjs`);
  }
  if (meta.doorStyles !== catalog.doorStyles.length) {
    fail(`meta.doorStyles (${meta.doorStyles}) != doorStyles.length (${catalog.doorStyles.length})`);
  }
  if (meta.accessories !== catalog.accessories.length) {
    fail(`meta.accessories (${meta.accessories}) != accessories.length (${catalog.accessories.length})`);
  }
  if (!eqMap(meta.cabinetsByCategory, countBy(catalog.cabinets))) {
    fail("meta.cabinetsByCategory is stale; run node scripts/catalog/recompute-meta.mjs");
  }
  if (!eqMap(meta.finishesByCategory, countBy(catalog.finishes))) {
    fail("meta.finishesByCategory is stale; run node scripts/catalog/recompute-meta.mjs");
  }

  // ── Content ───────────────────────────────────────────────────────────────
  for (const key of ["warrantyHeadline", "warrantySummary", "leadTime", "estimateDisclaimer"]) {
    if (!catalog.content?.[key]) fail(`content.${key} missing`);
  }

  // ── Nomenclature ──────────────────────────────────────────────────────────
  if (!catalog.nomenclature?.tokens) fail("nomenclature.tokens missing");

  // ── No supplier/brand strings in customer-facing finish/door/accessory names ─
  const customerStrings = [
    ...catalog.finishes.map((f) => f.name),
    ...catalog.doorStyles.map((d) => d.name),
    ...catalog.accessories.map((a) => a.name),
  ].join(" ");
  for (const banned of BANNED_STRINGS) {
    if (customerStrings.includes(banned)) {
      fail(`Banned supplier/brand string "${banned}" found in customer-facing names`);
    }
  }

  // ── Generated TS in sync ──────────────────────────────────────────────────
  for (const f of ["doorStyles.ts", "finishes.ts", "cabinetProducts.ts", "content.ts", "nomenclature.ts"]) {
    if (!fs.existsSync(path.join(GEN, f))) fail(`Missing generated ${f} — run: npm run catalog:codegen`);
  }
  const genFinishes = countConsts("finishes.ts", "slug");
  const genCabinets = countConsts("cabinetProducts.ts", "slug");
  if (genFinishes !== 299) fail(`Generated finishes out of sync (${genFinishes}); run npm run catalog:codegen`);
  if (genCabinets !== expectedCodes.length) {
    fail(`Generated cabinets out of sync (${genCabinets} vs ${expectedCodes.length}); run npm run catalog:codegen`);
  }

  console.log(
    `catalog:verify OK — ${catalog.doorStyles.length} door styles, ${catalog.finishes.length} finishes, ${catalog.cabinets.length} cabinets, ${catalog.accessories.length} accessories`,
  );
}

main();
