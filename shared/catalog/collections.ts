/**
 * Collections - BRC go-to-market lines over OSC manufacturing
 */

export type { PriceTier, CabinetCollection } from "./types";

export { COLLECTIONS, COLLECTION_BY_SLUG } from "./generated/collections";

import { COLLECTIONS } from "./generated/collections";

export const COLLECTION_BY_ID = Object.fromEntries(
  COLLECTIONS.map((c) => [c.id, c]),
) as Record<string, import("./types").CabinetCollection>;
