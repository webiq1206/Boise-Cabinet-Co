/**
 * Door styles - sourced from data/supplier-catalog/doorStyles.json
 */

import { DOOR_STYLES } from "./generated/doorStyles";

export type { FinishCategory, DoorStyle } from "./types";

export { DOOR_STYLES, DOOR_STYLE_BY_SLUG } from "./generated/doorStyles";

export const DOOR_STYLE_BY_ID = Object.fromEntries(
  DOOR_STYLES.map((d) => [d.id, d]),
) as Record<string, import("./types").DoorStyle>;

const LEGACY_DOOR_SLUGS: Record<string, string> = {
  shaker: "modern-shaker",
};

export function resolveDoorStyleSlug(slug: string): string {
  return LEGACY_DOOR_SLUGS[slug] ?? slug;
}
