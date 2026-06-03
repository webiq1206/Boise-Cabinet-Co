"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DisplayNum, Section } from "@/components/marketing";
import {
  ADAPTIVE_GLASS_ATTR,
  ADAPTIVE_GLASS_BAR_BASE,
  getAdaptiveGlassClasses,
} from "@/components/marketing/adaptiveGlassTheme";
import { useAdaptiveGlassTheme } from "@/hooks/useAdaptiveGlassTheme";
import { EstimateCalculatorWizard } from "@/components/estimate/EstimateCalculatorWizard";
import type { StoredEstimate } from "@/shared/estimateEngine";
import { formatPlanningCurrency } from "@/shared/estimateEngine";

interface EstimateCalculatorProps {
  inModal?: boolean;
  onBookVisit?: () => void;
}

export function EstimateCalculator({ inModal = false, onBookVisit }: EstimateCalculatorProps = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mobileEstimateBarRef = useRef<HTMLDivElement>(null);
  const [calculatorInView, setCalculatorInView] = useState(false);
  const mobileEstimateBarTheme = useAdaptiveGlassTheme(mobileEstimateBarRef, {
    enabled: calculatorInView && !inModal,
  });
  const mobileEstimateBarClasses = getAdaptiveGlassClasses(mobileEstimateBarTheme);

  const [barEstimate, setBarEstimate] = useState<StoredEstimate | null>(null);

  useEffect(() => {
    function load() {
      try {
        const raw = sessionStorage.getItem("brc_estimate");
        if (!raw) return;
        setBarEstimate(JSON.parse(raw) as StoredEstimate);
      } catch {
        /* ignore */
      }
    }
    load();
    window.addEventListener("brc_estimate_updated", load);
    return () => window.removeEventListener("brc_estimate_updated", load);
  }, []);

  useEffect(() => {
    if (inModal) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCalculatorInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "0px 0px -56px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inModal]);

  function handleBookVisitFromBar() {
    document.getElementById("consult")?.scrollIntoView({ behavior: "smooth" });
  }

  if (inModal) {
    return <EstimateCalculatorWizard inModal onBookVisit={onBookVisit} />;
  }

  return (
    <Section id="calculator" divider>
      <div ref={sectionRef} className="container px-4 pb-24 lg:pb-8">
        <div className="max-w-3xl mx-auto mb-10">
          <div className="brc-label mb-3">Project Estimator</div>
          <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-3 text-foreground">
            Plan your cabinet{" "}
            <em className="brc-accent text-accent">investment</em>
          </h2>
          <p className="text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            A short guided flow — pick your project, size, and style. Your planning range updates
            at each step.
          </p>
          <p className="text-xs text-muted-foreground/90 max-w-2xl">
            Planning estimate only, not a binding quote. Final pricing requires an in-home evaluation.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <EstimateCalculatorWizard onBookVisit={onBookVisit} />
        </div>
      </div>

      {calculatorInView && (
        <div
          ref={mobileEstimateBarRef}
          {...{ [ADAPTIVE_GLASS_ATTR]: "" }}
          className={cn(
            ADAPTIVE_GLASS_BAR_BASE,
            "lg:hidden z-[90] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            mobileEstimateBarClasses.bar,
          )}
          style={{ bottom: "56px" }}
          data-testid="mobile-estimate-bar"
        >
          <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[10px] uppercase tracking-wide truncate",
                  mobileEstimateBarClasses.textMuted,
                )}
              >
                {barEstimate?.scopeSummary ?? "Project Estimator"}
              </p>
              <p
                className={cn("text-lg", mobileEstimateBarClasses.text)}
                data-testid="mobile-estimate-range"
              >
                {barEstimate ? (
                  <DisplayNum>
                    {formatPlanningCurrency(barEstimate.priceLow)} to{" "}
                    {formatPlanningCurrency(barEstimate.priceHigh)}
                  </DisplayNum>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBookVisitFromBar}
              className="flex-shrink-0 px-4 py-2.5 min-h-[44px] text-xs font-medium rounded-sm bg-primary text-primary-foreground"
              data-testid="mobile-button-book-visit"
            >
              Consult
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
