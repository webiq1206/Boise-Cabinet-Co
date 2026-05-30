"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DisplayNum, Section } from "@/components/marketing";
import { EstimateResultPanel } from "@/components/estimate/EstimateResultPanel";
import {
  type ProjectType,
  type FinishLevel,
  type EstimateRefinements,
  type EstimateInput,
  type UserRefinementKey,
  DEFAULT_ESTIMATE_INPUT,
  PROJECT_LABELS,
  FINISH_LABELS,
  getProjectSizeConfig,
  getAvailableFinishLevels,
  getMaxRefinementFields,
  getRefinementVisibility,
  getPlumbingElectricalLabel,
  getPlumbingElectricalOptions,
  getFinishPlanningHint,
  buildSelectionSummary,
  calculateEstimate,
  buildStoredEstimate,
  formatPlanningCurrency,
} from "@/shared/estimateEngine";

function SelectButton<T extends string>({
  value,
  options,
  onChange,
  testIdPrefix,
  allowUnset,
}: {
  value: T | null;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
  testIdPrefix: string;
  allowUnset?: boolean;
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
              active ? "border-foreground/40 border-[1.5px] bg-muted/40" : "border-border",
              allowUnset && value === null && "opacity-90"
            )}
          >
            {active && (
              <Check className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-foreground" />
            )}
            <span className="font-medium text-xs text-foreground">{opt.label}</span>
            {opt.sub && (
              <span className="text-[11px] leading-snug text-muted-foreground">{opt.sub}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RefinementNumberInput({
  id,
  label,
  min,
  max,
  placeholder,
  value,
  onCommit,
  testId,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  placeholder: string;
  value: number | null;
  onCommit: (n: number | null) => void;
  testId: string;
}) {
  const [text, setText] = useState(value !== null ? String(value) : "");
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)));

  useEffect(() => {
    setText(value !== null ? String(value) : "");
  }, [value]);

  return (
    <div>
      <label htmlFor={id} className="brc-label mb-3 block">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          if (raw === "") {
            onCommit(null);
            return;
          }
          const n = Number(raw);
          if (Number.isFinite(n)) onCommit(clamp(n));
        }}
        onBlur={() => {
          if (text === "") {
            onCommit(null);
            return;
          }
          const n = Number(text);
          if (Number.isFinite(n)) {
            const c = clamp(n);
            setText(String(c));
            onCommit(c);
          } else {
            setText("");
            onCommit(null);
          }
        }}
        className="w-full p-3 rounded-sm text-sm bg-background border border-input"
        data-testid={testId}
      />
    </div>
  );
}

function StepHeader({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full border border-primary/60 text-primary text-[11px] font-semibold tracking-wide">
        {num}
      </span>
      <span className="font-sans font-medium text-sm text-foreground tracking-wide">
        {label}
      </span>
    </div>
  );
}

interface EstimateCalculatorProps {
  inModal?: boolean;
  onBookVisit?: () => void;
}

