"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstimateResult } from "@/shared/estimateEngine";
import { INCLUDED_SCOPE_NOTE } from "@/shared/estimateEngine";

function usePrevious<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => { ref.current = value; });
  return ref.current;
}

function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = usePrevious(value);

  useEffect(() => {
    if (prev === value) return;
    const steps = 20;
    const step = (value - prev) / steps;
    let current = prev;
    let i = 0;
    const id = setInterval(() => {
      i++;
      current += step;
      if (i >= steps) { setDisplay(value); clearInterval(id); }
      else setDisplay(Math.round(current));
    }, 16);
    return () => clearInterval(id);
  }, [value, prev]);

  const fmt = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${n.toLocaleString()}`;
  };

  return <span className="tabular-nums">{fmt(display)}</span>;
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
  const rangeAnnouncement = `$${Math.round(result.priceLow / 1000)}k to $${Math.round(result.priceHigh / 1000)}k planning range`;

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
        <div className="text-[10px] tracking-wide uppercase px-2 py-1 rounded-sm bg-accent/20 text-inverse-foreground/90">
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
          "font-serif font-light leading-none text-inverse-foreground",
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
              <span>Planning detail level</span>
              <span>{result.confidencePercent}%</span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden bg-inverse-foreground/15"
              role="progressbar"
              aria-valuenow={result.confidencePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Planning detail level"
            >
              <div
                className="h-full rounded-full transition-all duration-500 bg-accent"
                style={{ width: `${result.confidencePercent}%` }}
              />
            </div>
            <p className="text-[10px] mt-2 text-inverse-muted">
              More project details help tailor your planning range.
            </p>
          </div>

          <div className="mb-4">
            <p className="text-[11px] font-medium mb-2 text-inverse-foreground/90">
              Common scope for this project type and finish level
            </p>
            <div className="space-y-2 mb-3">
              {result.included.slice(0, 4).map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs leading-relaxed text-inverse-muted"
                >
                  <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-accent" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-inverse-muted">{INCLUDED_SCOPE_NOTE}</p>
          </div>
        </>
      )}

      <Button
        variant="brandAccent"
        onClick={onBookVisit}
        className={cn("w-full", isCompact ? "mb-0" : "mb-3")}
        data-testid="button-book-visit"
        size={isCompact ? "sm" : "default"}
      >
        Schedule your consultation
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
    </div>
  );
}
