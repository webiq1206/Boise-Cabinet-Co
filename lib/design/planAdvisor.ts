import {
  moduleFootprint,
  type CabinetModule,
  type RoomBounds,
} from "./previewConfig";
import {
  hasUserRoomDimensions,
  inchesToM,
  obstacleSpansOnWall,
  wallLengthIn,
  type RoomMeta,
  type RoomWallId,
} from "./roomMeta";

export type IssueSeverity = "error" | "warning";

export interface PlanIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  message: string;
  /** Optional one-tap fix returning the corrected module set. */
  fix?: { label: string; apply: (mods: CabinetModule[]) => CabinetModule[] };
}

export interface PlanRecommendation {
  id: string;
  title: string;
  message: string;
  fix?: { label: string; apply: (mods: CabinetModule[]) => CabinetModule[] };
}

const TOL = 0.02;

/* ── geometry helpers ───────────────────────────────────────────────────── */

function overlaps(a: CabinetModule, b: CabinetModule): number {
  const fa = moduleFootprint(a);
  const fb = moduleFootprint(b);
  const ox = Math.min(fa.x1, fb.x1) - Math.max(fa.x0, fb.x0);
  const oz = Math.min(fa.z1, fb.z1) - Math.max(fa.z0, fb.z0);
  if (ox > TOL && oz > TOL) return Math.min(ox, oz);
  return 0;
}

/** Uppers legitimately sit above bases — only compare like with like. */
function samePlane(a: CabinetModule, b: CabinetModule): boolean {
  return Boolean(a.isWall) === Boolean(b.isWall);
}

function frontDir(m: CabinetModule): { dx: number; dz: number } {
  const f = m.facing ?? 0;
  const dx = Math.round(Math.sin(f));
  const dz = Math.round(Math.cos(f));
  return { dx, dz };
}

/** Clearance in front of a module to the nearest in-plane obstacle or wall. */
function frontGap(
  m: CabinetModule,
  others: CabinetModule[],
  bounds: RoomBounds,
): number {
  const f = moduleFootprint(m);
  const { dx, dz } = frontDir(m);
  let gap = Infinity;

  for (const o of others) {
    if (o.id === m.id || !samePlane(m, o)) continue;
    const fo = moduleFootprint(o);
    if (dz > 0 && fo.x1 > f.x0 && fo.x0 < f.x1 && fo.z0 >= f.z1 - TOL) {
      gap = Math.min(gap, fo.z0 - f.z1);
    } else if (dz < 0 && fo.x1 > f.x0 && fo.x0 < f.x1 && fo.z1 <= f.z0 + TOL) {
      gap = Math.min(gap, f.z0 - fo.z1);
    } else if (dx > 0 && fo.z1 > f.z0 && fo.z0 < f.z1 && fo.x0 >= f.x1 - TOL) {
      gap = Math.min(gap, fo.x0 - f.x1);
    } else if (dx < 0 && fo.z1 > f.z0 && fo.z0 < f.z1 && fo.x1 <= f.x0 + TOL) {
      gap = Math.min(gap, f.x0 - fo.x1);
    }
  }

  if (dz > 0) gap = Math.min(gap, bounds.maxZ - f.z1);
  else if (dz < 0) gap = Math.min(gap, f.z0 - bounds.minZ);
  else if (dx > 0) gap = Math.min(gap, bounds.maxX - f.x1);
  else if (dx < 0) gap = Math.min(gap, f.x0 - bounds.minX);

  return Math.max(0, gap === Infinity ? 99 : gap);
}

function wallDistance(m: CabinetModule, bounds: RoomBounds): number {
  const f = moduleFootprint(m);
  return Math.min(
    f.x0 - bounds.minX,
    bounds.maxX - f.x1,
    f.z0 - bounds.minZ,
    bounds.maxZ - f.z1,
  );
}

function inches(meters: number): number {
  return Math.round(meters / 0.0254);
}

/* ── fixes ──────────────────────────────────────────────────────────────── */

