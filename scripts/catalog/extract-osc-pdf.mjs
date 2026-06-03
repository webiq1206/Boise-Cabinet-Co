#!/usr/bin/env node
/**
 * Extract One Source Cabinets catalog data from Custom_Catalog.v1.pdf
 * into data/supplier-catalog/*.json
 *
 * Usage: node scripts/catalog/extract-osc-pdf.mjs [path-to-pdf]
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(ROOT, "data/supplier-catalog");
const DEFAULT_PDF = path.join(ROOT, "docs/supplier/Custom_Catalog.v1.pdf");

const ALL_DOOR_STYLE_IDS = [
  "slab",
  "three-piece",
  "modern-shaker",
  "thin-shaker",
  "alpha-shaker",
  "beta-shaker",
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractText(pdfPath) {
  const tmp = path.join(ROOT, ".tmp-osc-catalog.txt");
  execSync(`pdftotext "${pdfPath}" "${tmp}"`, { stdio: "pipe" });
  return fs.readFileSync(tmp, "utf8");
}

/** Parse cabinet SKU codes from catalog text */
function extractCabinetProducts(text) {
  const codeRe =
    /\b(B[A-Z0-9]*(?:-[A-Z0-9]+)+|W[A-Z0-9]*(?:-[A-Z0-9]+)+|T[A-Z0-9]*(?:-[A-Z0-9]+)+|BFH-[A-Z0-9-]+|V[A-Z0-9]*(?:-[A-Z0-9]+)+|EP[A-Z0-9-]*|FILL[A-Z0-9-]*|HOOD[A-Z0-9-]*|FS[A-Z0-9-]*)\b/g;
  const seen = new Set();
  const products = [];

  for (const m of text.matchAll(codeRe)) {
    const code = m[0];
    if (seen.has(code)) continue;
    seen.add(code);

    let category = "base";
    if (code.startsWith("W")) category = "wall";
    else if (code.startsWith("T") || code.startsWith("BFH")) category = "tall";
    else if (code.startsWith("V")) category = "vanity";
    else if (code.startsWith("EP") || code.includes("END")) category = "end-panel";
    else if (code.startsWith("FILL")) category = "filler";
    else if (code.startsWith("HOOD")) category = "hood";
    else if (code.startsWith("FS")) category = "floating-shelf";

    const doors = (code.match(/(\d)D/g) || []).reduce((s, x) => s + parseInt(x[0], 10), 0);
    const drawers = (code.match(/(\d)TD/g) || []).reduce((s, x) => s + parseInt(x[0], 10), 0);
    const shelves = (code.match(/(\d)S/g) || []).reduce((s, x) => s + parseInt(x[0], 10), 0);
    const rollouts = (code.includes("ROT") ? 1 : 0) + (code.match(/(\d)ROT/g)?.length || 0);
    const partitions = code.includes("PART") ? 1 : 0;

    products.push({
      id: slugify(code),
      slug: slugify(code),
      oscCode: code,
      name: code.replace(/-/g, " "),
      category,
      description: `One Source ${category} cabinet configuration ${code}.`,
      widthRange: { minInches: 9, maxInches: 48, note: "See catalog for exact width increments per code." },
      configuration: {
        doors: doors || undefined,
        drawers: drawers || undefined,
        shelves: shelves || undefined,
        rollouts: rollouts || undefined,
        partitions: partitions || undefined,
      },
      compatibleCollectionIds: ["custom", "reserve"],
      compatibleDoorStyleIds: ALL_DOOR_STYLE_IDS,
    });
  }

  return products.sort((a, b) => a.oscCode.localeCompare(b.oscCode));
}

