"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  ImageIcon,
  Download,
  RotateCcw,
  Wand2,
  Loader2,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDesignStudio } from "./DesignStudioProvider";
import {
  buildConfigFromDesign,
  makeResolveModule,
  hardwareSpec,
} from "@/lib/design/resolveDesignStyles";
import { renderCabinetCutout } from "@/lib/design/cabinetModelBuilder";
import {
  DEFAULT_PHOTO_OVERLAY_TRANSFORM,
  normalizePhotoOverlayTransform,
  type PhotoOverlayTransform,
} from "@/lib/design/photoOverlayTransform";

interface RoomPhotoOverlayProps {
  photoUrl: string | null;
  finishColor: string;
  onPhotoChange: (url: string | null) => void;
  className?: string;
}

type Transform = Omit<PhotoOverlayTransform, "opacity">;

const BASE_WIDTH_PCT = 62; // overlay width as % of the photo before scaling

function transformFromDesign(
  saved: PhotoOverlayTransform | null | undefined,
): { transform: Transform; opacity: number } {
  const n = normalizePhotoOverlayTransform(saved);
  if (!n) {
    return {
      transform: {
        xPct: DEFAULT_PHOTO_OVERLAY_TRANSFORM.xPct,
        yPct: DEFAULT_PHOTO_OVERLAY_TRANSFORM.yPct,
        scale: DEFAULT_PHOTO_OVERLAY_TRANSFORM.scale,
        tilt: DEFAULT_PHOTO_OVERLAY_TRANSFORM.tilt,
        turn: DEFAULT_PHOTO_OVERLAY_TRANSFORM.turn,
      },
      opacity: DEFAULT_PHOTO_OVERLAY_TRANSFORM.opacity,
    };
  }
  const { opacity, ...transform } = n;
  return { transform, opacity };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function RoomPhotoOverlay({
  photoUrl,
  finishColor,
  onPhotoChange,
  className,
}: RoomPhotoOverlayProps) {
  const { design, updateDesign } = useDesignStudio();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ active: boolean }>({ active: false });
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initial = transformFromDesign(design.photoOverlayTransform);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [cutoutFailed, setCutoutFailed] = useState(false);
  const [opacity, setOpacity] = useState(initial.opacity);
  const [transform, setTransform] = useState<Transform>(initial.transform);

  useEffect(() => {
    const next = transformFromDesign(design.photoOverlayTransform);
    setTransform(next.transform);
    setOpacity(next.opacity);
  }, [design.photoOverlayTransform]);

  const persistOverlay = useCallback(
    (t: Transform, op: number) => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        updateDesign({
          photoOverlayTransform: { ...t, opacity: op },
        });
      }, 350);
    },
    [updateDesign],
  );

  const setTransformPersist: Dispatch<SetStateAction<Transform>> = useCallback(
    (action) => {
      setTransform((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        persistOverlay(next, opacity);
        return next;
      });
    },
    [opacity, persistOverlay],
  );

  const setOpacityPersist = useCallback(
    (op: number) => {
      setOpacity(op);
      persistOverlay(transform, op);
    },
    [transform, persistOverlay],
  );

  useEffect(() => {
    const w = design.roomMeta?.widthIn;
    if (!w || w < 48) return;
    const scale = Math.min(1.15, Math.max(0.4, (w / 132) * 0.65));
    setTransformPersist((t) => ({ ...t, scale }));
  }, [design.roomMeta?.widthIn, setTransformPersist]);
  const [remodel, setRemodel] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => onPhotoChange(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onPhotoChange],
  );

  // Regenerate the transparent cabinet cutout whenever the live design changes.
  // Debounced so dragging sliders elsewhere doesn't thrash the GPU.
  const finish = design.finish;
  const doorStyle = design.doorStyle;
  const hardware = design.hardware;
  const layout = design.layout;
  const accessoriesKey = design.accessories.join(",");
  const modulesKey = JSON.stringify(design.modules);
  const overridesKey = JSON.stringify(design.moduleOverrides);

  useEffect(() => {
    if (!photoUrl) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const config = buildConfigFromDesign(design);
      if (!config.modules.length) {
        setCutoutUrl(null);
        setCutoutFailed(false);
        return;
      }
      const url = renderCabinetCutout({
        config,
        resolveModule: makeResolveModule(design),
        hardware: hardwareSpec(design.hardware),
        accessories: design.accessories,
      });
      if (cancelled) return;
      if (url) {
        setCutoutUrl(url);
        setCutoutFailed(false);
      } else {
        setCutoutUrl(null);
        setCutoutFailed(true);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    photoUrl,
    finish,
    doorStyle,
    hardware,
    layout,
    accessoriesKey,
    modulesKey,
    overridesKey,
  ]);

  // Pointer dragging to reposition the overlay.
  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current.active = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformPersist((t) => ({
      ...t,
      xPct: Math.min(100, Math.max(0, x)),
      yPct: Math.min(100, Math.max(0, y)),
    }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragState.current.active = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  async function handleRemoveCabinets() {
    if (!photoUrl) return;
    setRemoving(true);
    try {
      const img = await loadImage(photoUrl);
      const res = await fetch("/api/room/remove-cabinets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photoUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "The photo edit failed.");
      }
      setOriginalPhoto(photoUrl);
      onPhotoChange(data.image as string);
      toast({
        title: "Existing cabinets removed",
        description: "Now position your new cabinets in the cleared room.",
      });
    } catch (err) {
      toast({
        title: "Couldn't edit the photo",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
    }
  }

  function restoreOriginal() {
    if (originalPhoto) {
      onPhotoChange(originalPhoto);
      setOriginalPhoto(null);
    }
  }

  async function handleCapture() {
    if (!photoUrl) return;
    try {
      const photoImg = await loadImage(photoUrl);
      const W = photoImg.naturalWidth || 1280;
      const H = photoImg.naturalHeight || 960;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(photoImg, 0, 0, W, H);

      if (cutoutUrl) {
        const cutImg = await loadImage(cutoutUrl);
        const baseW = W * (BASE_WIDTH_PCT / 100) * transform.scale;
        const ar = cutImg.naturalHeight / cutImg.naturalWidth || 0.75;
        const baseH = baseW * ar;
        const cx = (transform.xPct / 100) * W;
        const cy = (transform.yPct / 100) * H;
        const ry = (transform.turn * Math.PI) / 180;
        const rx = (transform.tilt * Math.PI) / 180;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(cx, cy);
        // Approximate the CSS 3D perspective: turn -> horizontal foreshorten +
        // skew, tilt -> vertical foreshorten.
        ctx.transform(
          Math.cos(ry),
          Math.sin(ry) * 0.12,
          -Math.sin(rx) * 0.25,
          Math.cos(rx),
          0,
          0,
        );
        ctx.drawImage(cutImg, -baseW / 2, -baseH / 2, baseW, baseH);
        ctx.restore();
      }

      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) return resolve();
          const file = new File([blob], "my-room-design.png", {
            type: "image/png",
          });
          const nav = navigator as Navigator & {
            canShare?: (data: { files: File[] }) => boolean;
          };
          if (nav.canShare && nav.canShare({ files: [file] })) {
            try {
              await nav.share({
                files: [file],
                title: "My cabinet design",
              } as ShareData);
            } catch {
              /* user cancelled share */
            }
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my-room-design.png";
            a.click();
            URL.revokeObjectURL(url);
          }
          resolve();
        }, "image/png");
      });
    } catch {
      toast({
        title: "Couldn't save the image",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Room photo overlay</p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            data-testid="input-room-photo"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            data-testid="button-upload-photo"
          >
            <Upload className="h-3.5 w-3.5" />
            {photoUrl ? "Change photo" : "Upload / take photo"}
          </Button>
          {photoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onPhotoChange(null);
                setOriginalPhoto(null);
              }}
              data-testid="button-remove-photo"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-sm overflow-hidden border border-border bg-muted select-none"
        style={{ perspective: "1100px", touchAction: "none" }}
      >
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt="Your room"
              className="block w-full h-auto"
              data-testid="img-room-photo"
            />
            {cutoutUrl ? (
              <img
                src={cutoutUrl}
                alt="Cabinet overlay"
                draggable={false}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="absolute cursor-move touch-none"
                style={{
                  left: `${transform.xPct}%`,
                  top: `${transform.yPct}%`,
                  width: `${BASE_WIDTH_PCT}%`,
                  opacity,
                  transform: `translate(-50%, -50%) scale(${transform.scale}) rotateX(${transform.tilt}deg) rotateY(${transform.turn}deg)`,
                  transformOrigin: "center center",
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.28))",
                }}
                data-testid="img-cabinet-overlay"
              />
            ) : (
              <div
                className="absolute bottom-[8%] left-[10%] right-[10%] h-[34%] rounded-sm border-2 border-dashed border-white/60 flex items-center justify-center"
                style={{
                  backgroundColor: finishColor,
                  opacity,
                }}
              >
                <span className="text-xs text-white/90 px-2 text-center">
                  {cutoutFailed
                    ? "3D overlay isn't supported on this device, showing finish color"
                    : "Add cabinets in the layout step to preview them here"}
                </span>
              </div>
            )}
            {cutoutUrl && (
              <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs flex items-center gap-1.5 pointer-events-none">
                <Move className="h-3 w-3" />
                Drag to position
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center aspect-video gap-2 text-muted-foreground p-6 text-center">
            <ImageIcon className="h-10 w-10 opacity-40" />
            <p className="text-sm">
              Upload or take a photo of your space to see your cabinets in the
              room
            </p>
          </div>
        )}
      </div>

      {photoUrl && (
        <div className="space-y-4 rounded-sm border border-border p-4">
          {/* Remodel / AI removal */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="remodel-toggle"
                checked={remodel}
                onCheckedChange={setRemodel}
                data-testid="switch-remodel"
              />
              <Label htmlFor="remodel-toggle" className="text-sm">
                Replace existing cabinets in this room
              </Label>
            </div>
            {remodel &&
              (originalPhoto ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={restoreOriginal}
                  data-testid="button-restore-photo"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore original
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveCabinets}
                  disabled={removing}
                  data-testid="button-remove-cabinets-ai"
                >
                  {removing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  {removing ? "Clearing the room…" : "Remove existing cabinets"}
                </Button>
              ))}
          </div>
          {remodel && (
            <p className="text-xs text-muted-foreground -mt-2">
              Uses AI to erase your current cabinets so you can see the new
              design on clean walls. This can take up to a minute.
            </p>
          )}

          {/* Position / scale / perspective controls */}
          <SliderRow
            label="Size"
            value={transform.scale}
            min={0.3}
            max={1.6}
            step={0.02}
            onChange={(v) => setTransformPersist((t) => ({ ...t, scale: v }))}
            testId="slider-scale"
          />
          <SliderRow
            label="Tilt"
            value={transform.tilt}
            min={-20}
            max={20}
            step={1}
            onChange={(v) => setTransformPersist((t) => ({ ...t, tilt: v }))}
            testId="slider-tilt"
          />
          <SliderRow
            label="Turn"
            value={transform.turn}
            min={-30}
            max={30}
            step={1}
            onChange={(v) => setTransformPersist((t) => ({ ...t, turn: v }))}
            testId="slider-turn"
          />
          <SliderRow
            label="Opacity"
            value={opacity}
            min={0.3}
            max={1}
            step={0.05}
            onChange={setOpacityPersist}
            testId="slider-opacity"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const d = DEFAULT_PHOTO_OVERLAY_TRANSFORM;
                setTransformPersist({
                  xPct: d.xPct,
                  yPct: d.yPct,
                  scale: d.scale,
                  tilt: d.tilt,
                  turn: d.turn,
                });
                setOpacityPersist(d.opacity);
              }}
              data-testid="button-reset-overlay"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset position
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleCapture}
              data-testid="button-capture-share"
            >
              <Download className="h-3.5 w-3.5" />
              Save / share photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  testId: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-muted-foreground shrink-0 w-14">
        {label}
      </label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        className="flex-1"
        aria-label={label}
        data-testid={testId}
      />
    </div>
  );
}
