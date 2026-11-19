/**
 * The door visualizer (/catalog/door-visualizer; owner, 19 November 2026):
 * every catalog finish on every catalog door style, as a cabinet door front
 * drawn in CSS whose surface is the finish's own catalog sample.
 *
 * Everything here comes from the catalog data: names, families, sample images
 * and which door styles a finish is offered on. Nothing is described beyond
 * what the catalog holds. Guard: tests/door-visualizer.test.ts.
 *
 * This file holds no catalog data, so the browser can import it. The lists
 * themselves are resolved on the server in shared/doorVisualizer.ts.
 */
export const DOOR_VISUALIZER_PATH = "/catalog/door-visualizer";

export type VisualizerFamily = "matte" | "gloss" | "woodgrain";

export const VISUALIZER_FAMILIES: readonly { id: VisualizerFamily; label: string }[] = [
  { id: "matte", label: "Matte" },
  { id: "gloss", label: "Gloss" },
  { id: "woodgrain", label: "Woodgrain" },
];

/**
 * How each catalog door style is drawn (the class the door front takes).
 * Each profile was read from the catalog's own picture of the style in
 * public/images/catalog/door-styles and from its catalog description:
 *
 * - slab: a flat front (photograph of two flat fronts).
 * - three-piece: two full-height stiles and one full-height centre panel, no
 *   rails (diagram); the centre panel's grain runs across (description).
 * - modern-shaker: full-height stiles, rails between them, a recessed centre
 *   panel (diagram).
 * - thin-shaker: the same construction with a narrow frame (photograph).
 * - alpha-shaker: a mitered frame around a flat centre panel (diagram:
 *   diagonal joints from each corner).
 * - beta-shaker: a mitered frame with a radius profile inside it, around a
 *   flat centre panel (diagram: diagonal joints and a second inner line).
 */
export const DRAWN_DOOR_STYLES = [
  "slab",
  "three-piece",
  "modern-shaker",
  "thin-shaker",
  "alpha-shaker",
  "beta-shaker",
] as const;

export type DrawnDoorStyle = (typeof DRAWN_DOOR_STYLES)[number];

export const DEFAULT_VISUALIZER_FINISH = "matte-snow-white";
export const DEFAULT_VISUALIZER_STYLE: DrawnDoorStyle = "modern-shaker";

export interface VisualizerStyle {
  slug: DrawnDoorStyle;
  name: string;
  /** Finish families the catalog offers this style in. */
  families: VisualizerFamily[];
}

export interface VisualizerFinish {
  slug: string;
  /** The catalog name, as written there. */
  name: string;
  family: VisualizerFamily;
  /** The catalog sample, 480px square: the door's surface. */
  image: string;
  /** The same sample at 160px: the chip. */
  chip: string;
  /** Door styles the catalog offers this finish on. */
  styles: DrawnDoorStyle[];
}

export interface VisualizerSelection {
  finish: string;
  style: DrawnDoorStyle;
  family: VisualizerFamily;
  q: string;
}

export const isDrawnDoorStyle = (slug: string): slug is DrawnDoorStyle => (DRAWN_DOOR_STYLES as readonly string[]).includes(slug);
export const isVisualizerFamily = (value: string): value is VisualizerFamily => VISUALIZER_FAMILIES.some((family) => family.id === value);

export function visualizerFamilyCounts(finishes: readonly VisualizerFinish[]): Record<VisualizerFamily, number> {
  const counts: Record<VisualizerFamily, number> = { matte: 0, gloss: 0, woodgrain: 0 };
  for (const finish of finishes) counts[finish.family] += 1;
  return counts;
}

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: Params, key: string): string {
  if (params instanceof URLSearchParams) return params.get(key) ?? "";
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * The selection a URL names. Anything the catalog does not hold falls back:
 * an unknown finish to the default white, a style the finish is not offered
 * on to the default shaker (every finish is offered on it) and a family to
 * the selected finish's own.
 */
export function parseVisualizerSelection(
  params: Params,
  finishes: readonly VisualizerFinish[],
): VisualizerSelection {
  const wanted = read(params, "finish").toLowerCase();
  const finish =
    finishes.find((item) => item.slug === wanted) ??
    finishes.find((item) => item.slug === DEFAULT_VISUALIZER_FINISH) ??
    finishes[0];
  const style = read(params, "style").toLowerCase();
  const family = read(params, "family").toLowerCase();
  return {
    finish: finish.slug,
    style: isDrawnDoorStyle(style) && finish.styles.includes(style) ? style : DEFAULT_VISUALIZER_STYLE,
    family: isVisualizerFamily(family) ? family : finish.family,
    q: read(params, "q").trim().slice(0, 60),
  };
}

/** The shareable address of a door: the finish and the style, nothing else. */
export function visualizerHref(selection: { finish: string; style: string; family?: string; q?: string }): string {
  const params = new URLSearchParams({ finish: selection.finish, style: selection.style });
  if (selection.family) params.set("family", selection.family);
  if (selection.q) params.set("q", selection.q);
  return `${DOOR_VISUALIZER_PATH}?${params.toString()}`;
}

/** The line carried into the request form's own "what can we help with" field. */
export function visualizerQuoteLine(finish: VisualizerFinish, style: VisualizerStyle): string {
  return `Door style: ${style.name}. Finish: ${finish.name} (${finish.family}).`;
}
