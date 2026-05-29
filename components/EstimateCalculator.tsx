"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";

type ProjectType = "kitchen" | "bathroom" | "whole-home" | "addition";
type FinishLevel = "refresh" | "mid-range" | "high-end" | "luxury";

interface PriceData {
  low: number;
  high: number;
  roi: number;
  included: string[];
}

const PROJECT_LABELS: Record<ProjectType, { label: string; sub: string }> = {
  kitchen: { label: "Kitchen", sub: "Cabinets, counters, appliances" },
  bathroom: { label: "Bathroom", sub: "Tile, fixtures, vanity" },
  "whole-home": { label: "Whole-Home", sub: "Multi-room renovation" },
  addition: { label: "Room Addition", sub: "New square footage" },
};

const FINISH_LABELS: Record<FinishLevel, { label: string; sub: string }> = {
  refresh: { label: "Refresh", sub: "Cosmetic upgrades, repaint" },
  "mid-range": { label: "Mid-Range", sub: "Replace & upgrade" },
  "high-end": { label: "High-End", sub: "Premium finishes" },
  luxury: { label: "Luxury", sub: "No constraints" },
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

export function EstimateCalculator() {
  const [project, setProject] = useState<ProjectType | null>(null);
  const [finish, setFinish] = useState<FinishLevel | null>(null);
  const [sqft, setSqft] = useState(300);
  const [showResult, setShowResult] = useState(false);

  const priceData = project && finish ? PRICE_MATRIX[project][finish] : null;
  const sizeMultiplier = Math.max(0.5, Math.min(2.5, sqft / 300));
  const priceLow = priceData ? Math.round((priceData.low * sizeMultiplier) / 1000) * 1000 : 0;
  const priceHigh = priceData ? Math.round((priceData.high * sizeMultiplier) / 1000) * 1000 : 0;

  const sliderPct = ((sqft - 100) / (2000 - 100)) * 100;
  const sliderBackground = `linear-gradient(to right, #999F93 0%, #999F93 ${sliderPct}%, #C9BCA9 ${sliderPct}%, #C9BCA9 100%)`;

  useEffect(() => {
    if (project && finish) setShowResult(true);
  }, [project, finish]);

  function handleSelectProject(type: ProjectType) {
    setProject(type);
    setFinish(null);
  }

  function handleBookVisit() {
    if (priceData && project && finish) {
      sessionStorage.setItem("brc_estimate", JSON.stringify({
        project,
        finish,
        sqft,
        priceLow,
        priceHigh,
        roi: priceData.roi,
      }));
    }
    document.getElementById("consult")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="calculator" style={{ background: "#E2DED2" }} className="py-20 md:py-28">
      <div className="container px-4">
        <div className="grid md:grid-cols-[3fr_2fr] gap-8 md:gap-12 items-start max-w-6xl mx-auto">

          {/* ── LEFT: Inputs ── */}
          <div>
            <div className="brc-label mb-3">Instant Range</div>
            <h2
              className="font-serif font-light text-3xl md:text-4xl mb-3"
              style={{ color: "#3A3E3D" }}
            >
              What will my project cost?
            </h2>
            <p className="text-sm mb-10" style={{ color: "#6E736F" }}>
              Select your project type and finish level to get a starting-point range in seconds.
            </p>

            {/* Step 1: Project type */}
            <div className="mb-8">
              <div className="brc-label mb-4">Step 1 — What are we remodeling?</div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PROJECT_LABELS) as ProjectType[]).map((type) => {
                  const info = PROJECT_LABELS[type];
                  const active = project === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleSelectProject(type)}
                      data-testid={`button-project-${type}`}
                      className="relative flex flex-col items-start gap-1.5 p-5 rounded-sm text-left transition-all"
                      style={{
                        background: active ? "rgba(153,159,147,0.06)" : "#FFFFFF",
                        border: active ? "1.5px solid #999F93" : "1px solid rgba(58,62,61,0.12)",
                      }}
                    >
                      {active && (
                        <Check
                          className="absolute top-3 right-3 h-4 w-4"
                          style={{ color: "#999F93" }}
                        />
                      )}
                      <span className="font-medium text-sm" style={{ color: "#3A3E3D" }}>
                        {info.label}
                      </span>
                      <span className="text-xs" style={{ color: "#6E736F" }}>
                        {info.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Finish level */}
            {project && (
              <div className="mb-8">
                <div className="brc-label mb-4">Step 2 — Choose a finish level</div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(FINISH_LABELS) as FinishLevel[]).map((level) => {
                    const info = FINISH_LABELS[level];
                    const active = finish === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setFinish(level)}
                        data-testid={`button-finish-${level}`}
                        className="relative flex flex-col items-start gap-1.5 p-5 rounded-sm text-left transition-all"
                        style={{
                          background: active ? "rgba(153,159,147,0.06)" : "#FFFFFF",
                          border: active ? "1.5px solid #999F93" : "1px solid rgba(58,62,61,0.12)",
                        }}
                      >
                        {active && (
                          <Check
                            className="absolute top-3 right-3 h-4 w-4"
                            style={{ color: "#999F93" }}
                          />
                        )}
                        <span className="font-medium text-sm" style={{ color: "#3A3E3D" }}>
                          {info.label}
                        </span>
                        <span className="text-xs" style={{ color: "#6E736F" }}>
                          {info.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Size slider */}
            {project && finish && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <div className="brc-label">Step 3 — Size of the space</div>
                  <div
                    className="font-serif font-light text-2xl leading-none"
                    style={{ color: "#3A3E3D" }}
                  >
                    {sqft.toLocaleString()} <span className="text-sm font-sans" style={{ color: "#6E736F" }}>sqft</span>
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
                <div
                  className="flex justify-between text-[11px] mt-2 tracking-wide"
                  style={{ color: "#6E736F" }}
                >
                  <span>100 sqft</span>
                  <span>2,000 sqft</span>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Result panel ── */}
          <div className="md:sticky md:top-24">
            {priceData ? (
              <div
                className="rounded-sm p-8"
                style={{ background: "#3A3E3D" }}
              >
                <div
                  className="brc-label mb-5"
                  style={{ color: "rgba(255,255,255,0.62)" }}
                >
                  Starting-Point Range
                </div>
                <div
                  className="font-serif font-light leading-none mb-2"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 44px)",
                    color: "#FFFFFF",
                  }}
                >
                  <AnimatedPrice value={priceLow} />
                  {" – "}
                  <AnimatedPrice value={priceHigh} />
                </div>
                <p
                  className="text-xs mb-7"
                  style={{ color: "rgba(255,255,255,0.66)" }}
                >
                  Estimated ROI at resale: ~{priceData.roi}% recouped
                </p>

                <div className="space-y-2.5 mb-8">
                  {priceData.included.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      <Check
                        className="h-4 w-4 flex-shrink-0 mt-0.5"
                        style={{ color: "#999F93" }}
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleBookVisit}
                  className="w-full py-3.5 text-sm font-medium rounded-sm flex items-center justify-center gap-2"
                  style={{ background: "#3A3E3D", color: "#FFFFFF" }}
                  data-testid="button-book-visit"
                >
                  Book my free in-home visit
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p
                  className="text-[11px] mt-5 leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.62)" }}
                >
                  Starting-point estimate only. Not a contract or firm bid. Final pricing
                  determined after your free in-home consultation.
                </p>
              </div>
            ) : (
              <div
                className="rounded-sm p-8 flex flex-col items-center justify-center text-center"
                style={{
                  background: "#3A3E3D",
                  minHeight: "220px",
                }}
              >
                <p
                  className="text-sm leading-relaxed max-w-[200px]"
                  style={{ color: "rgba(255,255,255,0.62)" }}
                >
                  Select a project type and finish level to see your starting-point range
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
