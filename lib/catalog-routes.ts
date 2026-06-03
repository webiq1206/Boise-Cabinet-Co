import type { CatalogSearchResult } from "@/shared/catalog";
import { FINISH_BY_SLUG, getCabinetProductBySlug } from "@/shared/catalog";

export function catalogResultHref(result: CatalogSearchResult): string {
  switch (result.type) {
    case "collection":
      return `/collections/${result.slug}`;
    case "doorStyle":
      return `/door-styles/${result.slug}`;
    case "finish": {
      const finish = FINISH_BY_SLUG[result.slug];
      return finish ? `/finishes/${finish.category}/${finish.slug}` : "/finishes";
    }
    case "cabinetProduct": {
      const p = getCabinetProductBySlug(result.slug);
      return p ? `/products/${p.category}/${p.slug}` : "/products";
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
