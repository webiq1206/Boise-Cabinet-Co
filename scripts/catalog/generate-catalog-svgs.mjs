#!/usr/bin/env node
/**
 * Generate all code-drawn catalog imagery to /public/generated/ from
 * data/catalog.json (single source of truth). Produces:
 *   - 2A: one front-elevation box SVG per cabinet  -> generated/cabinets/{slug}.svg
 *   - 2B: 6 door-style profile SVGs                -> generated/door-styles/{slug}.svg
 *   - 2C: one flat color tile per finish           -> generated/finishes/{slug}.svg
 *   - 2D: one construction diagram                 -> generated/construction.svg
 *
 * These are committed placeholders; real photography (Phase 9) drops into the
 * same `image` / `boxImage` slots with no code change. No brand/supplier names.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boxDiagramSvg } from "./box-diagram-svg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");
const OUT = path.join(ROOT, "public/generated");

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(rel, contents) {
  const full = path.join(OUT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, contents);
}

// ── Slug logic mirrored from codegen-catalog.mjs (must stay in sync) ─────────
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function uniqueSlugger() {
  const seen = new Map();
  return (base) => {
    const b = base || "item";
    const n = (seen.get(b) || 0) + 1;
    seen.set(b, n);
    return n === 1 ? b : `${b}-${n}`;
  };
}
function doorSlug(name) {
  if (name === "3 Piece") return "three-piece";
  return slugify(name);
}

// ── 2A: Cabinet box diagrams ─────────────────────────────────────────────────
function generateCabinets() {
  let count = 0;
  for (const cab of catalog.cabinets) {
    // boxImage is the authoritative relative path, e.g. "cabinets/wdd-1d-0s.svg"
    const rel = cab.boxImage || `cabinets/${slugify(cab.code)}.svg`;
    write(rel, boxDiagramSvg(cab));
    count++;
  }
  return count;
}

// ── 2B: Door-style profile diagrams ──────────────────────────────────────────
const D_BG = "#F7F3EC";
const D_FRAME = "#5E564A";
const D_PANEL = "#ECE6DB";
const D_LINE = "#8C8170";
const D_FAINT = "#B7AD9B";

function doorSvg(style) {
  const W = 400;
  const H = 300;
  // centered door panel (tall)
  const dw = 150;
  const dh = 250;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;
  const els = [`<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="4" fill="${D_PANEL}" stroke="${D_FRAME}" stroke-width="2"/>`];

  const inset = (railTop, railSide, mitered, radius) => {
    const ix = dx + railSide;
    const iy = dy + railTop;
    const iw = dw - railSide * 2;
    const ih = dh - railTop * 2;
    if (mitered) {
      // miter lines at each corner
      els.push(`<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="${radius || 0}" fill="#FBFAF6" stroke="${D_LINE}" stroke-width="1.4"/>`);
      els.push(`<line x1="${dx}" y1="${dy}" x2="${ix}" y2="${iy}" stroke="${D_LINE}" stroke-width="1"/>`);
      els.push(`<line x1="${dx + dw}" y1="${dy}" x2="${ix + iw}" y2="${iy}" stroke="${D_LINE}" stroke-width="1"/>`);
      els.push(`<line x1="${dx}" y1="${dy + dh}" x2="${ix}" y2="${iy + ih}" stroke="${D_LINE}" stroke-width="1"/>`);
      els.push(`<line x1="${dx + dw}" y1="${dy + dh}" x2="${ix + iw}" y2="${iy + ih}" stroke="${D_LINE}" stroke-width="1"/>`);
    } else {
      els.push(`<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="${radius || 1}" fill="#FBFAF6" stroke="${D_LINE}" stroke-width="1.4"/>`);
    }
  };

  switch (style) {
    case "Slab":
      // flat, no inset; subtle vertical grain hint
      els.push(`<line x1="${dx + dw / 2}" y1="${dy + 10}" x2="${dx + dw / 2}" y2="${dy + dh - 10}" stroke="${D_FAINT}" stroke-width="0.8"/>`);
      break;
    case "Modern Shaker":
      inset(26, 22, false, 1);
      break;
    case "Thin Shaker":
      inset(14, 12, false, 1);
      break;
    case "Alpha Shaker":
      inset(22, 20, true, 0);
      break;
    case "Beta Shaker":
      inset(22, 20, true, 10);
      break;
    case "3 Piece":
      // horizontal center panel with horizontal grain lines
      inset(40, 16, false, 1);
      for (let i = 1; i <= 6; i++) {
        const yy = dy + 40 + ((dh - 80) * i) / 7;
        els.push(`<line x1="${dx + 22}" y1="${yy}" x2="${dx + dw - 22}" y2="${yy}" stroke="${D_FAINT}" stroke-width="0.9"/>`);
      }
      break;
    default:
      inset(20, 18, false, 1);
  }
  // handle hint
  els.push(`<circle cx="${dx + dw - 16}" cy="${dy + dh / 2}" r="3" fill="${D_FRAME}"/>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${style} door style">
  <rect width="${W}" height="${H}" fill="${D_BG}"/>
  ${els.join("\n  ")}
</svg>`;
}

function generateDoors() {
  let count = 0;
  for (const d of catalog.doorStyles) {
    write(`door-styles/${doorSlug(d.name)}.svg`, doorSvg(d.name));
    count++;
  }
  return count;
}

// ── 2C: Finish color tiles ───────────────────────────────────────────────────
const FAMILY_HEX = {
  Green: "#2D4A3E",
  "Neutral / Beige": "#D8CFC0",
  Black: "#1A1A1A",
  Grey: "#8A8A8A",
  Blue: "#3A5A78",
  White: "#F2EFE9",
  Wood: "#9C6B43",
};
const FAMILY_HEX_DEFAULT = "#CFC7B8";
const WOOD_HEX = "#9C6B43";

function finishTileSvg(hex, isWood) {
  const S = 240;
  const els = [`<rect width="${S}" height="${S}" fill="${hex}"/>`];
  if (isWood) {
    // faint horizontal woodgrain lines
    for (let i = 1; i <= 9; i++) {
      const yy = (S * i) / 10;
      els.push(`<line x1="0" y1="${yy}" x2="${S}" y2="${yy}" stroke="#000000" stroke-opacity="0.06" stroke-width="2"/>`);
    }
  }
  els.push(`<rect x="0.5" y="0.5" width="${S - 1}" height="${S - 1}" fill="none" stroke="#000000" stroke-opacity="0.08"/>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="finish color tile">
  ${els.join("\n  ")}
</svg>`;
}

function generateFinishes() {
  const finishSlug = uniqueSlugger();
  let count = 0;
  for (const f of catalog.finishes) {
    const cat = f.category.toLowerCase();
    const slug = finishSlug(slugify(`${cat}-${f.name}`));
    const isWood = cat === "woodgrain";
    const hex = isWood
      ? WOOD_HEX
      : (FAMILY_HEX[f.colorFamily] ?? FAMILY_HEX_DEFAULT);
    write(`finishes/${slug}.svg`, finishTileSvg(hex, isWood));
    count++;
  }
  return count;
}

// ── 2D: Construction diagram ─────────────────────────────────────────────────
function generateConstruction() {
  const W = 800;
  const H = 480;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cabinet construction diagram">
  <rect width="${W}" height="${H}" fill="${D_BG}"/>
  <!-- Plywood box -->
  <g>
    <rect x="60" y="120" width="200" height="240" fill="#FBFAF6" stroke="${D_FRAME}" stroke-width="2.5" rx="3"/>
    <rect x="60" y="120" width="200" height="240" fill="none" stroke="${D_LINE}" stroke-width="1" stroke-dasharray="0" />
    <line x1="68" y1="128" x2="68" y2="352" stroke="${D_FAINT}" stroke-width="1"/>
    <line x1="252" y1="128" x2="252" y2="352" stroke="${D_FAINT}" stroke-width="1"/>
    <line x1="60" y1="240" x2="260" y2="240" stroke="${D_LINE}" stroke-width="1.2"/>
    <text x="160" y="392" text-anchor="middle" fill="${D_FRAME}" font-family="system-ui,sans-serif" font-size="16">Plywood box</text>
  </g>
  <!-- Dovetail drawer -->
  <g>
    <rect x="320" y="160" width="180" height="120" fill="#FBFAF6" stroke="${D_FRAME}" stroke-width="2.5" rx="3"/>
    <path d="M 320 160 l 18 0 l 6 12 l 18 0 l 6 -12 l 18 0 l 6 12 l 18 0 l 6 -12 l 18 0 l 6 12 l 18 0 l 6 -12 l 18 0" fill="none" stroke="${D_LINE}" stroke-width="1.4"/>
    <line x1="360" y1="220" x2="460" y2="220" stroke="${D_FAINT}" stroke-width="2"/>
    <text x="410" y="312" text-anchor="middle" fill="${D_FRAME}" font-family="system-ui,sans-serif" font-size="16">Dovetail drawers</text>
  </g>
  <!-- Soft-close hinge -->
  <g>
    <rect x="560" y="150" width="180" height="140" fill="#FBFAF6" stroke="${D_FRAME}" stroke-width="2.5" rx="3"/>
    <path d="M 600 290 A 90 90 0 0 1 700 180" fill="none" stroke="${D_LINE}" stroke-width="2"/>
    <circle cx="600" cy="290" r="6" fill="${D_FRAME}"/>
    <circle cx="700" cy="180" r="6" fill="${D_FRAME}"/>
    <text x="650" y="322" text-anchor="middle" fill="${D_FRAME}" font-family="system-ui,sans-serif" font-size="16">Soft-close hardware</text>
  </g>
  <text x="${W / 2}" y="56" text-anchor="middle" fill="${D_FRAME}" font-family="system-ui,sans-serif" font-size="24" font-weight="500">How our cabinets are built</text>
</svg>`;
  write("construction.svg", svg);
  return 1;
}

function main() {
  ensureDir(OUT);
  const cabinets = generateCabinets();
  const doors = generateDoors();
  const finishes = generateFinishes();
  const construction = generateConstruction();
  console.log(
    `Generated SVGs -> public/generated: ${cabinets} cabinets, ${doors} doors, ${finishes} finishes, ${construction} construction`,
  );
}

main();
