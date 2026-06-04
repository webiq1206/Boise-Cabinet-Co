/**
 * Image path helpers for catalog entities (doors, finishes, products, search).
 */

import type { CabinetProduct } from "./types";
import type { CatalogSearchResultType } from "./queries";
import { DOOR_STYLE_BY_SLUG } from "./generated/doorStyles";
import { FINISH_BY_SLUG } from "./generated/finishes";
import { COLLECTION_BY_SLUG } from "./generated/collections";
import { CABINET_PRODUCT_BY_SLUG } from "./generated/cabinetProducts";
import {
  getHardwareImagePath,
  getAccessoryImagePath,
  getAccessoryFamilyImagePath,
} from "./catalogImages";

export interface DoorStyleImages {
  primary: string;
  thumb640: string;
}

export interface FinishImages {
  swatch?: string;
  inRoom: string;
}

export interface ProductImages {
  hero: string;
  diagram: string;
  thumb: string;
}

/** Door style hero + 640px thumbnail paths with sensible fallbacks */
export function getDoorStyleImages(slug: string, imagePath?: string): DoorStyleImages {
  // Real photo/render when available, otherwise the generated profile diagram.
  const primary = imagePath ?? `/generated/door-styles/${slug}.svg`;
  const thumb640 = primary;
  return { primary, thumb640 };
}

/** Finish swatch + in-room application preview */
export function getFinishImages(slug: string, imagePath?: string): FinishImages {
  // imagePath is always set in generated data (real swatch or generated tile),
  // so the swatch never resolves to a broken/missing image.
  return {
    swatch: imagePath ?? `/generated/finishes/${slug}.svg`,
    inRoom: `/images/catalog/finishes/in-room/${slug}.webp`,
  };
}

/**
 * Product imagery. Cabinets always have a generated front-elevation box SVG
 * (`boxImage`); real product photography (Phase 9) drops into the same slot.
 */
export function getProductImages(
  product: Pick<CabinetProduct, "slug"> & { boxImage?: string },
): ProductImages {
  const boxImage =
    product.boxImage ??
    CABINET_PRODUCT_BY_SLUG[product.slug]?.boxImage ??
    `/generated/cabinets/${product.slug}.svg`;
  return {
    hero: boxImage,
    diagram: boxImage,
    thumb: boxImage,
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
    case "cabinetProduct":
      return getProductImages({ slug: input.slug }).thumb;
    default:
      return undefined;
  }
}

