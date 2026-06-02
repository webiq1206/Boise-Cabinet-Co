"use client";

import { useEffect, useRef } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Plus,
  RotateCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";
import {
  cabinetCode,
  computeRoomBounds,
  moduleFootprint,
  type ApplianceType,
  type CabinetModule,
  type ModuleFront,
} from "@/lib/design/previewConfig";
import { optimizeLayout } from "@/lib/design/planAdvisor";

const SCALE = 120; // px per meter
const SNAP = 0.07; // meters
const MIN_W = 0.228; // 9 in
const MAX_W = 1.22; // 48 in
const NUDGE = 0.05; // meters

type DragState =
  | { mode: "move"; id: string; offX: number; offZ: number }
  | { mode: "start" | "end"; id: string; fixed: number; runHorizontal: boolean };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function snapWidthInches(meters: number) {
  const inch = meters / 0.0254;
  const snapped = Math.round(inch / 3) * 3;
  return clamp(snapped * 0.0254, MIN_W, MAX_W);
}

const APPLIANCE_LABEL: Record<ApplianceType, string> = {
  sink: "Sink",
  range: "Range",
  refrigerator: "Fridge",
  dishwasher: "Dishwasher",
};

export function Room2DPlanner({ className }: { className?: string }) {
  const {
    design,
    updateModule,
    removeModule,
    addModule,
    setModules,
    setSelectedModuleId,
  } = useDesignStudio();

  const modules = design.modules;
  const bounds = design.roomBounds ?? computeRoomBounds(modules);
  const selectedId = design.selectedModuleId;
  const selected = modules.find((m) => m.id === selectedId) ?? null;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const roomW = bounds.maxX - bounds.minX;
  const roomD = bounds.maxZ - bounds.minZ;
  const W = roomW * SCALE;
  const H = roomD * SCALE;

  const toPxX = (x: number) => (x - bounds.minX) * SCALE;
  const toPxZ = (z: number) => (z - bounds.minZ) * SCALE;

  /* delete with keyboard when a module is selected */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeModule(selectedId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeModule]);

  function clientToWorld(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, z: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, z: 0 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x / SCALE + bounds.minX, z: pt.y / SCALE + bounds.minZ };
  }

  function snapMove(
    m: CabinetModule,
    nx: number,
    nz: number,
  ): { x: number; z: number } {
    const f = moduleFootprint(m);
    const halfW = f.w / 2;
    const halfD = f.d / 2;
    let x = nx;
    let z = nz;

    // walls
    if (Math.abs(x - halfW - bounds.minX) < SNAP) x = bounds.minX + halfW;
    if (Math.abs(x + halfW - bounds.maxX) < SNAP) x = bounds.maxX - halfW;
    if (Math.abs(z - halfD - bounds.minZ) < SNAP) z = bounds.minZ + halfD;
    if (Math.abs(z + halfD - bounds.maxZ) < SNAP) z = bounds.maxZ - halfD;

    // neighbors
    for (const o of modules) {
      if (o.id === m.id || Boolean(o.isWall) !== Boolean(m.isWall)) continue;
      const fo = moduleFootprint(o);
      const zOverlap = z + halfD > fo.z0 && z - halfD < fo.z1;
      const xOverlap = x + halfW > fo.x0 && x - halfW < fo.x1;
      if (zOverlap) {
        if (Math.abs(x - halfW - fo.x1) < SNAP) x = fo.x1 + halfW;
        if (Math.abs(x + halfW - fo.x0) < SNAP) x = fo.x0 - halfW;
        if (Math.abs(z - halfD - fo.z0) < SNAP) z = fo.z0 + halfD;
        if (Math.abs(z + halfD - fo.z1) < SNAP) z = fo.z1 - halfD;
      }
      if (xOverlap) {
        if (Math.abs(z - halfD - fo.z1) < SNAP) z = fo.z1 + halfD;
        if (Math.abs(z + halfD - fo.z0) < SNAP) z = fo.z0 - halfD;
        if (Math.abs(x - halfW - fo.x0) < SNAP) x = fo.x0 + halfW;
        if (Math.abs(x + halfW - fo.x1) < SNAP) x = fo.x1 - halfW;
      }
    }

    x = clamp(x, bounds.minX + halfW, bounds.maxX - halfW);
    z = clamp(z, bounds.minZ + halfD, bounds.maxZ - halfD);
    return { x, z };
  }

  function onModuleDown(e: React.PointerEvent, m: CabinetModule) {
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    setSelectedModuleId(m.id);
    const w = clientToWorld(e);
    dragRef.current = { mode: "move", id: m.id, offX: w.x - m.x, offZ: w.z - m.z };
  }

  function onHandleDown(
    e: React.PointerEvent,
    m: CabinetModule,
    which: "start" | "end",
  ) {
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    setSelectedModuleId(m.id);
    const runHorizontal = Math.abs(Math.sin(m.facing ?? 0)) <= 0.5;
    const center = runHorizontal ? m.x : m.z;
    const fixed = which === "start" ? center + m.width / 2 : center - m.width / 2;
    dragRef.current = { mode: which, id: m.id, fixed, runHorizontal };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const m = modules.find((mm) => mm.id === d.id);
    if (!m) return;
    const w = clientToWorld(e);

    if (d.mode === "move") {
      const next = snapMove(m, w.x - d.offX, w.z - d.offZ);
      updateModule(d.id, next);
      return;
    }

    // resize: keep the fixed end anchored, snap width to 3 in
    const along = d.runHorizontal ? w.x : w.z;
    let width =
      d.mode === "start" ? d.fixed - along : along - d.fixed;
    width = snapWidthInches(width);
    const center =
      d.mode === "start" ? d.fixed - width / 2 : d.fixed + width / 2;
    updateModule(d.id, d.runHorizontal ? { width, x: center } : { width, z: center });
  }

  function onPointerUp(e: React.PointerEvent) {
    if (dragRef.current) {
      svgRef.current?.releasePointerCapture?.(e.pointerId);
      dragRef.current = null;
    }
  }

  function addCabinet(kind: "base" | "drawers" | "wall") {
    const front: ModuleFront = kind === "drawers" ? "drawers" : "door";
    const m: CabinetModule = {
      id: `custom-${kind}-${Date.now()}`,
      x: (bounds.minX + bounds.maxX) / 2,
      z: (bounds.minZ + bounds.maxZ) / 2,
      width: 0.6,
      height: kind === "wall" ? 0.7 : 0.9,
      depth: 0.6,
      front,
      facing: 0,
      isWall: kind === "wall",
    };
    addModule(m);
  }

  function nudge(dx: number, dz: number) {
    if (!selected) return;
    const f = moduleFootprint(selected);
    const x = clamp(
      selected.x + dx,
      bounds.minX + f.w / 2,
      bounds.maxX - f.w / 2,
    );
    const z = clamp(
      selected.z + dz,
      bounds.minZ + f.d / 2,
      bounds.maxZ - f.d / 2,
    );
    updateModule(selected.id, { x, z });
  }

  function rotateSelected() {
    if (!selected) return;
    const facing = ((selected.facing ?? 0) + Math.PI / 2) % (Math.PI * 2);
    updateModule(selected.id, { facing });
  }

  function setFront(front: ModuleFront) {
    if (!selected) return;
    updateModule(selected.id, { front });
  }

  function setAppliance(value: ApplianceType | "none") {
    if (!selected) return;
    updateModule(selected.id, {
      appliance: value === "none" ? undefined : value,
    });
  }

  const gridLines: number[] = [];
  for (let gx = Math.ceil(bounds.minX * 2) / 2; gx < bounds.maxX; gx += 0.5) {
    gridLines.push(gx);
  }
  const gridZ: number[] = [];
  for (let gz = Math.ceil(bounds.minZ * 2) / 2; gz < bounds.maxZ; gz += 0.5) {
    gridZ.push(gz);
  }

  const bases = modules.filter((m) => !m.isWall);
  const walls = modules.filter((m) => m.isWall);
  const ordered = [...bases, ...walls];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addCabinet("base")}
          data-testid="button-add-base"
        >
          <Plus className="h-4 w-4" /> Base
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addCabinet("drawers")}
          data-testid="button-add-drawers"
        >
          <Plus className="h-4 w-4" /> Drawers
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addCabinet("wall")}
          data-testid="button-add-wall"
        >
          <Plus className="h-4 w-4" /> Wall
        </Button>
        <div className="ml-auto">
          <Button
            type="button"
            size="sm"
            onClick={() => setModules(optimizeLayout(modules, bounds))}
            data-testid="button-optimize"
          >
            <Sparkles className="h-4 w-4" /> Auto-arrange
          </Button>
        </div>
      </div>

      {/* canvas */}
      <div className="w-full overflow-auto rounded-md border bg-card">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="block max-w-full touch-none select-none"
          style={{ touchAction: "none" }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerDown={() => setSelectedModuleId(null)}
          data-testid="svg-room-planner"
        >
          {/* floor */}
          <rect
            x={0}
            y={0}
            width={W}
            height={H}
            fill="hsl(var(--background))"
          />
          {/* grid */}
          {gridLines.map((gx) => (
            <line
              key={`gx-${gx}`}
              x1={toPxX(gx)}
              y1={0}
              x2={toPxX(gx)}
              y2={H}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
          {gridZ.map((gz) => (
            <line
              key={`gz-${gz}`}
              x1={0}
              y1={toPxZ(gz)}
              x2={W}
              y2={toPxZ(gz)}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
          {/* walls outline */}
          <rect
            x={1.5}
            y={1.5}
            width={W - 3}
            height={H - 3}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeOpacity={0.45}
            strokeWidth={3}
          />

          {/* modules */}
          {ordered.map((m) => {
            const f = moduleFootprint(m);
            const x = toPxX(f.x0);
            const y = toPxZ(f.z0);
            const w = f.w * SCALE;
            const h = f.d * SCALE;
            const isSel = m.id === selectedId;
            const isAppliance = Boolean(m.appliance);
            const fill = m.isWall
              ? "hsl(var(--muted-foreground))"
              : isAppliance
                ? "hsl(var(--accent))"
                : "hsl(var(--primary))";
            const fillOpacity = m.isWall ? 0.1 : isAppliance ? 0.28 : 0.16;
            const stroke = isSel
              ? "hsl(var(--primary))"
              : m.isWall
                ? "hsl(var(--muted-foreground))"
                : isAppliance
                  ? "hsl(var(--accent))"
                  : "hsl(var(--primary))";
            // front-edge indicator
            const { dx, dz } = {
              dx: Math.round(Math.sin(m.facing ?? 0)),
              dz: Math.round(Math.cos(m.facing ?? 0)),
            };
            let fx1 = x;
            let fy1 = y;
            let fx2 = x + w;
            let fy2 = y + h;
            if (dz > 0) {
              fy1 = fy2 = y + h;
            } else if (dz < 0) {
              fy1 = fy2 = y;
            } else if (dx > 0) {
              fx1 = fx2 = x + w;
              fy2 = y + h;
            } else {
              fx1 = fx2 = x;
              fy2 = y + h;
            }

            return (
              <g
                key={m.id}
                onPointerDown={(e) => onModuleDown(e, m)}
                style={{ cursor: "grab" }}
                data-testid={`module-${m.id}`}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={2}
                  fill={fill}
                  fillOpacity={fillOpacity}
                  stroke={stroke}
                  strokeWidth={isSel ? 3 : 1.5}
                  strokeDasharray={m.isWall ? "5 4" : undefined}
                />
                {!m.isWall && (
                  <line
                    x1={fx1}
                    y1={fy1}
                    x2={fx2}
                    y2={fy2}
                    stroke={stroke}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                )}
                {w > 34 && h > 22 && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 - 2}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="hsl(var(--foreground))"
                    style={{ pointerEvents: "none" }}
                  >
                    {isAppliance
                      ? APPLIANCE_LABEL[m.appliance as ApplianceType]
                      : cabinetCode(m)}
                  </text>
                )}
                {w > 34 && h > 34 && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 11}
                    textAnchor="middle"
                    fontSize={9}
                    fill="hsl(var(--muted-foreground))"
                    style={{ pointerEvents: "none" }}
                  >
                    {moduleFootprintInches(m)}
                  </text>
                )}

                {/* resize handles */}
                {isSel &&
                  (() => {
                    const runHorizontal =
                      Math.abs(Math.sin(m.facing ?? 0)) <= 0.5;
                    const cx = toPxX(m.x);
                    const cz = toPxZ(m.z);
                    const startPt = runHorizontal
                      ? { hx: toPxX(m.x - m.width / 2), hy: cz }
                      : { hx: cx, hy: toPxZ(m.z - m.width / 2) };
                    const endPt = runHorizontal
                      ? { hx: toPxX(m.x + m.width / 2), hy: cz }
                      : { hx: cx, hy: toPxZ(m.z + m.width / 2) };
                    return (
                      <>
                        {(["start", "end"] as const).map((which) => {
                          const p = which === "start" ? startPt : endPt;
                          return (
                            <g key={which}>
                              <circle
                                cx={p.hx}
                                cy={p.hy}
                                r={13}
                                fill="transparent"
                                onPointerDown={(e) => onHandleDown(e, m, which)}
                                style={{
                                  cursor: runHorizontal
                                    ? "ew-resize"
                                    : "ns-resize",
                                }}
                                data-testid={`handle-${which}-${m.id}`}
                              />
                              <circle
                                cx={p.hx}
                                cy={p.hy}
                                r={5}
                                fill="hsl(var(--background))"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                style={{ pointerEvents: "none" }}
                              />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* selected module controls */}
      {selected ? (
        <div
          className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-3"
          data-testid="panel-selected-module"
        >
          <Badge variant="secondary" data-testid="text-selected-code">
            {selected.appliance
              ? APPLIANCE_LABEL[selected.appliance]
              : cabinetCode(selected)}
          </Badge>
          <span
            className="text-sm text-muted-foreground"
            data-testid="text-selected-size"
          >
            {moduleFootprintInches(selected)}
          </span>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => nudge(-NUDGE, 0)}
              data-testid="button-nudge-left"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => nudge(NUDGE, 0)}
              data-testid="button-nudge-right"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => nudge(0, -NUDGE)}
              data-testid="button-nudge-up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => nudge(0, NUDGE)}
              data-testid="button-nudge-down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={rotateSelected}
              data-testid="button-rotate"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {!selected.isWall && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant={selected.front === "door" ? "default" : "outline"}
                onClick={() => setFront("door")}
                data-testid="button-front-door"
              >
                Door
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selected.front === "drawers" ? "default" : "outline"}
                onClick={() => setFront("drawers")}
                data-testid="button-front-drawers"
              >
                Drawers
              </Button>
            </div>
          )}

          {!selected.isWall && (
            <select
              className="h-8 rounded-md border bg-background px-2 text-sm"
              value={selected.appliance ?? "none"}
              onChange={(e) =>
                setAppliance(e.target.value as ApplianceType | "none")
              }
              data-testid="select-appliance"
            >
              <option value="none">No appliance</option>
              <option value="sink">Sink</option>
              <option value="range">Range</option>
              <option value="refrigerator">Fridge</option>
              <option value="dishwasher">Dishwasher</option>
            </select>
          )}

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="ml-auto text-destructive"
            onClick={() => removeModule(selected.id)}
            data-testid="button-delete-module"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
      ) : (
        <p
          className="text-sm text-muted-foreground"
          data-testid="text-planner-hint"
        >
          {modules.length === 0
            ? "This room is empty. Use Base, Drawers, or Wall above to add cabinets — or pick a layout to start from."
            : "Tap a cabinet to move, resize, or change it. Drag to reposition — it snaps to walls and neighbors."}
        </p>
      )}
    </div>
  );
}

function moduleFootprintInches(m: CabinetModule) {
  const f = moduleFootprint(m);
  const w = Math.round(f.w / 0.0254);
  const d = Math.round(f.d / 0.0254);
  return `${w}" × ${d}"`;
}
