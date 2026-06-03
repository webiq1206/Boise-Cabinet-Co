"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ruler,
  Camera,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useDesignStudio } from "./DesignStudioProvider";
import { RoomScanXR, type RoomScanResult, type ScanMode } from "./RoomScanXR";
import { DesktopScanHandoff } from "./DesktopScanHandoff";
import { RoomPlanImport } from "./RoomPlanImport";
import { RoomSizeDiagram } from "./RoomSizeDiagram";
import { RoomSizeTuner } from "./RoomSizeTuner";
import { RoomAccuracyNotice } from "./RoomAccuracyNotice";
import { RoomPhotoQuickMeasure } from "./RoomPhotoQuickMeasure";
import {
  isScannedRoom,
  roomDimensionAccuracy,
} from "@/lib/design/roomScanGeometry";
import { estimateRoomFromDataUrl } from "@/lib/design/photoRoomEstimate";
import { syncRoomForModules } from "@/lib/design/syncDesignRoom";
import { rankLayoutsForRoom } from "@/lib/design/layoutFit";
import { getLayoutsForRoom, type LayoutSlug } from "@/shared/catalog/layouts";
import type { RoomMeta } from "@/lib/design/roomMeta";
import type { RoomBounds } from "@/lib/design/previewConfig";
import { trackDesignEvent } from "@/lib/design/designAnalytics";
import { checkArSupport } from "@/lib/design/arSupport";
import { scanCopy } from "@/shared/designStudioCopy";
import {
  presetsForRoomType,
  sizeBucketsForRoom,
} from "@/shared/roomSizePresets";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function roomBoundsFromInches(widthIn: number, depthIn: number): RoomBounds {
  const wm = widthIn * 0.0254;
  const dm = depthIn * 0.0254;
  return {
    minX: -wm / 2,
    maxX: wm / 2,
    minZ: -dm / 2,
    maxZ: dm / 2,
  };
}

