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
  /**
   * Short, specific reason the primary action is unavailable, e.g. "Set both
   * cabinet runs to continue". Shown next to the blocked button so the visitor
   * never has to guess what a greyed-out Continue wants from them.
   */
  blockedHint?: string;
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
  /** Overrides the "Step X of Y" eyebrow (e.g. a per-room context label). */
  metaLabel?: string;
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
  /**
   * Viewport-fit mode. The shell becomes a bounded flex column: a compact
   * slim-progress header, a scroll-contained body, and a footer with Back +
   * primary CTA pinned to the bottom of the card. The parent must give the
   * shell a bounded height (e.g. `h-full` inside a `100dvh` wrapper). Keeps the
   * step counter + primary action on screen at every step without page scroll.
   * Opt-in: default `false` preserves the classic in-flow layout.
   */
  fitViewport?: boolean;
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
  blockedHint,
  children,
  continueLabel = "Continue",
  lastStepAction,
  hidePrimaryOnLast,
  stepDescription,
  mobileSummary,
  metaLabel,
  headerExtra,
  className,
  stepClassName,
  progressPercent,
  minutesLeftLabel,
  compactMobileSteps,
  focusPrimaryToken,
  sidePanel,
  fitViewport = false,
}: GuidedFlowShellProps) {
  const step = steps[currentIndex];
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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

  // In the classic layout the wizard bar is lg:hidden, so we only ask the global
  // nav bottom bar to step aside below lg (otherwise 1024-1279px would have no
  // bottom bar at all). In fit mode our footer is pinned at every width, so we
  // step the nav bar aside all the way up to xl (where it hides itself).
  const [belowLg, setBelowLg] = useState(false);
  useEffect(() => {
    const query = fitViewport ? "(max-width: 1279px)" : "(max-width: 1023px)";
    const mq = window.matchMedia(query);
    const sync = () => setBelowLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [fitViewport]);

  // Ref-count active wizard mobile bars on the window so the global navigation
  // bottom bar can step aside while a guided flow is on screen (no stacked bars).
  // In fit mode the footer is always rendered while the shell is mounted, so we
  // register on `belowLg` alone; the classic fixed bar is gated by `barVisible`.
  const barActive = fitViewport ? belowLg : barVisible && belowLg;
  useEffect(() => {
    if (!barActive || typeof window === "undefined") return;
    const w = window as unknown as { __wizardMobileBars?: number };
    w.__wizardMobileBars = (w.__wizardMobileBars ?? 0) + 1;
    window.dispatchEvent(new Event("wizardmobilebar"));
    return () => {
      w.__wizardMobileBars = Math.max(0, (w.__wizardMobileBars ?? 1) - 1);
      window.dispatchEvent(new Event("wizardmobilebar"));
    };
  }, [barActive]);

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
    if (fitViewport) {
      // Every step must open at the very top. Reset the contained body and any
      // page-level scroll (the standalone /estimate page can scroll to its site
      // footer) instantly, so a new step never appears mid-scroll.
      bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      topRef.current?.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    }
    // Focus without a second scroll jump; the smooth scroll above handles it.
    headingRef.current?.focus({ preventScroll: true });
  }, [currentIndex, fitViewport]);

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

  if (fitViewport) {
    return (
      <div
        ref={rootRef}
        className={cn("flex h-full min-h-0 flex-col", className)}
        data-testid="guided-flow-fit"
      >
        {/* Compact, non-scrolling header */}
        <div ref={topRef} className="shrink-0">
          <div className="mb-2">
            <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
              {metaLabel ?? `Step ${currentIndex + 1} of ${steps.length}`}
              {minutesLeftLabel ? ` · ${minutesLeftLabel}` : ""}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-lg font-medium leading-tight text-foreground outline-none sm:text-xl"
            >
              {step.label}
            </h2>
            {stepDescription && (
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                {stepDescription}
              </p>
            )}
          </div>
          <StepProgress
            variant="slim"
            steps={steps}
            currentIndex={currentIndex}
            isStepComplete={isStepComplete}
            onStepClick={onStepClick}
          />
        </div>

        <p className="sr-only" aria-live="polite" role="status">
          Step {currentIndex + 1} of {steps.length}: {step.label}
        </p>

        {headerExtra}

        {/* Scroll-contained body: the page never scrolls; on rare overflow the
            body scrolls inside the card while header + footer stay pinned. The
            wrapper is a flex column on mobile (so the body is height-bounded and
            scrolls internally) and a two-column grid on desktop. */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            sidePanel
              ? "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6"
              : "",
          )}
        >
          <div
            ref={bodyRef}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 lg:flex-none",
              stepClassName,
            )}
          >
            {/* Short steps (a couple of sliders) previously sat at the top of a
                tall canvas with a large void beneath, which reads as a web page
                rather than an app screen. `min-h-full` makes this wrapper at
                least the height of the scroll container - so `justify-center`
                centres short content - while still growing past it when a step
                is tall, which keeps normal scrolling instead of the clipped-top
                behaviour a bare `justify-center` causes on overflow. Desktop
                keeps its own top-aligned two-column rhythm. */}
            <div className="flex min-h-full flex-col justify-center lg:block lg:min-h-0">
              {children}
            </div>
          </div>
          {sidePanel && (
            <aside
              className="hidden min-h-0 overflow-y-auto lg:block"
              data-testid="guided-flow-side-panel"
            >
              {sidePanel}
            </aside>
          )}
        </div>

        {/* Pinned footer: Back + live-range chip (mobile) + primary CTA. */}
        <div
          className="shrink-0 border-t bg-background/95 px-0.5 pt-2 pb-safe"
          data-testid="wizard-mobile-bar"
        >
          {mobileSummary && (
            <div className="mb-1.5 lg:hidden" data-testid="wizard-mobile-summary">
              {mobileSummary}
            </div>
          )}
          {!canAdvance && blockedHint && (
            <p
              className="mb-1.5 text-[13px] leading-snug text-muted-foreground"
              data-testid="wizard-blocked-hint"
            >
              {blockedHint}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isFirst}
              className="min-h-11 shrink-0 px-3 sm:px-4"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            {(() => {
              const primary = renderPrimary(true);
              return primary ? (
                <div className="min-w-0 flex-1">{primary}</div>
              ) : (
                !isFirst && <div className="flex-1" />
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("flex flex-col", className)}>
      <div ref={topRef} className="scroll-mt-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {metaLabel ?? `Step ${currentIndex + 1} of ${steps.length}`}
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
          // Desktop-only: on mobile/tablet the live range lives in the sticky
          // bottom bar + drawer, so rendering the full panel inline here too
          // would duplicate it and force needless scrolling.
          <aside
            className="hidden lg:block lg:sticky lg:top-24"
            data-testid="guided-flow-side-panel"
          >
            {sidePanel}
          </aside>
        )}
      </div>

      {/* Spacer so content is never hidden behind the sticky bar (mobile + tablet) */}
      <div
        className={cn("lg:hidden", mobileSummary ? "h-44" : "h-32")}
        aria-hidden
      />

      {/* Sticky CTA through tablet - keeps Continue reachable without scrolling */}
      {barVisible && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden pb-safe pt-3 px-4"
          data-testid="wizard-mobile-bar"
        >
          {mobileSummary && (
            <div className="mb-2" data-testid="wizard-mobile-summary">
              {mobileSummary}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              disabled={isFirst}
              className="min-h-11 min-w-11 shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {(() => {
              const primary = renderPrimary(true);
              return primary ? (
                <div className="flex-1 min-w-0">{primary}</div>
              ) : (
                !isFirst && <div className="flex-1" />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
