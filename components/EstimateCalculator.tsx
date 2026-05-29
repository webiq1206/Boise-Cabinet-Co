"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

type ProjectType = "kitchen" | "bathroom" | "whole-home" | "addition";
type FinishLevel = "refresh" | "mid-range" | "high-end" | "luxury";
type SizePreset = "compact" | "average" | "spacious";

interface PriceData {
  low: number;
  high: number;
  roi: number;
  included: string[];
}

const PROJECT_LABELS: Record<ProjectType, { label: string; icon: string; sub: string }> = {
  kitchen: { label: "Kitchen", icon: "🍳", sub: "Cabinets, counters, appliances" },
  bathroom: { label: "Bathroom", icon: "🛁", sub: "Tile, fixtures, vanity" },
  "whole-home": { label: "Whole-Home", icon: "🏠", sub: "Multi-room renovation" },
  addition: { label: "Room Addition", icon: "📐", sub: "New square footage" },
};

const FINISH_LABELS: Record<FinishLevel, { label: string; sub: string }> = {
  refresh: { label: "Refresh", sub: "Cosmetic upgrades, repaint" },
  "mid-range": { label: "Mid-Range", sub: "Replace & upgrade" },
  "high-end": { label: "High-End", sub: "Premium finishes" },
  luxury: { label: "Luxury", sub: "No constraints" },
};

const SIZE_MULTIPLIERS: Record<SizePreset, { label: string; sub: string; mult: number }> = {
  compact: { label: "Compact", sub: "Under 200 sqft", mult: 0.78 },
  average: { label: "Average", sub: "200 – 400 sqft", mult: 1.0 },
  spacious: { label: "Spacious", sub: "400+ sqft", mult: 1.55 },
};

const PRICE_MATRIX: Record<ProjectType, Record<FinishLevel, PriceData>> = {
  kitchen: {
    refresh: {
      low: 15000, high: 35000, roi: 72,
      included: ["New countertops (laminate/entry quartz)", "Cabinet repaints or door replacement", "Standard appliance package", "New plumbing fixtures", "LVP or tile flooring"],
    },
    "mid-range": {
      low: 35000, high: 75000, roi: 74,
      included: ["Semi-custom cabinetry", "Quartz or granite countertops", "Mid-range appliance package", "Tile backsplash", "Updated plumbing & electrical"],
    },
    "high-end": {
      low: 75000, high: 150000, roi: 70,
      included: ["Custom or semi-custom cabinetry", "Premium stone countertops", "High-end appliance package", "Island addition or expansion", "Custom tile work & lighting redesign"],
    },
    luxury: {
      low: 150000, high: 300000, roi: 62,
      included: ["Fully custom cabinetry", "Exotic stone countertops", "Professional-grade appliances", "Structural layout changes", "Smart home integration"],
    },
  },
  bathroom: {
    refresh: {
      low: 5000, high: 15000, roi: 70,
      included: ["New vanity & mirror", "Tile shower refresh", "Updated fixtures & hardware", "New toilet if needed", "Lighting update"],
    },
    "mid-range": {
      low: 15000, high: 35000, roi: 71,
      included: ["Custom tile shower", "Semi-custom vanity", "Heated floors", "Updated plumbing", "New windows"],
    },
    "high-end": {
      low: 35000, high: 80000, roi: 65,
      included: ["Wet room or custom walk-in shower", "Freestanding soaking tub", "Radiant heated floors", "Custom built-ins", "High-end plumbing fixtures"],
    },
    luxury: {
      low: 80000, high: 160000, roi: 58,
      included: ["Steam shower system", "Spa soaking tub", "Heated floors & walls", "Full layout reconfiguration", "Designer fixtures throughout"],
    },
  },
  "whole-home": {
    refresh: {
      low: 25000, high: 60000, roi: 65,
      included: ["Kitchen & bath cosmetic refresh", "New flooring throughout", "Fresh interior paint", "Updated light fixtures"],
    },
    "mid-range": {
      low: 60000, high: 150000, roi: 68,
      included: ["Kitchen & bath mid-range renovation", "Open-concept conversion", "New flooring throughout", "Updated HVAC & windows"],
    },
    "high-end": {
      low: 150000, high: 350000, roi: 62,
      included: ["Custom kitchen & bath renovation", "Structural modifications", "New windows & doors", "High-end finishes throughout"],
    },
    luxury: {
      low: 350000, high: 700000, roi: 55,
      included: ["Full gut renovation", "Structural engineering", "Smart home system", "Premium finishes throughout", "New HVAC, electrical & plumbing"],
    },
  },
  addition: {
    refresh: {
      low: 40000, high: 80000, roi: 60,
      included: ["New room with standard finishes", "Basic electrical & HVAC", "Matching exterior siding & roofline"],
    },
    "mid-range": {
      low: 80000, high: 180000, roi: 63,
      included: ["Bedroom or family room addition", "Full HVAC integration", "Updated electrical panel", "Mid-range finishes"],
    },
    "high-end": {
      low: 180000, high: 400000, roi: 58,
      included: ["400–600 sqft addition", "High-end finishes", "Full integration with existing layout", "Custom windows & doors"],
    },
    luxury: {
      low: 400000, high: 750000, roi: 50,
      included: ["600+ sqft addition", "Structural engineering", "Premium finishes throughout", "Custom design integration"],
    },
  },
};

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

