/**
 * Parametric front-elevation "box" diagram generator for Boise Cabinet Co.
 *
 * Reads a cabinet's parsed `attrs` (from data/catalog.json) and draws a clean,
 * flat, on-brand line drawing. No gradients, thin stroke, neutral fill. Covers
 * every attribute case: doors, drawers (top/bottom/stacked), false fronts,
 * glass, open shelving, partitions, rollouts, full-height, door-down, floating,
 * sink/trash, appliance, corner types, lazy susan, and left/right hand.
 *
 * Pure (no I/O) so it can be unit-tested and reused. Output is an SVG string.
 */

const BG = "#F7F3EC"; // warm paper
const FRAME = "#5E564A"; // box outline
const PANEL = "#ECE6DB"; // door/drawer fill
const PANEL_LINE = "#8C8170"; // inset/border lines
const HANDLE = "#6E6555"; // hardware
const FAINT = "#B7AD9B"; // dashed/secondary
const GLASS = "#E3ECEE"; // glass fill

const VBW = 360;
const VBH = 420;

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const r1 = (n) => Number(n).toFixed(1);

function nominal(min, max, fallback) {
  const a = typeof min === "number" ? min : null;
  const b = typeof max === "number" ? max : null;
  if (a != null && b != null) return (a + b) / 2;
  if (a != null) return a;
  if (b != null) return b;
  return fallback;
}

const CAT_MAP = {
  Wall: "wall",
  Base: "base",
  Tall: "tall",
  Vanity: "vanity",
  "Floating Shelf": "floating-shelf",
  Hood: "hood",
  "Filler/Crown": "filler",
  "End Panel": "end-panel",
  Panel: "panel",
};

