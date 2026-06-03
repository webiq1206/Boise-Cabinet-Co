/**
 * Exports supplier product alignment CSV from productColorMap.
 * Run: node scripts/build-supplier-color-map.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const docsDir = path.join(root, "docs");

// Inline export — mirrors shared/supplier/productColorMap.ts for Node without TS compile.
// Columns: [brcSlug, brcName, supplierPanelBrand, supplierColorName, supplierSeries, finishType, verified]
// Unconfirmed entries carry no supplier fields (empty strings) and verified "false".
const FINISH_COLOR_MAP = [
  ["snowcap", "Snowcap", "Tafisa", "Vanilla Orchid", "Lummia Perfect Matt", "matte", "true"],
  ["glacier", "Glacier", "Tafisa", "Carte Blanche", "Lummia Perfect Matt", "matte", "true"],
  ["dune", "Dune", "", "", "", "matte", "false"],
  ["sagebrush", "Sagebrush", "Tafisa", "Eucalyptus", "Lummia Perfect Matt", "matte", "true"],
  ["slate", "Slate", "", "", "", "matte", "false"],
  ["midnight", "Midnight", "", "", "", "matte", "false"],
  ["clay", "Clay", "", "", "", "matte", "false"],
  ["fog", "Fog", "", "", "", "matte", "false"],
  ["linen", "Linen", "", "", "", "matte", "false"],
  ["riverstone", "Riverstone", "", "", "", "matte", "false"],
  ["basalt", "Basalt", "", "", "", "matte", "false"],
  ["mist", "Mist", "", "", "", "matte", "false"],
  ["terracotta", "Terracotta", "", "", "", "matte", "false"],
  ["fern", "Fern", "", "", "", "matte", "false"],
  ["pebble", "Pebble", "", "", "", "matte", "false"],
  ["porcelain", "Porcelain", "", "Gloss White", "One Source Gloss", "gloss", "true"],
  ["ivory", "Ivory", "", "", "", "gloss", "false"],
  ["pearl", "Pearl", "", "Gloss Light Grey", "One Source Gloss", "gloss", "true"],
  ["graphite", "Graphite", "", "Gloss Graphite", "One Source Gloss", "gloss", "true"],
  ["obsidian", "Obsidian", "", "Gloss Black", "One Source Gloss", "gloss", "true"],
  ["seafoam", "Seafoam", "", "", "", "gloss", "false"],
  ["blush", "Blush", "", "", "", "gloss", "false"],
  ["cobalt", "Cobalt", "", "Gloss Deep Blue", "One Source Gloss", "gloss", "true"],
  ["champagne", "Champagne", "", "", "", "gloss", "false"],
  ["storm", "Storm", "", "Gloss Dark Grey", "One Source Gloss", "gloss", "true"],
  ["alabaster", "Alabaster", "", "", "", "gloss", "false"],
  ["crimson", "Crimson", "", "", "", "gloss", "false"],
  ["white-oak", "White Oak", "Salt International", "Canyon Oak", "Salt TSV", "eir-woodgrain", "true"],
  ["natural-walnut", "Natural Walnut", "Salt International", "Canyon Walnut", "Salt TSV", "eir-woodgrain", "true"],
  ["espresso-walnut", "Espresso Walnut", "Salt International", "Pecan Scuro", "Salt TSV", "eir-woodgrain", "true"],
  ["honey-maple", "Honey Maple", "Salt International", "Olmo Miele", "Salt TSV", "eir-woodgrain", "true"],
  ["driftwood", "Driftwood", "Tafisa", "Chameleon", "Karisma", "eir-woodgrain", "true"],
  ["charcoal-oak", "Charcoal Oak", "Salt International", "Canyon Charcoal", "Salt TSV", "eir-woodgrain", "true"],
  ["hickory", "Hickory", "", "", "", "eir-woodgrain", "false"],
  ["cherry", "Cherry", "Stevenswood", "Kirsche", "Stevenswood", "eir-woodgrain", "true"],
  ["ash", "Ash", "", "", "", "eir-woodgrain", "false"],
  ["teak", "Teak", "", "", "", "eir-woodgrain", "false"],
  ["reclaimed-barn", "Reclaimed Barn", "", "", "", "eir-woodgrain", "false"],
  ["ebony", "Ebony", "Salt International", "Rockefeller", "Salt TSV", "eir-woodgrain", "true"],
  ["blonde-oak", "Blonde Oak", "Tafisa", "Sheer Beauty", "Karisma", "eir-woodgrain", "true"],
  ["pecan", "Pecan", "", "", "", "eir-woodgrain", "false"],
  ["cedar", "Cedar", "", "", "", "eir-woodgrain", "false"],
];

const DOOR_STYLES = [
  ["slab", "Slab", "Slab", "true"],
  ["shaker", "Shaker", "Shaker", "true"],
  ["thin-shaker", "Thin Shaker", "Thin Shaker", "true"],
];

const COLLECTIONS = [
  ["custom", "Custom Cabinets", "One Source built-to-order custom line", "true"],
  ["reserve", "Reserve", "One Source Reserve Collection", "true"],
];

function csvEscape(val) {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\n") + "\n";
}

fs.mkdirSync(docsDir, { recursive: true });

const finishRows = FINISH_COLOR_MAP.map((r) => [
  r[0], r[1], r[2], r[3], r[4], r[5], r[6],
  `/images/catalog/finishes/${r[0]}.webp`,
]);

fs.writeFileSync(
  path.join(docsDir, "supplier-product-alignment.csv"),
  toCsv(
    ["brcSlug", "brcName", "supplierPanelBrand", "supplierColorName", "supplierSeries", "finishType", "verified", "imagePath"],
    finishRows,
  ),
);

const doorRows = DOOR_STYLES.map((r) => [...r, `/images/catalog/door-styles/${r[0]}.webp`]);
fs.writeFileSync(
  path.join(docsDir, "supplier-door-styles.csv"),
  toCsv(["brcSlug", "brcName", "oscName", "verified", "imagePath"], doorRows),
);

const collectionRows = COLLECTIONS.map((r) => [...r, `/images/catalog/collections/${r[0]}.webp`]);
fs.writeFileSync(
  path.join(docsDir, "supplier-collections.csv"),
  toCsv(["brcSlug", "brcName", "oscLine", "verified", "imagePath"], collectionRows),
);

console.log("Wrote docs/supplier-product-alignment.csv");
console.log("Wrote docs/supplier-door-styles.csv");
console.log("Wrote docs/supplier-collections.csv");
