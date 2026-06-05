"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";
import { useIsDesktop } from "@/hooks/use-media-query";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { RoomSetupStep } from "./steps/RoomSetupStep";
import { LayoutStep } from "./steps/LayoutStep";
import { LookStep } from "./steps/LookStep";
import { PreviewStep } from "./steps/PreviewStep";
import { QuoteStep } from "./steps/QuoteStep";
import { RoomStepLivePreview } from "./RoomStepLivePreview";
import { Button } from "@/components/ui/button";
import { ChevronUp, Eye } from "lucide-react";
import { wizardCopy } from "@/shared/designStudioCopy";
import { GuidedFlowShell } from "@/components/guided-flow";
import type { GuidedStep } from "@/components/guided-flow";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";

/** The layout step name adapts to the chosen room (no hard-coded "Kitchen"). */
function layoutStepLabel(roomType: string | null): string {
  if (!roomType) return "Layout";
  if (roomType === "kitchen") return "Kitchen shape";
  if (roomType === "bathroom") return "Vanity layout";
  const name = ROOM_BY_SLUG[roomType]?.name;
  return name ? `${name} layout` : "Layout";
}

function buildWizardSteps(roomType: string | null): readonly GuidedStep[] {
  return [
    { id: "room", label: "Your room", shortLabel: "Room" },
    { id: "layout", label: layoutStepLabel(roomType), shortLabel: "Layout" },
    { id: "look", label: "Colors & hardware", shortLabel: "Look" },
    { id: "preview", label: "3D preview", shortLabel: "Preview" },
    { id: "quote", label: "Save & quote", shortLabel: "Quote" },
  ];
}

export const WIZARD_STEPS: readonly GuidedStep[] = buildWizardSteps(null);

const STEP_COMPONENTS = [
  RoomSetupStep,
  LayoutStep,
  LookStep,
  PreviewStep,
  QuoteStep,
] as const;

// Steps that auto-advance the moment their required selection is satisfied, so
// the visitor is carried straight to the next step without hunting for a button.
// The 3D preview is intentionally excluded (it is the payoff, not a step to skip
// past) and the final quote step has nowhere to advance to.
const AUTO_ADVANCE_STEP_IDS = new Set<string>(["room", "layout", "look"]);
const AUTO_ADVANCE_DELAY_MS = 650;

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

  // "Browse styles without measuring" jumps straight to the Look step (index 2)
  // after the room step seeds a typical size.
  useEffect(() => {
    const handler = () => setCurrentStep(2);
    window.addEventListener("brc-studio-goto-look", handler);
    return () => window.removeEventListener("brc-studio-goto-look", handler);
  }, []);

  const steps = buildWizardSteps(design.roomType);

  const STEP_DESCRIPTIONS: Record<string, string> = {
    room: "Tell us the room and its size - or skip ahead to browse styles.",
    layout: "Choose the layout that best matches your space.",
    look: "Pick your finish color, door style, and hardware.",
    preview: "See your design come together in 3D - rotate and explore.",
    quote: "Name your design, then save and request pricing.",
  };

  const previewReady =
    isScannedRoom(design.roomMeta) ||
    design.layout !== null ||
    Boolean(design.photoUrl);

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const currentStepId = steps[currentStep]?.id ?? "";
  const isPreviewStep = currentStepId === "preview";
  const canAdvance = isStepComplete(currentStep);

  const goNext = () => {
    if (!canAdvance || isLast) return;
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setCurrentStep((s) => s - 1);
  };

  // Guided auto-advance: when the current step's required selection becomes
  // complete, carry the visitor to the next step automatically. We only fire on
  // a fresh false -> true transition while staying on the same step, so arriving
  // at an already-complete step (e.g. navigating Back, or a pre-selected layout)
  // never bounces the user forward and they keep full control.
  const wasCompleteRef = useRef(false);
  const advancingFromStepRef = useRef(currentStep);
  useEffect(() => {
    // Re-baseline whenever the step changes; never auto-advance on arrival.
    if (advancingFromStepRef.current !== currentStep) {
      advancingFromStepRef.current = currentStep;
      wasCompleteRef.current = canAdvance;
      return;
    }
    const justCompleted = canAdvance && !wasCompleteRef.current;
    wasCompleteRef.current = canAdvance;
    if (!justCompleted || isLast || !AUTO_ADVANCE_STEP_IDS.has(currentStepId)) {
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => setCurrentStep((s) => (s === currentStep ? s + 1 : s)),
      prefersReduced ? 0 : AUTO_ADVANCE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [canAdvance, currentStep, currentStepId, isLast]);

  const previewPanel = previewReady ? (
    <RoomStepLivePreview
      deferMount={!isDesktop && !mobilePreviewOpen}
    />
  ) : (
    <div className="rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center">
      <p className="text-sm text-muted-foreground">{wizardCopy.previewPlaceholder}</p>
    </div>
  );

  // On the dedicated 3D preview step, the live render is the whole point, so on
  // mobile it is embedded directly in the step body (always mounted) rather than
  // hidden behind a toggle.
  const inlineMobilePreview =
    !isDesktop && isPreviewStep ? (
      <div className="mb-6">
        {previewReady ? (
          <RoomStepLivePreview />
        ) : (
          <div className="rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center">
            <p className="text-sm text-muted-foreground">{wizardCopy.previewPlaceholder}</p>
          </div>
        )}
      </div>
    ) : null;

  const mobilePreviewToggle =
    !isDesktop && !isPreviewStep && previewReady ? (
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
      steps={steps}
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
      stepDescription={STEP_DESCRIPTIONS[steps[currentStep]?.id ?? ""]}
      headerExtra={mobilePreviewToggle}
    >
      {inlineMobilePreview}
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
