import { detectIssues } from "./planAdvisor";
import { cabinetCode, type CabinetModule } from "./previewConfig";
import { resolveRoomBounds } from "./resolveRoomBounds";
import { hasUserRoomDimensions, metersToInches, type RoomMeta } from "./roomMeta";
import type { RoomBounds } from "./previewConfig";

export interface LayoutSummary {
  moduleCount: number;
  baseCount: number;
  wallCount: number;
  approximateLinearFeet: number;
  roomWidthIn: number | null;
  roomDepthIn: number | null;
  roomDimensionsConfirmed: boolean;
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issueTitles: string[];
  modules: { code: string; widthIn: number; depthIn: number; heightIn: number }[];
  scanSource: string | null;
  scanConfidence: string | null;
}

export function buildLayoutSummary(input: {
  modules: CabinetModule[];
  roomBounds: RoomBounds | null;
  roomMeta: RoomMeta | null;
  layout: string | null;
}): LayoutSummary {
  const bounds = resolveRoomBounds(
    input.modules,
    input.roomBounds,
    input.roomMeta,
  );
  const issues = detectIssues(input.modules, bounds, input.roomMeta);
  const bases = input.modules.filter((m) => !m.isWall);
  const walls = input.modules.filter((m) => m.isWall);

  let linearIn = 0;
  for (const m of bases) {
    linearIn += metersToInches(m.width);
  }

  return {
    moduleCount: input.modules.length,
    baseCount: bases.length,
    wallCount: walls.length,
    approximateLinearFeet: Math.round((linearIn / 12) * 10) / 10,
    roomWidthIn: input.roomMeta?.widthIn ?? metersToInches(bounds.maxX - bounds.minX),
    roomDepthIn: input.roomMeta?.depthIn ?? metersToInches(bounds.maxZ - bounds.minZ),
    roomDimensionsConfirmed: hasUserRoomDimensions(input.roomMeta),
    issueCount: issues.length,
    errorCount: issues.filter((i) => i.severity === "error").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
    issueTitles: issues.map((i) => i.title),
    modules: input.modules.map((m) => ({
      code: cabinetCode(m),
      widthIn: metersToInches(m.width),
      depthIn: metersToInches(m.depth),
      heightIn: metersToInches(m.height),
    })),
    scanSource: input.roomMeta?.source ?? null,
    scanConfidence: input.roomMeta?.scanConfidence ?? null,
  };
}
