/**
 * Plain-English, need-based labels for cabinets. The internal SKU (`oscCode`) is
 * never used here — homeowners see what a cabinet is *for*, not its part number.
 */

import type { CabinetProduct, CabinetProductCategory } from "./types";

const CATEGORY_FALLBACK: Record<CabinetProductCategory, string> = {
  base: "Everyday storage",
  wall: "Wall storage",
  tall: "Pantry & tall storage",
  vanity: "Bathroom vanity",
  "end-panel": "Finishing touches",
  filler: "Finishing touches",
  hood: "Range hood",
  "floating-shelf": "Open shelving",
  panel: "Finishing touches",
};

/**
 * A short, need-based label like "Pots & pans", "Trash & recycling", or
 * "Corner storage", inferred from the cabinet's purpose. Falls back to a
 * friendly category label when nothing more specific applies.
 */
export function getCabinetNeedLabel(
  product: Pick<CabinetProduct, "category" | "name" | "description" | "configuration">,
): string {
  const text = `${product.name} ${product.description ?? ""}`.toLowerCase();
  const cfg = product.configuration ?? {};

  if (/(trash|waste|recycl)/.test(text)) return "Trash & recycling";
  if (/(corner|lazy|susan)/.test(text)) return "Corner storage";
  if (/sink/.test(text)) return "Under-sink";
  if (/(spice|tray|cutlery|utensil)/.test(text)) return "Utensils & trays";
  if (/(pantry|pull-?out pantry)/.test(text)) return "Pantry & tall storage";
  if (/(pots?|pans?)/.test(text)) return "Pots & pans";

  if (product.category === "base") {
    if ((cfg.drawers ?? 0) >= 3) return "Pots & pans";
    if ((cfg.rollouts ?? 0) >= 1) return "Pull-out storage";
    if ((cfg.drawers ?? 0) >= 1) return "Drawers & utensils";
  }

  return CATEGORY_FALLBACK[product.category] ?? "Everyday storage";
}
