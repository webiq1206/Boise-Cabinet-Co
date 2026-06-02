"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useMemo, useState } from "react";
import { useDesignStudio } from "./DesignStudioProvider";
import {
  buildPreviewConfig,
  getFinishHex,
  getFinishCategory,
} from "@/lib/design/previewConfig";
import type {
  HardwareSpec,
  ResolvedModuleStyle,
  ViewMode,
} from "./CabinetPreview3D";
import type { CabinetModule } from "@/lib/design/previewConfig";
import { HARDWARE_BY_SLUG } from "@/shared/catalog/hardware";
import { DOOR_STYLES, DOOR_STYLE_BY_SLUG } from "@/shared/catalog/doorStyles";
import { FINISHES, FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, RotateCcw, Box, PersonStanding, X } from "lucide-react";

const CabinetScene3D = dynamic(
  () => import("./CabinetPreview3D").then((m) => m.CabinetScene3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

class WebGLBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

const HARDWARE_FINISH_HEX: Record<string, string> = {
  "matte-black": "#1c1c1c",
  "brushed-nickel": "#b6babf",
  "polished-chrome": "#d9dee3",
  "brushed-gold": "#c6a35a",
  "oil-rubbed-bronze": "#3a2f29",
  stainless: "#c2c6ca",
};

function hardwareSpec(slug: string | null): HardwareSpec {
  const hw = slug ? HARDWARE_BY_SLUG[slug] : undefined;
  if (!hw) return { category: "pull", color: "#1c1c1c" };
  const color = HARDWARE_FINISH_HEX[hw.finish] ?? "#1c1c1c";
  if (hw.category === "knob") return { category: "knob", color };
  if (hw.category === "handleless") return { category: "handleless", color };
  if (hw.category === "pull") return { category: "pull", color };
  return { category: "other", color };
}

interface LivePreviewPanelProps {
  className?: string;
  /** When true, render at a taller fixed height (mobile expanded sheet). */
  compact?: boolean;
}

export function LivePreviewPanel({ className, compact }: LivePreviewPanelProps) {
  const { design, updateModuleOverride, resetModuleOverride } = useDesignStudio();
  const [viewMode, setViewMode] = useState<ViewMode>("orbit");
  const [resetSignal, setResetSignal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const config = useMemo(
    () => buildPreviewConfig(design.layout, design.finish, design.doorStyle),
    [design.layout, design.finish, design.doorStyle],
  );

  const hardware = useMemo(() => hardwareSpec(design.hardware), [design.hardware]);

  const overrides = design.moduleOverrides;
  const resolveModule = useMemo(() => {
    return (module: CabinetModule): ResolvedModuleStyle => {
      const ov = overrides[module.id];
      const finishSlug = ov?.finish ?? design.finish;
      const doorStyle = ov?.doorStyle ?? design.doorStyle ?? "slab";
      return {
        color: getFinishHex(finishSlug),
        category: getFinishCategory(finishSlug),
        doorStyle,
      };
    };
  }, [overrides, design.finish, design.doorStyle]);

  // Clear the selection if the selected module no longer exists (e.g. after a
  // layout change rebuilds the module set).
  useEffect(() => {
    if (selectedId && !config.modules.some((m) => m.id === selectedId)) {
      setSelectedId(null);
    }
  }, [config, selectedId]);

  const selectedOverride = selectedId ? overrides[selectedId] : undefined;
  const selectedIsWall = selectedId?.includes("-wall-");
  const featuredFinishes = FINISHES.slice(0, 10);

  const activeDoorStyle =
    selectedOverride?.doorStyle ?? design.doorStyle ?? "slab";
  const activeFinish = selectedOverride?.finish ?? design.finish;

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border bg-card overflow-hidden",
        className,
      )}
      data-testid="panel-live-preview"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Live preview</span>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "orbit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("orbit")}
            data-testid="button-view-orbit"
          >
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Orbit</span>
          </Button>
          <Button
            variant={viewMode === "walk" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("walk")}
            data-testid="button-view-walk"
          >
            <PersonStanding className="h-4 w-4" />
            <span className="hidden sm:inline">Walk</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setResetSignal((s) => s + 1)}
            aria-label="Reset camera"
            data-testid="button-reset-camera"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={cn("relative w-full", compact ? "h-[44vh]" : "aspect-[4/3]")}>
        <WebGLBoundary
          fallback={
            <div className="h-full w-full flex items-center justify-center bg-muted p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Your browser can&apos;t show the 3D preview. You can still configure
                your design and overlay finishes on a room photo in the Visualize step.
              </p>
            </div>
          }
        >
          <CabinetScene3D
            config={config}
            resolveModule={resolveModule}
            hardware={hardware}
            accessories={design.accessories}
            selectedId={selectedId}
            onSelect={setSelectedId}
            viewMode={viewMode}
            resetSignal={resetSignal}
          />
        </WebGLBoundary>

        {selectedId && (
          <div
            className="absolute inset-x-2 bottom-2 rounded-md border bg-background/95 backdrop-blur p-3 shadow-md"
            data-testid="panel-module-editor"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium">
                {selectedIsWall ? "Wall cabinet" : "Base cabinet"} selected
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                data-testid="button-close-module-editor"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground mb-1">Door style</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {DOOR_STYLES.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() =>
                    updateModuleOverride(selectedId, { doorStyle: d.slug })
                  }
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] transition-colors",
                    activeDoorStyle === d.slug
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/40",
                  )}
                  data-testid={`button-module-door-${d.slug}`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground mb-1">Finish</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {featuredFinishes.map((f) => (
                <button
                  key={f.slug}
                  type="button"
                  onClick={() =>
                    updateModuleOverride(selectedId, { finish: f.slug })
                  }
                  aria-label={f.name}
                  title={f.name}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-transform",
                    activeFinish === f.slug
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : "border-border/60",
                  )}
                  style={{ backgroundColor: f.hexColor }}
                  data-testid={`button-module-finish-${f.slug}`}
                />
              ))}
            </div>

            {selectedOverride && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetModuleOverride(selectedId)}
                data-testid="button-reset-module"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Match overall design
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="px-3 py-2 text-[11px] text-muted-foreground border-t">
        {selectedId
          ? "Adjust this cabinet, or tap empty space to deselect."
          : viewMode === "walk"
            ? "Drag to look around · Scroll to move · Tap a cabinet to customize it."
            : "Drag to rotate · Scroll to zoom · Tap a cabinet to customize it."}
      </p>
    </div>
  );
}
