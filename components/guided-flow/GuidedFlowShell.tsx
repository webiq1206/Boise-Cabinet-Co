"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepProgress, type GuidedStep } from "./StepProgress";

interface GuidedFlowShellProps {
  steps: readonly GuidedStep[];
  currentIndex: number;
  isStepComplete: (index: number) => boolean;
  onStepClick?: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  canAdvance: boolean;
  children: ReactNode;
  /** Primary CTA label on non-last steps */
  continueLabel?: string;
  /** Last-step primary action (optional; if omitted uses continueLabel) */
  lastStepAction?: ReactNode;
  /** Sticky footer on mobile for last step only */
  mobileStickyFooter?: ReactNode;
  headerExtra?: ReactNode;
  className?: string;
  stepClassName?: string;
}

export function GuidedFlowShell({
  steps,
  currentIndex,
  isStepComplete,
  onStepClick,
  onBack,
  onNext,
  isFirst,
  isLast,
  canAdvance,
  children,
  continueLabel = "Continue",
  lastStepAction,
  mobileStickyFooter,
  headerExtra,
  className,
  stepClassName,
}: GuidedFlowShellProps) {
  const step = steps[currentIndex];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <h2 className="text-lg font-medium mt-1 sr-only">{step.label}</h2>
      </div>

      <StepProgress
        steps={steps}
        currentIndex={currentIndex}
        isStepComplete={isStepComplete}
        onStepClick={onStepClick}
      />

      {headerExtra}

      <div className={cn("flex-1 min-h-[280px]", stepClassName)}>{children}</div>

      <div
        className={cn(
          "flex items-center justify-between gap-4 mt-8 pt-6 border-t",
          isLast && mobileStickyFooter && "pb-24 md:pb-0",
        )}
      >
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirst}
          className="min-h-11"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {!isLast ? (
          <Button
            variant="brand"
            onClick={onNext}
            disabled={!canAdvance}
            className="min-h-11"
          >
            {continueLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          lastStepAction ?? (
            <Button variant="brand" onClick={onNext} disabled={!canAdvance} className="min-h-11">
              {continueLabel}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )
        )}
      </div>

      {isLast && mobileStickyFooter && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur md:hidden pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 px-4">
          {mobileStickyFooter}
        </div>
      )}
    </div>
  );
}
