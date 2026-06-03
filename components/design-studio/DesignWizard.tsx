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
import { PreviewStep } from "./steps/PreviewStep";
import { QuoteStep } from "./steps/QuoteStep";
import { RoomStepLivePreview } from "./RoomStepLivePreview";
import { Button } from "@/components/ui/button";
import { ChevronUp, Eye } from "lucide-react";
import { wizardCopy } from "@/shared/designStudioCopy";
import { GuidedFlowShell } from "@/components/guided-flow";
import type { GuidedStep } from "@/components/guided-flow";

export const WIZARD_STEPS: readonly GuidedStep[] = [
  { id: "room", label: "Your room", shortLabel: "Room" },
  { id: "layout", label: "Kitchen shape", shortLabel: "Layout" },
  { id: "collection", label: "Cabinet line", shortLabel: "Line" },
  { id: "look", label: "Colors & hardware", shortLabel: "Look" },
  { id: "preview", label: "3D preview", shortLabel: "Preview" },
  { id: "quote", label: "Save & quote", shortLabel: "Quote" },
] as const;

const STEP_COMPONENTS = [
  RoomSetupStep,
  LayoutStep,
  CollectionStep,
  LookStep,
  PreviewStep,
  QuoteStep,
] as const;

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

  const previewReady =
    isScannedRoom(design.roomMeta) ||
    design.layout !== null ||
    Boolean(design.photoUrl);

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === WIZARD_STEPS.length - 1;
  const canAdvance = isStepComplete(currentStep);

  const goNext = () => {
    if (!canAdvance || isLast) return;
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setCurrentStep((s) => s - 1);
  };

  const previewPanel = previewReady ? (
    <RoomStepLivePreview
      deferMount={!isDesktop && !mobilePreviewOpen}
    />
  ) : (
    <div className="rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center">
      <p className="text-sm text-muted-foreground">{wizardCopy.previewPlaceholder}</p>
    </div>
  );

  const mobilePreviewToggle =
    !isDesktop && previewReady ? (
      <div className="mb-6">
        <Button
          variant="outline"
          className="w-full justify-between min-h-11"
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
    ) : null;

  const shell = (
    <GuidedFlowShell
      steps={WIZARD_STEPS}
      currentIndex={currentStep}
      isStepComplete={isStepComplete}
      onStepClick={(index) => index <= currentStep && setCurrentStep(index)}
      onBack={goBack}
      onNext={
        isLast
          ? () => {
              document.getElementById("request-pricing")?.scrollIntoView({ behavior: "smooth" });
            }
          : goNext
      }
      isFirst={isFirst}
      isLast={isLast}
      canAdvance={canAdvance || isLast}
      continueLabel={isLast ? "Go to pricing form" : "Continue"}
      headerExtra={mobilePreviewToggle}
      mobileStickyFooter={
        isLast ? (
          <Button
            variant="brand"
            className="w-full min-h-11"
            onClick={() => {
              document.getElementById("request-pricing")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Save & request quote
          </Button>
        ) : undefined
      }
    >
      <StepComponent />
    </GuidedFlowShell>
  );

  if (!mounted) {
    return <div className={cn("flex flex-col", className)}>{shell}</div>;
  }

  if (isDesktop) {
    return (
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_minmax(380px,42%)] gap-8 items-start",
          className,
        )}
      >
        <div className="flex flex-col min-w-0">{shell}</div>
        <div className="sticky top-20">{previewPanel}</div>
      </div>
    );
  }

  return <div className={cn("flex flex-col", className)}>{shell}</div>;
}