export function clampInside(
  modules: CabinetModule[],
  bounds: RoomBounds,
): CabinetModule[] {
  return modules.map((m) => {
    const f = moduleFootprint(m);
    let dx = 0;
    let dz = 0;
    if (f.x0 < bounds.minX) dx = bounds.minX - f.x0;
    else if (f.x1 > bounds.maxX) dx = bounds.maxX - f.x1;
    if (f.z0 < bounds.minZ) dz = bounds.minZ - f.z0;
    else if (f.z1 > bounds.maxZ) dz = bounds.maxZ - f.z1;
    return dx || dz ? { ...m, x: m.x + dx, z: m.z + dz } : m;
  });
}

export function separateOverlaps(modules: CabinetModule[]): CabinetModule[] {
  const result = modules.map((m) => ({ ...m }));
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        if (!samePlane(a, b)) continue;
        const fa = moduleFootprint(a);
        const fb = moduleFootprint(b);
        const ox = Math.min(fa.x1, fb.x1) - Math.max(fa.x0, fb.x0);
        const oz = Math.min(fa.z1, fb.z1) - Math.max(fa.z0, fb.z0);
        if (ox <= TOL || oz <= TOL) continue;
        moved = true;
        // push apart along the axis of least penetration
        if (ox < oz) {
          const dir = a.x <= b.x ? -1 : 1;
          a.x += (dir * (ox + 0.01)) / 2;
          b.x -= (dir * (ox + 0.01)) / 2;
        } else {
          const dir = a.z <= b.z ? -1 : 1;
          a.z += (dir * (oz + 0.01)) / 2;
          b.z -= (dir * (oz + 0.01)) / 2;
        }
      }
    }
    if (!moved) break;
  }
  return result;
}

/** Snap each near-wall module flush against its closest wall. */
export function snapToWalls(
  modules: CabinetModule[],
  bounds: RoomBounds,
): CabinetModule[] {
  return modules.map((m) => {
    const f = moduleFootprint(m);
    const dBack = f.z0 - bounds.minZ;
    const dFront = bounds.maxZ - f.z1;
    const dLeft = f.x0 - bounds.minX;
    const dRight = bounds.maxX - f.x1;
    const min = Math.min(dBack, dFront, dLeft, dRight);
    if (min > 0.6) return m; // treat as island, leave it
    if (min === dBack) return { ...m, z: m.z - dBack };
    if (min === dFront) return { ...m, z: m.z + dFront };
    if (min === dLeft) return { ...m, x: m.x - dLeft };
    return { ...m, x: m.x + dRight };
  });
}

export function optimizeLayout(
  modules: CabinetModule[],
  bounds: RoomBounds,
): CabinetModule[] {
  let next = snapToWalls(modules, bounds);
  next = clampInside(next, bounds);
  next = separateOverlaps(next);
  next = clampInside(next, bounds);
  return next;
}

/* ── detection ──────────────────────────────────────────────────────────── */

function nearestWall(
  m: CabinetModule,
  bounds: RoomBounds,
): RoomWallId | null {
  const f = moduleFootprint(m);
  const dBack = f.z0 - bounds.minZ;
  const dFront = bounds.maxZ - f.z1;
  const dLeft = f.x0 - bounds.minX;
  const dRight = bounds.maxX - f.x1;
  const min = Math.min(dBack, dFront, dLeft, dRight);
  if (min > 0.25) return null;
  if (min === dBack) return "back";
  if (min === dFront) return "front";
  if (min === dLeft) return "left";
  return "right";
}

function moduleSpanOnWall(
  m: CabinetModule,
  wall: RoomWallId,
): { start: number; end: number } | null {
  const f = moduleFootprint(m);
  if (wall === "back" || wall === "front") {
    return { start: f.x0, end: f.x1 };
  }
  return { start: f.z0, end: f.z1 };
}

function spansOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.end > b.start + TOL && b.end > a.start + TOL;
}

