"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Check, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import {
  type ProjectType,
  type FinishLevel,
  type EstimateRefinements,
  type EstimateInput,
  DEFAULT_ESTIMATE_INPUT,
  PROJECT_LABELS,
  FINISH_LABELS,
  calculateEstimate,
  buildStoredEstimate,
} from "@/shared/estimateEngine";

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

function SelectButton<T extends string>({
  value,
  options,
  onChange,
  testIdPrefix,
}: {
  value: T;
  options: { value: T; label: string; sub?: string }[];
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
            className={cn(
              "relative flex flex-col items-start gap-1 p-4 rounded-sm text-left transition-all border bg-card",
              active ? "border-accent border-[1.5px] bg-accent/5" : "border-border"
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

  const input: EstimateInput = useMemo(
    () => ({ project, finish, sqft, refinements }),
    [project, finish, sqft, refinements]
  );

  const result = useMemo(() => calculateEstimate(input), [input]);

  const sliderPct = ((sqft - 100) / (2000 - 100)) * 100;
  const sliderBackground = `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${sliderPct}%, hsl(var(--border)) ${sliderPct}%, hsl(var(--border)) 100%)`;

  function handleSelectProject(type: ProjectType) {
    setProject(type);
    setRefinements((prev) => ({
      ...prev,
      cabinetTier: null,
      fixtureCount: null,
      roomCount: null,
      stories: null,
    }));
  }

  function updateRefinement<K extends keyof EstimateRefinements>(key: K, value: EstimateRefinements[K]) {
    setRefinements((prev) => ({ ...prev, [key]: value }));
  }

  function handleRefineToggle() {
    if (!refineOpen) {
      setRefinements((prev) => ({
        ...prev,
        cityZone: prev.cityZone ?? "treasure-valley",
        timeline: prev.timeline ?? "standard",
        cabinetTier: project === "kitchen" ? (prev.cabinetTier ?? "semi-custom") : prev.cabinetTier,
        fixtureCount: project === "bathroom" ? (prev.fixtureCount ?? 3) : prev.fixtureCount,
        roomCount: project === "whole-home" ? (prev.roomCount ?? 4) : prev.roomCount,
        stories: project === "addition" ? (prev.stories ?? 1) : prev.stories,
      }));
    }
    setRefineOpen(!refineOpen);
  }

  function handleBookVisit() {
    sessionStorage.setItem("brc_estimate", JSON.stringify(buildStoredEstimate(input)));
    document.getElementById("consult")?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    sessionStorage.setItem("brc_estimate", JSON.stringify(buildStoredEstimate(input)));
  }, [input]);

  return (
    <Section id="calculator" divider>
      <div className="container px-4">
        <div className="max-w-6xl mx-auto mb-10">
          <div className="brc-label mb-3">Project Estimator</div>
          <h2 className="font-serif font-light text-section-title md:text-section-title-lg mb-3 text-foreground">
            Plan your project investment
          </h2>
          <p className="text-sm max-w-2xl leading-relaxed text-muted-foreground">
            Get a planning range in seconds. Add details below to refine your estimate and build confidence before your consultation.
          </p>
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
                      onClick={() => handleSelectProject(type)}
                      data-testid={`button-project-${type}`}
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
                  return (
                    <button
                      key={level}
                      onClick={() => setFinish(level)}
                      data-testid={`button-finish-${level}`}
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
              <div className="flex justify-between items-end mb-4">
                <div className="brc-label">Step 3: Size of the space</div>
                <div className="font-serif font-light text-2xl leading-none text-foreground">
                  {sqft.toLocaleString()}{" "}
                  <span className="text-sm font-sans text-muted-foreground">sqft</span>
                </div>
              </div>
              <input
                type="range"
                className="brc-slider"
                min={100}
                max={2000}
                step={50}
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                style={{ background: sliderBackground }}
                data-testid="slider-size"
                aria-label="Project size in square feet"
              />
              <div className="flex justify-between text-[11px] mt-2 tracking-wide text-muted-foreground">
                <span>100 sqft</span>
                <span>2,000 sqft</span>
              </div>
            </div>

            <div className="rounded-sm overflow-hidden border border-border marketing-card">
              <button
                type="button"
                onClick={handleRefineToggle}
                className="w-full flex items-center justify-between p-5 text-left bg-surface-muted hover:bg-muted/80 transition-colors"
                data-testid="button-refine-toggle"
              >
                <div>
                  <span className="font-medium text-sm block text-foreground">
                    Refine my estimate
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Add project details for a more tailored planning range
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform text-accent",
                    refineOpen && "rotate-180"
                  )}
                />
              </button>

              {refineOpen && (
                <div className="p-5 space-y-6 bg-card border-t border-border">
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
                        value={refinements.cabinetTier ?? "semi-custom"}
                        onChange={(v) => updateRefinement("cabinetTier", v)}
                        testIdPrefix="cabinet"
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
                      <label className="brc-label mb-3 block">Number of fixtures</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={refinements.fixtureCount ?? 3}
                        onChange={(e) => updateRefinement("fixtureCount", Number(e.target.value))}
                        className="w-full p-3 rounded-sm text-sm bg-background border border-input"
                        data-testid="input-fixture-count"
                      />
                    </div>
                  )}

                  {project === "whole-home" && (
                    <div>
                      <label className="brc-label mb-3 block">Rooms being remodeled</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={refinements.roomCount ?? 4}
                        onChange={(e) => updateRefinement("roomCount", Number(e.target.value))}
                        className="w-full p-3 rounded-sm text-sm bg-background border border-input"
                        data-testid="input-room-count"
                      />
                    </div>
                  )}

                  {project === "addition" && (
                    <div>
                      <label className="brc-label mb-3 block">Stories involved</label>
                      <SelectButton
                        value={String(refinements.stories ?? 1) as "1" | "2"}
                        onChange={(v) => updateRefinement("stories", Number(v))}
                        testIdPrefix="stories"
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
                      value={refinements.cityZone ?? "treasure-valley"}
                      onChange={(v) => updateRefinement("cityZone", v)}
                      testIdPrefix="city"
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
                      value={refinements.timeline ?? "standard"}
                      onChange={(v) => updateRefinement("timeline", v)}
                      testIdPrefix="timeline"
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

          <div className="lg:sticky lg:top-24">
            <div className="rounded-sm p-8 bg-inverse text-inverse-foreground shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="brc-label text-inverse-muted">
                  Planning range
                </div>
                <div className="text-[10px] tracking-wide uppercase px-2 py-1 rounded-sm bg-accent/20 text-inverse-foreground/90">
                  {result.confidenceLabel}
                </div>
              </div>

              <div className="font-serif font-light leading-none mb-4 text-[clamp(28px,3.5vw,44px)] text-inverse-foreground">
                <AnimatedPrice value={result.priceLow} />
                {" – "}
                <AnimatedPrice value={result.priceHigh} />
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-[11px] mb-1.5 text-inverse-muted">
                  <span>Estimate confidence</span>
                  <span>{result.confidencePercent}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-inverse-foreground/15">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-accent"
                    style={{ width: `${result.confidencePercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
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

              <Button
                variant="brandAccent"
                onClick={handleBookVisit}
                className="w-full mb-3"
                data-testid="button-book-visit"
              >
                Schedule your consultation
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-[11px] text-center mb-5 text-inverse-muted">
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
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
