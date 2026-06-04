/**
 * Plain-English filtering helpers for the progressive-disclosure options selector.
 *
 * The supplier data does not populate `colorFamily` and uses a near-uniform price
 * tier, so color family and light/dark "tone" are DERIVED from `hexColor` at
 * runtime. No brand, supplier, or material names are ever exposed here.
 */

import type { DoorStyle, Finish, FinishCategory } from "./types";
import { FINISHES } from "./finishes";
import { DOOR_STYLES, DOOR_STYLE_BY_SLUG } from "./doorStyles";

// ── Color families (homeowner language, never material/brand names) ───────────

export type ColorFamily =
  | "Whites"
  | "Beiges"
  | "Greys"
  | "Browns"
  | "Reds"
  | "Greens"
  | "Blues"
  | "Blacks"
  | "Woods";

/** Display order for color-family chips. */
export const COLOR_FAMILIES: ColorFamily[] = [
  "Whites",
  "Beiges",
  "Greys",
  "Browns",
  "Reds",
  "Greens",
  "Blues",
  "Blacks",
  "Woods",
];

export type FinishTone = "light" | "dark";

interface Hsl {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

function hexToHsl(hex: string): Hsl | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

/**
 * Bucket a finish into a plain-English color family. Woodgrain finishes always
 * read as "Woods"; everything else is derived from its swatch color.
 */
export function deriveColorFamily(finish: Pick<Finish, "category" | "hexColor">): ColorFamily {
  if (finish.category === "woodgrain") return "Woods";

  const hsl = hexToHsl(finish.hexColor);
  if (!hsl) return "Greys";
  const { h, s, l } = hsl;

  // Lightness dominates the very ends: near-black and near-white read as such
  // regardless of a slight warm/cool tint (catalog whites are a warm off-white).
  if (l < 0.16) return "Blacks";
  if (l >= 0.86) return "Whites";

  // Near-neutral mid/dark tones are greys.
  if (s < 0.1) return "Greys";

  // Chromatic, bucketed by hue (homeowner language, never material names).
  if (h < 18 || h >= 345) {
    // Reds; dark, muted reds read as browns.
    return l < 0.35 && s < 0.4 ? "Browns" : "Reds";
  }
  if (h < 50) {
    // Oranges/tans: light & muted → beige, otherwise brown.
    return l > 0.62 && s < 0.5 ? "Beiges" : "Browns";
  }
  if (h < 70) return l > 0.6 ? "Beiges" : "Browns";
  if (h < 165) return "Greens";
  if (h < 265) return "Blues";
  // Purples/magentas are rare here; group with reds.
  return "Reds";
}

/** Light vs. dark tone, derived from swatch lightness. */
export function getFinishTone(finish: Pick<Finish, "hexColor">): FinishTone {
  const hsl = hexToHsl(finish.hexColor);
  if (!hsl) return "light";
  return hsl.l >= 0.55 ? "light" : "dark";
}

// ── Curated "start small" sets ────────────────────────────────────────────────

const MOST_LOVED_FINISH_SLUGS = [
  "matte-vanilla-orchid",
  "woodgrain-canyon-oak",
  "gloss-white-hg",
  "matte-eucalyptus",
  "matte-bitter",
  "gloss-light-grey",
];

const POPULAR_DOOR_SLUGS = ["modern-shaker", "slab", "thin-shaker"];

/** Up to `count` "most-loved" finishes, filling from the catalog if a slug is missing. */
export function getMostLovedFinishes(count = 6): Finish[] {
  const bySlug = new Map(FINISHES.map((f) => [f.slug, f] as const));
  const picked: Finish[] = [];
  const seen = new Set<string>();
  for (const slug of MOST_LOVED_FINISH_SLUGS) {
    const f = bySlug.get(slug);
    if (f && !seen.has(f.id)) {
      picked.push(f);
      seen.add(f.id);
    }
  }
  for (const f of FINISHES) {
    if (picked.length >= count) break;
    if (!seen.has(f.id)) {
      picked.push(f);
      seen.add(f.id);
    }
  }
  return picked.slice(0, count);
}

/** The most popular door styles, filling from the catalog if a slug is missing. */
export function getPopularDoorStyles(count = 3): DoorStyle[] {
  const picked: DoorStyle[] = [];
  const seen = new Set<string>();
  for (const slug of POPULAR_DOOR_SLUGS) {
    const d = DOOR_STYLE_BY_SLUG[slug];
    if (d && !seen.has(d.id)) {
      picked.push(d);
      seen.add(d.id);
    }
  }
  for (const d of DOOR_STYLES) {
    if (picked.length >= count) break;
    if (!seen.has(d.id)) {
      picked.push(d);
      seen.add(d.id);
    }
  }
  return picked.slice(0, count);
}

// ── Finish filter state + matching ───────────────────────────────────────────

export interface FinishFilters {
  colorFamily?: ColorFamily;
  tone?: FinishTone;
  category?: FinishCategory;
  priceTier?: number;
}

export function finishMatchesFilters(finish: Finish, filters: FinishFilters): boolean {
  if (filters.category && finish.category !== filters.category) return false;
  if (filters.colorFamily && deriveColorFamily(finish) !== filters.colorFamily) return false;
  if (filters.tone && getFinishTone(finish) !== filters.tone) return false;
  if (filters.priceTier && (finish.priceTierMarker || 1) !== filters.priceTier) return false;
  return true;
}

/** Color families that actually appear in a finish list, in display order. */
export function colorFamiliesPresent(finishes: Finish[]): ColorFamily[] {
  const present = new Set(finishes.map((f) => deriveColorFamily(f)));
  return COLOR_FAMILIES.filter((fam) => present.has(fam));
}

/** Price tiers that actually appear in a finish list, ascending. */
export function priceTiersPresent(finishes: Finish[]): number[] {
  const present = new Set(finishes.map((f) => f.priceTierMarker || 1));
  return [...present].sort((a, b) => a - b);
}
