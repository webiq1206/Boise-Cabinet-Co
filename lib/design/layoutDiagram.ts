/**
 * Parametric top-down floor-plan diagram builder for cabinet layouts.
 *
 * Pure (no node/browser APIs) so it can be shared by:
 *  - scripts/generate-layout-diagrams.ts (writes generic 4:3 SVGs for the estimator)
 *  - the Design Studio layout step (renders diagrams at the scanned room's
 *    real width/depth proportions)
 *
 * When width/depth are omitted the builder emits the generic 4:3 diagram.
 * When they are supplied (inches), the frame's aspect ratio and cabinet depth
 * scale so a wide room looks wide and a deep room looks deep.
 */

const FLOOR = "#F3ECDF";
const WALL = "#8A7B66";
// Cabinet colors are driven by CSS custom properties so consumers can tint the
// cabinet runs to roughly match a selected finish (the Project Estimator does
// this). They use `style` (not presentation attributes) so var() resolves, and
// each falls back to the brand terracotta when the property is unset.
const CAB = "var(--cab-fill, #9F4F2D)";
const CAB_TOP = "var(--cab-stroke, #7E3E22)";
const ISLAND = "var(--cab-island, #B5673F)";
const SINK_STROKE = "#5A4E3E";
const DIVIDER = "#00000022";

const FR = 14; // wall frame inset
const GAP = 8; // cabinet offset from the wall

const DEFAULT_W = 320;
const DEFAULT_H = 240;
const DEFAULT_D = 22;

/** Display aspect (width / depth) is clamped so extreme rooms stay legible. */
const MIN_ASPECT = 0.6;
const MAX_ASPECT = 1.8;
const BASE = 300;

export interface LayoutDiagramOptions {
  /** Scanned room width in inches (wall the viewer faces). */
  widthIn?: number;
  /** Scanned room depth in inches (toward the viewer). */
  depthIn?: number;
}

export interface LayoutDiagramResult {
  svg: string;
  /** viewBox width / height, for sizing the container. */
  aspect: number;
}

interface Dims {
  W: number;
  H: number;
  D: number;
}

function resolveDims(opts?: LayoutDiagramOptions): Dims {
  if (!opts?.widthIn || !opts?.depthIn || opts.widthIn <= 0 || opts.depthIn <= 0) {
    return { W: DEFAULT_W, H: DEFAULT_H, D: DEFAULT_D };
  }
  const aspect = Math.min(
    MAX_ASPECT,
    Math.max(MIN_ASPECT, opts.widthIn / opts.depthIn),
  );
  const W = aspect >= 1 ? BASE : BASE * aspect;
  const H = aspect >= 1 ? BASE / aspect : BASE;
  const D = Math.round(Math.min(28, Math.max(15, Math.min(W, H) * 0.12)));
  return { W: Math.round(W), H: Math.round(H), D };
}

function cab(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: string; dividers?: number; vertical?: boolean } = {},
): string {
  const { fill = CAB, dividers = 0, vertical = false } = opts;
  let out = `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="2" style="fill:${fill};stroke:${CAB_TOP}" stroke-width="1.5"/>`;
  if (dividers > 0) {
    for (let i = 1; i < dividers; i++) {
      if (vertical) {
        const yy = r(y + (h / dividers) * i);
        out += `<line x1="${r(x)}" y1="${yy}" x2="${r(x + w)}" y2="${yy}" stroke="${DIVIDER}" stroke-width="1"/>`;
      } else {
        const xx = r(x + (w / dividers) * i);
        out += `<line x1="${xx}" y1="${r(y)}" x2="${xx}" y2="${r(y + h)}" stroke="${DIVIDER}" stroke-width="1"/>`;
      }
    }
  }
  return out;
}

function sink(cx: number, cy: number, d: number): string {
  const w = d * 1.15;
  const h = d * 0.62;
  return (
    `<rect x="${r(cx - w / 2)}" y="${r(cy - h / 2)}" width="${r(w)}" height="${r(h)}" rx="3" fill="${FLOOR}" stroke="${SINK_STROKE}" stroke-width="1.5"/>` +
    `<circle cx="${r(cx)}" cy="${r(cy - h / 2 - 2)}" r="1.6" fill="${SINK_STROKE}"/>`
  );
}

function r(n: number): number {
  return Math.round(n * 10) / 10;
}

