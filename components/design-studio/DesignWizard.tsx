"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";
import { RoomStep } from "./steps/RoomStep";
import { CollectionStep } from "./steps/CollectionStep";
import { LayoutStep } from "./steps/LayoutStep";
import { StyleStep } from "./steps/StyleStep";
import { DetailsStep } from "./steps/DetailsStep";
import { VisualizeStep } from "./steps/VisualizeStep";
import { SaveStep } from "./steps/SaveStep";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export const WIZARD_STEPS = [
  { id: "room", label: "Room", shortLabel: "Room" },
  { id: "collection", label: "Collection", shortLabel: "Collection" },
  { id: "layout", label: "Layout", shortLabel: "Layout" },
  { id: "style", label: "Style", shortLabel: "Style" },
  { id: "details", label: "Details", shortLabel: "Details" },
  { id: "visualize", label: "Visualize", shortLabel: "Preview" },
  { id: "save", label: "Save", shortLabel: "Save" },
] as const;

const STEP_COMPONENTS = [
  RoomStep,
  CollectionStep,
  LayoutStep,
  StyleStep,
  DetailsStep,
  VisualizeStep,
  SaveStep,
];

interface DesignWizardProps {
  className?: string;
}

export function DesignWizard({ className }: DesignWizardProps) {
  const { isStepComplete } = useDesignStudio();
  const [currentStep, setCurrentStep] = useState(0);

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

  return (
    <div className={cn("flex flex-col", className)}>
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
                    index > currentStep && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                      active && "border-primary bg-primary text-primary-foreground",
                      done && !active && "border-primary bg-primary/10 text-primary",
                      !done && !active && "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {done && !active ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs truncate max-w-full",
                      active ? "font-semibold text-foreground" : "text-muted-foreground"
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
                      index < currentStep ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

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
    </div>
  );
}