export function RoomScanPanel() {
  const { design, updateDesign } = useDesignStudio();
  const { toast } = useToast();
  const isDesktop = useIsDesktop();
  const [editing, setEditing] = useState(false);
  const [xrOpen, setXrOpen] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>("corners");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const [arAlert, setArAlert] = useState<string | null>(null);
  const [ceilingIn] = useState(96);
  const [widthIn, setWidthIn] = useState("");
  const [depthIn, setDepthIn] = useState("");
  const [pendingVision, setPendingVision] = useState<{
    roomMeta: RoomMeta;
    roomBounds: RoomBounds;
    image: string;
    confidence: string;
    notes?: string;
  } | null>(null);
  const [lowConfAck, setLowConfAck] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);

  const scanned = isScannedRoom(design.roomMeta) && !editing;
  const meta = design.roomMeta;
  const roomSelected = design.roomType !== null;
  const presets = presetsForRoomType(design.roomType);
  const buckets = sizeBucketsForRoom(design.roomType);
  const hasPhoto = Boolean(design.photoUrl);

  useEffect(() => {
    let cancelled = false;
    void checkArSupport().then((r) => {
      if (!cancelled) setArSupported(r.ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (editing) return;
    const w = design.roomMeta?.widthIn;
    const d = design.roomMeta?.depthIn;
    if (w && w >= 48) setWidthIn(String(w));
    if (d && d >= 48) setDepthIn(String(d));
  }, [design.roomMeta?.widthIn, design.roomMeta?.depthIn, editing]);

  function applyScan(roomMeta: RoomMeta, roomBounds: RoomBounds) {
    const synced = syncRoomForModules({
      layout: design.layout,
      roomType: design.roomType,
      modules: design.modules,
      roomMeta,
    });
    updateDesign({
      ...synced,
      roomBounds,
    });
    if (!design.layout && design.roomType) {
      const layouts = getLayoutsForRoom(design.roomType);
      const best = rankLayoutsForRoom(
        layouts,
        roomMeta,
        design.roomType,
        roomBounds,
      ).find((r) => r.fits);
      if (best) {
        updateDesign({ layout: best.slug as LayoutSlug });
      }
    }
    setEditing(false);
    setWidthIn(String(roomMeta.widthIn));
    setDepthIn(String(roomMeta.depthIn));
    trackDesignEvent("room_size_set", {
      accuracy: roomDimensionAccuracy(roomMeta),
      source: roomMeta.source ?? "unknown",
      method: roomMeta.source ?? "unknown",
    });
  }

  function applyPreset(width: number, depth: number, method: string) {
    const roomMeta: RoomMeta = {
      widthIn: width,
      depthIn: depth,
      ceilingIn,
      obstacles: [],
      userConfirmed: true,
      source: "manual",
      scanConfidence: "medium",
    };
    applyScan(roomMeta, roomBoundsFromInches(width, depth));
    trackDesignEvent("scan_completed", { method });
  }

  function handleXrComplete(result: RoomScanResult) {
    setXrOpen(false);
    applyScan(result.meta, result.roomBounds);
    toast({
      title: scanCopy.roomCaptured,
      description: `${result.meta.widthIn}" × ${result.meta.depthIn}"`,
    });
  }

  async function openAr(mode: ScanMode) {
    setArAlert(null);
    const support = await checkArSupport();
    if (!support.ok) {
      setArAlert(support.reason);
      trackDesignEvent("ar_unsupported");
      return;
    }
    setScanMode(mode);
    setXrOpen(true);
    trackDesignEvent("scan_method", {
      method: mode === "walls" ? "wall-run" : "ar-scan",
    });
  }

  function triggerPhotoPicker() {
    if (!roomSelected) {
      toast({
        title: "Pick a room first",
        description: "Choose which room you're designing above.",
        variant: "destructive",
      });
      return;
    }
    if (isDesktop) {
      handoffRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast({
        title: scanCopy.desktopScanHint,
        description: "Use your phone camera for the best room photo.",
      });
      return;
    }
    fileRef.current?.click();
  }

  async function applyPhotoRoomMeta(
    image: string,
    roomMeta: RoomMeta,
    roomBounds: RoomBounds,
    method: string,
  ) {
    updateDesign({ photoUrl: image });
    if (roomMeta.scanConfidence === "low" || !roomMeta.userConfirmed) {
      trackDesignEvent("vision_scan_low_confidence");
      setPendingVision({
        roomMeta,
        roomBounds,
        image,
        confidence: roomMeta.scanConfidence ?? "low",
        notes: scanCopy.photoFallbackNote,
      });
      return;
    }
    applyScan(roomMeta, roomBounds);
    trackDesignEvent("scan_completed", { method });
    toast({
      title: scanCopy.photoSuccess,
      description: `${roomMeta.widthIn}" × ${roomMeta.depthIn}" - adjust below if needed.`,
    });
  }

  async function handlePhotoScan(file: File) {
    setPhotoLoading(true);
    trackDesignEvent("scan_method", { method: "vision-scan" });
    const image = await fileToDataUrl(file);
    try {
      const res = await fetch("/api/design-studio/scan-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          roomType: design.roomType,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          widthIn: number;
          depthIn: number;
          ceilingIn?: number;
          confidence: "low" | "medium" | "high";
          notes?: string;
          openings?: RoomMeta["obstacles"];
        };
        const roomMeta: RoomMeta = {
          widthIn: data.widthIn,
          depthIn: data.depthIn,
          ceilingIn: data.ceilingIn ?? ceilingIn,
          obstacles: data.openings ?? [],
          userConfirmed: data.confidence !== "low",
          source: "vision-scan",
          scanConfidence: data.confidence,
        };
        await applyPhotoRoomMeta(
          image,
          roomMeta,
          roomBoundsFromInches(data.widthIn, data.depthIn),
          "vision-scan",
        );
        return;
      }
      throw new Error("scan_api_unavailable");
    } catch {
      try {
        const roomMeta = await estimateRoomFromDataUrl(image, design.roomType);
        await applyPhotoRoomMeta(
          image,
          { ...roomMeta, scanConfidence: "medium" },
          roomBoundsFromInches(roomMeta.widthIn, roomMeta.depthIn),
          "vision-scan-fallback",
        );
        toast({
          title: scanCopy.photoFallbackTitle,
          description: scanCopy.photoFallbackNote,
        });
      } catch (e) {
        trackDesignEvent("scan_failed", { method: "vision-scan" });
        toast({
          title: scanCopy.photoFailed,
          description:
            e instanceof Error ? e.message : scanCopy.photoFailedHint,
          variant: "destructive",
        });
      }
    } finally {
      setPhotoLoading(false);
    }
  }

  function applyManualDims() {
    const w = parseInt(widthIn, 10);
    const d = parseInt(depthIn, 10);
    if (w < 48 || d < 48) {
      toast({
        title: scanCopy.manualInvalid,
        variant: "destructive",
      });
      return;
    }
    const roomMeta: RoomMeta = {
      widthIn: w,
      depthIn: d,
      ceilingIn,
      obstacles: design.roomMeta?.obstacles ?? [],
      userConfirmed: true,
      source: "manual",
      scanConfidence: "high",
    };
    applyScan(roomMeta, roomBoundsFromInches(w, d));
    trackDesignEvent("scan_completed", { method: "manual" });
    toast({
      title: scanCopy.roomCaptured,
      description: `${w}" × ${d}"`,
    });
  }

  function startEditing() {
    setEditing(true);
    if (meta) {
      setWidthIn(String(meta.widthIn));
      setDepthIn(String(meta.depthIn));
    }
  }

  const parsedW = parseInt(widthIn, 10) || 0;
  const parsedD = parseInt(depthIn, 10) || 0;
  const canApplyManual = parsedW >= 48 && parsedD >= 48 && roomSelected;

  return (
    <div className="space-y-4" data-testid="room-scan-panel">
      <div ref={handoffRef}>
        <DesktopScanHandoff />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handlePhotoScan(f);
          e.target.value = "";
        }}
      />

      {scanned && meta ? (
        <div className="space-y-4">
          <RoomAccuracyNotice meta={meta} />
          <div className="flex items-start gap-3 rounded-md border border-accent/40 bg-accent/10 p-4">
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{scanCopy.roomCaptured}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {meta.widthIn}&quot; × {meta.depthIn}&quot;
                {meta.ceilingIn ? `, ${meta.ceilingIn}" ceiling` : ""} -{" "}
                {meta.source === "ar-scan"
                  ? scanCopy.sourceAr
                  : meta.source === "vision-scan" || meta.source === "photo"
                    ? scanCopy.sourcePhoto
                    : scanCopy.sourceManual}
                .
              </p>
              <Button
                type="button"
                variant="ghost"
                className="h-auto p-0 mt-2 text-sm text-accent underline-offset-4 hover:underline"
                onClick={startEditing}
                data-testid="button-change-room-size"
              >
                {scanCopy.changeSize}
              </Button>
            </div>
          </div>

          {hasPhoto && meta && (
            <div className="rounded-md border bg-card p-4 space-y-4" data-testid="room-photo-review">
              <div>
                <p className="text-sm font-medium">{scanCopy.photoReviewTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {scanCopy.photoReviewHint}
                </p>
              </div>
              <RoomPhotoQuickMeasure />
              <RoomSizeTuner roomMeta={meta} onApply={applyScan} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={triggerPhotoPicker}
              >
                <Camera className="h-4 w-4" />
                Replace photo
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-5">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-accent" />
              {scanCopy.photoPrimaryTitle}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {scanCopy.photoPrimaryHint}
            </p>
            <Button
              type="button"
              variant="brand"
              className="w-full min-h-12 mt-4"
              disabled={photoLoading || !roomSelected}
              onClick={triggerPhotoPicker}
              data-testid="button-estimate-from-photo"
            >
              {photoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {photoLoading ? scanCopy.takePhotoLoading : scanCopy.photoPrimaryButton}
            </Button>
            {!roomSelected && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Pick a room type above first.
              </p>
            )}
          </div>

          {buckets.length > 0 && (
            <div className="rounded-md border bg-card p-4 space-y-3">
              <p className="text-sm font-medium">{scanCopy.bucketLabel}</p>
              <p className="text-xs text-muted-foreground">{scanCopy.bucketHint}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {buckets.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    disabled={!roomSelected}
                    onClick={() => applyPreset(b.widthIn, b.depthIn, `bucket-${b.id}`)}
                    className="rounded-md border p-3 text-left hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50 min-h-11"
                    data-testid={`button-bucket-${b.id}`}
                  >
                    <span className="text-sm font-medium block">{b.label}</span>
                    <span className="text-xs text-muted-foreground">{b.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Collapsible open={manualOpen} onOpenChange={setManualOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between min-h-11"
              >
                <span className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  {scanCopy.knowSizeLabel}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${manualOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="rounded-md border bg-card p-4 mt-2 space-y-4">
              <p className="text-xs text-muted-foreground">{scanCopy.typeSizeHint}</p>

              {presets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{scanCopy.presetLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((p) => (
                      <Button
                        key={p.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-10"
                        disabled={!roomSelected}
                        onClick={() => {
                          setWidthIn(String(p.widthIn));
                          setDepthIn(String(p.depthIn));
                          applyPreset(p.widthIn, p.depthIn, `preset-${p.id}`);
                        }}
                        data-testid={`button-preset-${p.id}`}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="manual-w-primary" className="text-xs">
                      {scanCopy.widthLabel}
                    </Label>
                    <Input
                      id="manual-w-primary"
                      type="number"
                      inputMode="numeric"
                      placeholder="144"
                      className="min-h-11 text-base"
                      value={widthIn}
                      disabled={!roomSelected}
                      onChange={(e) => setWidthIn(e.target.value)}
                      data-testid="input-manual-width"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="manual-d-primary" className="text-xs">
                      {scanCopy.depthLabel}
                    </Label>
                    <Input
                      id="manual-d-primary"
                      type="number"
                      inputMode="numeric"
                      placeholder="168"
                      className="min-h-11 text-base"
                      value={depthIn}
                      disabled={!roomSelected}
                      onChange={(e) => setDepthIn(e.target.value)}
                      data-testid="input-manual-depth"
                    />
                  </div>
                </div>
                <RoomSizeDiagram widthIn={parsedW} depthIn={parsedD} />
              </div>

              <Button
                type="button"
                variant="brandOutline"
                className="w-full min-h-11"
                disabled={!canApplyManual}
                onClick={applyManualDims}
                data-testid="button-apply-manual-dims"
              >
                {scanCopy.manualApply}
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {arAlert && (
            <Alert variant="destructive">
              <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>{arAlert}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={triggerPhotoPicker}
                  data-testid="button-scan-from-photo"
                >
                  {scanCopy.arTryPhoto}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
              >
                {scanCopy.typeSizeAdvanced}
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {arSupported && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full min-h-11"
                    disabled={!roomSelected}
                    onClick={() => void openAr("corners")}
                    data-testid="button-ar-floor-measure"
                  >
                    <Smartphone className="h-4 w-4" />
                    {scanCopy.measureWithCamera}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    disabled={!roomSelected}
                    onClick={() => void openAr("walls")}
                    data-testid="button-wall-scan"
                  >
                    {scanCopy.traceWalls}
                  </Button>
                </>
              )}
              <RoomPlanImport
                onImport={(roomMeta, roomBounds) => {
                  applyScan(roomMeta, roomBounds);
                  trackDesignEvent("scan_completed", { method: "roomplan" });
                }}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <RoomScanXR
        open={xrOpen}
        mode={scanMode}
        ceilingIn={ceilingIn}
        onClose={() => setXrOpen(false)}
        onComplete={handleXrComplete}
        onPhotoFallback={() => {
          setXrOpen(false);
          triggerPhotoPicker();
        }}
      />

      <AlertDialog open={!!pendingVision} onOpenChange={() => setPendingVision(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {scanCopy.lowConfidenceTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingVision
                ? scanCopy.lowConfidenceBody(
                    pendingVision.roomMeta.widthIn,
                    pendingVision.roomMeta.depthIn,
                    pendingVision.notes,
                  )
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{scanCopy.lowConfidenceCancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={!lowConfAck}
              onClick={() => {
                if (!pendingVision) return;
                applyScan(
                  { ...pendingVision.roomMeta, userConfirmed: true },
                  pendingVision.roomBounds,
                );
                updateDesign({ photoUrl: pendingVision.image });
                trackDesignEvent("scan_completed", { method: "vision-scan" });
                setPendingVision(null);
                setLowConfAck(false);
              }}
            >
              {scanCopy.lowConfidenceConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
          <label className="flex items-center gap-2 text-sm px-6 pb-4">
            <input
              type="checkbox"
              checked={lowConfAck}
              onChange={(e) => setLowConfAck(e.target.checked)}
              data-testid="checkbox-low-confidence-ack"
            />
            {scanCopy.lowConfidenceAck}
          </label>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
