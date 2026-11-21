/**
 * Gloss surfaces (owner, 21 November 2026: "the gloss images look terrible
 * with the 2 tone and abstract shapes... can you make them all actually look
 * like gloss").
 *
 * The supplier paints a reflection (a light triangle, an arc or a corner glow)
 * onto every gloss sample in /images/catalog/finishes/gloss-*.webp.
 * scripts/images/build-gloss-surfaces.py writes, for each one:
 *
 * - a clean surface in /images/catalog/finishes/gloss-surface/ (the same file
 *   name and geometry as the sample, white margin included), which the drawn
 *   door of the homepage picker and the door visualizer place by that
 *   geometry; and
 * - a swatch in /images/catalog/finishes/gloss-swatch/: the square of that
 *   surface the picker chips show, edge to edge, at 640px with -160, -320
 *   and -640 copies.
 *
 * The gloss is drawn over either in CSS (--gloss-sheen, app/gloss-sheen.css).
 * Every other visitor-facing finish swatch takes its picture through
 * finishSwatchSrc() and its sheen through glossSheenClass(), so no page shows
 * the painted sample.
 *
 * This module imports nothing but the list of surfaces, so server code,
 * client components and the estimate engine can all use it.
 */
import { GLOSS_SURFACE_FILES } from "./generated/glossSurfaces";

const FINISH_DIR = "/images/catalog/finishes/";
export const GLOSS_SURFACE_DIR = "/images/catalog/finishes/gloss-surface/";
export const GLOSS_SWATCH_DIR = "/images/catalog/finishes/gloss-swatch/";

/** The class that draws the gloss over a surface (app/gloss-sheen.css). */
export const GLOSS_SHEEN_CLASS = "gloss-sheen";

/** The file name of a catalog gloss sample that has a surface, or null. */
function glossFile(imagePath: string | undefined | null): string | null {
  if (!imagePath || !imagePath.startsWith(FINISH_DIR)) return null;
  const file = imagePath.slice(FINISH_DIR.length);
  return !file.includes("/") && GLOSS_SURFACE_FILES.has(file) ? file : null;
}

/**
 * The clean surface for a catalog gloss sample (the sample's geometry, for
 * the drawn door), or null when the path is not a gloss sample with one.
 */
export function glossSurface(imagePath: string | undefined | null): string | null {
  const file = glossFile(imagePath);
  return file ? `${GLOSS_SURFACE_DIR}${file}` : null;
}

/** The edge-to-edge clean swatch for a catalog gloss sample, or null. */
export function glossSwatch(imagePath: string | undefined | null): string | null {
  const file = glossFile(imagePath);
  return file ? `${GLOSS_SWATCH_DIR}${file}` : null;
}

/** The picture a visitor sees for a finish: the gloss swatch, or the catalog sample. */
export function finishSwatchSrc(imagePath: string): string;
export function finishSwatchSrc(imagePath: string | undefined): string | undefined;
export function finishSwatchSrc(imagePath: string | undefined): string | undefined {
  return glossSwatch(imagePath) ?? imagePath;
}

/** True for a clean gloss picture (surface or swatch, any size, with or without a version). */
export function isGlossSurfaceSrc(src: string | undefined | null): boolean {
  return Boolean(src && (src.startsWith(GLOSS_SWATCH_DIR) || src.startsWith(GLOSS_SURFACE_DIR)));
}

/**
 * The sheen class for the element that holds a swatch picture: set when the
 * picture is a clean gloss picture. The element must be positioned and clip its
 * content (every swatch frame on the site is `relative overflow-hidden`).
 */
export function glossSheenClass(src: string | undefined | null): string | undefined {
  return isGlossSurfaceSrc(src) ? GLOSS_SHEEN_CLASS : undefined;
}
