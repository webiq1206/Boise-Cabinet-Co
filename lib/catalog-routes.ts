import type { CatalogSearchResult } from "@/shared/catalog";
import { FINISH_BY_SLUG } from "@/shared/catalog";

export function catalogResultHref(result: CatalogSearchResult): string {
  switch (result.type) {
    case "collection":
      return `/collections/${result.slug}`;
    case "doorStyle":
      return `/door-styles/${result.slug}`;
    case "finish": {
      const finish = FINISH_BY_SLUG[result.slug];
      return finish ? `/finishes/${finish.category}` : "/finishes";
    }
    case "room":
      return `/cabinets/${result.slug}`;
    case "accessory":
      return "/accessories";
    case "hardware":
      return "/hardware";
    case "cabinetType":
      return "/cabinets";
    default:
      return "/cabinets";
  }
}
