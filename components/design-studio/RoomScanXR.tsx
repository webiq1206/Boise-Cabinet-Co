"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RotateCcw, Undo2, X } from "lucide-react";
import {
  boundsFromScanPoints,
  SCAN_CORNERS_REQUIRED,
  type ScanPoint3,
} from "@/lib/design/roomScanGeometry";
import {
  roomMetaFromWallPoints,
  WALL_SCAN_MIN_POINTS,
} from "@/lib/design/wallScanGeometry";
import type { RoomBounds } from "@/lib/design/previewConfig";
import type { RoomMeta } from "@/lib/design/roomMeta";
import { trackDesignEvent } from "@/lib/design/designAnalytics";
import { scanCopy, SCAN_CORNER_USER_LABELS } from "@/shared/designStudioCopy";
import { RoomScanFloorHint } from "./RoomScanFloorHint";

type XRNavigator = Navigator & {
  xr?: XRSystem;
};

export type ScanMode = "corners" | "walls";

export interface RoomScanResult {
  meta: RoomMeta;
  roomBounds: RoomBounds;
  points: ScanPoint3[];
}

interface RoomScanXRProps {
  open: boolean;
  mode?: ScanMode;
  ceilingIn?: number;
  onClose: () => void;
  onComplete: (result: RoomScanResult) => void;
  onPhotoFallback?: () => void;
}

