import { DOOR_STYLES } from "./catalog/generated/doorStyles";
import { FINISHES } from "./catalog/generated/finishes";
import { glossSurface } from "./catalog/glossSurface";
import {
  VISUALIZER_FAMILIES,
  isDrawnDoorStyle,
  isVisualizerFamily,
  parseVisualizerSelection,
  type DrawnDoorStyle,
  type VisualizerFamily,
  type VisualizerFinish,
  type VisualizerSelection,
  type VisualizerStyle,
} from "./doorVisualizerModel";

export * from "./doorVisualizerModel";

/**
 * The door visualizer's lists, resolved from the catalog on the server
 * (the model, with no catalog data in it, is shared/doorVisualizerModel.ts).
 */
export function visualizerStyles(): VisualizerStyle[] {
  return DOOR_STYLES.filter((style) => isDrawnDoorStyle(style.slug)).map((style) => ({
    slug: style.slug as DrawnDoorStyle,
    name: style.name,
    families: style.compatibleFinishCategories.filter(isVisualizerFamily),
  }));
}

/**
 * The clean surface a gloss sample is drawn with: shared/catalog/glossSurface.ts,
 * the one helper every finish swatch on the site uses.
 */
export { glossSurface };

export function visualizerFinishes(): VisualizerFinish[] {
  const order = new Map(VISUALIZER_FAMILIES.map((family, index) => [family.id as string, index]));
  return FINISHES.filter((finish) => finish.imagePath && isVisualizerFamily(finish.category))
    .map((finish) => {
      const surface = finish.category === "gloss" ? glossSurface(finish.imagePath as string) : null;
      const image = surface ?? (finish.imagePath as string);
      return {
        slug: finish.slug,
        name: finish.name,
        family: finish.category as VisualizerFamily,
        image,
        chip: image.replace(/\.webp$/, "-160.webp"),
        styles: finish.compatibleDoorStyleIds.filter(isDrawnDoorStyle),
      };
    })
    .sort((a, b) => (order.get(a.family) ?? 0) - (order.get(b.family) ?? 0) || a.name.localeCompare(b.name));
}


/** The selection a set of URL parameters names, against the whole catalog. */
export function resolveVisualizerSelection(
  params: Record<string, string | string[] | undefined> | URLSearchParams,
): VisualizerSelection {
  return parseVisualizerSelection(params, visualizerFinishes());
}
