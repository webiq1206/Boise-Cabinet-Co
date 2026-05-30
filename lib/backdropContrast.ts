const ADAPTIVE_GLASS_SELECTOR = "[data-adaptive-glass]";

export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Default light canvas scrim (~ `--background` at 40 20% 96%). */
export const DEFAULT_SCRIM_LUMINANCE = 0.96;
export const DEFAULT_SCRIM_OPACITY = 0.97;
export const LUMINANCE_THRESHOLD = 0.55;

export function parseCssColor(color: string): RgbColor | null {
  const trimmed = color.trim();
  if (!trimmed || trimmed === "transparent") return null;

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
      a: rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
    };
  }

  const hslMatch = trimmed.match(
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (hslMatch) {
    const h = Number(hslMatch[1]) / 360;
    const s = Number(hslMatch[2]) / 100;
    const l = Number(hslMatch[3]) / 100;
    const a = hslMatch[4] !== undefined ? Number(hslMatch[4]) : 1;

    if (s === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v, a };
    }

    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
      a,
    };
  }

  return null;
}

export function relativeLuminance(color: RgbColor): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function colorStringLuminance(color: string): number | null {
  const parsed = parseCssColor(color);
  if (!parsed || parsed.a <= 0) return null;
  return relativeLuminance(parsed);
}

export function resolveBackgroundLuminance(el: Element): number | null {
  let current: Element | null = el;
  while (current && current !== document.documentElement) {
    const style = getComputedStyle(current);
    const bgLuminance = colorStringLuminance(style.backgroundColor);
    if (bgLuminance !== null && parseCssColor(style.backgroundColor)!.a > 0.05) {
      return bgLuminance;
    }
    current = current.parentElement;
  }
  return null;
}

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

function getSharedCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
    sharedCanvas.width = 1;
    sharedCanvas.height = 1;
    sharedCtx = sharedCanvas.getContext("2d", { willReadFrequently: true });
  }
  return sharedCtx;
}

export function sampleImageLuminance(img: HTMLImageElement, x: number, y: number): number | null {
  if (!img.complete || img.naturalWidth === 0) return null;

  const ctx = getSharedCanvasContext();
  if (!ctx) return null;

  try {
    const rect = img.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const localX = ((x - rect.left) / rect.width) * img.naturalWidth;
    const localY = ((y - rect.top) / rect.height) * img.naturalHeight;
    const sx = Math.max(0, Math.min(img.naturalWidth - 1, Math.round(localX)));
    const sy = Math.max(0, Math.min(img.naturalHeight - 1, Math.round(localY)));

    ctx.clearRect(0, 0, 1, 1);
    ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a <= 10) return null;
    return relativeLuminance({ r, g, b, a: a / 255 });
  } catch {
    return null;
  }
}

function isInsideAdaptiveGlass(el: Element, excludeRoot: Element | null): boolean {
  if (excludeRoot && excludeRoot.contains(el)) return true;
  return el.closest(ADAPTIVE_GLASS_SELECTOR) !== null;
}

function luminanceFromElement(el: Element, x: number, y: number): number | null {
  if (el instanceof HTMLImageElement) {
    const imageLuminance = sampleImageLuminance(el, x, y);
    if (imageLuminance !== null) return imageLuminance;
  }

  const bgLuminance = resolveBackgroundLuminance(el);
  if (bgLuminance !== null) return bgLuminance;

  return null;
}

export function sampleBackdropLuminance(
  x: number,
  y: number,
  excludeRoot: Element | null
): number | null {
  if (typeof document === "undefined") return null;

  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (isInsideAdaptiveGlass(el, excludeRoot)) continue;
    const luminance = luminanceFromElement(el, x, y);
    if (luminance !== null) return luminance;
  }

  return null;
}

export function blendWithScrim(
  contentLuminance: number,
  scrimLuminance = DEFAULT_SCRIM_LUMINANCE,
  scrimOpacity = DEFAULT_SCRIM_OPACITY
): number {
  return contentLuminance * (1 - scrimOpacity) + scrimLuminance * scrimOpacity;
}

export function luminanceToTheme(
  effectiveLuminance: number,
  threshold = LUMINANCE_THRESHOLD
): "onLight" | "onDark" {
  return effectiveLuminance < threshold ? "onDark" : "onLight";
}

export function measureBarTheme(
  barEl: HTMLElement,
  options?: { threshold?: number }
): "onLight" | "onDark" {
  const rect = barEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return "onLight";

  const sampleY = rect.top + rect.height * 0.5;
  const sampleXs = [
    rect.left + rect.width * 0.25,
    rect.left + rect.width * 0.5,
    rect.left + rect.width * 0.75,
  ];

  const threshold = options?.threshold ?? LUMINANCE_THRESHOLD;

  let total = 0;
  let count = 0;

  for (const x of sampleXs) {
    const backdrop = sampleBackdropLuminance(x, sampleY, barEl);
    if (backdrop !== null) {
      total += backdrop;
      count += 1;
    }
  }

  if (count === 0) return "onLight";

  const average = total / count;
  return luminanceToTheme(average, threshold);
}
