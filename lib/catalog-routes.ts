import type { CatalogSearchResult } from "@/shared/catalog";

export function catalogResultHref(result: CatalogSearchResult): string {
  switch (result.type) {
    case "collection":
      return "/catalog";
    case "doorStyle":
      return "/catalog";
    case "finish":
      return "/catalog";
    case "cabinetProduct":
      return "/catalog";
    case "room":
      return `/cabinets/${result.slug}`;
    case "accessory":
      return "/accessories";
    case "hardware":
      return "/catalog";
    case "cabinetType":
      return "/cabinets";
    default:
      return "/cabinets";
  }
}