function usePrevious<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => { ref.current = value; });
  return ref.current;
}

function AnimatedPrice({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = usePrevious(value);

  useEffect(() => {
    if (prev === value) return;
    const steps = 18;
    const step = (value - prev) / steps;
    let current = prev;
    let i = 0;
    const id = setInterval(() => {
      i++;
      current += step;
      if (i >= steps) { setDisplay(value); clearInterval(id); }
      else setDisplay(Math.round(current));
    }, 14);
    return () => clearInterval(id);
  }, [value, prev]);

  return <span className="tabular-nums">{prefix}{display >= 1000000 ? `$${(display / 1000000).toFixed(1)}M` : display >= 1000 ? `$${Math.round(display / 1000)}k` : `$${display.toLocaleString()}`}</span>;
}

export function EstimateCalculator() {
  const [project, setProject] = useState<ProjectType | null>(null);
  const [finish, setFinish] = useState<FinishLevel | null>(null);
  const [size, setSize] = useState<SizePreset>("average");
  const [showResult, setShowResult] = useState(false);

  const priceData = project && finish ? PRICE_MATRIX[project][finish] : null;
  const mult = SIZE_MULTIPLIERS[size].mult;
  const priceLow = priceData ? Math.round((priceData.low * mult) / 1000) * 1000 : 0;
  const priceHigh = priceData ? Math.round((priceData.high * mult) / 1000) * 1000 : 0;

  useEffect(() => {
    if (project && finish) setShowResult(true);
  }, [project, finish]);

  function handleBookVisit() {
    if (priceData && project && finish) {
      sessionStorage.setItem("brc_estimate", JSON.stringify({
        project,
        finish,
        size,
        priceLow,
        priceHigh,
        roi: priceData.roi,
      }));
    }
    const el = document.getElementById("consult");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="calculator" className="py-20 md:py-28 bg-secondary/40">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">Instant Range</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              What will my project cost?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Select your project type and finish level to get a starting-point range in seconds.
            </p>
          </div>

          {/* Step 1: Project type */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Step 1 — What are we remodeling?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(PROJECT_LABELS) as ProjectType[]).map((type) => {
                const info = PROJECT_LABELS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setProject(type)}
                    data-testid={`button-project-${type}`}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-md border-2 text-center transition-all hover-elevate ${
                      project === type
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {project === type && (
                      <span className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </span>
                    )}
                    <span className="text-2xl">{info.icon}</span>
                    <span className="font-semibold text-sm text-foreground">{info.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{info.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Finish level */}
          {project && (
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Step 2 — Choose a finish level
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(FINISH_LABELS) as FinishLevel[]).map((level) => {
                  const info = FINISH_LABELS[level];
                  return (
                    <button
                      key={level}
                      onClick={() => setFinish(level)}
                      data-testid={`button-finish-${level}`}
                      className={`relative flex flex-col items-start gap-1 p-4 rounded-md border-2 text-left transition-all hover-elevate ${
                        finish === level
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                    >
                      {finish === level && (
                        <span className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </span>
                      )}
                      <span className="font-semibold text-sm text-foreground">{info.label}</span>
                      <span className="text-xs text-muted-foreground">{info.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Size */}
          {project && finish && (
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Step 3 — Roughly how large is the space?
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(SIZE_MULTIPLIERS) as SizePreset[]).map((s) => {
                  const info = SIZE_MULTIPLIERS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      data-testid={`button-size-${s}`}
                      className={`flex flex-col items-center gap-1 p-4 rounded-md border-2 text-center transition-all hover-elevate ${
                        size === s
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <span className="font-semibold text-sm text-foreground">{info.label}</span>
                      <span className="text-xs text-muted-foreground">{info.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results */}
          {showResult && priceData && (
            <div className="bg-card border border-border rounded-md p-6 md:p-8 mt-2">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Starting-Point Range</p>
                  <div className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-1">
                    <AnimatedPrice value={priceLow} /> – <AnimatedPrice value={priceHigh} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Estimated ROI at resale: ~{priceData.roi}% recouped
                  </p>
                  <Button onClick={handleBookVisit} className="w-full sm:w-auto" size="lg">
                    Book my free in-home visit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">Typically included:</p>
                  <ul className="space-y-2">
                    {priceData.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-6 pt-4 border-t">
                This is a starting-point estimate only, not a contract or firm bid. Final pricing is determined after a free in-home consultation and detailed scope review. Ranges reflect Boise Treasure Valley market conditions as of 2025.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
