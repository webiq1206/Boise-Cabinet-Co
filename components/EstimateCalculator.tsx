"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DisplayNum, Section } from "@/components/marketing";
import {
  ADAPTIVE_GLASS_ATTR,
  ADAPTIVE_GLASS_BAR_BASE,
  getAdaptiveGlassClasses,
} from "@/components/marketing/adaptiveGlassTheme";
import { useAdaptiveGlassTheme } from "@/hooks/useAdaptiveGlassTheme";
import { EstimateResultPanel } from "@/components/estimate/EstimateResultPanel";
import {
  type ProjectType,
  type EstimateSelections,
  type SelectionStepKey,
  type SelectOption,
  DEFAULT_SELECTIONS,
  PROJECT_LABELS,
  getProjectSizeConfig,
  getStepVisibility,
  getVisibleSteps,
  getLayoutOptions,
  getCabinetLineOptions,
  getDoorStyleOptions,
  FINISH_CATEGORY_OPTIONS,
  FINISH_TIER_OPTIONS,
  CONSTRUCTION_OPTIONS,
  STORAGE_OPTIONS,
  getDefaultSelectionsForProject,
  calculateEstimate,
  buildStoredEstimate,
  buildSelectionSummary,
  formatPlanningCurrency,
} from "@/shared/estimateEngine";

