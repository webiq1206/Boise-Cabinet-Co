"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { View, Loader2, Smartphone, Download, Ruler, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDesignStudio } from "./DesignStudioProvider";
import {
  buildConfigFromDesign,
  makeResolveModule,
  hardwareSpec,
} from "@/lib/design/resolveDesignStyles";
import { buildCabinetGroup } from "@/lib/design/cabinetModelBuilder";
import {
  exportGLB,
  exportUSDZ,
  bytesToBase64,
} from "@/lib/design/modelExport";
import { hasUserRoomDimensions } from "@/lib/design/roomMeta";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { buildLayoutSummary } from "@/lib/design/layoutSummary";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { detectIssues } from "@/lib/design/planAdvisor";

type Platform = "ios" | "android" | "unsupported" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) {
    const a = document.createElement("a");
    const supportsAR =
      a.relList && typeof a.relList.supports === "function"
        ? a.relList.supports("ar")
        : false;
    return supportsAR ? "ios" : "unsupported";
  }
  if (/android/i.test(ua)) return "android";
  return "unsupported";
}

interface UploadedUrls {
  glbUrl: string;
  usdzUrl: string;
}

export function ARLauncher({ className }: { className?: string }) {
  const { design } = useDesignStudio();
  const { toast } = useToast();
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState<UploadedUrls | null>(null);
  const [preflightOpen, setPreflightOpen] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const summary = buildLayoutSummary({
    modules: design.modules,
    roomBounds: design.roomBounds,
    roomMeta: design.roomMeta,
    layout: design.layout,
  });
  const bounds = resolveRoomBounds(
    design.modules,
    design.roomBounds,
    design.roomMeta,
  );
  const arIssues = detectIssues(design.modules, bounds, design.roomMeta);
  const errorCount = arIssues.filter((i) => i.severity === "error").length;
  const roomDimsSet = hasUserRoomDimensions(design.roomMeta);
  const scanned = isScannedRoom(design.roomMeta);

  async function buildAndUpload(): Promise<UploadedUrls> {
    const config = buildConfigFromDesign(design);
    if (!config.modules.length) {
      throw new Error("Add some cabinets to your layout first.");
    }
    const group = buildCabinetGroup({
      config,
      resolveModule: makeResolveModule(design),
      hardware: hardwareSpec(design.hardware),
      accessories: design.accessories,
      includeScaleReference: true,
    });

    const [glbBuffer, usdzBytes] = await Promise.all([
      exportGLB(group),
      exportUSDZ(group),
    ]);

    const res = await fetch("/api/ar-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        glb: bytesToBase64(glbBuffer),
        usdz: bytesToBase64(usdzBytes),
        name: design.designName || "Cabinet design",
      }),
    });
    if (!res.ok) {
      throw new Error("We couldn't prepare the AR model. Please try again.");
    }
    const { id } = (await res.json()) as { id: string };
    const origin = window.location.origin;
    return {
      glbUrl: `${origin}/api/ar-models/${id}/model.glb`,
      usdzUrl: `${origin}/api/ar-models/${id}/model.usdz`,
    };
  }

  function launchIOS(usdzUrl: string) {
    const a = document.createElement("a");
    a.setAttribute("rel", "ar");
    a.appendChild(document.createElement("img"));
    a.href = usdzUrl;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
  }

  function launchAndroid(glbUrl: string) {
    const title = encodeURIComponent(design.designName || "Cabinet design");
    const file = encodeURIComponent(glbUrl);
    const fallbackUrl = encodeURIComponent(glbUrl);
    const intentUrl =
      `intent://arvr.google.com/scene-viewer/1.0?file=${file}` +
      `&mode=ar_preferred&title=${title}` +
      `#Intent;scheme=https;package=com.google.ar.core;` +
      `action=android.intent.action.VIEW;` +
      `S.browser_fallback_url=${fallbackUrl};end;`;
    window.location.href = intentUrl;
  }

  async function runArLaunch() {
    setPreflightOpen(false);
    setLoading(true);
    try {
      const urls = await buildAndUpload();
      if (platform === "ios") {
        launchIOS(urls.usdzUrl);
      } else if (platform === "android") {
        launchAndroid(urls.glbUrl);
      } else {
        setFallback(urls);
      }
    } catch (err) {
      toast({
        title: "Couldn't open AR view",
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong preparing the 3D model.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleLaunchClick() {
    if (!design.modules.length) {
      toast({
        title: "No cabinets yet",
        description: "Add cabinets in the Layout step first.",
        variant: "destructive",
      });
      return;
    }
    setPreflightOpen(true);
  }

  const supportLabel =
    platform === "ios"
      ? "Opens in AR Quick Look, true-scale cabinets + 12 in reference"
      : platform === "android"
        ? "Opens in Google Scene Viewer, true-scale cabinets"
        : "Best on a phone or tablet";

  return (
    <div className={className}>
      <Button
        type="button"
        variant="brand"
        onClick={handleLaunchClick}
        disabled={loading}
        data-testid="button-view-in-room"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <View className="h-4 w-4" />
        )}
        View in your room
      </Button>
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
        <Smartphone className="h-3.5 w-3.5" />
        {supportLabel}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Visual only, does not measure your room. Compare the grey 12&quot;
        square to a real foot ruler when placing.
      </p>

      <Dialog open={preflightOpen} onOpenChange={setPreflightOpen}>
        <DialogContent data-testid="dialog-ar-preflight">
          <DialogHeader>
            <DialogTitle>Before AR preview</DialogTitle>
            <DialogDescription>
              Cabinets export at the same sizes as your 2D plan. AR does not scan
              walls or confirm fit, it helps you visualize finish and scale.
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <Ruler className="h-4 w-4 shrink-0" />
              {scanned
                ? `Scanned room (${summary.scanSource ?? "scan"}): ${summary.roomWidthIn}" × ${summary.roomDepthIn}"${summary.scanConfidence ? `, ${summary.scanConfidence} confidence` : ""}`
                : roomDimsSet
                  ? `Room: ${summary.roomWidthIn}" × ${summary.roomDepthIn}"`
                  : "Scan your room in the wizard for fit-aware layout checks."}
            </li>
            <li>
              ~{summary.approximateLinearFeet} linear ft of base cabinets (
              {summary.moduleCount} modules), planning estimate only.
            </li>
            {errorCount > 0 && (
              <li className="flex gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {errorCount} layout error{errorCount === 1 ? "" : "s"} in the
                planner, fix in Layout before ordering.
              </li>
            )}
          </ul>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPreflightOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="brand"
              onClick={() => void runArLaunch()}
              disabled={loading}
              data-testid="button-ar-continue"
            >
              Continue to AR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fallback} onOpenChange={(o) => !o && setFallback(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View in your room on a phone</DialogTitle>
            <DialogDescription>
              Augmented reality needs a phone or tablet camera. Open this page on
              your iPhone, iPad, or Android device to place true-scale cabinets , 
              or download the 3D model.
            </DialogDescription>
          </DialogHeader>
          {fallback && (
            <div className="flex flex-col gap-2">
              <a
                href={fallback.glbUrl}
                download="cabinet-design.glb"
                className="w-full"
                data-testid="link-download-glb"
              >
                <Button type="button" variant="outline" className="w-full">
                  <Download className="h-4 w-4" />
                  Download 3D model (.glb)
                </Button>
              </a>
              <a
                href={fallback.usdzUrl}
                download="cabinet-design.usdz"
                className="w-full"
                data-testid="link-download-usdz"
              >
                <Button type="button" variant="outline" className="w-full">
                  <Download className="h-4 w-4" />
                  Download for Apple devices (.usdz)
                </Button>
              </a>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFallback(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