/** Known finish names from OSC 2023 catalog (curated from PDF sections) */
function buildFinishes() {
  const matteSupramat = [
    "Bitter", "Breeze Beige", "Forest Green", "Macaron Green", "Pearl Black", "Pebble Grey",
    "Glamorous Pacific", "Ice Grey", "London Blues", "Royal Grey", "Snow White", "Timeless Grey",
    "Beige Arizona", "Bianco Alaska", "Bianco Dover", "Bronzo Doha", "Castoro Ottawa", "Grigio Antrim",
    "Nero Ingo", "Piomba Doha", "Bianco Malé", "Bianco Kos", "Blue Fes", "Grigio Bromo", "Grigio Efeso",
    "Grigio Londra",
  ];
  const matteLummia = [
    "Black", "Calm Sea", "Camera Obscura", "Morning Dew", "North Wind", "Urban Vibe",
    "Carte Blanche", "Eucalyptus", "Midnight Sun", "Vanilla Orchid",
  ];
  const matteOther = ["Dark Grey", "Deep Blue", "White", "Graphite", "Jade Green", "Tan",
    "Boxcar Blonde", "Capital Starlit", "Maltese Mist", "Midnight Dash", "Olive Detour",
    "Casa Blanca", "Gaslit Alley", "High Low", "Silver Lake", "Smoke Stack", "Trench Coat",
  ];
  const gloss = [
    "Black HG", "Dark Grey HG", "White HG", "Carte Blanche", "Steampunk", "Vanilla Orchid",
    "Iron Horse", "Morning Dew", "North Wind", "Dark Grey", "Deep Blue", "White", "Light Grey",
    "Fumo", "Legno", "Sbiancato", "Nebbia", "Perla", "Piano", "Marmo Nero", "Sabbia", "Zucchero",
    "Menta", "Bigio", "Cappuccino", "Grafite", "Magnolia", "Meringa",
  ];
  const woodgrain = [
    "Chameleon", "First Class", "Free Spirit", "Rhapsody", "Sheer Beauty", "Fashionista",
    "Canyon Oak", "Canyon Walnut", "Canyon Charcoal", "Coral Bark", "Epic", "Coral Sand",
    "Eucalipto Grey", "Eucalipto White", "Olmo Miele", "Panna", "Pecan Scuro", "Rockefeller",
    "Evening Notte", "Kirsche", "Grey Echo", "Morning Fog", "Midnight Run", "Serotina", "Ontano",
    "White Zebrine", "Alno",
  ];

  const tierFor = (brand, name) => {
    if (brand === "FENIX" || name.includes("Doha") || name === "Nero Ingo") return 5;
    if (brand === "Lummia" || brand === "Salt") return 4;
    if (brand === "Supramat" || brand === "AGT") return 3;
    return 3;
  };

  const hexApprox = {
    "Vanilla Orchid": "#F5F0E8", "Carte Blanche": "#F0EDE8", "Calm Sea": "#9BB5B0",
    "Eucalyptus": "#8B9A7E", "Morning Dew": "#E8EDE6", "North Wind": "#C5CDD4",
    "Black": "#1A1A1A", "Snow White": "#FAFAFA", "Gloss White": "#FFFFFF",
    "White HG": "#FFFFFF", "Chameleon": "#8A8A82", "Canyon Oak": "#C4A574",
  };

  const finishes = [];
  const addGroup = (names, category, brand, series, sidedness = "double") => {
    for (const name of names) {
      const baseSlug = slugify(name);
      const slug = `${category}-${baseSlug}`;
      const id = slug;
      finishes.push({
        id,
        slug,
        name,
        oscName: name,
        category,
        sheen: category === "gloss" ? "high-gloss" : category === "woodgrain" ? "satin" : "matte",
        hexColor: hexApprox[name] || "#888888",
        panelBrand: brand,
        panelSeries: series,
        sidedness,
        priceTierMarker: tierFor(brand, name),
        compatibleDoorStyleIds: ALL_DOOR_STYLE_IDS,
        compatibleCollectionIds: ["custom", "reserve"],
        imagePath: `/images/catalog/finishes/${slug}.webp`,
      });
    }
  };

  addGroup(matteSupramat, "matte", "Supramat", "Supramat");
  addGroup(matteLummia, "matte", "Tafisa", "Lummia Perfect Matt");
  addGroup(matteOther, "matte", "Various", "OSC Matte");
  addGroup(gloss, "gloss", "Various", "OSC Gloss", "single");
  addGroup(woodgrain, "woodgrain", "Various", "OSC Woodgrain");

  return finishes;
}

