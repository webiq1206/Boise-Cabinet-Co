/**
 * SVG cabinet elevation diagrams for OSC SKU codes (catalog product imagery).
 */

const BG = "#F3ECDF";
const FRAME = "#8A7B66";
const FILL = "#9F4F2D";
const STROKE = "#7E3E22";
const ACCENT = "#5A4E3E";

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Front panel splits for door count */
function doorPanels(x, y, w, h, doors) {
  const n = Math.max(1, doors || 1);
  const parts = [];
  const gap = 3;
  const pw = (w - gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    const px = x + i * (pw + gap);
    parts.push(
      `<rect x="${px.toFixed(1)}" y="${y}" width="${pw.toFixed(1)}" height="${h}" rx="2" fill="${FILL}" stroke="${STROKE}" stroke-width="1.5"/>`,
    );
  }
  return parts.join("\n");
}

function drawerBands(x, y, w, h, count) {
  const n = Math.max(1, count || 1);
  const bandH = h / n;
  const lines = [];
  for (let i = 0; i < n; i++) {
    const by = y + i * bandH;
    lines.push(
      `<rect x="${x}" y="${by.toFixed(1)}" width="${w}" height="${(bandH - 2).toFixed(1)}" rx="1" fill="${FILL}" stroke="${STROKE}" stroke-width="1.2" opacity="0.92"/>`,
      `<line x1="${x + 8}" y1="${(by + bandH / 2).toFixed(1)}" x2="${x + w - 8}" y2="${(by + bandH / 2).toFixed(1)}" stroke="${ACCENT}" stroke-width="1" opacity="0.35"/>`,
    );
  }
  return lines.join("\n");
}

/**
 * @param {object} product
 * @param {{ showLabel?: boolean; width?: number; height?: number }} opts
 */
export function productDiagramSvg(product, opts = {}) {
  const { showLabel = false, width = 800, height = 600 } = opts;
  const { category, oscCode, configuration: cfg = {} } = product;
  const doors = cfg.doors ?? 0;
  const drawers = cfg.drawers ?? 0;
  const hasRollout = (cfg.rollouts ?? 0) > 0 || /ROT/i.test(oscCode);
  const hasPart = (cfg.partitions ?? 0) > 0 || /PART/i.test(oscCode);

  const inner = [];
  const margin = 48;
  const cx = 400;
  const cy = 300;

  if (category === "wall") {
    const w = 280;
    const h = 100;
    inner.push(
      `<rect x="${cx - w / 2}" y="${cy - h / 2 - 40}" width="${w}" height="${h}" rx="3" fill="#E8E0D4" stroke="${FRAME}" stroke-width="2"/>`,
      doorPanels(cx - w / 2 + 8, cy - h / 2 - 32, w - 16, h - 16, doors || 2),
    );
  } else if (category === "tall" || category === "hood") {
    const w = category === "hood" ? 240 : 160;
    const h = category === "hood" ? 90 : 220;
    const y0 = cy - h / 2;
    if (category === "hood") {
      inner.push(
        `<path d="M ${cx - w / 2} ${y0 + h} L ${cx - w / 4} ${y0} L ${cx + w / 4} ${y0} L ${cx + w / 2} ${y0 + h} Z" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
        `<rect x="${cx - 30}" y="${y0 + h - 8}" width="60" height="8" fill="${ACCENT}" opacity="0.5"/>`,
      );
    } else {
      inner.push(
        `<rect x="${cx - w / 2}" y="${y0}" width="${w}" height="${h}" rx="3" fill="#E8E0D4" stroke="${FRAME}" stroke-width="2"/>`,
        doorPanels(cx - w / 2 + 8, y0 + 12, w - 16, h * 0.55, doors || 2),
      );
      if (drawers) {
        inner.push(drawerBands(cx - w / 2 + 8, y0 + h * 0.58, w - 16, h * 0.35, drawers));
      }
    }
  } else if (category === "vanity") {
    const w = 260;
    const h = 90;
    inner.push(
      `<rect x="${cx - w / 2}" y="${cy - 20}" width="${w}" height="${h}" rx="3" fill="#E8E0D4" stroke="${FRAME}" stroke-width="2"/>`,
      doorPanels(cx - w / 2 + 8, cy - 12, w - 16, h - 16, doors || 2),
    );
  } else if (category === "floating-shelf") {
    const w = 220;
    inner.push(
      `<rect x="${cx - w / 2}" y="${cy - 12}" width="${w}" height="24" rx="2" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
      `<rect x="${cx - w / 2}" y="${cy - 28}" width="${w}" height="6" fill="${ACCENT}" opacity="0.2"/>`,
    );
  } else if (category === "filler" || category === "end-panel") {
    const w = 36;
    const h = 200;
    inner.push(
      `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="2" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
    );
  } else {
    // base (default)
    const w = 200;
    const h = 140;
    const x0 = cx - w / 2;
    const y0 = cy - h / 2 + 20;
    inner.push(
      `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="3" fill="#E8E0D4" stroke="${FRAME}" stroke-width="2"/>`,
    );
    if (drawers > 0) {
      const doorH = h * 0.42;
      const drH = h - doorH - 12;
      if (doors > 0) {
        inner.push(doorPanels(x0 + 8, y0 + 8, w - 16, doorH, doors));
      }
      inner.push(drawerBands(x0 + 8, y0 + doorH + 8, w - 16, drH, drawers));
    } else {
      inner.push(doorPanels(x0 + 8, y0 + 8, w - 16, h - 16, doors || 1));
    }
    if (hasRollout) {
      inner.push(
        `<text x="${cx}" y="${y0 + h - 6}" text-anchor="middle" fill="${ACCENT}" font-size="11" font-family="system-ui,sans-serif">roll-out</text>`,
      );
    }
    if (hasPart) {
      inner.push(
        `<line x1="${cx}" y1="${y0 + 12}" x2="${cx}" y2="${y0 + h - 12}" stroke="${ACCENT}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
      );
    }
  }

  const labelBlock = showLabel
    ? `<text x="400" y="560" text-anchor="middle" fill="${ACCENT}" font-family="ui-monospace,monospace" font-size="18" font-weight="500">${esc(oscCode)}</text>
       <text x="400" y="582" text-anchor="middle" fill="${ACCENT}" font-family="system-ui,sans-serif" font-size="12" opacity="0.7">${esc(category)} cabinet</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 600" role="img" aria-label="${esc(oscCode)} cabinet diagram">
  <rect width="800" height="600" fill="${BG}"/>
  <rect x="${margin}" y="${margin}" width="${800 - margin * 2}" height="${600 - margin * 2}" fill="none" stroke="${FRAME}" stroke-width="1" opacity="0.25" rx="8"/>
  ${inner.join("\n")}
  ${labelBlock}
</svg>`;
}
