/**
 * Builds scripts/site-image-manifest.json and docs/image-audit-manifest.csv
 * Run: node scripts/build-site-image-manifest.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const STYLE_SUFFIX =
  "Photorealistic architectural interior in Treasure Valley Idaho, natural window light, no people, no text, no watermarks";

const ROOMS = [
  { slug: "kitchen", name: "Kitchen", door: "shaker", finish: "snowcap", collection: "custom" },
  { slug: "bathroom", name: "Bathroom", door: "thin-shaker", finish: "glacier", collection: "custom" },
  { slug: "laundry", name: "Laundry", door: "slab", finish: "fog", collection: "custom" },
  { slug: "mudroom", name: "Mudroom", door: "thin-shaker", finish: "riverstone", collection: "reserve" },
  { slug: "home-office", name: "Home Office", door: "shaker", finish: "white-oak", collection: "custom" },
  { slug: "entertainment", name: "Entertainment", door: "slab", finish: "basalt", collection: "reserve" },
  { slug: "built-ins", name: "Built-Ins", door: "shaker", finish: "natural-walnut", collection: "custom" },
  { slug: "pantry", name: "Pantry", door: "shaker", finish: "linen", collection: "custom" },
  { slug: "closet", name: "Closet", door: "slab", finish: "white-oak", collection: "custom" },
  { slug: "garage", name: "Garage", door: "slab", finish: "slate", collection: "custom" },
  { slug: "outdoor", name: "Outdoor Kitchen", door: "slab", finish: "cedar", collection: "reserve" },
  { slug: "wet-bar", name: "Wet Bar", door: "shaker", finish: "espresso-walnut", collection: "reserve" },
  { slug: "bedroom", name: "Bedroom", door: "thin-shaker", finish: "blonde-oak", collection: "custom" },
];

const COLLECTIONS = [
  { slug: "custom", name: "Custom Cabinets", door: "shaker", finish: "white-oak" },
  { slug: "reserve", name: "Reserve", door: "thin-shaker", finish: "pebble" },
];

const FINISHES = [
  "snowcap", "glacier", "dune", "sagebrush", "slate", "midnight", "clay", "fog", "linen",
  "riverstone", "basalt", "mist", "terracotta", "fern", "pebble", "porcelain", "ivory", "pearl",
  "graphite", "obsidian", "seafoam", "blush", "cobalt", "champagne", "storm", "alabaster", "crimson",
  "white-oak", "natural-walnut", "espresso-walnut", "honey-maple", "driftwood", "charcoal-oak",
  "hickory", "cherry", "ash", "teak", "reclaimed-barn", "ebony", "blonde-oak", "pecan", "cedar",
];

const DOOR_STYLES = ["slab", "shaker", "thin-shaker"];

const CITIES = ["boise", "meridian", "eagle", "nampa", "kuna", "star", "middleton", "caldwell"];
const CITY_NAMES = {
  boise: "Boise", meridian: "Meridian", eagle: "Eagle", nampa: "Nampa",
  kuna: "Kuna", star: "Star", middleton: "Middleton", caldwell: "Caldwell",
};
const SERVICES = [
  { slug: "kitchen-cabinets", label: "Kitchen cabinets", door: "shaker", finish: "white-oak" },
  { slug: "bathroom-cabinets", label: "Bathroom vanity cabinets", door: "thin-shaker", finish: "glacier" },
  { slug: "custom-built-ins", label: "Custom built-in cabinets", door: "shaker", finish: "natural-walnut" },
  { slug: "closet-cabinets", label: "Closet cabinet systems", door: "slab", finish: "white-oak" },
  { slug: "whole-home-cabinets", label: "Whole-home cabinet packages", door: "shaker", finish: "snowcap" },
];

const GALLERY = [
  { slug: "kitchen", title: "Kitchen cabinet transformation" },
  { slug: "bathroom", title: "Bathroom vanity cabinet renovation" },
  { slug: "whole-home", title: "Whole-home custom cabinets" },
  { slug: "addition", title: "Built-in cabinet addition" },
  { slug: "basement", title: "Basement wet bar cabinets" },
  { slug: "outdoor", title: "Outdoor kitchen cabinets" },
];

/** @type {import('./site-image-manifest.types.js').SiteImageEntry[]} */
const entries = [];
let id = 0;

function add(entry) {
  entries.push({ id: `img-${String(++id).padStart(4, "0")}`, status: "pending", phase: 2, priority: "medium", width: 1792, height: 1024, formats: ["webp", "png"], ...entry });
}

