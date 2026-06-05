/**
 * Catalog indexation policy - doorway-page remediation.
 *
 * The catalog generates ~299 finish detail pages and ~320 cabinet SKU pages.
 * Indexing all of them creates a thin / near-duplicate "doorway" footprint
 * (see seo-audit/doorway-page-analysis.md). This module is the single source of
 * truth for which catalog detail pages are indexable.
 *
 * Rules:
 *  - Cabinet SKU pages: never indexed (near-duplicate spec/configurator pages).
 *    They stay fully usable + internally linked (noindex, follow, self-canonical).
 *  - Finishes: index matte + gloss (named designer colors) and a curated subset
 *    of recognizable woodgrain looks. The long-tail woodgrain SKUs are
 *    noindex,follow with a canonical to their /finishes/[category] hub.
 *
 * Tuning: edit WOODGRAIN_INDEX_KEYWORDS / WOODGRAIN_INDEX_ALLOWLIST as real
 * search demand data becomes available.
 */

import type { Finish } from "@/shared/catalog";
import { FINISHES } from "@/shared/catalog";

/** Cabinet SKU pages are never indexed. */
export function isProductSkuIndexable(): boolean {
  return false;
}

/** Recognizable wood looks worth indexing (matched case-insensitively in the finish name). */
const WOODGRAIN_INDEX_KEYWORDS = [
  "walnut",
  "oak",
  "maple",
  "elm",
  "mahogany",
  "pine",
  "pearwood",
  "eucalyptus",
  "eucalipto",
  "hickory",
  "cherry",
  "ash",
  "birch",
  "teak",
  "ebony",
  "driftwood",
  "wood",
  "linen",
  "pecan",
  "hemlock",
  "noce",
  "olmo",
  "rovere",
  "rustica",
  "cedar",
  "fir",
  "bamboo",
  "hazel",
];

/** Explicit slug allowlist override (always index, regardless of keyword match). */
const WOODGRAIN_INDEX_ALLOWLIST = new Set<string>([]);

/**
 * Finishes that share a name within a category. Their titles are disambiguated
 * (see finishMetaTitle) so they can stay indexable without colliding.
 */
const FINISH_NAME_COUNTS: Record<string, number> = (() => {
  const counts: Record<string, number> = {};
  for (const f of FINISHES) {
    const key = `${f.category}::${f.name}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
})();

export function finishNameCollides(finish: Finish): boolean {
  return (FINISH_NAME_COUNTS[`${finish.category}::${finish.name}`] ?? 0) > 1;
}

/** Numbered panel-brand duplicate variant, e.g. "matte-black-2". */
function isDuplicateVariant(finish: Finish): boolean {
  return finishNameCollides(finish) && /-\d+$/.test(finish.slug);
}

/** Whether a finish detail page should be indexed. */
export function isFinishIndexable(finish: Finish): boolean {
  // Index only the base variant of a colliding name; noindex "-2"/"-3" dupes.
  if (isDuplicateVariant(finish)) return false;
  if (finish.category === "matte" || finish.category === "gloss") return true;
  // woodgrain: curated subset only
  if (WOODGRAIN_INDEX_ALLOWLIST.has(finish.slug)) return true;
  const name = finish.name.toLowerCase();
  return WOODGRAIN_INDEX_KEYWORDS.some((kw) => name.includes(kw));
}

/** Clean, human title for a finish page (indexable set has no name collisions). */
export function finishMetaTitle(finish: Finish): string {
  return `${finish.name} Cabinet Finish`;
}

/** Convenience list of indexable finishes (used by sitemap). */
export function indexableFinishes(): Finish[] {
  return FINISHES.filter(isFinishIndexable);
}
