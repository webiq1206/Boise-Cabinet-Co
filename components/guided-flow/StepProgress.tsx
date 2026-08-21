"use client";

import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  /** Optional 0-100 completion bar shown above the stepper. */
  percent?: number;
  /** On small screens, collapse the rail into a compact step menu. */
  compactMobile?: boolean;
  /**
   * "slim" renders a low-profile segmented bar (~20px) instead of the tall
   * circular rail, so viewport-fit flows can keep the whole step on screen.
   * The step title/counter is expected to live in the surrounding header.
   */
  variant?: "rail" | "slim";
}

export function StepProgress({
  steps,
  currentIndex,
  isStepComplete,
  onStepClick,
  className,
  percent,
  compactMobile = false,
  variant = "rail",
}: StepProgressProps) {
  const current = steps[currentIndex];

  if (variant === "slim") {
    return (
      <nav aria-label="Progress" className={cn("mb-3", className)}>
        <ol className="flex items-center gap-1.5">
          {steps.map((step, index) => {
            const done =
              index < currentIndex || (index === currentIndex && isStepComplete(index));
            const active = index === currentIndex;
            const canNavigate = index <= currentIndex && onStepClick;
            return (
              <li key={step.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => canNavigate && onStepClick?.(index)}
                  disabled={!canNavigate}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${step.label}${done ? " (done)" : ""}`}
                  className={cn(
                    // The visible bar stays 6px, but a 6px-tall tap target is
                    // unusable on a phone. The ::after overlay lifts the real
                    // hit area to 38px without adding height to a step header
                    // that has to share a fixed viewport with the step body.
                    //
                    // 38 rather than the 44 Apple/Google suggest, deliberately:
                    // measured on a phone viewport, the step description sits
                    // 24px above the bar's centre and the step body (a later
                    // sibling, so it wins the hit test) starts 21px below.
                    // Reaching 44 would mean either making explanatory prose
                    // tappable or covering the step's first control. 38 clears
                    // WCAG 2.5.8's 24px requirement with room to spare and
                    // overlaps nothing.
                    "relative block h-1.5 w-full rounded-full transition-colors",
                    "after:absolute after:inset-x-0 after:-top-[16px] after:-bottom-[16px] after:content-['']",
                    active
                      ? "bg-accent"
                      : done
                        ? "bg-primary/70"
                        : "bg-border",
                    canNavigate ? "cursor-pointer" : "cursor-default",
                  )}
                />
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Progress" className={cn("mb-8", className)}>
      {typeof percent === "number" && (
        <div
          className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(Math.max(0, Math.min(100, percent)))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Design progress: ${Math.round(
            Math.max(0, Math.min(100, percent)),
          )}% complete`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
            data-testid="step-progress-bar"
          />
        </div>
      )}

      {/* Compact mobile control: a single chip that opens a jump menu. */}
      {compactMobile && (
        <div className="sm:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border bg-card px-3 py-2 min-h-11 text-left"
                data-testid="step-progress-compact"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {currentIndex + 1}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[12px] uppercase tracking-wide text-muted-foreground">
                      Step {currentIndex + 1} of {steps.length}
                    </span>
                    <span className="font-medium">{current?.label}</span>
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1">
              <ol>
                {steps.map((step, index) => {
                  const done =
                    index < currentIndex ||
                    (index === currentIndex && isStepComplete(index));
                  const canNavigate = index <= currentIndex && onStepClick;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => canNavigate && onStepClick?.(index)}
                        disabled={!canNavigate}
                        aria-current={index === currentIndex ? "step" : undefined}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm min-h-10",
                          index === currentIndex && "bg-muted font-medium",
                          !canNavigate
                            ? "cursor-not-allowed text-muted-foreground"
                            : "hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                            done
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground",
                          )}
                        >
                          {done ? <Check className="h-3 w-3" /> : index + 1}
                        </span>
                        {step.label}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <ol
        className={cn(
          "flex items-center justify-between gap-1 overflow-x-auto pb-2",
          compactMobile && "hidden sm:flex",
        )}
      >
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
