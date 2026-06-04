import {
  ACCESSORY_FAMILY_BY_SLUG,
  CABINET_PRODUCT_BY_SLUG,
  COLLECTIONS,
  DOOR_STYLES,
  FINISHES,
  HARDWARE_OPTIONS,
  getCollectionBySlug,
  getDoorStyleBySlug,
  getFinishBySlug,
  resolveDoorStyleSlug,
  resolveFinishSlug,
} from "@/shared/catalog";
import { getAccessoryFamilyImagePath, getHardwareImagePath } from "@/shared/catalog/catalogImages";
import { getDoorStyleImages, getFinishImages, getProductImages } from "@/shared/catalog/entityImages";
import { getCabinetNeedLabel } from "@/shared/catalog/cabinetLabels";
import type { ProjectSelections } from "@/shared/catalog/projectSelections";

export interface SelectionDisplayRow {
  category: string;
  value: string;
  status: "selected" | "pending" | "review";
  slug?: string;
  imageSrc?: string;
  href?: string;
}

function layoutLabel(slug: string | null): string {
  if (!slug) return "Not selected";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function projectSelectionsToDisplayRows(
  selections: ProjectSelections,
): SelectionDisplayRow[] {
  const rows: SelectionDisplayRow[] = [];

  if (selections.collection) {
    const c = getCollectionBySlug(selections.collection) ?? COLLECTIONS.find((x) => x.id === selections.collection);
    rows.push({
      category: "Collection",
      value: c?.name ?? selections.collection,
      status: "selected",
      slug: c?.slug ?? selections.collection,
      imageSrc: c?.heroImage,
      href: c ? `/collections/${c.slug}` : undefined,
    });
  } else {
    rows.push({ category: "Collection", value: "Not selected", status: "pending" });
  }

  if (selections.doorStyle) {
    const resolved = resolveDoorStyleSlug(selections.doorStyle);
    const d = getDoorStyleBySlug(resolved);
    const imgs = d ? getDoorStyleImages(d.slug, d.imagePath) : null;
    rows.push({
      category: "Door style",
      value: d?.name ?? selections.doorStyle,
      status: "selected",
      slug: d?.slug ?? resolved,
      imageSrc: imgs?.thumb640,
      href: d ? `/door-styles/${d.slug}` : undefined,
    });
  } else {
    rows.push({ category: "Door style", value: "Not selected", status: "pending" });
  }

  if (selections.finish) {
    const resolved = resolveFinishSlug(selections.finish);
    const f = getFinishBySlug(resolved) ?? getFinishBySlug(selections.finish);
    const imgs = f ? getFinishImages(f.slug, f.imagePath) : null;
    rows.push({
      category: "Finish",
      value: f?.name ?? selections.finish,
      status: "selected",
      slug: f?.slug ?? resolved,
      imageSrc: imgs?.swatch,
      href: f ? `/finishes/${f.category}/${f.slug}` : undefined,
    });
  } else {
    rows.push({ category: "Finish", value: "Not selected", status: "pending" });
  }

  if (selections.layout) {
    rows.push({
      category: "Layout",
      value: layoutLabel(selections.layout),
      status: "selected",
      slug: selections.layout,
    });
  }

  if (selections.hardware) {
    const h = HARDWARE_OPTIONS.find((x) => x.slug === selections.hardware);
    rows.push({
      category: "Hardware",
      value: h?.name ?? selections.hardware,
      status: "selected",
      slug: selections.hardware,
      imageSrc: getHardwareImagePath(selections.hardware),
      href: "/hardware",
    });
  }

  if (selections.accessories.length > 0) {
    const names = selections.accessories.map((slug) => {
      const family = ACCESSORY_FAMILY_BY_SLUG[slug];
      if (family) return family.name;
      return slug.replace(/-/g, " ");
    });
    const firstSlug = selections.accessories[0];
    const family = ACCESSORY_FAMILY_BY_SLUG[firstSlug];
    rows.push({
      category: "Accessories",
      value:
        selections.accessories.length === 1
          ? names[0]
          : `${names.slice(0, 2).join(", ")}${selections.accessories.length > 2 ? ` +${selections.accessories.length - 2} more` : ""}`,
      status: "selected",
      slug: firstSlug,
      imageSrc: family ? getAccessoryFamilyImagePath(family.slug) : getAccessoryFamilyImagePath(firstSlug),
      href: "/accessories",
    });
  }

  if (selections.lineItemSlugs.length > 0) {
    const first = CABINET_PRODUCT_BY_SLUG[selections.lineItemSlugs[0]];
    const imgs = first ? getProductImages(first) : null;
    // Plain-English cabinet name + diagram - never the raw SKU/oscCode.
    const firstLabel = first ? getCabinetNeedLabel(first) : selections.lineItemSlugs[0].replace(/-/g, " ");
    rows.push({
      category: "Cabinets",
      value:
        selections.lineItemSlugs.length === 1
          ? firstLabel
          : `${firstLabel} +${selections.lineItemSlugs.length - 1} more`,
      status: "selected",
      slug: first?.slug,
      imageSrc: imgs?.thumb,
      href: first ? `/products/${first.category}/${first.slug}` : "/products",
    });
  }

  if (selections.roomType) {
    const roomName = selections.roomType
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    rows.push({
      category: "Room",
      value: roomName,
      status: "selected",
      slug: selections.roomType,
      href: `/cabinets/${selections.roomType}`,
    });
  }

  return rows;
}
