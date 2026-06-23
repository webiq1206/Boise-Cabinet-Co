#!/usr/bin/env node
/**
 * Add the standard OSC catalog cabinet families that were missing from
 * data/catalog.json so the catalog matches the supplier source 1:1.
 *
 * Every SKU below is a real product page in the supplier catalog. Dimensions
 * are taken verbatim from the catalog's specification appendix (Min/Max W,
 * Min/Max H, Min/Max D). For the handful of variants the appendix does not
 * tabulate (the glass diagonal-corner door-down family and a few partition
 * variants whose box is identical to the tabulated sibling), dimensions are
 * inherited from the same-configuration sibling the appendix DOES list.
 *
 * `attrs` are constructed from the SKU code semantics following the exact
 * conventions already used in data/catalog.json:
 *   - a top drawer  -> topDrawers:1, drawers:0
 *   - a bottom drawer -> bottomDrawers:1, drawers:0
 *   - rollouts/partitions/shelves -> their own count fields
 *
 * Idempotent: SKUs already present are skipped. After running, regenerate the
 * derived TS + SVGs:
 *   node scripts/catalog/codegen-catalog.mjs
 *   node scripts/catalog/generate-catalog-svgs.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Full attribute object with the catalog's default (zero/false/null) shape.
const A = (o = {}) => ({
  doors: 0,
  topDrawers: 0,
  bottomDrawers: 0,
  drawers: 0,
  falseFronts: 0,
  shelves: 0,
  rollouts: 0,
  partitions: 0,
  glass: false,
  open: false,
  fullHeight: false,
  doorDown: false,
  floating: false,
  sink: false,
  trash: false,
  appliance: 0,
  lazySusan: false,
  corner: null,
  lift: null,
  hand: null,
  insertReady: false,
  pencilDrawers: 0,
  ...o,
});

// mk(code, category, [minW,maxW,minH,maxH,minD,maxD], attrs)
const mk = (code, category, d, attrs) => ({
  code,
  category,
  minW: d[0],
  maxW: d[1],
  minH: d[2],
  maxH: d[3],
  minD: d[4],
  maxD: d[5],
  attrs: A(attrs),
  boxImage: `cabinets/${slugify(code)}.svg`,
});

// ── WALL ─────────────────────────────────────────────────────────────────────
const WALL_1D = [12, 54, 9, 30, 9, 30];
const WALL_1D_PART = [12, 54, 9, 26, 9, 30];
const WALL_2D = [12, 54, 21, 42, 9, 30];

const wallStandard = [];
for (let s = 0; s <= 4; s++)
  wallStandard.push(mk(`W-1D-${s}S`, "Wall", WALL_1D, { doors: 1, shelves: s }));
for (let p = 1; p <= 3; p++)
  wallStandard.push(
    mk(`W-1D-${p}PART`, "Wall", WALL_1D_PART, { doors: 1, partitions: p }),
  );
for (let s = 0; s <= 4; s++)
  wallStandard.push(mk(`W-2D-${s}S`, "Wall", WALL_2D, { doors: 2, shelves: s }));
for (let p = 1; p <= 3; p++)
  wallStandard.push(
    mk(`W-2D-${p}PART`, "Wall", WALL_2D, { doors: 2, partitions: p }),
  );

// Lift / fold wall cabinets (shelf counts are adjustable ranges in the catalog;
// a representative count from the stated range is stored).
const wallLifts = [
  mk("VWL", "Wall", [12, 24, 12, 60, 9, 30], { doors: 1, shelves: 1, lift: "vertical" }),
  mk("GVWL", "Wall", [12, 24, 12, 42, 9, 30], { doors: 1, shelves: 1, glass: true, lift: "vertical" }),
  mk("WHL", "Wall", [12, 21, 15, 39, 12, 30], { doors: 1, shelves: 0, lift: "high" }),
  mk("WHF", "Wall", [30, 42, 15, 42, 9, 30], { doors: 1, shelves: 2, lift: "fold" }),
  mk("GWHF", "Wall", [30, 42, 15, 42, 9, 30], { doors: 1, shelves: 2, glass: true, lift: "fold" }),
];

// Glass diagonal-corner door-down: same footprint as WDCDD (appendix), + glass.
const WDCDD_DIMS = [12, 54, 24, 24, 24, 24];
const wallGlassCorner = [];
for (let s = 0; s <= 4; s++)
  wallGlassCorner.push(
    mk(`GWDCDD-${s}S`, "Wall", WDCDD_DIMS, {
      doors: 0,
      shelves: s,
      glass: true,
      doorDown: true,
      corner: "diagonal corner",
    }),
  );

// ── BASE ─────────────────────────────────────────────────────────────────────
const baseStandard = [];
// B-1D-1TD (1 door + 1 top drawer)
baseStandard.push(mk("B-1D-1TD-1S", "Base", [24, 42, 12, 26, 15, 30], { doors: 1, topDrawers: 1, shelves: 1 }));
for (const r of [1, 2])
  baseStandard.push(mk(`B-1D-1TD-${r}ROT`, "Base", [24, 42, 12, 26, 18, 30], { doors: 1, topDrawers: 1, rollouts: r }));
for (const p of [1, 2, 3])
  baseStandard.push(mk(`B-1D-1TD-${p}PART`, "Base", [24, 42, 12, 26, 15, 30], { doors: 1, topDrawers: 1, partitions: p }));
// B-2D-1TD (2 doors + 1 top drawer)
baseStandard.push(mk("B-2D-1TD-1S", "Base", [24, 42, 21, 39, 15, 30], { doors: 2, topDrawers: 1, shelves: 1 }));
for (const r of [1, 2])
  baseStandard.push(mk(`B-2D-1TD-${r}ROT`, "Base", [24, 42, 21, 39, 18, 30], { doors: 2, topDrawers: 1, rollouts: r }));
for (const p of [1, 2, 3])
  baseStandard.push(mk(`B-2D-1TD-${p}PART`, "Base", [24, 42, 21, 39, 15, 30], { doors: 2, topDrawers: 1, partitions: p }));
// B-2D-2TD (2 doors + 2 top drawers)
baseStandard.push(mk("B-2D-2TD-1S", "Base", [24, 42, 30, 42, 15, 30], { doors: 2, topDrawers: 2, shelves: 1 }));
for (const r of [1, 2])
  baseStandard.push(mk(`B-2D-2TD-${r}ROT`, "Base", [24, 42, 21, 39, 18, 30], { doors: 2, topDrawers: 2, rollouts: r }));
for (const p of [1, 2, 3])
  baseStandard.push(mk(`B-2D-2TD-${p}PART`, "Base", [24, 42, 21, 42, 15, 30], { doors: 2, topDrawers: 2, partitions: p }));
// B-1D-1BD (1 door + 1 bottom drawer)
for (const s of [0, 1])
  baseStandard.push(mk(`B-1D-1BD-${s}S`, "Base", [24, 66, 12, 26, 15, 30], { doors: 1, bottomDrawers: 1, shelves: s }));
for (const r of [1, 2])
  baseStandard.push(mk(`B-1D-1BD-${r}ROT`, "Base", [24, 66, 12, 26, 18, 30], { doors: 1, bottomDrawers: 1, rollouts: r }));
for (const p of [1, 2, 3])
  baseStandard.push(mk(`B-1D-1BD-${p}PART`, "Base", [24, 66, 12, 26, 15, 30], { doors: 1, bottomDrawers: 1, partitions: p }));
// B-2D-1BD (2 doors + 1 bottom drawer)
for (const s of [0, 1])
  baseStandard.push(mk(`B-2D-1BD-${s}S`, "Base", [24, 66, 21, 39, 15, 30], { doors: 2, bottomDrawers: 1, shelves: s }));
for (const r of [1, 2])
  baseStandard.push(mk(`B-2D-1BD-${r}ROT`, "Base", [24, 66, 21, 39, 18, 30], { doors: 2, bottomDrawers: 1, rollouts: r }));
for (const p of [1, 2, 3])
  baseStandard.push(mk(`B-2D-1BD-${p}PART`, "Base", [24, 66, 21, 39, 15, 30], { doors: 2, bottomDrawers: 1, partitions: p }));

// ── TALL ─────────────────────────────────────────────────────────────────────
const tallNew = [
  mk("TBFH-1D-0S", "Tall", [30, 66, 9, 26, 9, 30], { doors: 1, shelves: 0, fullHeight: true, trash: true }),
  // TBFH-1D-1ROT-2S: dims taken verbatim from the appendix (30-66 x 12-26 x 18-30).
  mk("TBFH-1D-1ROT-2S", "Tall", [30, 66, 12, 26, 18, 30], { doors: 1, shelves: 2, rollouts: 1, fullHeight: true, trash: true }),
];

// ── FLOATING SHELF FULL-HEIGHT (FLFH) ────────────────────────────────────────
// The catalog lists rollout variants 1ROT/2ROT/3ROT; the 2ROT middle of each
// 1D/2D series was missing (it appears in the PDF as "FLFH-?D-2 ROT" — pdftotext
// splits "2ROT" into "2 ROT"). Dims are identical to the sibling 1ROT/3ROT.
const flfhNew = [
  mk("FLFH-1D-2ROT", "Base", [18, 30, 8, 26, 18, 30], { doors: 1, rollouts: 2, fullHeight: true, floating: true }),
  mk("FLFH-2D-2ROT", "Base", [18, 30, 21, 39, 18, 30], { doors: 2, rollouts: 2, fullHeight: true, floating: true }),
];

// ── INSERTION ────────────────────────────────────────────────────────────────
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const cabs = catalog.cabinets;
const existing = new Set(cabs.map((c) => c.code));

function dedupe(list) {
  return list.filter((c) => {
    if (existing.has(c.code)) return false;
    existing.add(c.code);
    return true;
  });
}

function insertBefore(anchorCode, items) {
  if (!items.length) return;
  const i = cabs.findIndex((c) => c.code === anchorCode);
  if (i === -1) cabs.push(...items);
  else cabs.splice(i, 0, ...items);
}

function insertAtCategoryStart(category, items) {
  if (!items.length) return;
  const i = cabs.findIndex((c) => c.category === category);
  if (i === -1) cabs.push(...items);
  else cabs.splice(i, 0, ...items);
}

const wallStd = dedupe([...wallStandard, ...wallLifts]);
const wallCorner = dedupe(wallGlassCorner);
const baseStd = dedupe(baseStandard);
const tbfh0 = dedupe([tallNew[0]]);
const tbfhRot = dedupe([tallNew[1]]);
const flfh1 = dedupe([flfhNew[0]]);
const flfh2 = dedupe([flfhNew[1]]);

// GWDCDD grouped right after the WDCDD family; standard wall at wall start.
insertBefore("TBFH-1D-2ROT-2S", tbfhRot);
insertBefore("TBFH-1D-1S", tbfh0);
const lastWdcdd = [...cabs].reverse().find((c) => /^WDCDD-/.test(c.code));
if (lastWdcdd) {
  const idx = cabs.findIndex((c) => c.code === lastWdcdd.code);
  cabs.splice(idx + 1, 0, ...wallCorner);
} else {
  insertAtCategoryStart("Wall", wallCorner);
}
insertBefore("FLFH-1D-3ROT", flfh1);
insertBefore("FLFH-2D-3ROT", flfh2);
insertAtCategoryStart("Base", baseStd);
insertAtCategoryStart("Wall", wallStd);

const added =
  wallStd.length + wallCorner.length + baseStd.length + tbfh0.length + tbfhRot.length + flfh1.length + flfh2.length;
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");
console.log(`Added ${added} missing cabinet SKUs. Total cabinets: ${cabs.length}`);
