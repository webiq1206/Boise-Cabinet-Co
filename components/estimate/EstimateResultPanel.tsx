"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Info, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstimateResult, ProjectType, RoomEstimate } from "@/shared/estimateEngine";
import {
  INCLUDED_SCOPE_NOTE,
  APPLIANCE_DISCLAIMER,
  ESTIMATE_RANGE_DISCLAIMER,
  ESTIMATE_VALUE_PROP,
  formatPlanningCurrency,
} from "@/shared/estimateEngine";
import { CATALOG_CONTENT } from "@/shared/catalog";
import { CTA_BOOK_VISIT } from "@/shared/ctaCopy";

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

function IncludedSection({
  included,
  project,
  collapsible = false,
}: {
  included: string[];
  project?: ProjectType;
  /** Start collapsed behind a single toggle (keeps the result step on one screen). */
  collapsible?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  // When collapsible, nothing is shown until the visitor opens it.
  const [open, setOpen] = useState(!collapsible);
  const hasMore = included.length > SCOPE_PREVIEW_COUNT;
  const visible = showAll ? included : included.slice(0, SCOPE_PREVIEW_COUNT);

  return (
    <div className={collapsible ? "mb-3" : "mb-6"} data-testid="typically-included-section">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2 rounded-sm border border-inverse-foreground/15 bg-inverse-foreground/5 px-3 py-2 text-left text-[12px] font-medium text-inverse-foreground/90 min-h-10"
          data-testid="button-toggle-included"
        >
          <span>What&apos;s typically included</span>
          <span className="text-inverse-muted">{open ? "Hide" : `Show ${included.length}`}</span>
        </button>
      ) : (
        <p className="text-[12px] font-medium mb-2 text-inverse-foreground/90">
          What&apos;s typically included
        </p>
      )}
      {open && (
        <>
          <div className="space-y-2 mb-2 mt-2">
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
              className="text-[12px] text-inverse-foreground/70 underline underline-offset-2 mb-3 hover:text-inverse-foreground transition-colors"
              data-testid="button-toggle-scope"
            >
              {showAll ? "Show less" : `Show all (${included.length})`}
            </button>
          )}
          {!hasMore && <div className="mb-3" />}
          <p className="text-[12px] leading-relaxed text-inverse-muted">{INCLUDED_SCOPE_NOTE}</p>
          {project === "kitchen" && (
            <p className="text-[12px] leading-relaxed text-inverse-muted mt-2" data-testid="appliance-disclaimer">
              {APPLIANCE_DISCLAIMER}
            </p>
          )}
        </>
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
  /** Suppress the panel's own CTA (e.g. when the flow's sticky bar owns it). */
  hideCta?: boolean;
  /**
   * One-screen density for the wizard's result step: tighter spacing, the
   * "what's included" list collapsed behind a toggle, marketing lines dropped,
   * and a condensed disclaimer, so the range + key info fit without scrolling.
   */
  compact?: boolean;
  /**
   * Per-room breakdown when the visitor planned multiple rooms. When it has more
   * than one room the panel labels the range "Total" and lists each room's
   * range in place of the single scope line.
   */
  breakdown?: RoomEstimate[];
  /**
   * "Not what you expected? Edit the scope and recalculate." Jumps back to a
   * specific room's steps with every prior answer preserved. Omit to hide the
   * edit affordance (e.g. read-only summaries outside the wizard).
   */
  onEditRoom?: (roomIndex: number) => void;
}