function frame(inner: string, d: Dims): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.W} ${d.H}" role="img" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%">
<rect x="${FR}" y="${FR}" width="${d.W - FR * 2}" height="${d.H - FR * 2}" rx="6" fill="${FLOOR}" stroke="${WALL}" stroke-width="3"/>
${inner}
</svg>`;
}

type Builder = (d: Dims) => string;

const builders: Record<string, Builder> = {
  galley: (d) => {
    const x = FR + GAP;
    const fullW = d.W - 2 * (FR + GAP);
    const bottomY = d.H - FR - GAP - d.D;
    return [
      cab(x, FR + GAP, fullW, d.D),
      cab(x, bottomY, fullW, d.D),
      sink(d.W / 2, FR + GAP + d.D / 2, d.D),
    ].join("\n");
  },

  "l-shape": (d) => {
    const x = FR + GAP;
    const fullW = d.W - 2 * (FR + GAP);
    const fullH = d.H - 2 * (FR + GAP);
    const bottomY = d.H - FR - GAP - d.D;
    const bottomW = fullW * 0.78;
    return [
      cab(x, FR + GAP, d.D, fullH),
      cab(x, bottomY, bottomW, d.D),
      sink(x + bottomW * 0.62, bottomY + d.D / 2, d.D),
    ].join("\n");
  },

  "u-shape": (d) => {
    const x = FR + GAP;
    const fullW = d.W - 2 * (FR + GAP);
    const fullH = d.H - 2 * (FR + GAP);
    const bottomY = d.H - FR - GAP - d.D;
    return [
      cab(x, FR + GAP, d.D, fullH),
      cab(d.W - FR - GAP - d.D, FR + GAP, d.D, fullH),
      cab(x, bottomY, fullW, d.D),
      sink(d.W / 2, bottomY + d.D / 2, d.D),
    ].join("\n");
  },

  island: (d) => {
    const x = FR + GAP;
    const fullW = d.W - 2 * (FR + GAP);
    const fullH = d.H - 2 * (FR + GAP);
    const iw = fullW * 0.42;
    const ih = fullH * 0.24;
    const icx = d.W * 0.56;
    const icy = d.H * 0.62;
    return [
      cab(x, FR + GAP, fullW * 0.82, d.D),
      cab(x, FR + GAP, d.D, fullH * 0.62),
      cab(icx - iw / 2, icy - ih / 2, iw, ih, { fill: ISLAND }),
      sink(icx, icy, d.D),
    ].join("\n");
  },

  peninsula: (d) => {
    const x = FR + GAP;
    const fullW = d.W - 2 * (FR + GAP);
    const fullH = d.H - 2 * (FR + GAP);
    const bottomY = d.H - FR - GAP - d.D;
    const bottomW = fullW * 0.85;
    const stubH = fullH * 0.4;
    return [
      cab(x, FR + GAP, d.D, fullH),
      cab(x, bottomY, bottomW, d.D),
      cab(d.W * 0.55, bottomY - stubH, d.D, stubH, { fill: ISLAND }),
      sink(x + bottomW * 0.4, bottomY + d.D / 2, d.D),
    ].join("\n");
  },

  "single-vanity": (d) => {
    const w = (d.W - 2 * (FR + GAP)) * 0.5;
    const y = d.H - FR - GAP - d.D;
    return [
      cab((d.W - w) / 2, y, w, d.D),
      sink(d.W / 2, y + d.D / 2, d.D),
    ].join("\n");
  },

  "double-vanity": (d) => {
    const w = (d.W - 2 * (FR + GAP)) * 0.85;
    const x = (d.W - w) / 2;
    const y = d.H - FR - GAP - d.D;
    return [
      cab(x, y, w, d.D),
      sink(x + w * 0.28, y + d.D / 2, d.D),
      sink(x + w * 0.72, y + d.D / 2, d.D),
    ].join("\n");
  },

  "wall-run": (d) =>
    cab(FR + GAP, FR + GAP, d.W - 2 * (FR + GAP), d.D, { dividers: 6 }),

  "floor-to-ceiling": (d) => {
    const x = FR + GAP;
    const fullW = d.W - 2 * (FR + GAP);
    const fullH = d.H - 2 * (FR + GAP);
    const tall = d.D * 1.5;
    return [
      cab(x, FR + GAP, fullW, tall, { dividers: 7 }),
      cab(x, FR + GAP, tall, fullH * 0.62, { dividers: 5, vertical: true }),
    ].join("\n");
  },
};

export const LAYOUT_DIAGRAM_SLUGS = Object.keys(builders);

/** Build a floor-plan diagram SVG for a layout slug, optionally at a room's proportions. */
export function buildLayoutDiagram(
  slug: string,
  opts?: LayoutDiagramOptions,
): LayoutDiagramResult {
  const build = builders[slug] ?? builders["wall-run"];
  const dims = resolveDims(opts);
  return { svg: frame(build(dims), dims), aspect: dims.W / dims.H };
}
