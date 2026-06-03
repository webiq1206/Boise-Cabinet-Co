/**
 * Finishes — OSC-primary names from data/supplier-catalog/finishes.json
 */

import { FINISHES } from "./generated/finishes";
import type { FinishCategory, Finish } from "./types";

export type { FinishTier, FinishSheen, Finish, FinishCategory } from "./types";

export { FINISHES, FINISH_BY_SLUG } from "./generated/finishes";

/** Resolve legacy BRC finish/door slugs to OSC catalog slugs */
export function resolveFinishSlug(slug: string): string {
  const redirects: Record<string, string> = {
    snowcap: "vanilla-orchid",
    glacier: "carte-blanche",
    sagebrush: "eucalyptus",
    porcelain: "white-hg",
    pearl: "light-grey",
    graphite: "grafite",
    obsidian: "black-hg",
    cobalt: "deep-blue",
    storm: "dark-grey",
    "white-oak": "canyon-oak",
    "natural-walnut": "canyon-walnut",
    "espresso-walnut": "pecan-scuro",
    "honey-maple": "olmo-miele",
    driftwood: "chameleon",
    "charcoal-oak": "canyon-charcoal",
    cherry: "kirsche",
    shaker: "modern-shaker",
  };
  return redirects[slug] ?? slug;
}

export const FINISH_BY_ID = Object.fromEntries(
  FINISHES.map((f) => [f.id, f]),
) as Record<string, Finish>;

export const FINISHES_BY_CATEGORY = FINISHES.reduce(
  (acc, finish) => {
    if (!acc[finish.category]) acc[finish.category] = [];
    acc[finish.category].push(finish);
    return acc;
  },
  {} as Record<FinishCategory, Finish[]>,
);