function rect(x, y, w, h, fill, stroke, sw = 1.4, rx = 2) {
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function line(x1, y1, x2, y2, stroke, sw = 1.2, dash) {
  return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

// A horizontal drawer/false-front band. handle=false for false fronts.
function band(x, y, w, h, handle = true) {
  const els = [rect(x, y, w, h - 2, PANEL, PANEL_LINE, 1.2, 1)];
  if (handle) {
    const cy = y + (h - 2) / 2;
    els.push(line(x + w * 0.35, cy, x + w * 0.65, cy, HANDLE, 2));
  }
  return els.join("");
}

// Vertical door panels with an inset frame and handles near the center seam.
function doorPanels(x, y, w, h, doors, opts = {}) {
  const n = Math.max(1, doors || 1);
  const gap = n > 1 ? 4 : 0;
  const pw = (w - gap * (n - 1)) / n;
  const els = [];
  const hand = opts.hand;
  for (let i = 0; i < n; i++) {
    const px = x + i * (pw + gap);
    const fill = opts.glass ? GLASS : PANEL;
    els.push(rect(px, y, pw, h, fill, PANEL_LINE, 1.4, 2));
    // inset frame for shaker-style read (skip for slab look on glass/open)
    if (!opts.glass) {
      els.push(rect(px + 6, y + 6, pw - 12, h - 12, "none", PANEL_LINE, 0.8, 1));
    }
    if (opts.glass) {
      // single diagonal line to read as glass
      els.push(line(px + 6, y + h - 6, px + pw - 6, y + 6, FAINT, 1));
    }
    // handle near the center seam; hinge side mirrors by hand
    let hx;
    if (n === 1) {
      hx = hand === "L" ? px + 10 : px + pw - 10;
    } else {
      hx = i === 0 ? px + pw - 8 : px + 8;
    }
    els.push(line(hx, y + h * 0.35, hx, y + h * 0.65, HANDLE, 2.2));
  }
  return els.join("");
}

function stackedDrawers(x, y, w, h, count) {
  const n = Math.max(1, count || 1);
  const bh = h / n;
  const els = [];
  for (let i = 0; i < n; i++) {
    els.push(band(x, y + i * bh, w, bh, true));
  }
  return els.join("");
}

function shelfLines(x, y, w, h, count) {
  const n = Math.max(0, count || 0);
  if (!n) return "";
  const els = [];
  for (let i = 1; i <= n; i++) {
    const yy = y + (h * i) / (n + 1);
    els.push(line(x + 3, yy, x + w - 3, yy, PANEL_LINE, 1.1));
  }
  return els.join("");
}

function partitionLines(x, y, w, h, count) {
  const n = Math.max(0, count || 0);
  if (!n) return "";
  const els = [];
  for (let i = 1; i <= n; i++) {
    const xx = x + (w * i) / (n + 1);
    els.push(line(xx, y + 4, xx, y + h - 4, FAINT, 1.4, "5 3"));
  }
  return els.join("");
}

function rolloutLines(x, y, w, h, count) {
  const n = Math.max(0, count || 0);
  if (!n) return "";
  const els = [];
  for (let i = 1; i <= n; i++) {
    const yy = y + (h * i) / (n + 1);
    els.push(line(x + 10, yy, x + w - 10, yy, FAINT, 1, "3 3"));
  }
  return els.join("");
}

/**
 * Compose the cabinet front for box-style categories.
 * Returns SVG for the area (x,y,w,h).
 */
function composeFront(x, y, w, h, attrs) {
  const els = [];
  const hand = attrs.hand;
  let top = y;
  let bottom = y + h;

  // Open shelving: no doors, show interior + shelves + partitions.
  if (attrs.open) {
    els.push(rect(x, y, w, h, "#FBFAF6", PANEL_LINE, 1.2, 2));
    els.push(shelfLines(x, y, w, h, attrs.shelves || 2));
    els.push(partitionLines(x, y, w, h, attrs.partitions));
    return els.join("");
  }

  // Appliance cabinet: door(s) at top, large open appliance opening below.
  if (attrs.appliance > 0) {
    const doorH = h * 0.28;
    els.push(doorPanels(x, top, w, doorH, attrs.doors || 2, { hand }));
    const openY = top + doorH + 4;
    const openH = bottom - openY;
    els.push(rect(x, openY, w, openH, "#FBFAF6", PANEL_LINE, 1.2, 2));
    els.push(line(x + 6, openY + openH * 0.5, x + w - 6, openY + openH * 0.5, FAINT, 1, "4 3"));
    return els.join("");
  }

  // Pencil drawers (very thin) at the very top.
  for (let i = 0; i < (attrs.pencilDrawers || 0); i++) {
    const bh = h * 0.06;
    els.push(band(x, top, w, bh, true));
    top += bh + 2;
  }

  // Top drawers.
  for (let i = 0; i < (attrs.topDrawers || 0); i++) {
    const bh = Math.min(h * 0.16, (bottom - top) * 0.4);
    els.push(band(x, top, w, bh, true));
    top += bh + 2;
  }

  // Bottom drawers (built up from the bottom).
  for (let i = 0; i < (attrs.bottomDrawers || 0); i++) {
    const bh = Math.min(h * 0.16, (bottom - top) * 0.4);
    els.push(band(x, bottom - bh, w, bh, true));
    bottom -= bh + 2;
  }

  // Sink false front spans the top of the remaining middle (no handle).
  if ((attrs.falseFronts || 0) > 0 || attrs.sink) {
    const bh = Math.min(h * 0.16, (bottom - top) * 0.4);
    els.push(band(x, top, w, bh, false));
    top += bh + 2;
  }

  const midY = top;
  const midH = Math.max(8, bottom - top);

  // Drawer base: stacked drawers fill the middle when there are no doors.
  if ((attrs.drawers || 0) > 0 && (attrs.doors || 0) === 0) {
    els.push(stackedDrawers(x, midY, w, midH, attrs.drawers));
    return els.join("");
  }

  // Door area (with optional glass, rollouts, partitions, trash, shelves).
  if ((attrs.doors || 0) > 0 || (!attrs.drawers && !attrs.topDrawers && !attrs.bottomDrawers)) {
    let doorY = midY;
    let doorH = midH;
    // door-down: door extends slightly below the box bottom (~3/4").
    if (attrs.doorDown) doorH += 6;
    els.push(doorPanels(x, doorY, w, doorH, attrs.doors || 1, { glass: attrs.glass, hand }));
    if (attrs.rollouts > 0) els.push(rolloutLines(x, doorY, w, doorH, attrs.rollouts));
    if (attrs.partitions > 0) els.push(partitionLines(x, doorY, w, doorH, attrs.partitions));
    if (attrs.glass && attrs.shelves > 0) els.push(shelfLines(x, doorY, w, doorH, attrs.shelves));
    // trash: small bin indicator over the door.
    if (attrs.trash) {
      const bw = w * 0.32;
      const bx = x + (w - bw) / 2;
      const by = doorY + doorH * 0.45;
      const bh = doorH * 0.4;
      els.push(`<path d="M ${r1(bx)} ${r1(by)} L ${r1(bx + bw)} ${r1(by)} L ${r1(bx + bw - 4)} ${r1(by + bh)} L ${r1(bx + 4)} ${r1(by + bh)} Z" fill="none" stroke="${FAINT}" stroke-width="1.2"/>`);
      els.push(line(bx - 2, by, bx + bw + 2, by, FAINT, 1.2));
    }
  } else if ((attrs.drawers || 0) > 0) {
    els.push(stackedDrawers(x, midY, w, midH, attrs.drawers));
  }

  return els.join("");
}

/**
 * @param {object} cab - a catalog cabinet row { code, category, attrs, minW.. }
 * @returns {string} SVG markup
 */
export function boxDiagramSvg(cab) {
  const cat = CAT_MAP[cab.category] ?? "base";
  const attrs = cab.attrs ?? {};
  const inner = [];

  // ── Nominal proportions ─────────────────────────────────────────────────
  const nomW = nominal(cab.minW, cab.maxW, 24);
  const nomH = nominal(cab.minH, cab.maxH, 30);
  let aspect = nomW / nomH; // width / height
  if (!isFinite(aspect) || aspect <= 0) aspect = 0.8;
  aspect = Math.max(0.18, Math.min(3.2, aspect));

  // Fit the box within the drawable area preserving aspect.
  const maxW = 280;
  const maxH = 320;
  let bw = maxW;
  let bh = bw / aspect;
  if (bh > maxH) {
    bh = maxH;
    bw = bh * aspect;
  }
  const bx = (VBW - bw) / 2;
  const by = (VBH - bh) / 2;

  const hasToeKick = (cat === "base" || cat === "vanity" || cat === "tall") && !attrs.floating;
  const toeH = hasToeKick ? Math.min(18, bh * 0.08) : 0;

  // ── Category-specific silhouettes ────────────────────────────────────────
  if (cat === "floating-shelf") {
    const sh = Math.max(14, Math.min(28, bw * 0.12));
    const yy = VBH / 2 - sh / 2;
    inner.push(rect(bx, yy, bw, sh, PANEL, FRAME, 1.6, 2));
    inner.push(line(bx, yy + sh, bx + bw, yy + sh, FAINT, 1));
  } else if (cat === "hood") {
    const topW = bw * 0.5;
    const yTop = by;
    const yBot = by + bh;
    inner.push(
      `<path d="M ${r1(bx)} ${r1(yBot)} L ${r1(VBW / 2 - topW / 2)} ${r1(yTop)} L ${r1(VBW / 2 + topW / 2)} ${r1(yTop)} L ${r1(bx + bw)} ${r1(yBot)} Z" fill="${PANEL}" stroke="${FRAME}" stroke-width="1.8"/>`,
    );
    inner.push(rect(VBW / 2 - bw * 0.18, yBot - 8, bw * 0.36, 8, FAINT, PANEL_LINE, 1, 1));
  } else if (cat === "filler" || cat === "end-panel" || cat === "panel") {
    const pw = Math.max(22, Math.min(60, bw * 0.5));
    const px = VBW / 2 - pw / 2;
    inner.push(rect(px, by, pw, bh, PANEL, FRAME, 1.6, 2));
    inner.push(line(px + pw / 2, by + 6, px + pw / 2, by + bh - 6, FAINT, 1, "5 4"));
  } else if (attrs.corner === "diagonal corner") {
    // Angled front face (cut corner).
    const cut = bw * 0.28;
    inner.push(
      `<path d="M ${r1(bx)} ${r1(by)} L ${r1(bx + bw - cut)} ${r1(by)} L ${r1(bx + bw)} ${r1(by + cut)} L ${r1(bx + bw)} ${r1(by + bh)} L ${r1(bx)} ${r1(by + bh)} Z" fill="#FBFAF6" stroke="${FRAME}" stroke-width="1.8"/>`,
    );
    // door on the angled face area
    inner.push(doorPanels(bx + 14, by + cut + 8, bw - 28, bh - cut - (toeH + 16), attrs.doors || 1, { hand: attrs.hand }));
    if (toeH) inner.push(rect(bx + 10, by + bh - toeH, bw - 20, toeH, "#FBFAF6", PANEL_LINE, 1, 1));
  } else if (attrs.corner === "90 corner") {
    // L-shaped footprint.
    const arm = bw * 0.45;
    inner.push(
      `<path d="M ${r1(bx)} ${r1(by)} L ${r1(bx + bw)} ${r1(by)} L ${r1(bx + bw)} ${r1(by + arm)} L ${r1(bx + arm)} ${r1(by + arm)} L ${r1(bx + arm)} ${r1(by + bh)} L ${r1(bx)} ${r1(by + bh)} Z" fill="#FBFAF6" stroke="${FRAME}" stroke-width="1.8"/>`,
    );
    inner.push(doorPanels(bx + 8, by + 8, arm - 16, bh - 16 - toeH, 1, { hand: attrs.hand }));
    inner.push(doorPanels(arm + bx + 8, by + 8, bw - arm - 16, arm - 16, 1, { hand: attrs.hand }));
  } else if (attrs.corner === "blind corner") {
    inner.push(rect(bx, by, bw, bh - toeH, "#FBFAF6", FRAME, 1.8, 2));
    // blind (hatched) panel on the hinge-opposite side + filler
    const blindW = bw * 0.32;
    const blindX = attrs.hand === "L" ? bx + bw - blindW : bx;
    inner.push(rect(blindX, by + 8, blindW, bh - toeH - 16, "#F0EBE0", PANEL_LINE, 1, 1));
    for (let i = 0; i < 5; i++) {
      const xx = blindX + (blindW * (i + 1)) / 6;
      inner.push(line(xx, by + 10, xx, by + bh - toeH - 10, FAINT, 0.8));
    }
    const doorX = attrs.hand === "L" ? bx : bx + blindW;
    inner.push(doorPanels(doorX + 6, by + 8, bw - blindW - 12, bh - toeH - 16, attrs.doors || 1, { hand: attrs.hand }));
    if (toeH) inner.push(rect(bx + 10, by + bh - toeH, bw - 20, toeH, "#FBFAF6", PANEL_LINE, 1, 1));
  } else if (attrs.lazySusan || attrs.corner === "lazy susan") {
    inner.push(rect(bx, by, bw, bh - toeH, "#FBFAF6", FRAME, 1.8, 2));
    inner.push(doorPanels(bx + 8, by + 8, bw - 16, bh - toeH - 16, attrs.doors || 2, { hand: attrs.hand }));
    // round susan indicator
    const cxp = VBW / 2;
    const cyp = by + (bh - toeH) / 2;
    const rr = Math.min(bw, bh) * 0.18;
    inner.push(`<circle cx="${r1(cxp)}" cy="${r1(cyp)}" r="${r1(rr)}" fill="none" stroke="${FAINT}" stroke-width="1.2" stroke-dasharray="4 3"/>`);
    inner.push(line(cxp - rr, cyp, cxp + rr, cyp, FAINT, 0.8));
    inner.push(line(cxp, cyp - rr, cxp, cyp + rr, FAINT, 0.8));
    if (toeH) inner.push(rect(bx + 10, by + bh - toeH, bw - 20, toeH, "#FBFAF6", PANEL_LINE, 1, 1));
  } else {
    // Standard box (wall/base/tall/vanity).
    const boxH = bh - toeH;
    inner.push(rect(bx, by, bw, boxH, "#FBFAF6", FRAME, 1.8, 3));
    const pad = 8;
    inner.push(composeFront(bx + pad, by + pad, bw - pad * 2, boxH - pad * 2, attrs));
    if (toeH) {
      // toe-kick recess
      inner.push(rect(bx + 14, by + boxH, bw - 28, toeH, BG, PANEL_LINE, 1, 1));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VBW}" height="${VBH}" viewBox="0 0 ${VBW} ${VBH}" role="img" aria-label="${esc(cab.code)} cabinet front elevation">
  <rect width="${VBW}" height="${VBH}" fill="${BG}"/>
  ${inner.join("\n  ")}
</svg>`;
}
