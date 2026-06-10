"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstimateResult, ProjectType } from "@/shared/estimateEngine";
import {
  INCLUDED_SCOPE_NOTE,
  APPLIANCE_DISCLAIMER,
  ESTIMATE_RANGE_DISCLAIMER,
  ESTIMATE_VALUE_PROP,
  formatPlanningCurrency,
} from "@/shared/estimateEngine";
import { CTA_PRIMARY } from "@/shared/ctaCopy";
import { CATALOG_CONTENT } from "@/shared/catalog";

const ANIM_DURATION = 320;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts up to `value` from whatever is currently shown. The animation depends
 * ONLY on the target value, so unrelated re-renders never interrupt or freeze
 * it. An interrupting value change picks up smoothly from the live displayed
 * number, and the tween always settles exactly on the target.
 */
export function AnimatedPrice({ value }: { value: number }) {
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

const SCOPE_PREVIEW_COUNT = 5;

function IncludedSection({ included, project }: { included: string[]; project?: ProjectType }) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = included.length > SCOPE_PREVIEW_COUNT;
  const visible = showAll ? included : included.slice(0, SCOPE_PREVIEW_COUNT);

  return (
    <div className="mb-6" data-testid="typically-included-section">
      <p className="text-[11px] font-medium mb-2 text-inverse-foreground/90">
        What&apos;s typically included
      </p>
      <div className="space-y-2 mb-2">
        {visible.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs leading-relaxed text-inverse-muted"
            data-testid={`included-item-${i}`}
          >
            <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-inverse-muted" />
            {item}
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="text-[11px] text-inverse-foreground/70 underline underline-offset-2 mb-3 hover:text-inverse-foreground transition-colors"
          data-testid="button-toggle-scope"
        >
          {showAll ? "Show less" : `Show all (${included.length})`}
        </button>
      )}
      {!hasMore && <div className="mb-3" />}
      <p className="text-[10px] leading-relaxed text-inverse-muted">{INCLUDED_SCOPE_NOTE}</p>
      {project === "kitchen" && (
        <p className="text-[10px] leading-relaxed text-inverse-muted mt-2" data-testid="appliance-disclaimer">
          {APPLIANCE_DISCLAIMER}
        </p>
      )}
    </div>
  );
}

/** Shown wherever the estimator has no priceable selections yet. */
export const ESTIMATE_EMPTY_MESSAGE =
  "Make your selections to see an estimated investment range.";

export interface EstimateResultPanelProps {
  /** Null until the visitor has made priceable selections (project + size). */
  result: EstimateResult | null;
  selectionSummary: string;
  scopeSummary?: string;
  onBookVisit: () => void;
  project?: ProjectType;
  variant?: "full" | "sidebar";
  className?: string;
}

export function EstimateResultPanel({
  result,
  selectionSummary,
  scopeSummary,
  onBookVisit,
  project,
  variant = "full",
  className,
}: EstimateResultPanelProps) {
  const isSidebar = variant === "sidebar";
  const isFull = variant === "full";

  // Nothing priceable yet: show a neutral prompt instead of a fabricated range
  // so we never imply pricing the visitor didn't intentionally create.
  if (!result) {
    return (
      <div
        className={cn(
          "rounded-sm bg-inverse text-inverse-foreground shadow-xl",
          isSidebar ? "p-6" : "p-8",
          className,
        )}
        data-testid={isSidebar ? "estimate-side-panel" : "estimate-result-panel"}
      >
        <div className="brc-label text-inverse-muted mb-3">Planning range</div>
        <p
          className="text-inverse-foreground/90 leading-relaxed text-base"
          data-testid="estimate-empty-message"
        >
          {ESTIMATE_EMPTY_MESSAGE}
        </p>
        {(isFull || isSidebar) && (
          <p className="text-[11px] leading-relaxed mt-4 text-inverse-foreground/85">
            {ESTIMATE_VALUE_PROP}
          </p>
        )}
      </div>
    );
  }

  const rangeAnnouncement = `${formatPlanningCurrency(result.priceLow)} to ${formatPlanningCurrency(result.priceHigh)} planning range`;

  return (
    <div
      className={cn(
        "rounded-sm bg-inverse text-inverse-foreground shadow-xl",
        isSidebar ? "p-6" : "p-8",
        className
      )}
      data-testid={isSidebar ? "estimate-side-panel" : "estimate-result-panel"}
    >
      <div className={cn("flex items-center justify-between", "mb-5")}>
        <div className="brc-label text-inverse-muted">Planning range</div>
        <div className="text-[10px] tracking-wide uppercase px-2 py-1 rounded-sm bg-inverse-foreground/15 text-inverse-foreground/90">
          {result.confidenceLabel}
        </div>
      </div>

      <p
        className="text-inverse-muted text-xs mb-3"
      >
        {selectionSummary}
      </p>

      <div
        className={cn(
          "leading-none text-inverse-foreground",
          isSidebar
            ? "text-[clamp(26px,2.4vw,34px)] mb-4"
            : "text-[clamp(28px,3.5vw,44px)] mb-4"
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

      {scopeSummary && (
        <div className="mb-4 rounded-sm p-3 bg-inverse-foreground/6 border border-inverse-foreground/10" data-testid="text-scope-summary">
          <div className="brc-label text-inverse-muted mb-1">Your selections</div>
          <p className="text-xs leading-relaxed text-inverse-foreground/90">{scopeSummary}</p>
        </div>
      )}

      {isFull && (
        <p className="text-xs text-inverse-muted mb-4">
          Based on your inputs. Your exact investment is confirmed at your in-home visit. Typical
          lead time is {CATALOG_CONTENT.leadTime} after your selections are finalized.
        </p>
      )}

      {isFull && (
        <IncludedSection included={result.included} project={project} />
      )}

      {(isFull || isSidebar) && (
        <div className={cn(isSidebar ? "mb-4" : "mb-6")}>
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
      )}

      {/* Subtle, credible value proposition reinforced throughout the estimator. */}
      {(isFull || isSidebar) && (
        <p
          className="text-[11px] leading-relaxed mb-4 text-inverse-foreground/85"
          data-testid="estimate-value-prop"
        >
          {ESTIMATE_VALUE_PROP}
        </p>
      )}

      {!isSidebar && (
        <Button
          variant="brand"
          onClick={onBookVisit}
          className="w-full mb-3"
          data-testid="button-book-visit"
        >
          {CTA_PRIMARY}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}

      {isFull && (
        <p className="text-[11px] text-center mb-5 mt-3 text-inverse-muted">
          Your in-home visit includes a detailed project evaluation and personalized planning guidance.
        </p>
      )}

      {(isFull || isSidebar) && (
        <div className="rounded-sm p-4 flex gap-3 bg-inverse-foreground/6 border border-inverse-foreground/10">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-inverse-muted" />
          <p className="text-[11px] leading-relaxed text-inverse-muted" data-testid="estimate-disclaimer">
            {ESTIMATE_RANGE_DISCLAIMER}
          </p>
        </div>
      )}

    </div>
  );
}
