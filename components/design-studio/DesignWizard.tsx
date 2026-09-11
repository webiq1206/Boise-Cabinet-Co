"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";
import { useIsDesktop } from "@/hooks/use-media-query";
import { RoomSetupStep } from "./steps/RoomSetupStep";
import { LayoutStep } from "./steps/LayoutStep";
import { DoorStep } from "./steps/DoorStep";
import { FinishStep } from "./steps/FinishStep";
import { ExtrasStep } from "./steps/ExtrasStep";
import { ReviewStep } from "./steps/ReviewStep";
import { RoomStepLivePreview } from "./RoomStepLivePreview";
import { DesignSummaryPanel } from "./DesignSummaryPanel";
import {
  EstimateTunerProvider,
  useEstimateTuner,
} from "./EstimateTunerContext";
import { ChevronUp } from "lucide-react";
import { wizardCopy } from "@/shared/designStudioCopy";
import { GuidedFlowShell } from "@/components/guided-flow";
import type { GuidedStep } from "@/components/guided-flow";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DESIGN_STEPS,
  DESIGN_STEP_IDS,
  GOTO_STEP_EVENT,
  designStepLabel,
  getDesignProgress,
  gotoDesignStep,
  type DesignStepId,
} from "@/lib/design/designSteps";
import { getDesignEstimate } from "@/lib/design/designToEstimate";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";

function buildWizardSteps(roomType: string | null): GuidedStep[] {
  return DESIGN_STEPS.map((s) => ({
    id: s.id,
    label: designStepLabel(s.id, roomType),
    shortLabel: s.shortLabel,
  }));
}

export const WIZARD_STEPS: readonly GuidedStep[] = buildWizardSteps(null);

const STEP_COMPONENTS: Record<DesignStepId, () => JSX.Element> = {
  room: RoomSetupStep,
  layout: LayoutStep,
  door: DoorStep,
  finish: FinishStep,
  extras: ExtrasStep,
  review: ReviewStep,
};

// Single-select steps no longer auto-advance (silent jumps confused visitors).
// Instead, once a choice is made we announce it and move focus to the now-enabled
// Continue button so progressing is one obvious tap, but always under user control.
const FOCUS_CUE_STEP_IDS = new Set<DesignStepId>(["door", "finish"]);

const STEP_DESCRIPTIONS: Record<DesignStepId, string> = {
  room: "Tell us the room and its size, or skip ahead to browse styles.",
  layout: "Choose the layout that best matches your space.",
  door: "Pick the cabinet door profile you love.",
  finish: "Choose your color and sheen.",
  extras: "Optional: pick hardware and smart storage, or just continue.",
  review: "Review everything, then send it for your estimate and free consultation.",
};

interface DesignWizardProps {
  className?: string;
}