export function EstimateCalculator({ inModal = false, onBookVisit: onBookVisitProp }: EstimateCalculatorProps = {}) {
  const [project, setProject] = useState<ProjectType>(DEFAULT_ESTIMATE_INPUT.project);
  const [finish, setFinish] = useState<FinishLevel>(DEFAULT_ESTIMATE_INPUT.finish);
  const [sqft, setSqft] = useState(DEFAULT_ESTIMATE_INPUT.sqft);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refinements, setRefinements] = useState<EstimateRefinements>(DEFAULT_ESTIMATE_INPUT.refinements);
  const [userRefinements, setUserRefinements] = useState<Set<UserRefinementKey>>(new Set());

  const sizeConfig = getProjectSizeConfig(project);
  const refinementVisibility = getRefinementVisibility(project);
  const userRefinementCount = userRefinements.size;

  const input: EstimateInput = useMemo(
    () => ({ project, finish, sqft, refinements }),
    [project, finish, sqft, refinements]
  );

  const result = useMemo(
    () => calculateEstimate(input, userRefinementCount),
    [input, userRefinementCount]
  );

  const selectionSummary = buildSelectionSummary(project, finish, sqft);

  const sliderPct = ((sqft - sizeConfig.min) / (sizeConfig.max - sizeConfig.min)) * 100;
  const sliderBackground = `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${sliderPct}%, hsl(var(--border)) ${sliderPct}%, hsl(var(--border)) 100%)`;

  function markRefinement(key: UserRefinementKey) {
    setUserRefinements((prev) => new Set(prev).add(key));
  }

  function handleSelectProject(type: ProjectType) {
    if (type === project) return;
    setProject(type);
    setSqft(getProjectSizeConfig(type).defaultSqft);
    setRefinements({ ...DEFAULT_ESTIMATE_INPUT.refinements });
    setUserRefinements(new Set());
    const availableFinishes = getAvailableFinishLevels(type);
    if (!availableFinishes.includes(finish)) {
      setFinish(availableFinishes[0]);
    }
  }

  function updateRefinement<K extends keyof EstimateRefinements>(key: K, value: EstimateRefinements[K]) {
    setRefinements((prev) => ({ ...prev, [key]: value }));
    markRefinement(key as UserRefinementKey);
  }

  function commitNumberRefinement<K extends keyof EstimateRefinements>(
    key: K,
    value: number | null
  ) {
    setRefinements((prev) => ({ ...prev, [key]: value as EstimateRefinements[K] }));
    setUserRefinements((prev) => {
      const next = new Set(prev);
      if (value === null) next.delete(key as UserRefinementKey);
      else next.add(key as UserRefinementKey);
      return next;
    });
  }

  function handleBookVisit() {
    sessionStorage.setItem(
      "brc_estimate",
      JSON.stringify(buildStoredEstimate(input, userRefinementCount))
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
      JSON.stringify(buildStoredEstimate(input, userRefinementCount))
    );
    window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
  }, [input, userRefinementCount]);

  const refineProgress = `${userRefinementCount} of ${getMaxRefinementFields(project)} details added`;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [calculatorInView, setCalculatorInView] = useState(false);

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

  const steps = (
    <div className="space-y-8">
      <div>
        <StepHeader num={1} label="What are we remodeling?" />
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
                <span className="font-medium text-sm text-foreground">{info.label}</span>
                <span className="text-xs text-muted-foreground">{info.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <StepHeader num={2} label="Choose a finish level" />
        <div className="grid grid-cols-2 gap-2">
          {getAvailableFinishLevels(project).map((level) => {
            const info = FINISH_LABELS[level];
            const active = finish === level;
            const hint = getFinishPlanningHint(project, level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => setFinish(level)}
                data-testid={`button-finish-${level}`}
                aria-pressed={active}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 p-5 rounded-sm text-left transition-all border bg-card",
                  active ? "border-foreground/40 border-[1.5px] bg-muted/40" : "border-border"
                )}
              >
                {active && (
                  <Check className="absolute top-3 right-3 h-4 w-4 text-foreground" />
                )}
                <span className="font-medium text-sm text-foreground">{info.label}</span>
                <span className="text-xs text-muted-foreground">{info.sub}</span>
                <span className="text-[10px] leading-snug text-muted-foreground/80 mt-0.5">{hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-5">
          <StepHeader num={3} label="Size of the space" />
          <DisplayNum className="text-2xl leading-none text-foreground">
            {sqft.toLocaleString()}{" "}
            <span className="text-sm font-sans text-muted-foreground">sqft</span>
          </DisplayNum>
        </div>
        <input
          type="range"
          className="brc-slider"
          min={sizeConfig.min}
          max={sizeConfig.max}
          step={sizeConfig.step}
          value={sqft}
          onChange={(e) => setSqft(Number(e.target.value))}
          style={{ background: sliderBackground }}
          data-testid="slider-size"
          aria-label={`Project size in square feet for ${PROJECT_LABELS[project].label}`}
          aria-valuemin={sizeConfig.min}
          aria-valuemax={sizeConfig.max}
          aria-valuenow={sqft}
        />
        <div className="flex justify-between text-[11px] mt-2 tracking-wide text-muted-foreground">
          <span>
            <DisplayNum>{sizeConfig.min.toLocaleString()}</DisplayNum> sqft
          </span>
          <span>
            <DisplayNum>{sizeConfig.max.toLocaleString()}</DisplayNum> sqft
          </span>
        </div>
      </div>

      <div className="rounded-sm overflow-hidden border border-border marketing-card">
        <button
          type="button"
          onClick={() => setRefineOpen(!refineOpen)}
          className="w-full flex items-center justify-between p-5 text-left bg-surface-muted hover:bg-muted/80 transition-colors"
          data-testid="button-refine-toggle"
          aria-expanded={refineOpen}
          aria-controls="refine-estimate-panel"
        >
          <div>
            <span className="font-medium text-sm block text-foreground">
              Improve estimate accuracy
            </span>
            <span className="text-xs text-muted-foreground">
              Add project details for a more tailored planning range
            </span>
            {refineOpen && (
              <span className="text-[10px] block mt-1 text-muted-foreground">{refineProgress}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-transform text-muted-foreground",
              refineOpen && "rotate-180"
            )}
          />
        </button>

        {refineOpen && (
          <div
            id="refine-estimate-panel"
            className="p-5 space-y-6 bg-card border-t border-border"
          >
            {refinementVisibility.layoutChanges && (
              <div>
                <label className="brc-label mb-3 block">Layout changes</label>
                <SelectButton
                  value={refinements.layoutChanges}
                  onChange={(v) => updateRefinement("layoutChanges", v)}
                  testIdPrefix="layout"
                  options={[
                    { value: "none", label: "None", sub: "Same layout" },
                    { value: "moderate", label: "Moderate", sub: "Minor wall changes" },
                    { value: "major", label: "Major", sub: "Structural changes" },
                  ]}
                />
              </div>
            )}

            {refinementVisibility.plumbingElectrical && (
              <div>
                <label className="brc-label mb-3 block">
                  {getPlumbingElectricalLabel(project)}
                </label>
                <SelectButton
                  value={refinements.plumbingElectrical}
                  onChange={(v) => updateRefinement("plumbingElectrical", v)}
                  testIdPrefix="plumbing"
                  options={getPlumbingElectricalOptions(project)}
                />
              </div>
            )}

            {refinementVisibility.cabinetTier && (
              <div>
                <label className="brc-label mb-3 block">Cabinet level</label>
                <SelectButton
                  value={refinements.cabinetTier}
                  onChange={(v) => updateRefinement("cabinetTier", v)}
                  testIdPrefix="cabinet"
                  allowUnset
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "semi-custom", label: "Semi-custom" },
                    { value: "custom", label: "Custom" },
                  ]}
                />
              </div>
            )}

            {refinementVisibility.fixtureCount && (
              <RefinementNumberInput
                id="fixture-count"
                label="Number of fixtures"
                min={1}
                max={8}
                placeholder="e.g. 3"
                value={refinements.fixtureCount}
                onCommit={(n) => commitNumberRefinement("fixtureCount", n)}
                testId="input-fixture-count"
              />
            )}

            {refinementVisibility.roomCount && (
              <RefinementNumberInput
                id="room-count"
                label="Rooms being remodeled"
                min={1}
                max={12}
                placeholder="e.g. 4"
                value={refinements.roomCount}
                onCommit={(n) => commitNumberRefinement("roomCount", n)}
                testId="input-room-count"
              />
            )}

            {refinementVisibility.stories && (
              <div>
                <label className="brc-label mb-3 block">Stories involved</label>
                <SelectButton
                  value={refinements.stories !== null ? String(refinements.stories) as "1" | "2" : null}
                  onChange={(v) => updateRefinement("stories", Number(v))}
                  testIdPrefix="stories"
                  allowUnset
                  options={[
                    { value: "1", label: "Single story" },
                    { value: "2", label: "Two story" },
                  ]}
                />
              </div>
            )}

            {refinementVisibility.aduConfiguration && (
              <div>
                <label className="brc-label mb-3 block">ADU configuration</label>
                <SelectButton
                  value={refinements.stories !== null ? String(refinements.stories) as "1" | "2" : null}
                  onChange={(v) => updateRefinement("stories", Number(v))}
                  testIdPrefix="adu-type"
                  allowUnset
                  options={[
                    { value: "1", label: "Detached", sub: "Separate structure on lot" },
                    { value: "2", label: "Attached", sub: "Connected to main home" },
                  ]}
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );

  const resultPanel = (
    <EstimateResultPanel
      result={result}
      selectionSummary={selectionSummary}
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
            Plan your project{" "}
            <em className="brc-accent text-accent">investment</em>
          </h2>
          <p className="text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            Get a planning range in seconds. Add details below to improve estimate accuracy before your consultation.
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
        </div>
      </div>

      {calculatorInView && (
        <div
          className="lg:hidden fixed left-0 right-0 z-[90] border-t border-border bg-background/97 backdrop-blur-md px-4 py-3 pb-safe"
          style={{ bottom: "56px" }}
          data-testid="mobile-estimate-bar"
        >
          <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">
                {selectionSummary}
              </p>
              <p className="text-lg text-foreground" data-testid="mobile-estimate-range">
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