// Collections
for (const c of COLLECTIONS) {
  add({
    outputPath: `/images/catalog/collections/${c.slug}.webp`,
    pages: [`/collections`, `/collections/${c.slug}`],
    placement: "hero",
    collectionId: c.slug,
    doorStyleId: c.door,
    finishId: c.finish,
    supplierColorName: c.finish,
    promptScene: `${c.name} custom cabinet collection, One Source ${c.door.replace(/-/g, " ")} doors, Tafisa ${c.finish} finish, frameless kitchen with island, ${STYLE_SUFFIX}`,
    alt: `${c.name} custom cabinets by Boise Cabinet Co — One Source ${c.name} line with premium frameless construction`,
    title: `${c.name} Cabinet Collection | Boise Cabinet Co`,
    caption: `${c.name} cabinets featuring One Source panel products and Treasure Valley installation.`,
    phase: 2,
    priority: "critical",
  });
}

// Rooms
for (const r of ROOMS) {
  add({
    outputPath: `/images/catalog/rooms/${r.slug}.webp`,
    pages: [`/`, `/cabinets`, `/cabinets/${r.slug}`],
    placement: "card-hero",
    roomId: r.slug,
    collectionId: r.collection,
    doorStyleId: r.door,
    finishId: r.finish,
    promptScene: `${r.name} with custom frameless cabinets, One Source ${r.door.replace(/-/g, " ")} doors, ${r.finish} finish, Idaho home interior, ${STYLE_SUFFIX}`,
    alt: `Custom ${r.name.toLowerCase()} cabinets with One Source ${r.door.replace(/-/g, " ")} doors in Treasure Valley Idaho`,
    title: `${r.name} Custom Cabinets | Boise Cabinet Co`,
    caption: `${r.name} cabinetry designed and installed by Boise Cabinet Co using One Source panel products.`,
    phase: 2,
    priority: "critical",
  });
}

// Finish swatches
for (const f of FINISHES) {
  add({
    outputPath: `/images/catalog/finishes/${f}.webp`,
    pages: [`/finishes`, `/finishes/matte`, `/finishes/gloss`, `/finishes/woodgrain`],
    placement: "swatch",
    finishId: f,
    promptScene: `Macro close-up of cabinet door surface showing ${f.replace(/-/g, " ")} finish texture, One Source Tafisa panel product, flat even lighting, ${STYLE_SUFFIX}`,
    alt: `${f.replace(/-/g, " ")} cabinet finish swatch — One Source Tafisa panel color for Boise Cabinet Co`,
    title: `${f.replace(/-/g, " ")} Cabinet Finish`,
    caption: `One Source ${f.replace(/-/g, " ")} finish available through Boise Cabinet Co.`,
    phase: 2,
    priority: "high",
    width: 800,
    height: 800,
  });
}

// Door styles
for (const d of DOOR_STYLES) {
  add({
    outputPath: `/images/catalog/door-styles/${d}.webp`,
    pages: [`/door-styles`, `/door-styles/${d}`],
    placement: "profile",
    doorStyleId: d,
    finishId: "snowcap",
    promptScene: `Close-up of One Source ${d.replace(/-/g, " ")} cabinet door profile on frameless box, white matte finish, ${STYLE_SUFFIX}`,
    alt: `One Source ${d.replace(/-/g, " ")} cabinet door profile — Boise Cabinet Co`,
    title: `${d.replace(/-/g, " ")} Door Style`,
    caption: `${d.replace(/-/g, " ")} door style from One Source Cabinets, available through Boise Cabinet Co.`,
    phase: 2,
    priority: "high",
    width: 1200,
    height: 800,
  });
}