function buildDoorStyles() {
  return [
    {
      id: "slab",
      slug: "slab",
      name: "Slab",
      oscName: "Slab",
      description:
        "Minimal and streamlined. Clean lines pair with rich wood tones or a pop of color.",
      constructionNotes:
        "Flat panel with edge banding matched to face finish. Drawer fronts slab.",
      compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
      drawerFrontDefault: "slab",
      availableInCollections: ["custom", "reserve"],
      imagePath: "/images/catalog/door-styles/slab.webp",
    },
    {
      id: "three-piece",
      slug: "three-piece",
      name: "3 Piece",
      oscName: "3 Piece",
      description:
        "Center panel runs horizontally to capture woodgrain depth and beauty.",
      constructionNotes: "Three-piece construction with horizontal grain center panel.",
      compatibleFinishCategories: ["woodgrain"],
      drawerFrontDefault: "slab",
      panelLine: "Karisma",
      availableInCollections: ["custom", "reserve"],
      imagePath: "/images/catalog/door-styles/three-piece.webp",
    },
    {
      id: "modern-shaker",
      slug: "modern-shaker",
      name: "Modern Shaker",
      oscName: "Modern Shaker",
      description:
        "Classic and timeless with just enough detail without being busy.",
      constructionNotes: "Square stiles and rails with flat recessed center panel.",
      compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
      drawerFrontDefault: "slab",
      availableInCollections: ["custom", "reserve"],
      imagePath: "/images/catalog/door-styles/modern-shaker.webp",
    },
    {
      id: "thin-shaker",
      slug: "thin-shaker",
      name: "Thin Shaker",
      oscName: "Thin Shaker",
      description: "Transitional modern look with understated detail.",
      constructionNotes: "Slim stiles and rails with flat recessed center panel.",
      compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
      drawerFrontDefault: "slab",
      availableInCollections: ["custom", "reserve"],
      imagePath: "/images/catalog/door-styles/thin-shaker.webp",
    },
    {
      id: "alpha-shaker",
      slug: "alpha-shaker",
      name: "Alpha Shaker",
      oscName: "Alpha Shaker",
      description: "Mitered shaker profile with streamlined look. Drawer fronts horizontal grain slab.",
      constructionNotes: "Mitered construction. Horizontal grain slab drawer fronts.",
      compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
      drawerFrontDefault: "slab",
      panelLine: "Karisma",
      availableInCollections: ["custom", "reserve"],
      imagePath: "/images/catalog/door-styles/alpha-shaker.webp",
    },
    {
      id: "beta-shaker",
      slug: "beta-shaker",
      name: "Beta Shaker",
      oscName: "Beta Shaker",
      description:
        "Mitered construction with radius center profile and flat center panel.",
      constructionNotes: "Mitered with radius center profile. Horizontal grain slab drawer fronts.",
      compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
      drawerFrontDefault: "slab",
      panelLine: "Karisma",
      availableInCollections: ["custom", "reserve"],
      imagePath: "/images/catalog/door-styles/beta-shaker.webp",
    },
  ];
}

function buildConstruction() {
  return {
    boxStyle: "frameless euro-style",
    boxMaterial: '3/4" melamine box with 3/4" melamine shelves',
    sides: '3/4" birch plywood sides',
    bottom: '1/2" birch plywood bottoms',
    drawerConstruction: "3/4\" plywood dovetail drawer boxes",
    hingeType: "Salice six-way adjustable soft-close hinges",
    drawerSlides: "Salice Futura Smove full-extension soft-close",
    legLevelers: true,
    adjustableDrawerFronts: true,
    fillerConstruction: "Doweled crown, return panels and fillers",
    endPanels: "3/4\" finished end panels field applied",
    warranty: "Limited lifetime for original homeowner",
    facilities: ["Mesa, Arizona", "Colorado Springs, Colorado"],
    features: [
      { id: "melamine-box", label: "3/4\" Melamine Box", description: "Structural box with PUR edge banding" },
      { id: "birch-sides", label: "Birch Plywood Sides", description: "Full 3/4\" birch plywood sides" },
      { id: "salice-hinges", label: "Salice Soft-Close Hinges", description: "Six-way adjustable, 64mm line bore" },
      { id: "dovetail-drawers", label: "Dovetail Drawer Boxes", description: "3/4\" plywood, soft-close slides" },
      { id: "doweled-fillers", label: "Doweled Fillers", description: "Coordinating crown and filler panels" },
    ],
  };
}

