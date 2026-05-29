"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/marketing/Section";
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
  getMaxRefinementFields,
  getFinishPlanningHint,
  buildSelectionSummary,
  calculateEstimate,
  buildStoredEstimate,
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
              active ? "border-accent border-[1.5px] bg-accent/5" : "border-border",
              allowUnset && value === null && "opacity-90"
            )}
          >
            {active && (
              <Check className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-accent" />
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

export function EstimateCalculator() {
  const [project, setProject] = useState<ProjectType>(DEFAULT_ESTIMATE_INPUT.project);
  const [finish, setFinish] = useState<FinishLevel>(DEFAULT_ESTIMATE_INPUT.finish);
  const [sqft, setSqft] = useState(DEFAULT_ESTIMATE_INPUT.sqft);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refinements, setRefinements] = useState<EstimateRefinements>(DEFAULT_ESTIMATE_INPUT.refinements);
  const [userRefinements, setUserRefinements] = useState<Set<UserRefinementKey>>(new Set());

  const sizeConfig = getProjectSizeConfig(project);
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
    setProject(type);
    setSqft(getProjectSizeConfig(type).defaultSqft);
    setRefinements({ ...DEFAULT_ESTIMATE_INPUT.refinements });
    setUserRefinements(new Set());
  }

  function updateRefinement<K extends keyof EstimateRefinements>(key: K, value: EstimateRefinements[K]) {
    setRefinements((prev) => ({ ...prev, [key]: value }));
    markRefinement(key as UserRefinementKey);
  }

  function handleBookVisit() {
    sessionStorage.setItem(
      "brc_estimate",
      JSON.stringify(buildStoredEstimate(input, userRefinementCount))
    );
    document.getElementById("consult")?.scrollIntoView({ behavior: "smooth" });
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
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCalculatorInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "0px 0px -56px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Section id="calculator" divider>
      <div ref={sectionRef} className="container px-4 pb-24 lg:pb-0">
        <div className="max-w-6xl mx-auto mb-10">
          <div className="brc-label mb-3">Project Estimator</div>
          <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-3 text-foreground">
            Plan your project investment
          </h2>
          <p className="text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            Get a planning range in seconds. Add details below to improve estimate accuracy before your consultation.
          </p>
          <p className="text-xs text-muted-foreground/90 max-w-2xl">
            Planning estimate only, not a binding quote. Final pricing requires an in-home evaluation.
          </p>
        </div>

        {/* Mobile: compact result at top */}
        <div className="lg:hidden max-w-6xl mx-auto mb-8">
          <EstimateResultPanel
            result={result}
            selectionSummary={selectionSummary}
            onBookVisit={handleBookVisit}
            variant="full"
          />
        </div>

        <div className="grid lg:grid-cols-[3fr_2fr] gap-8 md:gap-12 items-start max-w-6xl mx-auto">
          <div className="space-y-8">
            <div>
              <div className="brc-label mb-4">Step 1: What are we remodeling?</div>
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
                        active ? "border-accent border-[1.5px] bg-accent/5" : "border-border"
                      )}
                    >
                      {active && (
                        <Check className="absolute top-3 right-3 h-4 w-4 text-accent" />
                      )}
                      <span className="font-medium text-sm text-foreground">{info.label}</span>
                      <span className="text-xs text-muted-foreground">{info.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="brc-label mb-4">Step 2: Choose a finish level</div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FINISH_LABELS) as FinishLevel[]).map((level) => {
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
                        active ? "border-accent border-[1.5px] bg-accent/5" : "border-border"
                      )}
                    >
                      {active && (
                        <Check className="absolute top-3 right-3 h-4 w-4 text-accent" />
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
              <div className="flex justify-between items-end mb-4">
                <div className="brc-label">Step 3: Size of the space</div>
                <div className="font-sans font-light text-2xl leading-none text-foreground">
                  {sqft.toLocaleString()}{" "}
                  <span className="text-sm font-sans text-muted-foreground">sqft</span>
                </div>
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
                <span>{sizeConfig.min.toLocaleString()} sqft</span>
                <span>{sizeConfig.max.toLocaleString()} sqft</span>
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
                    <span className="text-[10px] block mt-1 text-accent">{refineProgress}</span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform text-accent",
                    refineOpen && "rotate-180"
                  )}
                />
              </button>

              {refineOpen && (
                <div
                  id="refine-estimate-panel"
                  className="p-5 space-y-6 bg-card border-t border-border"
                >
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

                  <div>
                    <label className="brc-label mb-3 block">Plumbing and electrical scope</label>
                    <SelectButton
                      value={refinements.plumbingElectrical}
                      onChange={(v) => updateRefinement("plumbingElectrical", v)}
                      testIdPrefix="plumbing"
                      options={[
                        { value: "cosmetic", label: "Cosmetic", sub: "Fixtures only" },
                        { value: "partial", label: "Partial", sub: "Some rerouting" },
                        { value: "full", label: "Full", sub: "Complete update" },
                      ]}
                    />
                  </div>

                  {project === "kitchen" && (
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

                  {project === "bathroom" && (
                    <div>
                      <label htmlFor="fixture-count" className="brc-label mb-3 block">
                        Number of fixtures
                      </label>
                      <input
                        id="fixture-count"
                        type="number"
                        min={1}
                        max={8}
                        placeholder="e.g. 3"
                        value={refinements.fixtureCount ?? ""}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (e.target.value && Number.isFinite(n)) {
                            updateRefinement("fixtureCount", n);
                          }
                        }}
                        className="w-full p-3 rounded-sm text-sm bg-background border border-input"
                        data-testid="input-fixture-count"
                      />
                    </div>
                  )}

                  {project === "whole-home" && (
                    <div>
                      <label htmlFor="room-count" className="brc-label mb-3 block">
                        Rooms being remodeled
                      </label>
                      <input
                        id="room-count"
                        type="number"
                        min={1}
                        max={12}
                        placeholder="e.g. 4"
                        value={refinements.roomCount ?? ""}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (e.target.value && Number.isFinite(n)) {
                            updateRefinement("roomCount", n);
                          }
                        }}
                        className="w-full p-3 rounded-sm text-sm bg-background border border-input"
                        data-testid="input-room-count"
                      />
                    </div>
                  )}

                  {project === "addition" && (
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

                  <div>
                    <label className="brc-label mb-3 block">Project location</label>
                    <SelectButton
                      value={refinements.cityZone}
                      onChange={(v) => updateRefinement("cityZone", v)}
                      testIdPrefix="city"
                      allowUnset
                      options={[
                        { value: "boise-core", label: "Boise / Eagle" },
                        { value: "treasure-valley", label: "Treasure Valley" },
                        { value: "extended", label: "Extended area" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="brc-label mb-3 block">Desired timeline</label>
                    <SelectButton
                      value={refinements.timeline}
                      onChange={(v) => updateRefinement("timeline", v)}
                      testIdPrefix="timeline"
                      allowUnset
                      options={[
                        { value: "flexible", label: "Flexible", sub: "6+ months out" },
                        { value: "standard", label: "Standard", sub: "3 to 6 months" },
                        { value: "accelerated", label: "Soon", sub: "Under 3 months" },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: sticky result panel */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <EstimateResultPanel
              result={result}
              selectionSummary={selectionSummary}
              onBookVisit={handleBookVisit}
              variant="full"
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky summary bar while scrolling inputs */}
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
            <p className="font-sans text-lg text-foreground tabular-nums" data-testid="mobile-estimate-range">
              ${Math.round(result.priceLow / 1000)}k to ${Math.round(result.priceHigh / 1000)}k
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
