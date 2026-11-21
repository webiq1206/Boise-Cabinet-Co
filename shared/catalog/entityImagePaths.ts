/**
 * Door style and finish image paths. Pure helpers with no catalog data
 * imports, so the estimate engine (which ships to the browser on the
 * homepage, contact and service pages) can use them without pulling the
 * generated cabinet product catalog into the bundle. entityImages.ts
 * re-exports both, so existing imports keep working.
 */
import { finishSwatchSrc } from "./glossSurface";

export interface DoorStyleImages {
  primary: string;
  thumb640: string;
}

export interface FinishImages {
  /** What a visitor sees: a gloss finish's clean surface, otherwise the catalog sample. */
  swatch?: string;
  /** The catalog sample itself, as the supplier supplies it (the printed catalog uses it). */
  sample?: string;
  inRoom: string;
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
  // so the swatch never resolves to a broken/missing image. A gloss sample
  // carries a painted reflection, so the swatch is its clean surface and the
  // gloss is drawn over it in CSS (glossSheenClass in ./glossSurface).
  const sample = imagePath ?? `/generated/finishes/${slug}.svg`;
  return {
    swatch: finishSwatchSrc(sample),
    sample,
    inRoom: `/images/catalog/finishes/in-room/${slug}.webp`,
  };
}
