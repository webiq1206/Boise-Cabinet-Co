"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuidedStep {
  id: string;
  label: string;
  shortLabel: string;
}

interface StepProgressProps {
  steps: readonly GuidedStep[];
  currentIndex: number;
  isStepComplete: (index: number) => boolean;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function StepProgress({
  steps,
  currentIndex,
  isStepComplete,
  onStepClick,
  className,
}: StepProgressProps) {
  return (
    <nav aria-label="Progress" className={cn("mb-8", className)}>
      <ol className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const done =
            index < currentIndex || (index === currentIndex && isStepComplete(index));
          const active = index === currentIndex;
          const canNavigate = index <= currentIndex && onStepClick;

          return (
            <li key={step.id} className="flex flex-1 items-center min-w-0">
              <button
                type="button"
                onClick={() => canNavigate && onStepClick?.(index)}
                disabled={!canNavigate}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1.5 w-full min-h-[44px] group",
                  !canNavigate && "cursor-default",
                  index > currentIndex && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    active && "border-primary bg-primary text-primary-foreground",
                    done && !active && "border-primary bg-primary/10 text-primary",
                    !done && !active && "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {done && !active ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs sm:text-sm truncate max-w-full px-0.5",
                    active ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block h-0.5 flex-1 mx-1 min-w-[1rem]",
                    index < currentIndex ? "bg-primary" : "bg-border",
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
}
