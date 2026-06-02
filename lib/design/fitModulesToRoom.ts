import {
  computeRoomBounds,
  moduleFootprint,
  type CabinetModule,
  type RoomBounds,
} from "./previewConfig";

/** Scale and centre layout template modules into scanned room bounds. */
export function fitModulesIntoRoomBounds(
  modules: CabinetModule[],
  targetBounds: RoomBounds,
  marginRatio = 0.08,
): CabinetModule[] {
  if (modules.length === 0) return modules;

  const src = computeRoomBounds(modules, 0);
  const srcW = src.maxX - src.minX;
  const srcD = src.maxZ - src.minZ;
  if (srcW < 0.01 || srcD < 0.01) return modules;

  const tgtW = targetBounds.maxX - targetBounds.minX;
  const tgtD = targetBounds.maxZ - targetBounds.minZ;
  const scale = Math.min(
    (tgtW * (1 - marginRatio)) / srcW,
    (tgtD * (1 - marginRatio)) / srcD,
    1,
  );

  const srcCx = (src.minX + src.maxX) / 2;
  const srcCz = (src.minZ + src.maxZ) / 2;
  const tgtCx = (targetBounds.minX + targetBounds.maxX) / 2;
  const tgtCz = (targetBounds.minZ + targetBounds.maxZ) / 2;

  return modules.map((m) => ({
    ...m,
    x: (m.x - srcCx) * scale + tgtCx,
    z: (m.z - srcCz) * scale + tgtCz,
    width: m.width * scale,
    depth: m.depth * scale,
    height: m.height * scale,
  }));
}

/** True when all module footprints sit inside bounds (with tolerance). */
export function modulesFitBounds(
  modules: CabinetModule[],
  bounds: RoomBounds,
  tol = 0.03,
): boolean {
  for (const m of modules) {
    const f = moduleFootprint(m);
    if (
      f.x0 < bounds.minX - tol ||
      f.x1 > bounds.maxX + tol ||
      f.z0 < bounds.minZ - tol ||
      f.z1 > bounds.maxZ + tol
    ) {
      return false;
    }
  }
  return modules.length > 0;
}
