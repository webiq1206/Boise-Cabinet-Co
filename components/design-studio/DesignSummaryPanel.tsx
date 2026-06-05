"use client";

import Image from "next/image";
import { Minus, Plus, Pencil, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HelpHint } from "./HelpHint";
import {
  getDoorStyleBySlug,
  getFinishBySlug,
  resolveDoorStyleSlug,
  resolveFinishSlug,
  ACCESSORY_FAMILY_BY_SLUG,
  HARDWARE_OPTIONS,
  getFinishImages,
} from "@/shared/catalog";
import { LAYOUT_BY_SLUG } from "@/shared/catalog/layouts";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";
import {
  CONSTRUCTION_OPTIONS,
  getProjectSizeConfig,
  type ConstructionTier,
  type ProjectType,
} from "@/shared/estimateEngine";
import {
  getDesignEstimate,
  designToEstimateSelections,
} from "@/lib/design/designToEstimate";
import {
  getDesignProgress,
  type DesignStepId,
} from "@/lib/design/designSteps";

export interface EstimateTuner {
  size?: number;
  construction: ConstructionTier;
}

interface SummaryRow {
  step: DesignStepId;
  label: string;
  value: string | null;
  imageSrc?: string;
  isSwatch?: boolean;
}

const PROJECT_TYPES = new Set<string>([
  "kitchen",
  "bathroom",
  "laundry",
  "mudroom",
  "home-office",
  "entertainment",
  "built-ins",
  "pantry",
]);

export function DesignSummaryPanel({
  variant = "sidebar",
  tuner,
  onTunerChange,
  onNavigate,
  className,
}: {
  variant?: "sidebar" | "sheet" | "review";
  tuner: EstimateTuner;
  onTunerChange: (patch: Partial<EstimateTuner>) => void;
  onNavigate?: (step: DesignStepId) => void;
  className?: string;
}) {
  const { design } = useDesignStudio();

  const estimate = getDesignEstimate(design, {
    size: tuner.size,
    construction: tuner.construction,
  });
  const selections = designToEstimateSelections(design, {
    size: tuner.size,
    construction: tuner.construction,
  });
  const project = (PROJECT_TYPES.has(design.roomType ?? "")
    ? design.roomType
    : "kitchen") as ProjectType;
  const sizeCfg = getProjectSizeConfig(project);
  const effectiveSize = selections.size;
  const progress = getDesignProgress(design);

  const door = design.doorStyle
    ? getDoorStyleBySlug(resolveDoorStyleSlug(design.doorStyle))
    : undefined;
  const finish = design.finish
    ? getFinishBySlug(resolveFinishSlug(design.finish)) ??
      getFinishBySlug(design.finish)
    : undefined;
  const hardware = design.hardware
    ? HARDWARE_OPTIONS.find((h) => h.slug === design.hardware)
    : undefined;
  const room = design.roomType ? ROOM_BY_SLUG[design.roomType] : undefined;
  const layout = design.layout ? LAYOUT_BY_SLUG[design.layout] : undefined;

  const roomValue = room
    ? design.roomMeta
      ? `${room.name} · ${design.roomMeta.widthIn}" × ${design.roomMeta.depthIn}"`
      : room.name
    : null;
  const accessoryNames = design.accessories
    .map((slug) => ACCESSORY_FAMILY_BY_SLUG[slug]?.name ?? null)
    .filter(Boolean) as string[];

  const rows: SummaryRow[] = [
    { step: "room", label: "Room", value: roomValue },
    { step: "layout", label: "Layout", value: layout?.name ?? null },
    { step: "door", label: "Cabinet style", value: door?.name ?? null },
    {
      step: "finish",
      label: "Finish",
      value: finish?.name ?? null,
      imageSrc: finish
        ? getFinishImages(finish.slug, finish.imagePath).swatch
        : undefined,
      isSwatch: true,
    },
    { step: "hardware", label: "Hardware", value: hardware?.name ?? null },
    {
      step: "addons",
      label: "Add-ons",
      value: accessoryNames.length ? accessoryNames.join(", ") : null,
    },
  ];

  const decSize = () =>
    onTunerChange({
      size: Math.max(sizeCfg.min, effectiveSize - sizeCfg.step),
    });
  const incSize = () =>
    onTunerChange({
      size: Math.min(sizeCfg.max, effectiveSize + sizeCfg.step),
    });

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        variant === "review" ? "p-5" : "p-4",
        className,
      )}
      data-testid="design-summary-panel"
    >
      {/* Estimate headline */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Estimated cost
          </p>
          <HelpHint label="About this estimate">
            A planning range modeled on Treasure Valley cabinetry rates and your
            selections. Your exact quote is confirmed at your free consultation.
          </HelpHint>
        </div>
        <p
          className="text-2xl font-semibold tracking-tight"
          data-testid="summary-estimate-range"
        >
          {estimate.rangeLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          Planning estimate · about {estimate.timelineLabel} · {estimate.confidencePercent}% confidence
        </p>
      </div>

      {/* Tuners */}
      <div className="mt-4 space-y-3 rounded-md bg-muted/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{sizeCfg.sizeStepLabel}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={decSize}
              aria-label="Decrease size"
              data-testid="summary-size-dec"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span
              className="min-w-[4.5rem] text-center text-sm tabular-nums"
              aria-live="polite"
            >
              {effectiveSize} {sizeCfg.unitShort}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={incSize}
              aria-label="Increase size"
              data-testid="summary-size-inc"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Construction</span>
            <HelpHint label="About construction tiers">
              Box quality and drawer hardware. Higher tiers add durability and
              cost.
            </HelpHint>
          </div>
          <div
            className="grid grid-cols-3 gap-1 rounded-md border bg-background p-1"
            role="group"
            aria-label="Construction quality"
          >
            {CONSTRUCTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTunerChange({ construction: opt.value })}
                aria-pressed={tuner.construction === opt.value}
                className={cn(
                  "min-h-10 rounded-sm px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  tuner.construction === opt.value
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted",
                )}
                data-testid={`summary-construction-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Design progress</span>
          <span data-testid="summary-progress-label">
            {progress.completedRequired} of {progress.totalRequired} key choices
          </span>
        </div>
        <Progress value={progress.percent} className="h-2" />
      </div>

      {/* Selection rows */}
      <ul className="mt-4 divide-y">
        {rows.map((row) => (
          <li
            key={row.step}
            className="flex items-center justify-between gap-3 py-2.5"
            data-testid={`summary-row-${row.step}`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {row.isSwatch && row.imageSrc ? (
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm border">
                  <Image
                    src={row.imageSrc}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p
                  className={cn(
                    "truncate text-sm",
                    row.value ? "font-medium" : "text-muted-foreground italic",
                  )}
                >
                  {row.value ?? "Not selected"}
                </p>
              </div>
            </div>
            {onNavigate && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => onNavigate(row.step)}
                data-testid={`summary-edit-${row.step}`}
              >
                <Pencil className="h-3.5 w-3.5" />
                {row.value ? "Edit" : "Add"}
              </Button>
            )}
          </li>
        ))}
      </ul>

      {variant !== "review" && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Everything saves automatically as you go.
        </p>
      )}
    </div>
  );
}
