"use client";

import { cn } from "@/lib/utils";
import type { FinishCategory } from "@/shared/catalog/doorStyles";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return { r: 196, g: 168, b: 130 };
  }
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** amt in -1..1: negative darkens, positive lightens toward white. */
function shade(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  if (amt >= 0) {
    return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  }
  const k = 1 + amt;
  return rgbToHex(r * k, g * k, b * k);
}

interface DoorStylePreviewProps {
  slug: string;
  color: string;
  category?: FinishCategory;
  className?: string;
}

const VIEW_W = 64;
const VIEW_H = 84;
const PAD = 3;

export function DoorStylePreview({ slug, color, category, className }: DoorStylePreviewProps) {
  const x = PAD;
  const y = PAD;
  const w = VIEW_W - PAD * 2;
  const h = VIEW_H - PAD * 2;

  const edge = shade(color, -0.2);
  const recess = shade(color, -0.09);
  const recessEdge = shade(color, -0.18);
  const raised = shade(color, 0.06);
  const groove = shade(color, -0.32);
  const grain = shade(color, -0.14);

  const grainId = `grain-${slug}`;

  const railWidth = slug === "thin-shaker" ? 4 : 8;
  const isFramed = slug !== "slab";

  const px = x + railWidth;
  const py = y + railWidth;
  const pw = w - railWidth * 2;
  const ph = h - railWidth * 2;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${slug} door profile preview`}
    >
      {category === "woodgrain" && (
        <defs>
          <pattern id={grainId} width="6" height={VIEW_H} patternUnits="userSpaceOnUse">
            <rect width="6" height={VIEW_H} fill="none" />
            <line x1="1.5" y1="0" x2="1.5" y2={VIEW_H} stroke={grain} strokeWidth="0.6" opacity="0.4" />
          </pattern>
        </defs>
      )}

      {/* Door body */}
      <rect x={x} y={y} width={w} height={h} rx="2.5" fill={color} stroke={edge} strokeWidth="1" />
      {category === "woodgrain" && (
        <rect x={x} y={y} width={w} height={h} rx="2.5" fill={`url(#${grainId})`} />
      )}

      {/* Slab: subtle handleless edge reveal on the right */}
      {slug === "slab" && (
        <line x1={x + w - 6} y1={y + 4} x2={x + w - 6} y2={y + h - 4} stroke={edge} strokeWidth="1" opacity="0.5" />
      )}

      {/* Simple shaker recessed panel (modern + thin) */}
      {(slug === "modern-shaker" || slug === "thin-shaker") && (
        <>
          <rect x={px} y={py} width={pw} height={ph} rx="1.5" fill={recess} stroke={recessEdge} strokeWidth="1" />
          <line x1={px} y1={py + 1} x2={px + pw} y2={py + 1} stroke={recessEdge} strokeWidth="1" opacity="0.6" />
        </>
      )}

      {/* Three-piece: recessed frame with raised center panel */}
      {slug === "three-piece" && (
        <>
          <rect x={px} y={py} width={pw} height={ph} rx="1" fill={recess} stroke={recessEdge} strokeWidth="1" />
          <rect
            x={px + 4}
            y={py + 4}
            width={pw - 8}
            height={ph - 8}
            rx="1"
            fill={raised}
            stroke={recessEdge}
            strokeWidth="0.75"
          />
        </>
      )}

      {/* Alpha shaker: beveled inner frame + slightly raised center */}
      {slug === "alpha-shaker" && (
        <>
          <rect
            x={px}
            y={py}
            width={pw}
            height={ph}
            rx="1"
            fill={recess}
            stroke={recessEdge}
            strokeWidth="2.5"
          />
          <rect
            x={px + 3.5}
            y={py + 3.5}
            width={pw - 7}
            height={ph - 7}
            rx="1"
            fill={raised}
            stroke={shade(color, 0.12)}
            strokeWidth="0.75"
          />
        </>
      )}

      {/* Beta shaker: flat panel with shadow-line groove */}
      {slug === "beta-shaker" && (
        <>
          <rect
            x={px}
            y={py}
            width={pw}
            height={ph}
            fill={color}
            stroke={groove}
            strokeWidth="1.5"
          />
          <rect
            x={px + 2.5}
            y={py + 2.5}
            width={pw - 5}
            height={ph - 5}
            fill={color}
            stroke={shade(color, -0.12)}
            strokeWidth="0.5"
          />
        </>
      )}

      {/* Hardware hint for non-slab framed doors */}
      {isFramed && (
        <circle cx={x + w - 7} cy={y + h / 2} r="1.4" fill={edge} opacity="0.7" />
      )}
    </svg>
  );
}
