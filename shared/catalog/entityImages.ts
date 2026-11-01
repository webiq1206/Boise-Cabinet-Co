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
import { getDoorStyleImages, getFinishImages } from "./entityImagePaths";

export { getDoorStyleImages, getFinishImages } from "./entityImagePaths";
export type { DoorStyleImages, FinishImages } from "./entityImagePaths";

export interface ProductImages {
  hero: string;
  diagram: string;
  thumb: string;
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

