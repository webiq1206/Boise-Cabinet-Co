"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";
import { useIsDesktop } from "@/hooks/use-media-query";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { RoomSetupStep } from "./steps/RoomSetupStep";
import { LayoutStep } from "./steps/LayoutStep";
import { CollectionStep } from "./steps/CollectionStep";
import { LookStep } from "./steps/LookStep";
import { FinishStep } from "./steps/FinishStep";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { ScannedRoomPreview } from "./ScannedRoomPreview";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Eye, ChevronUp } from "lucide-react";
import { wizardCopy } from "@/shared/designStudioCopy";

export const WIZARD_STEPS = [
  { id: "room", label: "Your room", shortLabel: "Room" },
  { id: "layout", label: "Layout", shortLabel: "Layout" },
  { id: "collection", label: "Cabinets", shortLabel: "Cabinets" },
  { id: "look", label: "Look", shortLabel: "Look" },
  { id: "finish", label: "Finish", shortLabel: "Finish" },
] as const;

const STEP_COMPONENTS = [
  RoomSetupStep,
  LayoutStep,
  CollectionStep,
  LookStep,
  FinishStep,
];

interface DesignWizardProps {
  className?: string;
}

export function DesignWizard({ className }: DesignWizardProps) {
  const { isStepComplete, design } = useDesignStudio();
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === WIZARD_STEPS.length - 1;
  const canAdvance = isStepComplete(currentStep);

  const previewReady =
    isScannedRoom(design.roomMeta) || design.layout !== null;

  const goNext = () => {
    if (!canAdvance || isLast) return;
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setCurrentStep((s) => s - 1);
  };

  const stepNav = (
    <nav aria-label="Design wizard progress" className="mb-8">
      <ol className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {WIZARD_STEPS.map((step, index) => {
          const done = index < currentStep || (index === currentStep && isStepComplete(index));
          const active = index === currentStep;

          return (
            <li key={step.id} className="flex flex-1 items-center min-w-0">
              <button
                type="button"
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  "flex flex-col items-center gap-1.5 w-full group",
                  index > currentStep && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                    active && "border-primary bg-primary text-primary-foreground",
                    done && !active && "border-primary bg-primary/10 text-primary",
                    !done && !active && "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {done && !active ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-[10px] sm:text-xs truncate max-w-full",
                    active ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
              </button>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block h-0.5 flex-1 mx-1 min-w-[1rem]",
                    index < currentStep ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const previewPanel = previewReady ? (
    design.layout ? (
      <LivePreviewPanel />
    ) : (
      <ScannedRoomPreview />
    )
  ) : (
    <div className="rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center">
      <p className="text-sm text-muted-foreground">{wizardCopy.previewPlaceholder}</p>
    </div>
  );

  const stepBody = (
    <>
      {stepNav}
      <div className="flex-1 min-h-[320px]">
        <StepComponent />
      </div>
      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={goBack} disabled={isFirst}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {!isLast ? (
          <Button variant="brand" onClick={goNext} disabled={!canAdvance}>
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </>
  );

  if (!mounted) {
    return <div className={cn("flex flex-col", className)}>{stepBody}</div>;
  }

  if (isDesktop) {
    return (
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_minmax(380px,42%)] gap-8 items-start",
          className,
        )}
      >
        <div className="flex flex-col min-w-0">{stepBody}</div>
        <div className="sticky top-20">{previewPanel}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {previewReady && (
        <div className="mb-6">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setMobilePreviewOpen((o) => !o)}
            data-testid="button-toggle-mobile-preview"
          >
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {mobilePreviewOpen ? "Hide live preview" : "Show live preview"}
            </span>
            <ChevronUp
              className={cn(
                "h-4 w-4 transition-transform",
                mobilePreviewOpen ? "" : "rotate-180",
              )}
            />
          </Button>
          {mobilePreviewOpen && <div className="mt-3">{previewPanel}</div>}
        </div>
      )}
      {stepBody}
    </div>
  );
}
