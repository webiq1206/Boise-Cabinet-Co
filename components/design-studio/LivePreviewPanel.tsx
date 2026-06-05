"use client";

import dynamic from "next/dynamic";
import {
  Component,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDesignStudio } from "./DesignStudioProvider";
import { buildPreviewConfig } from "@/lib/design/previewConfig";
import type { CaptureApi, ViewMode } from "./CabinetPreview3D";
import { hardwareSpec, makeResolveModule } from "@/lib/design/resolveDesignStyles";
import { trackDesignEvent } from "@/lib/design/designAnalytics";
import { useIsMobile } from "@/hooks/use-media-query";
import { DOOR_STYLES, DOOR_STYLE_BY_SLUG } from "@/shared/catalog/doorStyles";
import { FINISHES, FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  RotateCcw,
  Box,
  PersonStanding,
  X,
  Camera,
  Video,
} from "lucide-react";

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
  { children: ReactNode; fallback: ReactNode; onFail?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

interface LivePreviewPanelProps {
  className?: string;
  /** When true, render at a taller fixed height (mobile expanded sheet). */
  compact?: boolean;
  /** Skip WebGL mount until user opens preview (mobile). */
  deferMount?: boolean;
}

export function LivePreviewPanel({ className, compact, deferMount }: LivePreviewPanelProps) {
  const isMobile = useIsMobile();
  const {
    design,
    updateModuleOverride,
    resetModuleOverride,
    setSelectedModuleId,
  } = useDesignStudio();
  const [viewMode, setViewMode] = useState<ViewMode>("orbit");
  const [resetSignal, setResetSignal] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [webglRetry, setWebglRetry] = useState(0);
  const captureApiRef = useRef<CaptureApi | null>(null);
  const { toast } = useToast();
  const selectedId = design.selectedModuleId;
  const setSelectedId = setSelectedModuleId;

  const captureFileBase = (design.designName || "boise-cabinet-design")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "boise-cabinet-design";

  const handleScreenshot = () => {
    const url = captureApiRef.current?.screenshot();
    if (!url) {
      toast({
        title: "Couldn't capture image",
        description: "The 3D preview isn't ready yet. Try again in a moment.",
        variant: "destructive",
      });
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = `${captureFileBase}.png`;
    a.click();
    toast({ title: "Screenshot saved" });
  };

  const handleRecord = async () => {
    if (isRecording || !captureApiRef.current) return;
    setIsRecording(true);
    try {
      const blob = await captureApiRef.current.record(4);
      if (!blob || blob.size === 0) {
        toast({
          title: "Couldn't record video",
          description: "Your browser may not support video capture.",
          variant: "destructive",
        });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${captureFileBase}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast({ title: "Turntable video saved" });
    } finally {
      setIsRecording(false);
    }
  };

  const config = useMemo(
    () =>
      buildPreviewConfig(
        design.layout,
        design.finish,
        design.doorStyle,
        design.modules,
      ),
    [design.layout, design.finish, design.doorStyle, design.modules],
  );

  const hardware = useMemo(() => hardwareSpec(design.hardware), [design.hardware]);

  const overrides = design.moduleOverrides;
  const resolveModule = useMemo(() => makeResolveModule(design), [design]);

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

  if (deferMount) {
    return (
      <div
        className={cn(
          "flex flex-col rounded-md border bg-card overflow-hidden aspect-[4/3] items-center justify-center p-6 text-center",
          className,
        )}
        data-testid="panel-live-preview-deferred"
      >
        <p className="text-sm text-muted-foreground">
          Open this panel to load the 3D preview.
        </p>
      </div>
    );
  }

  const webglFallback = (
    <div className="h-full w-full flex flex-col items-center justify-center bg-muted p-6 text-center gap-3">
      <p className="text-sm text-muted-foreground">
        Your browser can&apos;t show the 3D preview. You can still save your design
        and request pricing.
      </p>
      <Button variant="outline" size="sm" onClick={() => setWebglRetry((n) => n + 1)}>
        Try again
      </Button>
    </div>
  );

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
          {!isMobile && (
            <Button
              variant={viewMode === "walk" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("walk")}
              data-testid="button-view-walk"
            >
              <PersonStanding className="h-4 w-4" />
              <span className="hidden sm:inline">Walk</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setResetSignal((s) => s + 1)}
            aria-label="Reset camera"
            data-testid="button-reset-camera"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleScreenshot}
            aria-label="Save screenshot"
            title="Save a screenshot"
            data-testid="button-capture-screenshot"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRecord}
            disabled={isRecording || isMobile}
            aria-label="Record turntable video"
            title={isMobile ? "Video capture not available on mobile" : "Record a rotating video"}
            data-testid="button-capture-video"
            className={isMobile ? "hidden" : undefined}
          >
            {isRecording ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative w-full touch-none",
          compact ? "h-[50dvh] max-h-[420px]" : "aspect-[4/3]",
        )}
      >
        <WebGLBoundary
          key={webglRetry}
          fallback={webglFallback}
          onFail={() => trackDesignEvent("webgl_error")}
        >
          <CabinetScene3D
            config={config}
            mobileQuality={isMobile}
            resolveModule={resolveModule}
            hardware={hardware}
            accessories={design.accessories}
            selectedId={selectedId}
            onSelect={setSelectedId}
            viewMode={viewMode}
            resetSignal={resetSignal}
            roomBounds={design.roomBounds}
            captureApiRef={captureApiRef}
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
          : isMobile
            ? "Pinch to zoom · Drag to orbit · Tap a cabinet to customize."
            : viewMode === "walk"
              ? "Drag to look around · Scroll to move · Tap a cabinet to customize it."
              : "Drag to rotate · Scroll to zoom · Tap a cabinet to customize it."}
      </p>
    </div>
  );
}