// Site heroes (deduplicated)
const siteHeroes = [
  { id: "hero-home", path: "/images/marketing/hero-home.webp", pages: ["/"], alt: "Custom kitchen cabinets with One Source Shaker doors in a Treasure Valley home" },
  { id: "hero-about", path: "/images/marketing/hero-about.webp", pages: ["/about"], alt: "Boise Cabinet Co design team reviewing custom cabinet plans with homeowners" },
  { id: "hero-contact", path: "/images/marketing/hero-contact.webp", pages: ["/contact"], alt: "Custom bathroom vanity cabinets installed in a Meridian Idaho home" },
  { id: "hero-design-studio", path: "/images/marketing/hero-design-studio.webp", pages: ["/design-studio"], alt: "Boise Cabinet Co Design Studio 3D cabinet preview on laptop in kitchen" },
  { id: "process-home", path: "/images/marketing/process-home.webp", pages: ["/"], alt: "Boise Cabinet Co designer reviewing custom kitchen cabinet layouts and finish samples with Treasure Valley homeowners" },
  { id: "process-about", path: "/images/marketing/process-about.webp", pages: ["/about"], alt: "Boise Cabinet Co cabinetmaker assembling a frameless cabinet box in the Meridian Idaho shop" },
  { id: "process-contact", path: "/images/marketing/process-contact.webp", pages: ["/contact"], alt: "Boise Cabinet Co designer measuring a kitchen during an in-home consultation in the Treasure Valley" },
  { id: "hero-hardware", path: "/images/marketing/hero-hardware.webp", pages: ["/hardware"], alt: "Brushed nickel cabinet pulls and knobs on white shaker doors by Boise Cabinet Co in Idaho" },
  { id: "hero-construction", path: "/images/marketing/hero-construction.webp", pages: ["/construction"], alt: "CNC cabinet door machining at the Boise Cabinet Co Meridian Idaho shop" },
  { id: "catalog-default", path: "/images/marketing/catalog-default.webp", pages: ["/catalog"], alt: "Boise Cabinet Co cabinet door style samples and finish swatches for Treasure Valley homes" },
  { id: "statement-band", path: "/images/marketing/statement-whole-home.webp", pages: ["/", "/about", "/contact"], alt: "Whole-home custom cabinet installation in an Eagle Idaho residence", decorative: true },
  { id: "og-default", path: "/images/marketing/og-default.webp", pages: ["og"], alt: "Boise Cabinet Co custom kitchen cabinets Treasure Valley Idaho" },
];

for (const h of siteHeroes) {
  add({
    outputPath: h.path,
    pages: h.pages,
    placement: "hero",
    doorStyleId: "shaker",
    finishId: "white-oak",
    promptScene: h.alt + ", " + STYLE_SUFFIX,
    alt: h.alt,
    title: "Boise Cabinet Co Custom Cabinets",
    caption: h.alt,
    phase: 2,
    priority: h.id.startsWith("hero") ? "critical" : "high",
  });
}

// City areas
for (const city of CITIES) {
  const name = CITY_NAMES[city];
  add({
    outputPath: `/images/areas/${city}.webp`,
    pages: [`/areas`, `/areas/${city}`],
    placement: "hero",
    promptScene: `Custom kitchen cabinets in a ${name} Idaho home, One Source shaker doors white oak finish, neighborhood exterior visible through window, ${STYLE_SUFFIX}`,
    alt: `Custom cabinets installed in ${name}, Idaho by Boise Cabinet Co`,
    title: `Custom Cabinets ${name} Idaho`,
    caption: `Boise Cabinet Co custom cabinet projects serving ${name} and the Treasure Valley.`,
    phase: 2,
    priority: "high",
  });
}

// City × service (cabinet-focused naming)
for (const svc of SERVICES) {
  for (const city of CITIES) {
    const name = CITY_NAMES[city];
    add({
      outputPath: `/images/city-service/${svc.slug}__${city}.webp`,
      pages: [`/services/${svc.slug}/${city}`],
      placement: "hero",
      doorStyleId: svc.door,
      finishId: svc.finish,
      promptScene: `${svc.label} in ${name} Idaho, One Source ${svc.door.replace(/-/g, " ")} doors, ${svc.finish} finish, ${STYLE_SUFFIX}`,
      alt: `${svc.label} in ${name}, Idaho — Boise Cabinet Co One Source cabinets`,
      title: `${svc.label} ${name} ID`,
      caption: `Custom ${svc.label.toLowerCase()} for ${name} homeowners by Boise Cabinet Co.`,
      phase: 2,
      priority: "medium",
    });
  }
}

// Service fallbacks
for (const svc of SERVICES) {
  add({
    outputPath: `/images/services/${svc.slug}.webp`,
    pages: [`/services/${svc.slug}`],
    placement: "hero",
    doorStyleId: svc.door,
    finishId: svc.finish,
    promptScene: `${svc.label}, One Source custom cabinets, ${STYLE_SUFFIX}`,
    alt: `${svc.label} by Boise Cabinet Co using One Source panel products`,
    title: svc.label,
    caption: `${svc.label} throughout the Treasure Valley.`,
    phase: 2,
    priority: "medium",
  });
}

