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

// Inline export — mirrors shared/supplier/productColorMap.ts for Node without TS compile
const FINISH_COLOR_MAP = [
  ["snowcap", "Snowcap", "Tafisa", "Classic White (CR)", "Prélude Crystalite", "matte", "true"],
  ["glacier", "Glacier", "Tafisa", "Glacier White (CR)", "Prélude Crystalite", "matte", "true"],
  ["dune", "Dune", "Tafisa", "Daybreak (IS)", "Prélude Isola", "matte", "true"],
  ["sagebrush", "Sagebrush", "Tafisa", "Force of Nature (KA)", "Prélude Karisma", "matte", "true"],
  ["slate", "Slate", "Tafisa", "Materia Black (MA)", "Prélude Materia", "matte", "true"],
  ["midnight", "Midnight", "Tafisa", "Black Tie (BV)", "Sommet Brava", "matte", "true"],
  ["clay", "Clay", "Tafisa", "Hot Cinnamon (SN)", "Prélude Smoothwood", "matte", "true"],
  ["fog", "Fog", "Tafisa", "Froth of Sea (CR)", "Prélude Crystalite", "matte", "true"],
  ["linen", "Linen", "Tafisa", "Materia Cream Puff (MA)", "Prélude Materia", "matte", "true"],
  ["riverstone", "Riverstone", "Tafisa", "Dark Chocolate (UR)", "Prélude Urbania", "matte", "true"],
  ["basalt", "Basalt", "Tafisa", "Black (CR)", "Prélude Crystalite", "matte", "true"],
  ["mist", "Mist", "Tafisa", "Evening Star (IS)", "Prélude Isola", "matte", "true"],
  ["terracotta", "Terracotta", "Tafisa", "Hot Fudge (CR)", "Prélude Crystalite", "matte", "false"],
  ["fern", "Fern", "Tafisa", "Force of Nature (KA)", "Prélude Karisma", "matte", "true"],
  ["pebble", "Pebble", "Salt International", "Reserve Greige (OSC Reserve)", "One Source Reserve", "matte", "true"],
  ["porcelain", "Porcelain", "Tafisa", "Classic White High Gloss (CR)", "Prélude Crystalite", "gloss", "true"],
  ["ivory", "Ivory", "Tafisa", "Ivory (CR)", "Prélude Crystalite", "gloss", "true"],
  ["pearl", "Pearl", "Tafisa", "Crème de la Crème (BV)", "Sommet Brava", "gloss", "true"],
  ["graphite", "Graphite", "Tafisa", "Black (IS)", "Prélude Isola", "gloss", "true"],
  ["obsidian", "Obsidian", "Tafisa", "Materia Black High Gloss (MA)", "Prélude Materia", "gloss", "true"],
  ["seafoam", "Seafoam", "Tafisa", "Copa Cabana (SN)", "Prélude Smoothwood", "gloss", "false"],
  ["blush", "Blush", "Tafisa", "Fashionista (KA)", "Prélude Karisma", "gloss", "false"],
  ["cobalt", "Cobalt", "Tafisa", "Latitude East (AT)", "Prélude Alto", "gloss", "false"],
  ["champagne", "Champagne", "Tafisa", "First Class (KA)", "Prélude Karisma", "gloss", "true"],
  ["storm", "Storm", "Tafisa", "Brushed Aluminum (CR)", "Prélude Crystalite", "gloss", "true"],
  ["alabaster", "Alabaster", "Tafisa", "Home Sweet Home (BV)", "Sommet Brava", "gloss", "true"],
  ["crimson", "Crimson", "Salt International", "Reserve Crimson (OSC Reserve)", "One Source Reserve", "gloss", "false"],
  ["white-oak", "White Oak", "Tafisa", "Sand Barbera Oak (OSC Semi-Custom)", "Prélude Smoothwood EIR", "eir-woodgrain", "true"],
  ["natural-walnut", "Natural Walnut", "Tafisa", "Hardrock Maple (CR)", "Prélude Crystalite EIR", "eir-woodgrain", "true"],
  ["espresso-walnut", "Espresso Walnut", "Tafisa", "Dark Rum Cherry (CR)", "Prélude Crystalite EIR", "eir-woodgrain", "true"],
  ["honey-maple", "Honey Maple", "Tafisa", "Acacia Honey (KA)", "Prélude Karisma EIR", "eir-woodgrain", "true"],
  ["driftwood", "Driftwood", "Tafisa", "Bora Bora (SN)", "Prélude Smoothwood EIR", "eir-woodgrain", "true"],
  ["charcoal-oak", "Charcoal Oak", "Tafisa", "Grenada (SN)", "Prélude Smoothwood EIR", "eir-woodgrain", "true"],
  ["hickory", "Hickory", "Tafisa", "Dolce Vita (SN)", "Prélude Smoothwood EIR", "eir-woodgrain", "true"],
  ["cherry", "Cherry", "Tafisa", "Dark Rum Cherry (CR)", "Prélude Crystalite EIR", "eir-woodgrain", "true"],
  ["ash", "Ash", "Tafisa", "Latitude North (AT)", "Prélude Alto EIR", "eir-woodgrain", "true"],
  ["teak", "Teak", "Tafisa", "Free Spirit (KA)", "Prélude Karisma EIR", "eir-woodgrain", "true"],
  ["reclaimed-barn", "Reclaimed Barn", "Salt International", "Reserve Wire-Brushed (OSC Reserve)", "One Source Reserve", "eir-woodgrain", "false"],
  ["ebony", "Ebony", "Tafisa", "Materia Black (MA) EIR", "Prélude Materia EIR", "eir-woodgrain", "true"],
  ["blonde-oak", "Blonde Oak", "Tafisa", "Sand Barbera Oak Light (OSC)", "Prélude Smoothwood EIR", "eir-woodgrain", "true"],
  ["pecan", "Pecan", "Tafisa", "Acacia Honey (KA)", "Prélude Karisma EIR", "eir-woodgrain", "true"],
  ["cedar", "Cedar", "Salt International", "Reserve Cedar (OSC Reserve)", "One Source Reserve", "eir-woodgrain", "true"],
];

const DOOR_STYLES = [
  ["slab", "Slab", "Slab", "true"],
  ["modern-shaker", "Modern Shaker", "Modern Shaker", "true"],
  ["thin-shaker", "Thin Shaker", "Thin Shaker", "true"],
  ["three-piece", "Three-Piece", "5-Piece Shaker", "true"],
  ["alpha-shaker", "Alpha Shaker", "Alpha Shaker (Reserve)", "false"],
  ["beta-shaker", "Beta Shaker", "Beta Shaker (Reserve)", "false"],
];

const COLLECTIONS = [
  ["full-custom", "Full Custom", "One Source Full Custom", "true"],
  ["semi-custom", "Semi-Custom", "One Source Semi-Custom", "true"],
  ["reserve", "Reserve", "One Source Reserve Collection", "true"],
  ["spec-grade", "Spec Grade", "One Source Spec / Builder Line", "true"],
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