function SelectButton<T extends string>({
  value,
  options,
  onChange,
  testIdPrefix,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            data-testid={`${testIdPrefix}-${opt.value}`}
            aria-pressed={active}
            className={cn(
              "relative flex flex-col items-start gap-1 p-4 rounded-sm text-left transition-all border bg-card",
              active ? "border-foreground/40 border-[1.5px] bg-muted/40" : "border-border"
            )}
          >
            {active && (
              <Check className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-foreground" />
            )}
            <span className="font-medium text-xs text-foreground pr-5">{opt.label}</span>
            {opt.sub && (
              <span className="text-[11px] leading-snug text-muted-foreground">{opt.sub}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function StepHeader({ num, label, hint }: { num: number; label: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full border border-primary/60 text-primary text-[11px] font-semibold tracking-wide mt-0.5">
        {num}
      </span>
      <div>
        <span className="font-sans font-medium text-sm text-foreground tracking-wide block">
          {label}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

interface EstimateCalculatorProps {
  inModal?: boolean;
  onBookVisit?: () => void;
}

export function EstimateCalculator({ inModal = false, onBookVisit: onBookVisitProp }: EstimateCalculatorProps = {}) {
  const [selections, setSelections] = useState<EstimateSelections>(DEFAULT_SELECTIONS);
  const [touched, setTouched] = useState<Set<SelectionStepKey>>(new Set());

  const { project } = selections;
  const sizeConfig = getProjectSizeConfig(project);
  const visibility = getStepVisibility(project);
  const visibleSteps = useMemo(() => getVisibleSteps(project), [project]);
  const selectionsMade = useMemo(
    () => visibleSteps.filter((s) => touched.has(s)).length,
    [visibleSteps, touched]
  );

  const result = useMemo(
    () => calculateEstimate(selections, selectionsMade),
    [selections, selectionsMade]
  );

  const selectionSummary = buildSelectionSummary(selections);

  const sliderPct = Math.round(
    ((selections.size - sizeConfig.min) / (sizeConfig.max - sizeConfig.min)) * 100
  );
  const sliderBackground = `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${sliderPct}%, hsl(var(--border)) ${sliderPct}%, hsl(var(--border)) 100%)`;

  const markTouched = useCallback((key: SelectionStepKey) => {
    setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  const updateField = useCallback(
    <K extends keyof EstimateSelections>(key: K, value: EstimateSelections[K], step: SelectionStepKey) => {
      setSelections((prev) => ({ ...prev, [key]: value }));
      markTouched(step);
    },
    [markTouched]
  );

  function handleSelectProject(type: ProjectType) {
    if (type === project) return;
    setSelections(getDefaultSelectionsForProject(type));
    setTouched(new Set());
  }

  function handleBookVisit() {
    sessionStorage.setItem(
      "brc_estimate",
      JSON.stringify(buildStoredEstimate(selections, selectionsMade))
    );
    window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
    if (onBookVisitProp) {
      onBookVisitProp();
    } else {
      document.getElementById("consult")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    sessionStorage.setItem(
      "brc_estimate",
      JSON.stringify(buildStoredEstimate(selections, selectionsMade))
    );
    window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
  }, [selections, selectionsMade]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const mobileEstimateBarRef = useRef<HTMLDivElement>(null);
  const [calculatorInView, setCalculatorInView] = useState(false);
  const mobileEstimateBarTheme = useAdaptiveGlassTheme(mobileEstimateBarRef, {
    enabled: calculatorInView && !inModal,
  });
  const mobileEstimateBarClasses = getAdaptiveGlassClasses(mobileEstimateBarTheme);

  useEffect(() => {
    if (inModal) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCalculatorInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "0px 0px -56px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inModal]);

  // Auto-incrementing step number across the visible steps.
  let stepNum = 1;
  const layoutOptions = getLayoutOptions(project);
  const lineOptions = getCabinetLineOptions();
  const doorOptions = getDoorStyleOptions();

  const steps = (
    <div className="space-y-8">
      <div>
        <StepHeader num={stepNum++} label="What cabinetry are you planning?" />
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PROJECT_LABELS) as ProjectType[]).map((type) => {
            const info = PROJECT_LABELS[type];
            const active = project === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectProject(type)}
                data-testid={`button-project-${type}`}
                aria-pressed={active}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 p-5 rounded-sm text-left transition-all border bg-card",
                  active ? "border-foreground/40 border-[1.5px] bg-muted/40" : "border-border"
                )}
              >
                {active && (
                  <Check className="absolute top-3 right-3 h-4 w-4 text-foreground" />
                )}
                <span className="font-medium text-sm text-foreground pr-5">{info.label}</span>
                <span className="text-xs text-muted-foreground">{info.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visibility.layout && layoutOptions.length > 0 && (
        <div>
          <StepHeader num={stepNum++} label="Pick your layout" hint="Drives the base run and complexity" />
          <SelectButton
            value={selections.layout}
            options={layoutOptions}
            onChange={(v) => updateField("layout", v, "layout")}
            testIdPrefix="button-layout"
          />
        </div>
      )}

      <div>
        <div className="flex flex-wrap justify-between items-start sm:items-center gap-x-4 gap-y-2 mb-5">
          <StepHeader num={stepNum++} label={sizeConfig.sizeStepLabel} />
          <DisplayNum className="text-2xl leading-none text-foreground sm:text-right">
            {selections.size.toLocaleString()}{" "}
            <span className="text-sm font-sans text-muted-foreground">{sizeConfig.unitShort}</span>
          </DisplayNum>
        </div>
        <input
          type="range"
          className="brc-slider"
          min={sizeConfig.min}
          max={sizeConfig.max}
          step={sizeConfig.step}
          value={selections.size}
          onChange={(e) => updateField("size", Number(e.target.value), "size")}
          style={{ background: sliderBackground }}
          data-testid="slider-size"
          aria-label={`${sizeConfig.sizeStepLabel} in ${sizeConfig.unitNoun} for ${PROJECT_LABELS[project].label}`}
          aria-valuemin={sizeConfig.min}
          aria-valuemax={sizeConfig.max}
          aria-valuenow={selections.size}
        />
        <div className="flex justify-between text-[11px] mt-2 tracking-wide text-muted-foreground">
          <span>
            <DisplayNum>{sizeConfig.min.toLocaleString()}</DisplayNum> {sizeConfig.unitShort}
          </span>
          <span>
            <DisplayNum>{sizeConfig.max.toLocaleString()}</DisplayNum> {sizeConfig.unitShort}
          </span>
        </div>
      </div>

      <div>
        <StepHeader num={stepNum++} label="Choose your cabinet line" />
        <SelectButton
          value={selections.cabinetLine}
          options={lineOptions}
          onChange={(v) => updateField("cabinetLine", v, "line")}
          testIdPrefix="button-line"
        />
      </div>

      {visibility.doorStyle && (
        <div>
          <StepHeader num={stepNum++} label="Choose a door style" />
          <SelectButton
            value={selections.doorStyle}
            options={doorOptions}
            onChange={(v) => updateField("doorStyle", v, "doorStyle")}
            testIdPrefix="button-door"
          />
        </div>
      )}

      <div>
        <StepHeader num={stepNum++} label="Select your finish" hint="Finish style and color tier" />
        <div className="space-y-4">
          <div>
            <label className="brc-label mb-3 block">Finish style</label>
            <SelectButton
              value={selections.finishCategory}
              options={FINISH_CATEGORY_OPTIONS}
              onChange={(v) => updateField("finishCategory", v, "finish")}
              testIdPrefix="button-finish-category"
            />
          </div>
          <div>
            <label className="brc-label mb-3 block">Color tier</label>
            <SelectButton
              value={selections.finishTier}
              options={FINISH_TIER_OPTIONS}
              onChange={(v) => updateField("finishTier", v, "finish")}
              testIdPrefix="button-finish-tier"
            />
          </div>
        </div>
      </div>

      <div>
        <StepHeader num={stepNum++} label="Construction quality" hint="How the cabinet boxes are built" />
        <SelectButton
          value={selections.construction}
          options={CONSTRUCTION_OPTIONS}
          onChange={(v) => updateField("construction", v, "construction")}
          testIdPrefix="button-construction"
        />
      </div>

      <div>
        <StepHeader num={stepNum++} label="Smart Storage add-ons" hint="Interior organization upgrades" />
        <SelectButton
          value={selections.storage}
          options={STORAGE_OPTIONS}
          onChange={(v) => updateField("storage", v, "storage")}
          testIdPrefix="button-storage"
        />
      </div>
    </div>
  );

  const resultPanel = (
    <EstimateResultPanel
      result={result}
      selectionSummary={selectionSummary}
      scopeSummary={result.scopeSummary}
      onBookVisit={handleBookVisit}
      project={project}
      variant="full"
    />
  );

  if (inModal) {
    return (
      <div className="grid md:grid-cols-[3fr_2fr] gap-6 md:gap-8 items-start">
        {steps}
        <div>{resultPanel}</div>
      </div>
    );
  }

  return (
    <Section id="calculator" divider>
      <div ref={sectionRef} className="container px-4 pb-24 lg:pb-0">
        <div className="max-w-6xl mx-auto mb-10">
          <div className="brc-label mb-3">Project Estimator</div>
          <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-3 text-foreground">
            Plan your cabinet{" "}
            <em className="brc-accent text-accent">investment</em>
          </h2>
          <p className="text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            Walk through your cabinet choices and watch the planning range update with every
            selection. Each option reflects our real cabinet lines, door styles, finishes, and
            Smart Storage.
          </p>
          <p className="text-xs text-muted-foreground/90 max-w-2xl">
            Planning estimate only, not a binding quote. Final pricing requires an in-home evaluation.
          </p>
        </div>

        <div className="grid lg:grid-cols-[3fr_2fr] gap-8 md:gap-12 items-start max-w-6xl mx-auto">
          {steps}
          <div className="hidden lg:block lg:sticky lg:top-24">
            {resultPanel}
          </div>
          <div className="lg:hidden">{resultPanel}</div>
        </div>
      </div>

      {calculatorInView && (
        <div
          ref={mobileEstimateBarRef}
          {...{ [ADAPTIVE_GLASS_ATTR]: "" }}
          className={cn(
            ADAPTIVE_GLASS_BAR_BASE,
            "lg:hidden z-[90] px-4 py-3",
            mobileEstimateBarClasses.bar
          )}
          style={{ bottom: "56px" }}
          data-testid="mobile-estimate-bar"
        >
          <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto">
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[10px] uppercase tracking-wide truncate",
                  mobileEstimateBarClasses.textMuted
                )}
              >
                {selectionSummary}
              </p>
              <p
                className={cn("text-lg", mobileEstimateBarClasses.text)}
                data-testid="mobile-estimate-range"
              >
                <DisplayNum>
                  {formatPlanningCurrency(result.priceLow)} to {formatPlanningCurrency(result.priceHigh)}
                </DisplayNum>
              </p>
            </div>
            <button
              type="button"
              onClick={handleBookVisit}
              className="flex-shrink-0 px-4 py-2.5 text-xs font-medium rounded-sm bg-primary text-primary-foreground"
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