export function EstimateResultPanel({
  result,
  selectionSummary,
  scopeSummary,
  onBookVisit,
  project,
  variant = "full",
  className,
  hideCta = false,
  compact = false,
  breakdown,
  onEditRoom,
}: EstimateResultPanelProps) {
  const isSidebar = variant === "sidebar";
  const isFull = variant === "full";
  const pad = compact ? "p-5" : isSidebar ? "p-6" : "p-8";
  const multiRoom = !!breakdown && breakdown.length > 1;

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
          <p className="text-[12px] leading-relaxed mt-4 text-inverse-foreground/85">
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
        pad,
        className
      )}
      data-testid={isSidebar ? "estimate-side-panel" : "estimate-result-panel"}
    >
      <div className={cn("flex items-center justify-between gap-2", compact ? "mb-2" : "mb-5")}>
        <div className="brc-label text-inverse-muted">
          {multiRoom ? "Total planning range" : "Planning range"}
        </div>
        <div className="text-[12px] tracking-wide uppercase px-2 py-1 rounded-sm bg-inverse-foreground/15 text-inverse-foreground/90 shrink-0">
          {result.confidenceLabel}
        </div>
      </div>

      <p className={cn("text-inverse-muted text-xs", compact ? "mb-2" : "mb-3")}>
        {selectionSummary}
      </p>

      <div
        className={cn(
          "leading-none text-inverse-foreground",
          isSidebar
            ? "text-[clamp(26px,2.4vw,34px)] mb-4"
            : compact
              ? "text-[clamp(28px,8vw,40px)] mb-3"
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

      {multiRoom ? (
        <div className={compact ? "mb-3" : "mb-4"} data-testid="estimate-breakdown">
          <div className="brc-label text-inverse-muted mb-2">{breakdown!.length} rooms</div>
          <div className="flex flex-col">
            {breakdown!.map((r, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 py-2 border-b border-inverse-foreground/10 last:border-0"
                data-testid={`breakdown-room-${i}`}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium leading-tight text-inverse-foreground">
                    {r.projectLabel}
                  </div>
                  <div className="text-[12px] leading-snug text-inverse-muted mt-0.5">
                    {r.scopeSummary}
                  </div>
                  {onEditRoom && (
                    <button
                      type="button"
                      onClick={() => onEditRoom(i)}
                      className="mt-1 text-[12px] font-medium text-inverse-foreground/70 underline underline-offset-2 hover:text-inverse-foreground"
                      data-testid={`button-edit-room-${i}`}
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="text-xs tabular-nums whitespace-nowrap pt-0.5 text-inverse-foreground/85">
                  {formatPlanningCurrency(r.priceLow)}
                  <span className="text-inverse-muted"> to </span>
                  {formatPlanningCurrency(r.priceHigh)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        scopeSummary &&
        (compact ? (
          <p
            className="mb-3 text-xs leading-relaxed text-inverse-foreground/80"
            data-testid="text-scope-summary"
          >
            {scopeSummary}
            {onEditRoom && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => onEditRoom(0)}
                  className="font-medium text-inverse-foreground/70 underline underline-offset-2 hover:text-inverse-foreground"
                  data-testid="button-edit-room-0"
                >
                  Edit
                </button>
              </>
            )}
          </p>
        ) : (
          <div
            className="mb-4 p-3 rounded-sm bg-inverse-foreground/6 border border-inverse-foreground/10"
            data-testid="text-scope-summary"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="brc-label text-inverse-muted">Your selections</div>
              {onEditRoom && (
                <button
                  type="button"
                  onClick={() => onEditRoom(0)}
                  className="text-[12px] font-medium text-inverse-foreground/70 underline underline-offset-2 hover:text-inverse-foreground"
                  data-testid="button-edit-room-0"
                >
                  Edit
                </button>
              )}
            </div>
            <p className="text-xs leading-relaxed text-inverse-foreground/90">{scopeSummary}</p>
          </div>
        ))
      )}

      {isFull && !compact && (
        <p className="hidden sm:block text-xs text-inverse-muted mb-4">
          Based on your inputs. Your exact investment is confirmed at your in-home visit. Typical
          lead time is {CATALOG_CONTENT.leadTime} after your selections are finalized.
        </p>
      )}

      {isFull && (
        <IncludedSection included={result.included} project={project} collapsible={compact} />
      )}

      {/* Full confidence meter; in compact mode the header badge already carries
          the confidence label, so we drop the bar to keep the step on one screen. */}
      {(isFull || isSidebar) && !compact && (
        <div className={cn(isSidebar ? "mb-4" : "mb-6")}>
          <div className="flex justify-between text-[12px] mb-1.5 text-inverse-muted">
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
              className="h-full rounded-full transition-all duration-500 bg-accent"
              style={{ width: `${result.confidencePercent}%` }}
            />
          </div>
          <p className="text-[12px] mt-2 text-inverse-muted">
            More project details help tailor your planning range.
          </p>
        </div>
      )}

      {/* Subtle, credible value proposition reinforced throughout the estimator. */}
      {(isFull || isSidebar) && !compact && (
        <p
          className="hidden sm:block text-[12px] leading-relaxed mb-4 text-inverse-foreground/85"
          data-testid="estimate-value-prop"
        >
          {ESTIMATE_VALUE_PROP}
        </p>
      )}

      {!isSidebar && !hideCta && (
        <Button
          variant="brand"
          onClick={onBookVisit}
          className="w-full mb-3"
          data-testid="button-book-visit"
        >
          {CTA_BOOK_VISIT}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}

      {isFull && !compact && (
        <p className="hidden sm:block text-[12px] text-center mb-5 mt-3 text-inverse-muted">
          Your in-home visit includes a detailed project evaluation and personalized planning guidance.
        </p>
      )}

      {(isFull || isSidebar) &&
        (compact ? (
          <CompactDisclaimer />
        ) : (
          <div className="rounded-sm flex gap-3 bg-inverse-foreground/6 border border-inverse-foreground/10 p-4">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-inverse-muted" />
            <p
              className="text-[12px] leading-relaxed text-inverse-muted"
              data-testid="estimate-disclaimer"
            >
              {ESTIMATE_RANGE_DISCLAIMER}
            </p>
          </div>
        ))}

    </div>
  );
}

/**
 * The full range disclaimer is long, so on the one-screen (compact) result step
 * it lives behind a toggle - present and one tap away, but never forcing scroll.
 */
function CompactDisclaimer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-sm bg-inverse-foreground/6 border border-inverse-foreground/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[12px] text-inverse-muted min-h-9"
        data-testid="button-toggle-disclaimer"
      >
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex-1">How this estimate works</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <p
          className="px-2.5 pb-2.5 text-[12px] leading-relaxed text-inverse-muted"
          data-testid="estimate-disclaimer"
        >
          {ESTIMATE_RANGE_DISCLAIMER}
        </p>
      )}
    </div>
  );
}
