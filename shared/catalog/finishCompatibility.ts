/**
 * Which finishes a door style can take. Kept apart from queries.ts, which also
 * imports the generated cabinet product catalog, so the estimate engine can
 * ask this one question without shipping every product to the browser.
 * queries.ts re-exports it.
 */

import { DOOR_STYLE_BY_SLUG } from "./generated/doorStyles";
import { FINISHES } from "./finishes";
import type { Finish } from "./types";

export function getFinishesForDoorStyle(doorStyleSlug: string): Finish[] {
  const doorStyle = DOOR_STYLE_BY_SLUG[doorStyleSlug];
  if (!doorStyle) return [];
  return FINISHES.filter((f) => f.compatibleDoorStyleIds.includes(doorStyle.id));
}