function detectRoomMetaIssues(
  modules: CabinetModule[],
  bounds: RoomBounds,
  roomMeta: RoomMeta,
): PlanIssue[] {
  const issues: PlanIssue[] = [];
  if (!hasUserRoomDimensions(roomMeta)) return issues;

  const walls: RoomWallId[] = ["back", "front", "left", "right"];
  for (const wall of walls) {
    const wallLenM = inchesToM(wallLengthIn(roomMeta, wall));
    const obs = obstacleSpansOnWall(roomMeta, wall, bounds);
    const onWall = modules.filter((m) => nearestWall(m, bounds) === wall);
    if (onWall.length === 0) continue;

    let usedStart = Infinity;
    let usedEnd = -Infinity;
    for (const m of onWall) {
      const span = moduleSpanOnWall(m, wall);
      if (!span) continue;
      usedStart = Math.min(usedStart, span.start);
      usedEnd = Math.max(usedEnd, span.end);

      for (const o of obs) {
        if (spansOverlap(span, o)) {
          issues.push({
            id: `obstacle-${m.id}-${wall}`,
            severity: "error",
            title: "Cabinet overlaps a fixed opening",
            message:
              "This cabinet sits where you marked a window, door, or appliance. Move it or adjust the obstacle in room dimensions.",
          });
          break;
        }
      }
    }

    if (usedStart !== Infinity && usedEnd - usedStart > wallLenM + TOL) {
      issues.push({
        id: `wall-run-${wall}`,
        severity: "error",
        title: "Wall run is too long",
        message: `Cabinets along the ${wall} wall need about ${inches(usedEnd - usedStart)} in but the wall is ${wallLengthIn(roomMeta, wall)} in (minus any openings).`,
      });
    }
  }

  const islands = modules.filter((m) => nearestWall(m, bounds) === null && !m.isWall);
  for (const m of islands) {
    const f = moduleFootprint(m);
    const clearance = Math.min(
      f.x0 - bounds.minX,
      bounds.maxX - f.x1,
      f.z0 - bounds.minZ,
      bounds.maxZ - f.z1,
    );
    if (clearance < 0.85 && clearance > 0) {
      issues.push({
        id: `island-clear-${m.id}`,
        severity: "warning",
        title: "Island may be tight to the wall",
        message: `This island or peninsula has about ${inches(clearance)} in to the nearest wall — aim for 36 in or more for walkways.`,
      });
    }
  }

  return issues;
}

export function detectIssues(
  modules: CabinetModule[],
  bounds: RoomBounds,
  roomMeta?: RoomMeta | null,
): PlanIssue[] {
  const issues: PlanIssue[] = [];
  if (modules.length === 0) return issues;

  // 1. overlaps (error)
  let hasOverlap = false;
  for (let i = 0; i < modules.length && !hasOverlap; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      if (samePlane(modules[i], modules[j]) && overlaps(modules[i], modules[j])) {
        hasOverlap = true;
        break;
      }
    }
  }
  if (hasOverlap) {
    issues.push({
      id: "overlap",
      severity: "error",
      title: "Cabinets are overlapping",
      message:
        "Two or more cabinets are sitting on top of each other. They need their own space along the wall.",
      fix: { label: "Space them out", apply: separateOverlaps },
    });
  }

  // 2. out of bounds (error)
  const outside = modules.some((m) => {
    const f = moduleFootprint(m);
    return (
      f.x0 < bounds.minX - TOL ||
      f.x1 > bounds.maxX + TOL ||
      f.z0 < bounds.minZ - TOL ||
      f.z1 > bounds.maxZ + TOL
    );
  });
  if (outside) {
    issues.push({
      id: "bounds",
      severity: "error",
      title: "A cabinet runs past the wall",
      message:
        "A cabinet extends beyond the room outline. Pull it back inside so it fits the space.",
      fix: {
        label: "Bring it inside",
        apply: (mods) => clampInside(mods, bounds),
      },
    });
  }

  // 3. per-module front clearance (warnings) — at most one per module
  for (const m of modules) {
    if (m.isWall) continue;
    const gap = frontGap(m, modules, bounds);
    const floating = wallDistance(m, bounds) > 0.35;

    if (m.appliance === "refrigerator" && gap < 0.85) {
      issues.push({
        id: `appliance-${m.id}`,
        severity: "warning",
        title: "Fridge door may be blocked",
        message: `Leave about 36 in clear in front of the refrigerator so the door can open. There's about ${inches(gap)} in right now.`,
      });
    } else if (m.appliance === "range" && gap < 0.6) {
      issues.push({
        id: `appliance-${m.id}`,
        severity: "warning",
        title: "Tight space at the range",
        message: `Give the range some breathing room — about ${inches(gap)} in is open in front of it.`,
      });
    } else if (m.appliance && gap < 0.4) {
      issues.push({
        id: `appliance-${m.id}`,
        severity: "warning",
        title: "Appliance is crowded",
        message: `Only about ${inches(gap)} in is open in front of this appliance.`,
      });
    } else if (!m.appliance && m.front === "door" && gap < 0.4) {
      issues.push({
        id: `door-${m.id}`,
        severity: "warning",
        title: "A door can't fully open",
        message: `This cabinet door needs room to swing — there's about ${inches(gap)} in in front of it.`,
      });
    } else if (floating && gap > 0 && gap < 0.85) {
      issues.push({
        id: `walkway-${m.id}`,
        severity: "warning",
        title: "Tight walkway",
        message: `Aim for 36–42 in of walkway. This run leaves about ${inches(gap)} in to pass through.`,
      });
    }
  }

  if (roomMeta) {
    issues.push(...detectRoomMetaIssues(modules, bounds, roomMeta));
  }

  return issues;
}

