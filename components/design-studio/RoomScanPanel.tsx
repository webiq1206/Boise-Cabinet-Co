"use client";

import { useRef, useState } from "react";
import {
  ScanLine,
  Camera,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SCAN_CORNER_LABELS } from "@/lib/design/roomScanGeometry";

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
  const [xrOpen, setXrOpen] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>("corners");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [ceilingIn, setCeilingIn] = useState(96);
  const [pendingVision, setPendingVision] = useState<{
    roomMeta: RoomMeta;
    roomBounds: RoomBounds;
    image: string;
    confidence: string;
    notes?: string;
  } | null>(null);
  const [lowConfAck, setLowConfAck] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const scanned = isScannedRoom(design.roomMeta);
  const meta = design.roomMeta;

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
      title: "Room scanned",
      description: `${result.meta.widthIn}" × ${result.meta.depthIn}" captured.`,
    });
  }

  function openAr(mode: ScanMode) {
    setScanMode(mode);
    setXrOpen(true);
    trackDesignEvent("scan_method", { method: mode === "walls" ? "wall-run" : "ar-scan" });
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
          typeof err.error === "string" ? err.error : "Photo scan failed";
        if (res.status === 503) {
          throw new Error(
            `${msg} Use phone AR scan, or enter W×D from a laser measure below.`,
          );
        }
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
        title: "Room estimated from photo",
        description: `${data.widthIn}" × ${data.depthIn}" (${data.confidence} confidence).`,
      });
    } catch (e) {
      toast({
        title: "Could not scan photo",
        description: e instanceof Error ? e.message : "Try AR scan on your phone.",
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
        title: "Enter valid dimensions",
        description: "Width and depth must be at least 48 inches.",
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

  return (
    <div className="space-y-4" data-testid="room-scan-panel">
      <DesktopScanHandoff />

      {scanned && meta ? (
        <div className="flex items-start gap-3 rounded-md border border-accent/40 bg-accent/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Room captured</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.widthIn}&quot; × {meta.depthIn}&quot;
              {meta.ceilingIn ? `, ${meta.ceilingIn}" ceiling` : ""} —{" "}
              {meta.source === "ar-scan"
                ? "measured in AR"
                : meta.source === "vision-scan"
                  ? `photo estimate${meta.scanConfidence ? ` (${meta.scanConfidence})` : ""}`
                  : "entered manually"}
              .
            </p>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 mt-2 text-sm"
              onClick={() => openAr("corners")}
            >
              Scan again
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border-2 border-dashed border-primary/30 bg-primary/5 p-5">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-accent" />
              Scan your room first
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Measure your real floor in AR (best on phone) or from a wide room photo.
              Layouts are ranked to fit this space—not generic template sizes.
            </p>

            <ol className="mt-4 space-y-1 text-sm list-decimal list-inside text-muted-foreground">
              {SCAN_CORNER_LABELS.map((label) => (
                <li key={label}>
                  Tap <span className="font-medium text-foreground">{label}</span> where
                  walls meet the floor
                </li>
              ))}
            </ol>

            <div className="grid gap-3 sm:grid-cols-2 mt-4 max-w-xs">
              <div className="space-y-1.5">
                <Label htmlFor="ceiling-in" className="text-xs">
                  Ceiling height (in)
                </Label>
                <Input
                  id="ceiling-in"
                  type="number"
                  min={84}
                  max={144}
                  value={ceilingIn}
                  onChange={(e) => setCeilingIn(Number(e.target.value) || 96)}
                  data-testid="input-ceiling-height"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                type="button"
                variant="brand"
                className="flex-1"
                onClick={() => openAr("corners")}
                data-testid="button-start-ar-scan"
              >
                <Smartphone className="h-4 w-4" />
                Scan with phone AR
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={photoLoading}
                onClick={() => fileRef.current?.click()}
                data-testid="button-scan-from-photo"
              >
                {photoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                Scan from photo
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2 text-sm"
              onClick={() => openAr("walls")}
              data-testid="button-wall-scan"
            >
              L- or U-shaped room? Trace wall outline (6+ points)
            </Button>

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
          </div>

          <RoomPlanImport
            onImport={(roomMeta, roomBounds) => {
              applyScan(roomMeta, roomBounds);
              trackDesignEvent("scan_completed", { method: "roomplan" });
            }}
          />

          <div className="rounded-md border p-4 space-y-3">
            <p className="text-sm font-medium">No photo API? Enter W × D (inches)</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
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
              Use these dimensions
            </Button>
          </div>
        </>
      )}

      <RoomScanXR
        open={xrOpen}
        mode={scanMode}
        ceilingIn={ceilingIn}
        onClose={() => setXrOpen(false)}
        onComplete={handleXrComplete}
      />

      <AlertDialog open={!!pendingVision} onOpenChange={() => setPendingVision(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Low confidence estimate
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingVision
                ? `Photo scan suggests ${pendingVision.roomMeta.widthIn}" × ${pendingVision.roomMeta.depthIn}" with low confidence. ${pendingVision.notes ?? "Confirm or re-scan in AR for better accuracy."}`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
              Use estimate anyway
            </AlertDialogAction>
          </AlertDialogFooter>
          <label className="flex items-center gap-2 text-sm px-6 pb-4">
            <input
              type="checkbox"
              checked={lowConfAck}
              onChange={(e) => setLowConfAck(e.target.checked)}
              data-testid="checkbox-low-confidence-ack"
            />
            I understand this is approximate — site measure required
          </label>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
