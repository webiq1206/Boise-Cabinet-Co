/**
 * Door style and finish image paths. Pure helpers with no catalog data
 * imports, so the estimate engine (which ships to the browser on the
 * homepage, contact and service pages) can use them without pulling the
 * generated cabinet product catalog into the bundle. entityImages.ts
 * re-exports both, so existing imports keep working.
 */

export interface DoorStyleImages {
  primary: string;
  thumb640: string;
}

export interface FinishImages {
  swatch?: string;
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
  // so the swatch never resolves to a broken/missing image.
  return {
    swatch: imagePath ?? `/generated/finishes/${slug}.svg`,
    inRoom: `/images/catalog/finishes/in-room/${slug}.webp`,
  };
}