export function RoomScanXR({
  open,
  mode = "corners",
  ceilingIn = 96,
  onClose,
  onComplete,
  onPhotoFallback,
}: RoomScanXRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finishScanRef = useRef<() => void>(() => {});
  const undoCornerRef = useRef<() => void>(() => {});
  const resetScanRef = useRef<() => void>(() => {});

  const requiredPoints =
    mode === "walls" ? WALL_SCAN_MIN_POINTS : SCAN_CORNERS_REQUIRED;

  const [status, setStatus] = useState<
    "idle" | "checking" | "scanning" | "unsupported" | "error"
  >("idle");
  const [cornerCount, setCornerCount] = useState(0);
  const [message, setMessage] = useState("");

  const cleanupRef = useRef<(() => void) | null>(null);

  const stopSession = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  const finishScan = useCallback(() => {
    finishScanRef.current();
  }, []);

  const undoCorner = useCallback(() => {
    undoCornerRef.current();
  }, []);

  const resetScan = useCallback(() => {
    resetScanRef.current();
  }, []);

  useEffect(() => {
    if (!open) {
      stopSession();
      setStatus("idle");
      setCornerCount(0);
      return;
    }

    trackDesignEvent("scan_started", {
      method: mode === "walls" ? "wall-run" : "ar",
    });

    let cancelled = false;

    async function start() {
      setStatus("checking");
      setMessage("Starting camera…");

      const nav = navigator as XRNavigator;
      if (!nav.xr) {
        setStatus("unsupported");
        setMessage(scanCopy.arUnavailable);
        trackDesignEvent("ar_unsupported");
        return;
      }

      try {
        const supported = await nav.xr.isSessionSupported("immersive-ar");
        if (!supported) {
          setStatus("unsupported");
          setMessage(scanCopy.arUnavailable);
          trackDesignEvent("ar_unsupported");
          return;
        }
      } catch {
        setStatus("unsupported");
        setMessage(scanCopy.arUnavailable);
        trackDesignEvent("ar_unsupported");
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      setStatus("scanning");
      setMessage(
        mode === "walls"
          ? `Tap ${WALL_SCAN_MIN_POINTS}+ points along your floor outline.`
          : scanCopy.arInstructionFirst,
      );

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 20);
      camera.matrixAutoUpdate = false;

      const markerGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xc4a882 });
      const cornerPoints: ScanPoint3[] = [];
      const markers: THREE.Mesh[] = [];

      let session: XRSession;
      let refSpace: XRReferenceSpace;
      let hitTestSource: XRHitTestSource | null = null;

      try {
        session = await nav.xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test", "local-floor"],
        });
      } catch (e) {
        setStatus("error");
        setMessage(
          e instanceof Error ? e.message : scanCopy.arUnavailable,
        );
        renderer.dispose();
        return;
      }

      try {
        await renderer.xr.setSession(session);
        refSpace = await session.requestReferenceSpace("local-floor");
        const viewerSpace = await session.requestReferenceSpace("viewer");
        if (!session.requestHitTestSource) throw new Error(scanCopy.arUnavailable);
        const source = await session.requestHitTestSource({ space: viewerSpace });
        if (!source) throw new Error(scanCopy.arUnavailable);
        hitTestSource = source;
      } catch (error) {
        await session.end().catch(() => {});
        renderer.dispose();
        markerGeo.dispose();
        markerMat.dispose();
        setStatus("error");
        setMessage(error instanceof Error ? error.message : scanCopy.arUnavailable);
        return;
      }

      const updateMessage = (count: number) => {
        if (mode === "walls") {
          setMessage(
            count >= WALL_SCAN_MIN_POINTS
              ? "Outline captured. Tap Done."
              : `Point ${count}, keep tapping along walls (${WALL_SCAN_MIN_POINTS} minimum).`,
          );
          return;
        }
        if (count >= SCAN_CORNERS_REQUIRED) {
          setMessage(scanCopy.arAllDone);
          return;
        }
        const label = SCAN_CORNER_USER_LABELS[count] ?? "corner";
        setMessage(scanCopy.arInstructionNext(label, count + 1, SCAN_CORNERS_REQUIRED));
      };

      const onSelect = (event: XRInputSourceEvent) => {
        const frame = event.frame;
        if (!hitTestSource) return;
        const results = frame.getHitTestResults(hitTestSource);
        if (results.length === 0) return;

        const pose = results[0].getPose(refSpace);
        if (!pose) return;

        const x = pose.transform.position.x;
        const y = pose.transform.position.y;
        const z = pose.transform.position.z;

        cornerPoints.push({ x, y, z });
        const mesh = new THREE.Mesh(markerGeo, markerMat.clone());
        mesh.position.set(x, y, z);
        scene.add(mesh);
        markers.push(mesh);
        setCornerCount(cornerPoints.length);
        updateMessage(cornerPoints.length);
      };

      session.addEventListener("select", onSelect);

      undoCornerRef.current = () => {
        if (cornerPoints.length === 0) return;
        cornerPoints.pop();
        const mesh = markers.pop();
        if (mesh) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
        setCornerCount(cornerPoints.length);
        updateMessage(cornerPoints.length);
      };

      resetScanRef.current = () => {
        while (cornerPoints.length > 0) undoCornerRef.current();
      };

      finishScanRef.current = () => {
        if (cornerPoints.length < requiredPoints) {
          setMessage(scanCopy.arNeedMore(requiredPoints - cornerPoints.length));
          return;
        }
        if (mode === "walls") {
          const wallResult = roomMetaFromWallPoints(cornerPoints, { ceilingIn });
          if (!wallResult) {
            setMessage(scanCopy.arTooSmall);
            return;
          }
          stopSession();
          trackDesignEvent("scan_completed", {
            method: "wall-run",
            widthIn: wallResult.meta.widthIn,
            depthIn: wallResult.meta.depthIn,
          });
          onComplete({
            meta: wallResult.meta,
            roomBounds: wallResult.roomBounds,
            points: cornerPoints,
          });
          return;
        }

        const cornerResult = boundsFromScanPoints(cornerPoints);
        if (!cornerResult) {
          setMessage(scanCopy.arTooSmall);
          return;
        }
        const meta = { ...cornerResult.meta, ceilingIn };
        stopSession();
        trackDesignEvent("scan_completed", {
          method: "ar-scan",
          widthIn: meta.widthIn,
          depthIn: meta.depthIn,
        });
        onComplete({
          meta,
          roomBounds: cornerResult.roomBounds,
          points: cornerPoints,
        });
      };

      const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      onResize();
      window.addEventListener("resize", onResize);

      const loop = (_t: number, frame?: XRFrame) => {
        if (!frame) return;
        const pose = frame.getViewerPose(refSpace);
        if (pose) {
          const view = pose.views[0];
          if (view) {
            camera.matrix.fromArray(view.transform.matrix);
            camera.projectionMatrix.fromArray(view.projectionMatrix);
          }
        }
        renderer.render(scene, camera);
      };

      renderer.setAnimationLoop(loop);

      cleanupRef.current = () => {
        session.removeEventListener("select", onSelect);
        window.removeEventListener("resize", onResize);
        renderer.setAnimationLoop(null);
        session.end().catch(() => {});
        renderer.dispose();
        markerGeo.dispose();
        markerMat.dispose();
        markers.forEach((m) => {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        });
      };
    }

    void start();

    return () => {
      cancelled = true;
      stopSession();
      finishScanRef.current = () => {};
      undoCornerRef.current = () => {};
      resetScanRef.current = () => {};
    };
  }, [open, mode, ceilingIn, onComplete, stopSession]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      data-testid="room-scan-xr"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="flex items-center justify-between p-4 pointer-events-auto bg-gradient-to-b from-black/70 to-transparent">
          <p className="text-white text-sm font-medium max-w-[70%]">{message}</p>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => {
              stopSession();
              onClose();
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {status === "scanning" && mode === "corners" && (
          <div className="pointer-events-none text-white/80 text-center text-xs mt-2">
            <RoomScanFloorHint />
            <p>{scanCopy.standInDoorway}</p>
          </div>
        )}
        <div className="flex-1" />
        <div className="p-4 pb-8 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent space-y-3">
          {status === "scanning" && (
            <p className="text-white/90 text-center text-sm">
              {scanCopy.cornerProgress(cornerCount, requiredPoints)}
            </p>
          )}
          {status === "checking" && (
            <div className="flex justify-center text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {status === "scanning" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/40 text-white hover:bg-white/10"
                  disabled={cornerCount === 0}
                  onClick={undoCorner}
                  data-testid="button-scan-undo"
                >
                  <Undo2 className="h-4 w-4" />
                  {scanCopy.arUndo}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/40 text-white hover:bg-white/10"
                  disabled={cornerCount === 0}
                  onClick={resetScan}
                  data-testid="button-scan-reset"
                >
                  <RotateCcw className="h-4 w-4" />
                  {scanCopy.arReset}
                </Button>
              </div>
              <Button
                type="button"
                variant="brand"
                className="w-full"
                disabled={cornerCount < requiredPoints}
                onClick={finishScan}
                data-testid="button-scan-done"
              >
                {scanCopy.arDone}
              </Button>
            </div>
          )}
          {(status === "unsupported" || status === "error") && (
            <div className="flex flex-col gap-2">
              {onPhotoFallback && (
                <Button
                  type="button"
                  variant="brand"
                  className="w-full"
                  onClick={onPhotoFallback}
                  data-testid="button-ar-photo-fallback"
                >
                  <Camera className="h-4 w-4" />
                  {scanCopy.arTryPhoto}
                </Button>
              )}
              <Button type="button" variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
