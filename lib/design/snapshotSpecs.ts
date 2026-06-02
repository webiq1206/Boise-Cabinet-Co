import { COLLECTION_BY_SLUG } from "@/shared/catalog/collections";
import { DOOR_STYLE_BY_SLUG } from "@/shared/catalog/doorStyles";
import { FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { HARDWARE_BY_SLUG } from "@/shared/catalog/hardware";
import { getEstimatedTier } from "./estimatedTier";
import type { DesignSnapshot } from "./designSerialization";

export interface SpecRow {
  label: string;
  value: string;
}

function nameOf(
  lookup: Record<string, { name: string } | undefined>,
  slug: string | null,
): string {
  if (!slug) return "—";
  return lookup[slug]?.name ?? slug;
}

/** Human-readable spec rows for a saved design snapshot. */
export function snapshotSpecRows(snapshot: DesignSnapshot): SpecRow[] {
  const tier = getEstimatedTier(snapshot.collection, snapshot.finish);
  return [
    { label: "Room", value: snapshot.roomType ?? "—" },
    { label: "Collection", value: nameOf(COLLECTION_BY_SLUG, snapshot.collection) },
    { label: "Door style", value: nameOf(DOOR_STYLE_BY_SLUG, snapshot.doorStyle) },
    { label: "Finish", value: nameOf(FINISH_BY_SLUG, snapshot.finish) },
    { label: "Hardware", value: nameOf(HARDWARE_BY_SLUG, snapshot.hardware) },
    { label: "Estimated tier", value: tier.label },
  ];
}
