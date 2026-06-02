import { detectIssues } from "./planAdvisor";
import {
  cabinetCode,
  moduleFootprint,
  type CabinetModule,
  type RoomBounds,
} from "./previewConfig";
import { metersToInches, type RoomMeta } from "./roomMeta";

const SCALE = 120;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildFloorPlanSvg(input: {
  modules: CabinetModule[];
  bounds: RoomBounds;
  roomMeta: RoomMeta | null;
  designName?: string;
}): string {
  const { modules, bounds, roomMeta, designName } = input;
  const roomW = bounds.maxX - bounds.minX;
  const roomD = bounds.maxZ - bounds.minZ;
  const W = roomW * SCALE;
  const H = roomD * SCALE;
  const toPxX = (x: number) => (x - bounds.minX) * SCALE;
  const toPxZ = (z: number) => (z - bounds.minZ) * SCALE;

  const issues = detectIssues(modules, bounds, roomMeta);
  const widthIn = roomMeta?.widthIn ?? metersToInches(roomW);
  const depthIn = roomMeta?.depthIn ?? metersToInches(roomD);

  let body = "";

  body += `<rect x="0" y="0" width="${W}" height="${H}" fill="#f8f6f3" stroke="#3A3E3D" stroke-width="2"/>`;

  body += `<text x="${W / 2}" y="-8" text-anchor="middle" font-size="12" fill="#3A3E3D">${esc(designName || "Cabinet layout")}</text>`;
  body += `<text x="${W / 2}" y="14" text-anchor="middle" font-size="10" fill="#666">${widthIn}" W × ${depthIn}" D, planning only, confirm at site measure</text>`;

  body += `<text x="${W / 2}" y="${H + 18}" text-anchor="middle" font-size="11" fill="#3A3E3D">${widthIn}"</text>`;
  body += `<text x="-4" y="${H / 2}" text-anchor="end" font-size="11" fill="#3A3E3D" transform="rotate(-90 -4 ${H / 2})">${depthIn}"</text>`;

  for (const m of modules) {
    const f = moduleFootprint(m);
    const x = toPxX(f.x0);
    const y = toPxZ(f.z0);
    const w = f.w * SCALE;
    const h = f.d * SCALE;
    const fill = m.isWall ? "#d4cfc8" : "#c4a882";
    body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#3A3E3D" stroke-width="1.5"/>`;
    if (w > 28 && h > 18) {
      body += `<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">${esc(cabinetCode(m))}</text>`;
    }
  }

  if (issues.length > 0) {
    body += `<text x="8" y="${H - 8}" font-size="9" fill="#b91c1c">${issues.length} layout note(s), see Design Studio</text>`;
  }

  const pad = 32;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-24} ${W + pad * 2} ${H + pad + 28}" width="${W + pad * 2}" height="${H + pad + 28}">
  ${body}
</svg>`;
}

export function downloadFloorPlanSvg(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
