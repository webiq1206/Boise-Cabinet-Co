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
  /** Optional 0-100 completion bar in the step rail. */
  progressPercent?: number;
  /** Optional "time left" hint shown by the step counter. */
  minutesLeftLabel?: string;
  /** Collapse the step rail into a compact menu on small screens. */
  compactMobileSteps?: boolean;
  /** When this number changes, move focus to the visible primary CTA. */
  focusPrimaryToken?: number;
  /**
   * Optional persistent panel (e.g. a live estimate summary). On desktop it
   * renders as a sticky right column beside the step; on mobile it stacks
   * directly below the step content. Other flows can omit it entirely.
   */
  sidePanel?: ReactNode;
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
  progressPercent,
  minutesLeftLabel,
  compactMobileSteps,
  focusPrimaryToken,
  sidePanel,
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

  // When a step's choice is made we surface the now-enabled Continue by moving
  // focus to it (predictable, replaces silent auto-advance). Only fires when the
  // parent bumps the token, never on first paint.
  const focusInit = useRef(false);
  useEffect(() => {
    if (!focusInit.current) {
      focusInit.current = true;
      return;
    }
    if (focusPrimaryToken === undefined) return;
    const buttons = rootRef.current?.querySelectorAll<HTMLButtonElement>(
      '[data-testid="wizard-next"]',
    );
    const visible = Array.from(buttons ?? []).find(
      (b) => !b.disabled && b.offsetParent !== null,
    );
    visible?.focus({ preventScroll: true });
  }, [focusPrimaryToken]);

  const renderPrimary = (fullWidth?: boolean) => {
    if (isLast && hidePrimaryOnLast) return null;
    if (isLast && lastStepAction) return lastStepAction;
    return (
      <Button
        variant="brand"
        onClick={onNext}
        disabled={!canAdvance}
        className={cn("min-h-11", fullWidth && "w-full")}
        data-testid="wizard-next"
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
            {minutesLeftLabel ? ` · ${minutesLeftLabel}` : ""}
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
          percent={progressPercent}
          compactMobile={compactMobileSteps}
        />
      </div>

      {/* Polite announcement for screen readers on step change */}
      <p className="sr-only" aria-live="polite" role="status">
        Step {currentIndex + 1} of {steps.length}: {step.label}
      </p>

      {headerExtra}

      <div
        className={cn(
          sidePanel && "lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:items-start",
        )}
      >
        <div className="min-w-0">
          <div className={cn("flex-1 min-h-[280px]", stepClassName)}>{children}</div>

          {/* Desktop in-flow controls (lg and up; the two-column layout starts here) */}
          <div className="hidden lg:flex items-center justify-between gap-4 mt-8 pt-6 border-t">
            <Button variant="outline" onClick={onBack} disabled={isFirst} className="min-h-11">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {renderPrimary()}
          </div>
        </div>

        {sidePanel && (
          <aside className="mt-6 lg:mt-0 lg:sticky lg:top-24" data-testid="guided-flow-side-panel">
            {sidePanel}
          </aside>
        )}
      </div>

      {/* Spacer so content is never hidden behind the sticky bar (mobile + tablet) */}
      <div className="h-32 lg:hidden" aria-hidden />

      {/* Sticky CTA through tablet - keeps Continue reachable without scrolling */}
      {barVisible && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-4"
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