function buildPanelBrands() {
  return [
    { id: "supramat", name: "Supramat", series: ["Supramat"] },
    { id: "fenix", name: "FENIX", series: ["FENIX NTM"] },
    { id: "lummia", name: "Tafisa Lummia", series: ["Lummia Perfect Matt"] },
    { id: "karisma", name: "Tafisa Karisma", series: ["Karisma"] },
    { id: "agt", name: "AGT", series: ["High Gloss"] },
    { id: "mirlux", name: "Mirlux", series: ["Premium Gloss"] },
    { id: "salt", name: "Salt International", series: ["Salt TSV"] },
    { id: "stevenswood", name: "Stevenswood", series: ["Stevenswood"] },
  ];
}

function main() {
  const pdfPath = process.argv[2] || DEFAULT_PDF;
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const text = extractText(pdfPath);

  const manifest = {
    source: "Custom_Catalog.v1.pdf",
    extractedAt: new Date().toISOString(),
    supplier: "One Source Cabinets",
    catalogYear: 2023,
  };

  const files = {
    "manifest.json": manifest,
    "doorStyles.json": buildDoorStyles(),
    "panelBrands.json": buildPanelBrands(),
    "finishes.json": buildFinishes(),
    "construction.json": buildConstruction(),
    "cabinetProducts.json": extractCabinetProducts(text),
    "collections.json": [
      {
        id: "custom",
        slug: "custom",
        name: "Custom Cabinets",
        tagline: "Built to order for your Treasure Valley home",
        description:
          "Full custom frameless cabinetry manufactured by One Source in Mesa, AZ and Colorado Springs, CO.",
        features: ["Any OSC finish", "Full SKU catalog", "1/4\" sizing increments"],
        leadTime: "4–8 weeks",
        priceTier: "premium",
        heroImage: "/images/catalog/collections/custom.webp",
        oscLine: "One Source built-to-order custom line",
      },
      {
        id: "reserve",
        slug: "reserve",
        name: "Reserve",
        tagline: "Curated packages with premium finishes",
        description:
          "Reserve collection pairs select door styles and finishes with faster specification paths.",
        features: ["Curated finishes", "Premium hardware", "Design Studio ready"],
        leadTime: "3–6 weeks",
        priceTier: "luxury",
        heroImage: "/images/catalog/collections/reserve.webp",
        oscLine: "One Source Reserve Collection",
      },
    ],
    "brcSlugRedirects.json": {
      snowcap: "vanilla-orchid",
      glacier: "carte-blanche",
      sagebrush: "eucalyptus",
      porcelain: "white-hg",
      pearl: "light-grey",
      graphite: "grafite",
      obsidian: "black-hg",
      cobalt: "deep-blue",
      storm: "dark-grey",
      shaker: "modern-shaker",
      "thin-shaker": "thin-shaker",
      slab: "slab",
      "white-oak": "canyon-oak",
      "natural-walnut": "canyon-walnut",
      "espresso-walnut": "pecan-scuro",
      "honey-maple": "olmo-miele",
      driftwood: "chameleon",
      "charcoal-oak": "canyon-charcoal",
      cherry: "kirsche",
    },
  };

  for (const [name, data] of Object.entries(files)) {
    const out = path.join(OUT_DIR, name);
    fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(`Wrote ${name} (${count} ${Array.isArray(data) ? "items" : "keys"})`);
  }

  console.log(`\nCatalog extracted to ${OUT_DIR}`);
}

main();
