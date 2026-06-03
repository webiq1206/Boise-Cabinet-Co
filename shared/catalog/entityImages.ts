/**
 * Image path helpers for catalog entities (door styles, finishes, search results).
 */

import type { CatalogSearchResultType } from "./queries";
import { DOOR_STYLE_BY_SLUG } from "./generated/doorStyles";
import { FINISH_BY_SLUG } from "./generated/finishes";
import { COLLECTION_BY_SLUG } from "./generated/collections";
import { getHardwareImagePath, getAccessoryImagePath } from "./catalogImages";

export interface DoorStyleImages {
  primary: string;
  /** Optimized thumbnail used in estimator and compact grids */
  thumb640: string;
}

export interface FinishImages {
  swatch: string;
}

/** Door style hero + 640px thumbnail paths with sensible fallbacks */
export function getDoorStyleImages(slug: string, imagePath?: string): DoorStyleImages {
  const primary = imagePath ?? `/images/catalog/door-styles/${slug}.webp`;
  const thumb640 = primary.endsWith(".webp")
    ? primary.replace(/\.webp$/, "-640.webp")
    : `/images/catalog/door-styles/${slug}-640.webp`;
  return { primary, thumb640 };
}

/** Finish swatch image path */
export function getFinishImages(slug: string, imagePath?: string): FinishImages {
  return {
    swatch: imagePath ?? `/images/catalog/finishes/${slug}.webp`,
  };
}

export interface SearchResultImageInput {
  type: CatalogSearchResultType;
  slug: string;
  imagePath?: string;
}

/** Resolve a thumbnail for catalog search / facet results */
export function pickSearchResultImage(input: SearchResultImageInput): string | undefined {
  if (input.imagePath) return input.imagePath;

  switch (input.type) {
    case "doorStyle": {
      const door = DOOR_STYLE_BY_SLUG[input.slug];
      if (!door) return undefined;
      return getDoorStyleImages(door.slug, door.imagePath).primary;
    }
    case "finish": {
      const finish = FINISH_BY_SLUG[input.slug];
      if (!finish) return undefined;
      return getFinishImages(finish.slug, finish.imagePath).swatch;
    }
    case "collection": {
      const collection = COLLECTION_BY_SLUG[input.slug];
      return collection?.heroImage;
    }
    case "hardware":
      return getHardwareImagePath(input.slug);
    case "accessory":
      return getAccessoryImagePath(input.slug);
    default:
      return undefined;
  }
}
