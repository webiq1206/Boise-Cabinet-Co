"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
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
  /** Hide the shell's primary CTA on the last step (when the step content owns its own CTA) */
  hidePrimaryOnLast?: boolean;
  /** Short, plain-language description of what to do on this step */
  stepDescription?: ReactNode;
  /** One-line summary shown in the sticky mobile bar (e.g. live estimate range) */
  mobileSummary?: ReactNode;
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
  hidePrimaryOnLast,
  stepDescription,
  mobileSummary,
  headerExtra,
  className,
  stepClassName,
}: GuidedFlowShellProps) {
  const step = steps[currentIndex];
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The sticky mobile bar should only appear while the flow is actually on
  // screen (the estimator is also embedded mid-page on the homepage), so it
  // never lingers over unrelated content.
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setBarVisible(true);
      return;
    }
    const ob = new IntersectionObserver(([entry]) => setBarVisible(entry.isIntersecting), {
      threshold: 0,
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // Ref-count active wizard mobile bars on the window so the global navigation
  // bottom bar can step aside while a guided flow is on screen (no stacked bars).
  useEffect(() => {
    if (!barVisible || typeof window === "undefined") return;
    const w = window as unknown as { __wizardMobileBars?: number };
    w.__wizardMobileBars = (w.__wizardMobileBars ?? 0) + 1;
    window.dispatchEvent(new Event("wizardmobilebar"));
    return () => {
      w.__wizardMobileBars = Math.max(0, (w.__wizardMobileBars ?? 1) - 1);
      window.dispatchEvent(new Event("wizardmobilebar"));
    };
  }, [barVisible]);

  // On every step change: bring the step header into view and move focus to the
  // heading. This is the core "always return me to the top and show the next
  // step" behaviour. Honors reduced-motion and never steals focus on first paint.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    // Focus without a second scroll jump; the smooth scroll above handles it.
    headingRef.current?.focus({ preventScroll: true });
  }, [currentIndex]);

  const renderPrimary = (fullWidth?: boolean) => {
    if (isLast && hidePrimaryOnLast) return null;
    if (isLast && lastStepAction) return lastStepAction;
    return (
      <Button
        variant="brand"
        onClick={onNext}
        disabled={!canAdvance}
        className={cn("min-h-11", fullWidth && "w-full")}
      >
        {continueLabel}
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <div ref={rootRef} className={cn("flex flex-col", className)}>
      <div ref={topRef} className="scroll-mt-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-xl font-medium text-foreground outline-none"
          >
            {step.label}
          </h2>
          {stepDescription && (
            <p className="mt-1 text-sm text-muted-foreground">{stepDescription}</p>
          )}
        </div>

        <StepProgress
          steps={steps}
          currentIndex={currentIndex}
          isStepComplete={isStepComplete}
          onStepClick={onStepClick}
        />
      </div>

      {/* Polite announcement for screen readers on step change */}
      <p className="sr-only" aria-live="polite" role="status">
        Step {currentIndex + 1} of {steps.length}: {step.label}
      </p>

      {headerExtra}

      <div className={cn("flex-1 min-h-[280px]", stepClassName)}>{children}</div>

      {/* Desktop / tablet in-flow controls */}
      <div className="hidden md:flex items-center justify-between gap-4 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={isFirst} className="min-h-11">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {renderPrimary()}
      </div>

      {/* Spacer so content is never hidden behind the sticky mobile bar */}
      <div className="h-24 md:hidden" aria-hidden />

      {/* Sticky mobile CTA - keeps Continue reachable without scrolling */}
      {barVisible && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-4"
          data-testid="wizard-mobile-bar"
        >
          {mobileSummary && (
            <div
              className="mb-2 text-center text-xs text-muted-foreground"
              data-testid="wizard-mobile-summary"
            >
              {mobileSummary}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isFirst}
              className={cn("min-h-11", renderPrimary(true) ? "flex-1" : "w-full")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {renderPrimary(true) && <div className="flex-[2]">{renderPrimary(true)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
