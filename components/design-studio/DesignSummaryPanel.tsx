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
  /** "" until the visitor explicitly picks a tier. */
  construction: ConstructionTier | "";
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

  const extrasValue =
    [hardware?.name, ...accessoryNames].filter(Boolean).join(", ") || null;

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
    { step: "extras", label: "Finishing touches", value: extrasValue },
  ];

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        variant === "review" ? "p-5" : "p-4",
        className,
      )}
      data-testid="design-summary-panel"
    >
      <p className="font-medium">Your design</p>
      <p className="mt-1 text-sm text-muted-foreground">Your selections carry into the project estimator. We’ll ask only for missing details.</p>

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
                <p className="text-sm text-muted-foreground">{row.label}</p>
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
        <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Everything saves automatically as you go.
        </p>
      )}
    </div>
  );
}
