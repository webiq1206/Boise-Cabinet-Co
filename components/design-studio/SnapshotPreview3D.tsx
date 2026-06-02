"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useMemo } from "react";
import {
  buildPreviewConfig,
  getFinishHex,
  getFinishCategory,
  type CabinetModule,
} from "@/lib/design/previewConfig";
import type {
  HardwareSpec,
  ResolvedModuleStyle,
} from "./CabinetPreview3D";
import type { DesignSnapshot } from "@/lib/design/designSerialization";
import { HARDWARE_BY_SLUG } from "@/shared/catalog/hardware";
import { Loader2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SnapshotPreview3DProps {
  snapshot: DesignSnapshot;
  className?: string;
}

/**
 * Read-only 3D render of a saved design snapshot. No selection, no editing —
 * used by the comparison dialog and the view-only share page.
 */
export function SnapshotPreview3D({ snapshot, className }: SnapshotPreview3DProps) {
  const config = useMemo(
    () =>
      buildPreviewConfig(
        snapshot.layout,
        snapshot.finish,
        snapshot.doorStyle,
        snapshot.modules,
      ),
    [snapshot.layout, snapshot.finish, snapshot.doorStyle, snapshot.modules],
  );

  const hardware = useMemo(
    () => hardwareSpec(snapshot.hardware),
    [snapshot.hardware],
  );

  const overrides = snapshot.moduleOverrides;
  const resolveModule = useMemo(() => {
    return (module: CabinetModule): ResolvedModuleStyle => {
      const ov = overrides[module.id];
      const finishSlug = ov?.finish ?? snapshot.finish;
      const doorStyle = ov?.doorStyle ?? snapshot.doorStyle ?? "slab";
      return {
        color: getFinishHex(finishSlug),
        category: getFinishCategory(finishSlug),
        doorStyle,
      };
    };
  }, [overrides, snapshot.finish, snapshot.doorStyle]);

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <WebGLBoundary
        fallback={
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs">3D preview unavailable</span>
          </div>
        }
      >
        <CabinetScene3D
          config={config}
          resolveModule={resolveModule}
          hardware={hardware}
          accessories={snapshot.accessories}
          selectedId={null}
          onSelect={() => {}}
          viewMode="orbit"
          resetSignal={0}
        />
      </WebGLBoundary>
    </div>
  );
}
