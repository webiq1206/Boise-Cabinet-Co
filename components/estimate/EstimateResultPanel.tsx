"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstimateResult } from "@/shared/estimateEngine";
import { INCLUDED_SCOPE_NOTE, formatPlanningCurrency } from "@/shared/estimateEngine";
import { CTA_PRIMARY } from "@/shared/ctaCopy";

const ANIM_DURATION = 320;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts up to `value` from whatever is currently shown. The animation depends
 * ONLY on the target value, so unrelated re-renders never interrupt or freeze
 * it. An interrupting value change picks up smoothly from the live displayed
 * number, and the tween always settles exactly on the target.
 */
function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayRef.current;
    const to = value;
    if (from === to) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      displayRef.current = to;
      setDisplay(to);
      return;
    }

    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / ANIM_DURATION);
      if (t >= 1) {
        displayRef.current = to;
        setDisplay(to);
        rafRef.current = null;
        return;
      }
      const next = Math.round(from + (to - from) * easeOutCubic(t));
      displayRef.current = next;
      setDisplay(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value]);

  return (
    <span className="brc-display-num tabular-nums">{formatPlanningCurrency(display)}</span>
  );
}

export interface EstimateResultPanelProps {
  result: EstimateResult;
  selectionSummary: string;
  onBookVisit: () => void;
  variant?: "full" | "compact";
  className?: string;
}

export function EstimateResultPanel({
  result,
  selectionSummary,
  onBookVisit,
  variant = "full",
  className,
}: EstimateResultPanelProps) {
  const isCompact = variant === "compact";
  const rangeAnnouncement = `${formatPlanningCurrency(result.priceLow)} to ${formatPlanningCurrency(result.priceHigh)} planning range`;

  return (
    <div
      className={cn(
        "rounded-sm bg-inverse text-inverse-foreground shadow-xl",
        isCompact ? "p-4" : "p-8",
        className
      )}
      data-testid={isCompact ? "mobile-estimate-bar-panel" : "estimate-result-panel"}
    >
      <div className={cn("flex items-center justify-between", isCompact ? "mb-2" : "mb-5")}>
        <div className="brc-label text-inverse-muted">Planning range</div>
        <div className="text-[10px] tracking-wide uppercase px-2 py-1 rounded-sm bg-inverse-foreground/15 text-inverse-foreground/90">
          {result.confidenceLabel}
        </div>
      </div>

      <p
        className={cn(
          "text-inverse-muted",
          isCompact ? "text-[11px] mb-2" : "text-xs mb-3"
        )}
      >
        {selectionSummary}
      </p>

      <div
        className={cn(
          "leading-none text-inverse-foreground",
          isCompact ? "text-2xl mb-2" : "text-[clamp(28px,3.5vw,44px)] mb-4"
        )}
        data-testid="estimate-range"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">{rangeAnnouncement}</span>
        <AnimatedPrice value={result.priceLow} />
        <span aria-hidden="true"> to </span>
        <AnimatedPrice value={result.priceHigh} />
      </div>

      {!isCompact && (
        <>
          <div className="mb-6">
            <div className="flex justify-between text-[11px] mb-1.5 text-inverse-muted">
              <span>Details provided</span>
              <span>{result.confidencePercent}%</span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden bg-inverse-foreground/15"
              role="progressbar"
              aria-valuenow={result.confidencePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Details provided"
            >
              <div
                className="h-full rounded-full transition-all duration-500 bg-inverse-foreground/50"
                style={{ width: `${result.confidencePercent}%` }}
              />
            </div>
            <p className="text-[10px] mt-2 text-inverse-muted">
              More project details help tailor your planning range.
            </p>
          </div>

          <div className="mb-4">
            <p className="text-[11px] font-medium mb-2 text-inverse-foreground/90">
              Scope based on your selections
            </p>
            <div className="space-y-2 mb-3">
              {result.included.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs leading-relaxed text-inverse-muted"
                >
                  <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-inverse-muted" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-inverse-muted">{INCLUDED_SCOPE_NOTE}</p>
          </div>
        </>
      )}

      <Button
        variant="brand"
        onClick={onBookVisit}
        className={cn("w-full", isCompact ? "mb-0" : "mb-3")}
        data-testid="button-book-visit"
        size={isCompact ? "sm" : "default"}
      >
        {CTA_PRIMARY}
        <ArrowRight className="h-4 w-4" />
      </Button>

      {!isCompact && (
        <>
          <p className="text-[11px] text-center mb-5 mt-3 text-inverse-muted">
            Your in-home visit includes a detailed project evaluation and personalized planning guidance.
          </p>

          <div className="rounded-sm p-4 flex gap-3 bg-inverse-foreground/6 border border-inverse-foreground/10">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-inverse-muted" />
            <p className="text-[11px] leading-relaxed text-inverse-muted">
              This estimate is for planning purposes only. It is not a proposal, bid, or guaranteed project cost.
              Ranges are based on market conditions, project type, project size, location, finish level, and other
              assumptions. Schedule a consultation for a detailed project evaluation tailored to your home.
            </p>
          </div>
        </>
      )}

      {isCompact && (
        <p className="text-[10px] leading-snug mt-2 text-inverse-muted">
          Planning estimate only, not a binding quote.
        </p>
      )}
    </div>
  );
}