function DesignWizardInner({ className }: DesignWizardProps) {
  const { isStepComplete, design } = useDesignStudio();
  const { tuner, onTunerChange } = useEstimateTuner();
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [focusToken, setFocusToken] = useState(0);
  const [announce, setAnnounce] = useState("");

  useEffect(() => setMounted(true), []);

  const steps = buildWizardSteps(design.roomType);
  const currentStepId = (steps[currentStep]?.id ?? "room") as DesignStepId;

  // Jump-to-step requests from the summary panel "Edit" links (and the legacy
  // "browse styles" handoff). Only honor a jump when its prerequisites are met.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail as DesignStepId;
      const target = DESIGN_STEP_IDS.indexOf(id);
      if (target < 0) return;
      const prereqsMet = Array.from({ length: target }).every((_, i) =>
        isStepComplete(i),
      );
      if (target <= currentStep || prereqsMet) {
        setCurrentStep(target);
        setSummaryOpen(false);
      }
    };
    window.addEventListener(GOTO_STEP_EVENT, handler);
    return () => window.removeEventListener(GOTO_STEP_EVENT, handler);
  }, [currentStep, isStepComplete]);

  // "Browse styles without measuring" jumps straight to the door step.
  useEffect(() => {
    const handler = () => setCurrentStep(DESIGN_STEP_IDS.indexOf("door"));
    window.addEventListener("brc-studio-goto-look", handler);
    return () => window.removeEventListener("brc-studio-goto-look", handler);
  }, []);

  const previewReady =
    isScannedRoom(design.roomMeta) ||
    design.layout !== null ||
    Boolean(design.photoUrl);

  const StepComponent = STEP_COMPONENTS[currentStepId];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const canAdvance = isStepComplete(currentStep);

  const goNext = () => {
    if (!canAdvance || isLast) return;
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setCurrentStep((s) => s - 1);
  };

  // On a fresh selection of a single-select step, announce it and pull focus to
  // the now-enabled Continue (fresh false -> true only; never auto-advance).
  const wasCompleteRef = useRef(false);
  const advancingFromStepRef = useRef(currentStep);
  useEffect(() => {
    if (advancingFromStepRef.current !== currentStep) {
      advancingFromStepRef.current = currentStep;
      wasCompleteRef.current = canAdvance;
      return;
    }
    const justCompleted = canAdvance && !wasCompleteRef.current;
    wasCompleteRef.current = canAdvance;
    if (!justCompleted || isLast || !FOCUS_CUE_STEP_IDS.has(currentStepId)) {
      return;
    }
    const nextLabel = steps[currentStep + 1]?.label ?? "the next step";
    setAnnounce(
      `${steps[currentStep]?.label ?? "Selection"} chosen. Continue to ${nextLabel}.`,
    );
    setFocusToken((t) => t + 1);
  }, [canAdvance, currentStep, currentStepId, isLast, steps]);

  const previewPanel = previewReady ? (
    <RoomStepLivePreview deferMount={!isDesktop && !summaryOpen} />
  ) : (
    <div className="rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center">
      <p className="text-sm text-muted-foreground">{wizardCopy.previewPlaceholder}</p>
    </div>
  );

  const summaryPanel = (
    <DesignSummaryPanel
      variant={isDesktop ? "sidebar" : "sheet"}
      tuner={tuner}
      onTunerChange={onTunerChange}
      onNavigate={gotoDesignStep}
    />
  );

  const mobileSummaryNode = design.roomType ? (
    <Drawer open={summaryOpen} onOpenChange={setSummaryOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left min-h-11"
          data-testid="button-open-summary-sheet"
        >
          <span className="text-sm">
            <span className="font-medium">Your design selections</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            View summary
            <ChevronUp className="h-4 w-4" />
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Design summary</DrawerTitle>
        <div className="max-h-[82vh] overflow-y-auto p-4 pt-2">
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              {summaryPanel}
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              {previewPanel}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  ) : null;

  const continueLabel = currentStepId === "finish" ? "Review & estimate" : "Continue";

  const progress = getDesignProgress(design);
  const minutesLeftLabel =
    progress.percent < 100 && progress.minutesLeft > 0
      ? `about ${progress.minutesLeft} min left`
      : undefined;

  const shell = (
    <GuidedFlowShell
      
      steps={steps}
      currentIndex={currentStep}
      isStepComplete={isStepComplete}
      onStepClick={(index) => index <= currentStep && setCurrentStep(index)}
      onBack={goBack}
      onNext={goNext}
      isFirst={isFirst}
      isLast={isLast}
      canAdvance={canAdvance}
      hidePrimaryOnLast
      continueLabel={continueLabel}
      stepDescription={STEP_DESCRIPTIONS[currentStepId]}
      mobileSummary={mobileSummaryNode}
      progressPercent={progress.percent}
      minutesLeftLabel={minutesLeftLabel}
      compactMobileSteps
      focusPrimaryToken={focusToken}
    >
      <p className="sr-only" aria-live="polite" role="status">
        {announce}
      </p>
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
        {/* Preview and summary are both always visible (stacked, sticky) so the
            estimate and selections are never hidden behind a tab. */}
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-4 overflow-y-auto pr-1">
          {previewPanel}
          {summaryPanel}
        </div>
      </div>
    );
  }

  return <div className={cn("flex flex-col", className)}>{shell}</div>;
}

export function DesignWizard(props: DesignWizardProps) {
  return (
    <EstimateTunerProvider>
      <DesignWizardInner {...props} />
    </EstimateTunerProvider>
  );
}
