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
const GEN = path.join(ROOT, "shared/catalog/generated");

function fail(msg: string): never {
  console.error(`catalog:verify FAIL — ${msg}`);
  process.exit(1);
}

interface Catalog {
  doorStyles: { name: string }[];
  finishes: { name: string; category: string; priceTier: string }[];
  accessories: { name: string }[];
  cabinets: {
    code: string;
    category: string;
    attrs?: Record<string, unknown>;
    boxImage?: string;
  }[];
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
