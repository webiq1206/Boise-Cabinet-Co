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
  if (!slug) return "N/A";
  return lookup[slug]?.name ?? slug;
}

function scanMethodLabel(source: string | undefined): string {
  switch (source) {
    case "ar-scan":
      return "AR floor scan";
    case "vision-scan":
      return "Photo estimate";
    case "manual":
      return "Manual entry";
    default:
      return "N/A";
  }
}

/** Human-readable spec rows for a saved design snapshot. */
export function snapshotSpecRows(snapshot: DesignSnapshot): SpecRow[] {
  const tier = getEstimatedTier(snapshot.collection, snapshot.finish);
  const meta = snapshot.roomMeta;
  const rows: SpecRow[] = [
    { label: "Room", value: snapshot.roomType ?? "N/A" },
    { label: "Collection", value: nameOf(COLLECTION_BY_SLUG, snapshot.collection) },
    { label: "Layout", value: snapshot.layout ?? "N/A" },
    { label: "Door style", value: nameOf(DOOR_STYLE_BY_SLUG, snapshot.doorStyle) },
    { label: "Finish", value: nameOf(FINISH_BY_SLUG, snapshot.finish) },
    { label: "Hardware", value: nameOf(HARDWARE_BY_SLUG, snapshot.hardware) },
    { label: "Estimated tier", value: tier.label },
  ];

  if (meta?.userConfirmed && meta.widthIn && meta.depthIn) {
    rows.push({
      label: "Room size",
      value: `${meta.widthIn}" × ${meta.depthIn}"${meta.ceilingIn ? ` × ${meta.ceilingIn}" ceiling` : ""}`,
    });
    rows.push({
      label: "Scan method",
      value: scanMethodLabel(meta.source),
    });
    if (meta.scanConfidence) {
      rows.push({ label: "Scan confidence", value: meta.scanConfidence });
    }
  }

  return rows;
}
