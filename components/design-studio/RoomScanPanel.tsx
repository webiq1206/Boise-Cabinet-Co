"use client";

import { useRef, useState } from "react";
import {
  ScanLine,
  Camera,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronDown,
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
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { syncRoomForModules } from "@/lib/design/syncDesignRoom";
import { rankLayoutsForRoom } from "@/lib/design/layoutFit";
import { getLayoutsForRoom, type LayoutSlug } from "@/shared/catalog/layouts";
import type { RoomMeta } from "@/lib/design/roomMeta";
import type { RoomBounds } from "@/lib/design/previewConfig";
import { trackDesignEvent } from "@/lib/design/designAnalytics";
import { checkArSupport, resolveScanRoute } from "@/lib/design/arSupport";
import { scanCopy } from "@/shared/designStudioCopy";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function RoomScanPanel() {
  const { design, updateDesign } = useDesignStudio();
  const { toast } = useToast();
  const isDesktop = useIsDesktop();
  const [xrOpen, setXrOpen] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>("corners");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [smartScanLoading, setSmartScanLoading] = useState(false);
  const [altOpen, setAltOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [arAlert, setArAlert] = useState<string | null>(null);
  const [ceilingIn] = useState(96);
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

  const scanned = isScannedRoom(design.roomMeta);
  const meta = design.roomMeta;
  const roomSelected = design.roomType !== null;

  function applyScan(roomMeta: RoomMeta, roomBounds: RoomScanResult["roomBounds"]) {
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
    fileRef.current?.click();
  }

  async function handleSmartScan() {
    if (!roomSelected) {
      toast({
        title: "Pick a room first",
        description: "Choose which room you're designing above.",
        variant: "destructive",
      });
      return;
    }

    setSmartScanLoading(true);
    setArAlert(null);
    try {
      const route = await resolveScanRoute(isDesktop);
      if (route === "desktop-handoff") {
        handoffRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        toast({
          title: scanCopy.desktopScanHint,
          description: "Scan the QR code with your phone to measure your room.",
        });
        return;
      }
      if (route === "ar") {
        await openAr("corners");
        return;
      }
      triggerPhotoPicker();
    } finally {
      setSmartScanLoading(false);
    }
  }

  async function handlePhotoScan(file: File) {
    setPhotoLoading(true);
    trackDesignEvent("scan_method", { method: "vision-scan" });
    try {
      const image = await fileToDataUrl(file);
      const res = await fetch("/api/design-studio/scan-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          roomType: design.roomType,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        const msg =
          typeof err.error === "string" ? err.error : scanCopy.photoFailed;
        throw new Error(msg);
      }
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
      const w = roomMeta.widthIn * 0.0254;
      const d = roomMeta.depthIn * 0.0254;
      const roomBounds = {
        minX: -w / 2,
        maxX: w / 2,
        minZ: -d / 2,
        maxZ: d / 2,
      };

      if (data.confidence === "low") {
        trackDesignEvent("vision_scan_low_confidence");
        setPendingVision({
          roomMeta,
          roomBounds,
          image,
          confidence: data.confidence,
          notes: data.notes,
        });
        return;
      }

      applyScan(roomMeta, roomBounds);
      updateDesign({ photoUrl: image });
      trackDesignEvent("scan_completed", { method: "vision-scan" });
      toast({
        title: scanCopy.photoSuccess,
        description: `${data.widthIn}" × ${data.depthIn}"`,
      });
    } catch (e) {
      trackDesignEvent("scan_failed", { method: "vision-scan" });
      toast({
        title: scanCopy.photoFailed,
        description:
          e instanceof Error ? e.message : scanCopy.photoFailedHint,
        variant: "destructive",
      });
    } finally {
      setPhotoLoading(false);
    }
  }

  function applyManualDims() {
    const w = parseInt(String(design.roomMeta?.widthIn ?? 0), 10);
    const d = parseInt(String(design.roomMeta?.depthIn ?? 0), 10);
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
      obstacles: [],
      userConfirmed: true,
      source: "manual",
    };
    const wm = w * 0.0254;
    const dm = d * 0.0254;
    applyScan(roomMeta, {
      minX: -wm / 2,
      maxX: wm / 2,
      minZ: -dm / 2,
      maxZ: dm / 2,
    });
    trackDesignEvent("scan_completed", { method: "manual" });
  }

  const loading = photoLoading || smartScanLoading;

  return (
    <div className="space-y-4" data-testid="room-scan-panel">
      <div ref={handoffRef}>
        <DesktopScanHandoff />
      </div>

      {scanned && meta ? (
        <div className="flex items-start gap-3 rounded-md border border-accent/40 bg-accent/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{scanCopy.roomCaptured}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.widthIn}&quot; × {meta.depthIn}&quot;
              {meta.ceilingIn ? `, ${meta.ceilingIn}" ceiling` : ""} , {" "}
              {meta.source === "ar-scan"
                ? scanCopy.sourceAr
                : meta.source === "vision-scan"
                  ? scanCopy.sourcePhoto
                  : scanCopy.sourceManual}
              .
            </p>
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 mt-2 text-sm text-accent underline-offset-4 hover:underline"
              onClick={() => void handleSmartScan()}
              data-testid="button-start-ar-scan"
            >
              {scanCopy.scanAgain}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border-2 border-dashed border-primary/30 bg-primary/5 p-5">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-accent" />
              {scanCopy.panelTitle}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">{scanCopy.panelHint}</p>
            <p className="text-xs text-muted-foreground mt-1">{scanCopy.typeSizeHint}</p>

            <div className="mt-4 rounded-md border bg-card p-4 space-y-3">
              <p className="text-sm font-medium">{scanCopy.typeSizePrimary}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="manual-w-primary" className="text-xs">
                    Width (in)
                  </Label>
                  <Input
                    id="manual-w-primary"
                    type="number"
                    inputMode="numeric"
                    placeholder="144"
                    className="min-h-11 text-base"
                    defaultValue={design.roomMeta?.widthIn || ""}
                    onChange={(e) =>
                      updateDesign({
                        roomMeta: {
                          widthIn: Number(e.target.value) || 0,
                          depthIn: design.roomMeta?.depthIn ?? 0,
                          obstacles: [],
                          userConfirmed: false,
                          source: "manual",
                        },
                      })
                    }
                    data-testid="input-manual-width"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="manual-d-primary" className="text-xs">
                    Depth (in)
                  </Label>
                  <Input
                    id="manual-d-primary"
                    type="number"
                    inputMode="numeric"
                    placeholder="168"
                    className="min-h-11 text-base"
                    defaultValue={design.roomMeta?.depthIn || ""}
                    onChange={(e) =>
                      updateDesign({
                        roomMeta: {
                          widthIn: design.roomMeta?.widthIn ?? 0,
                          depthIn: Number(e.target.value) || 0,
                          obstacles: [],
                          userConfirmed: false,
                          source: "manual",
                        },
                      })
                    }
                    data-testid="input-manual-depth"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="brandOutline"
                  className="min-h-11 flex-1"
                  disabled={!roomSelected}
                  onClick={applyManualDims}
                  data-testid="button-apply-manual-dims"
                >
                  {scanCopy.manualApply}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 flex-1"
                  disabled={!roomSelected}
                  onClick={() => {
                    updateDesign({
                      roomMeta: {
                        widthIn: 144,
                        depthIn: 168,
                        ceilingIn: 96,
                        obstacles: [],
                        userConfirmed: false,
                        source: "manual",
                      },
                    });
                    const roomMeta: RoomMeta = {
                      widthIn: 144,
                      depthIn: 168,
                      ceilingIn: 96,
                      obstacles: [],
                      userConfirmed: true,
                      source: "manual",
                      scanConfidence: "medium",
                    };
                    const wm = 144 * 0.0254;
                    const dm = 168 * 0.0254;
                    applyScan(roomMeta, {
                      minX: -wm / 2,
                      maxX: wm / 2,
                      minZ: -dm / 2,
                      maxZ: dm / 2,
                    });
                    trackDesignEvent("scan_completed", { method: "typical-preset" });
                  }}
                  data-testid="button-typical-kitchen-size"
                >
                  {scanCopy.typicalKitchen}
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">or scan with your phone</p>

            {arAlert && (
              <Alert variant="destructive" className="mt-4">
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

            <Button
              type="button"
              variant="brand"
              className="w-full mt-4"
              disabled={loading || !roomSelected}
              onClick={() => void handleSmartScan()}
              data-testid="button-smart-scan"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )}
              {loading ? scanCopy.primaryButtonLoading : scanCopy.primaryButton}
            </Button>

            {!roomSelected && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Pick a room type above first.
              </p>
            )}

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

            <Collapsible open={altOpen} onOpenChange={setAltOpen} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground"
                >
                  {scanCopy.tryDifferent}
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transition-transform ${altOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void openAr("corners")}
                >
                  <Smartphone className="h-4 w-4" />
                  {scanCopy.measureWithCamera}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={photoLoading}
                  onClick={triggerPhotoPicker}
                >
                  <Camera className="h-4 w-4" />
                  {scanCopy.takePhoto}
                </Button>

                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-sm"
                    >
                      {scanCopy.typeSizeAdvanced}
                      <ChevronDown
                        className={`h-4 w-4 ml-1 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="rounded-md border p-4 space-y-3 mt-2">
                    <p className="text-sm font-medium">{scanCopy.manualTitle}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="manual-w" className="text-xs">
                          Width
                        </Label>
                        <Input
                          id="manual-w"
                          type="number"
                          placeholder="120"
                          onChange={(e) =>
                            updateDesign({
                              roomMeta: {
                                widthIn: Number(e.target.value) || 0,
                                depthIn: design.roomMeta?.depthIn ?? 0,
                                obstacles: [],
                                userConfirmed: false,
                                source: "manual",
                              },
                            })
                          }
                          data-testid="input-manual-width"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="manual-d" className="text-xs">
                          Depth
                        </Label>
                        <Input
                          id="manual-d"
                          type="number"
                          placeholder="144"
                          onChange={(e) =>
                            updateDesign({
                              roomMeta: {
                                widthIn: design.roomMeta?.widthIn ?? 0,
                                depthIn: Number(e.target.value) || 0,
                                obstacles: [],
                                userConfirmed: false,
                                source: "manual",
                              },
                            })
                          }
                          data-testid="input-manual-depth"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyManualDims}
                      data-testid="button-apply-manual-dims"
                    >
                      {scanCopy.manualApply}
                    </Button>
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => void openAr("walls")}
                  data-testid="button-wall-scan"
                >
                  {scanCopy.traceWalls}
                </Button>

                <RoomPlanImport
                  onImport={(roomMeta, roomBounds) => {
                    applyScan(roomMeta, roomBounds);
                    trackDesignEvent("scan_completed", { method: "roomplan" });
                  }}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </>
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