/* ── recommendations ────────────────────────────────────────────────────── */

function isKitchen(roomType: string | null): boolean {
  return roomType === "kitchen" || roomType === "wet-bar";
}

export function getRecommendations(
  modules: CabinetModule[],
  roomType: string | null,
  accessories: string[],
): PlanRecommendation[] {
  const recs: PlanRecommendation[] = [];
  if (modules.length === 0) return recs;

  const bases = modules.filter((m) => !m.isWall);
  const sink = modules.find((m) => m.appliance === "sink");
  const range = modules.find((m) => m.appliance === "range");
  const hasTrash = accessories.some((a) => /trash|waste/i.test(a));
  const hasLazy = accessories.some((a) => /lazy|corner/i.test(a));

  if (isKitchen(roomType)) {
    if (sink && !hasTrash) {
      recs.push({
        id: "rec-trash",
        title: "Trash by the sink",
        message:
          "Most people prep and clean in the same spot — a pull-out trash next to the sink keeps cleanup quick. You can add it in the Details step.",
      });
    }

    if (range) {
      const neighbor = bases
        .filter((m) => !m.appliance && m.front === "door")
        .sort(
          (a, b) =>
            Math.hypot(a.x - range.x, a.z - range.z) -
            Math.hypot(b.x - range.x, b.z - range.z),
        )[0];
      if (neighbor) {
        recs.push({
          id: "rec-range-drawers",
          title: "Drawers by the range",
          message:
            "Deep drawers beside the cooktop make pots, pans, and lids easy to grab while you cook.",
          fix: {
            label: "Use drawers there",
            apply: (mods) =>
              mods.map((m) =>
                m.id === neighbor.id ? { ...m, front: "drawers" } : m,
              ),
          },
        });
      }
    }

    const hasBackRun = bases.some((m) => Math.abs(Math.sin(m.facing ?? 0)) < 0.5);
    const hasSideRun = bases.some((m) => Math.abs(Math.sin(m.facing ?? 0)) >= 0.5);
    if (hasBackRun && hasSideRun && !hasLazy) {
      recs.push({
        id: "rec-corner",
        title: "Reach the corner",
        message:
          "Corner cabinets hide a lot of space. A lazy Susan or corner pull-out makes the back easy to reach.",
      });
    }
  } else {
    recs.push({
      id: "rec-mix",
      title: "Mix drawers and doors",
      message:
        "A couple of drawer banks alongside doors keeps everyday items within easy reach.",
    });
  }

  recs.push({
    id: "rec-walkway",
    title: "Keep walkways open",
    message:
      "Leave 36–42 in between facing runs (or a run and an island) so two people can pass comfortably.",
  });

  return recs.slice(0, 4);
}