// Gallery before/after
for (const g of GALLERY) {
  for (const phase of ["before", "after"]) {
    add({
      outputPath: `/images/gallery/gallery-${g.slug}-${phase}.webp`,
      pages: ["/", "/testimonials"],
      placement: phase === "before" ? "gallery-before" : "gallery-after",
      promptScene: `${g.title} ${phase} photo, custom cabinets focus, Treasure Valley home, ${STYLE_SUFFIX}`,
      alt: `${phase === "before" ? "Before" : "After"}: ${g.title} in Treasure Valley Idaho`,
      title: `${g.title} — ${phase}`,
      caption: `${g.title} cabinet project by Boise Cabinet Co.`,
      phase: 2,
      priority: "medium",
    });
  }
}

// Hardware, accessories, construction
const HARDWARE = [
  "bar-pull-128-black",
  "bar-pull-160-nickel",
  "cup-pull-gold",
  "finger-edge-pull",
  "j-channel-pull",
  "knob-round-nickel",
  "knob-square-black",
  "glass-knob-chrome",
  "hinge-soft-close",
  "push-to-open-hinge",
  "slide-soft-close",
  "slide-heavy-duty",
  "outdoor-bar-pull-stainless",
];
for (const h of HARDWARE) {
  add({
    outputPath: `/images/catalog/hardware/${h}.webp`,
    pages: ["/hardware"],
    placement: "product",
    promptScene: `Cabinet ${h.replace(/-/g, " ")} hardware on One Source shaker door, product photography, ${STYLE_SUFFIX}`,
    alt: `Cabinet ${h.replace(/-/g, " ")} hardware option — Boise Cabinet Co`,
    title: h.replace(/-/g, " "),
    phase: 3,
    priority: "low",
    width: 800,
    height: 800,
  });
}

const ACCESSORIES = [
  "pull-out-shelf",
  "pull-out-pantry",
  "lazy-susan",
  "blind-corner-pullout",
  "spice-rack-pullout",
  "utensil-divider",
  "peg-board-drawer",
  "trash-pullout",
  "cutting-board-insert",
  "mixer-lift",
  "tip-out-tray",
  "vertical-divider",
  "drawer-organizer-kit",
  "led-strip-channel",
  "pull-out-hamper",
  "wine-rack-insert",
  "appliance-garage",
];
for (const a of ACCESSORIES) {
  add({
    outputPath: `/images/catalog/accessories/${a}.webp`,
    pages: ["/accessories"],
    placement: "product",
    promptScene: `Cabinet ${a.replace(/-/g, " ")} interior accessory installed in One Source kitchen, product photography, ${STYLE_SUFFIX}`,
    alt: `Cabinet ${a.replace(/-/g, " ")} interior accessory — Boise Cabinet Co`,
    title: a.replace(/-/g, " "),
    phase: 3,
    priority: "low",
    width: 800,
    height: 800,
  });
}

// Guarantee every non-decorative alt localizes us AND contains the business
// name, without hand-editing each string. Locale tokens are checked with the
// brand removed first so "Boise" inside "Boise Cabinet Co" never counts.
const BRAND = "Boise Cabinet Co";
const LOCALE_TOKENS = [
  "Treasure Valley", "Idaho", "Boise", "Meridian", "Eagle", "Nampa",
  "Kuna", "Star", "Middleton", "Caldwell", "Ada County", "Canyon County",
];
function ensureSeoAlt(alt, decorative) {
  let a = (alt || "").trim();
  if (decorative) return a;
  const sansBrand = a.split(BRAND).join(" ");
  const hasLocale = LOCALE_TOKENS.some((t) => sansBrand.includes(t));
  if (!hasLocale) a = `${a} in the Treasure Valley, Idaho`;
  if (!a.includes(BRAND)) a = `${a} | ${BRAND}`;
  return a;
}
for (const e of entries) {
  e.alt = ensureSeoAlt(e.alt, e.decorative);
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  styleSuffix: STYLE_SUFFIX,
  entries,
};

fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "scripts", "site-image-manifest.json"), JSON.stringify(manifest, null, 2));

const csvHeaders = ["id", "outputPath", "pages", "placement", "priority", "phase", "status", "alt", "doorStyleId", "finishId"];
const csvLines = [csvHeaders.join(",")];
for (const e of entries) {
  csvLines.push([
    e.id,
    e.outputPath,
    (e.pages || []).join("|"),
    e.placement,
    e.priority,
    e.phase,
    e.status,
    `"${(e.alt || "").replace(/"/g, '""')}"`,
    e.doorStyleId || "",
    e.finishId || "",
  ].join(","));
}
fs.writeFileSync(path.join(root, "docs", "image-audit-manifest.csv"), csvLines.join("\n") + "\n");

console.log(`Wrote site-image-manifest.json with ${entries.length} entries`);
console.log("Wrote docs/image-audit-manifest.csv");
