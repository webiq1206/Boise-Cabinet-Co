"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { requestHideMobileNavBar } from "@/lib/mobileNavBar";
import { useKeyboardInset } from "./useKeyboardInset";

export interface WizardActionBarProps {
  onBack?: () => void;
  backLabel?: string;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  primaryIcon?: "arrow" | "none";
  children?: React.ReactNode;
  topAccessory?: React.ReactNode;
  ownsBottomEdge?: boolean;
  /** Dock to the visual viewport and ride the keyboard inset (C10). */
  pinned?: boolean;
  className?: string;
  "data-testid"?: string;
  primaryTestId?: string;
  backTestId?: string;
}

/**
 * Viewport-fixed Back/Next dock for C10/D2 text steps. Rides `useKeyboardInset`
 * so controls stay above the software keyboard. A spacer reserves layout height.
 */
export function WizardActionBar({
  onBack,
  backLabel = "Back",
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  busy = false,
  busyLabel,
  primaryIcon = "arrow",
  children,
  topAccessory,
  ownsBottomEdge = true,
  pinned = true,
  className,
  "data-testid": testId = "wizard-action-bar",
  primaryTestId = "wizard-continue",
  backTestId = "wizard-back",
}: WizardActionBarProps) {
  const keyboardInset = useKeyboardInset();
  const barRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const [barHeight, setBarHeight] = useState(112);
  const [wizardInView, setWizardInView] = useState(true);
  // The form itself (not just the end of the step) has to own the lower part of the screen
  // before the bar docks. Without this, a short step whose end sat within reach of the first
  // screen docked the bar on load, over the section heading and intro above the form (/contact
  // at 768 and 1440). Starts true so pages where the form opens the page (/estimate) dock at once.
  const [formEngaged, setFormEngaged] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!pinned) return;
    const node = spacerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setWizardInView(entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "80px 0px 80px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [pinned]);

  useEffect(() => {
    if (!pinned) return;
    const spacer = spacerRef.current;
    const form = spacer?.closest("form") ?? spacer?.parentElement ?? null;
    if (!form || typeof IntersectionObserver === "undefined") return;
    // Shrinking the root by 40% from the bottom: the form counts as engaged only once its top
    // has risen above 60% of the viewport height, and until it has scrolled away above.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFormEngaged(entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "0px 0px -40% 0px" },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [pinned]);

  const docked = pinned && ((wizardInView && formEngaged) || keyboardInset > 0);

  useEffect(() => {
    if (!ownsBottomEdge || !docked) return;
    return requestHideMobileNavBar();
  }, [ownsBottomEdge, docked]);

  // Reserve clearance under the docked bar (C7): while it is fixed to the
  // bottom edge, the end of the page (reassurance copy, the planning-range
  // disclosure, the registration line) gets the bar's height as bottom padding
  // so it can scroll clear of the bar instead of sitting underneath it.
  useEffect(() => {
    if (!docked) return;
    const root = document.documentElement;
    root.style.setProperty("--wizard-bar-clearance", `${barHeight}px`);
    return () => {
      root.style.removeProperty("--wizard-bar-clearance");
    };
  }, [docked, barHeight]);

  useEffect(() => {
    if (!pinned) return;
    const node = barRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const next = Math.ceil(node.getBoundingClientRect().height);
      // Ignore transient 0-height reads while the bar portals to document.body.
      if (next > 40) setBarHeight(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [pinned, docked, onBack, primaryLabel, topAccessory, busy]);

  const bar = (
    <div
      ref={barRef}
      data-wizard-action-bar=""
      data-wizard-action-bar-pinned={pinned ? "true" : "false"}
      data-wizard-action-bar-docked={docked ? "true" : "false"}
      data-testid={testId}
      style={
        docked
          ? {
              bottom: keyboardInset > 0 ? keyboardInset : 0,
            }
          : undefined
      }
      className={cn(
        docked
          ? "fixed inset-x-0 z-[120] border-t border-border bg-background px-4 pb-safe pt-3 backdrop-blur-md transition-[bottom] duration-150"
          : pinned
            ? "relative z-30 -mx-4 mt-6 border-t border-border bg-background px-4 pb-safe pt-3 backdrop-blur-md"
            : "pt-1",
        className,
      )}
    >
      {topAccessory ? <div className="mx-auto max-w-3xl">{topAccessory}</div> : null}
      <div
        className={cn(
          "mx-auto flex max-w-3xl flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:gap-3",
          docked || pinned ? "pb-3" : "pb-2",
        )}
      >
        {onBack ? (
          <Button
            type="button"
            variant="brandOutline"
            onClick={onBack}
            disabled={busy}
            className="min-h-12 w-full flex-shrink-0 px-4 sm:w-auto"
            data-testid={backTestId}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Button>
        ) : null}

        {children}

        <Button
          type="button"
          variant="brand"
          onClick={onPrimary}
          disabled={primaryDisabled || busy}
          aria-busy={busy}
          className="min-h-12 w-full text-base sm:w-auto sm:flex-1"
          data-testid={primaryTestId}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {busyLabel ?? primaryLabel}
            </>
          ) : (
            <>
              {primaryLabel}
              {primaryIcon === "arrow" ? (
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              ) : null}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {pinned ? (
        <div
          ref={spacerRef}
          aria-hidden="true"
          data-wizard-action-bar-spacer=""
          // Keep reserved height whenever pinned so portaling the docked bar
          // never collapses document scroll height (C10 pin under header).
          style={{ height: barHeight }}
          className="pointer-events-none shrink-0"
        />
      ) : null}
      {/* Portal when docked so transform/filter ancestors cannot trap position:fixed. */}
      {docked && mounted ? createPortal(bar, document.body) : bar}
    </>
  );
}
