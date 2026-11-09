"use client";

import { useId, useMemo, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CTA_REQUEST_QUOTE } from "@/shared/ctaCopy";
import {
  type FinishCategory,
  calculateEstimate,
  formatPlanningCurrency,
  getDefaultSelectionsForProject,
  getProjectSizeConfig,
} from "@/shared/estimateEngine";

/**
 * Homepage interactive proof (C14): base-run slider + finish choice cards →
 * planning range from shared/estimateEngine with no email gate.
 */
const FINISH_LOOKS: ReadonlyArray<{
  value: FinishCategory;
  label: string;
  sub: string;
}> = [
  { value: "matte", label: "Matte", sub: "Most kitchens" },
  { value: "woodgrain", label: "Woodgrain", sub: "Warm texture" },
  { value: "gloss", label: "Gloss", sub: "High sheen" },
];

const SIZE = getProjectSizeConfig("kitchen");

export function KitchenPlanningRange() {
  const headingId = useId();
  const sizeLabelId = useId();
  const finishLabelId = useId();
  const [size, setSize] = useState(SIZE.default);
  const [finish, setFinish] = useState<FinishCategory>("matte");

  const result = useMemo(() => {
    const sel = getDefaultSelectionsForProject("kitchen");
    sel.size = size;
    // Typical kitchen: uppers scale with the base run (~0.75×), clamped to config.
    const upperDefault = SIZE.uppers?.default ?? 0;
    const upperMax = SIZE.uppers?.max ?? upperDefault;
    sel.sizeUpper = Math.min(
      upperMax,
      Math.max(0, Math.round((size * 0.75) / (SIZE.uppers?.step ?? 2)) * (SIZE.uppers?.step ?? 2)),
    );
    sel.finishCategory = finish;
    // Enough detail for a planning band without pretending a firm bid.
    return calculateEstimate(sel, 3);
  }, [size, finish]);

  const rangeLabel = result
    ? `${formatPlanningCurrency(result.priceLow)} to ${formatPlanningCurrency(result.priceHigh)}`
    : null;

  return (
    <section
      id="ranges"
      className="kitchen-planning-range fr-band"
      aria-labelledby={headingId}
      data-testid="kitchen-planning-range"
    >
      <div className="section wrap">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PLANNING RANGES</p>
          <h2 id={headingId}>
            What full kitchens
            <br />
            <em>usually plan for.</em>
          </h2>
        </div>
        <p>
          Move the slider to match your base run and pick a finish look. You get a planning
          range right away, with no email required. Share your room and we answer your questions
          and help you work out the next step.
        </p>
      </div>

      <div className="kitchen-planning-panel">
        <div className="kitchen-planning-controls">
          <div className="kitchen-planning-size">
            <div className="kitchen-planning-size-head">
              <label id={sizeLabelId} htmlFor="kitchen-base-run">
                Base cabinet run
              </label>
              <span className="kitchen-planning-size-value" aria-live="polite">
                {size} lf
              </span>
            </div>
            <Slider
              id="kitchen-base-run"
              aria-labelledby={sizeLabelId}
              min={SIZE.min}
              max={SIZE.max}
              step={SIZE.step}
              value={[size]}
              onValueChange={(v) => setSize(v[0] ?? SIZE.default)}
              className="kitchen-planning-slider"
              data-testid="kitchen-planning-size"
            />
            <div className="kitchen-planning-size-ends" aria-hidden="true">
              <span>{SIZE.min} lf</span>
              <span>{SIZE.max} lf</span>
            </div>
          </div>

          <div className="kitchen-planning-finish">
            <p id={finishLabelId} className="kitchen-planning-finish-label">
              Finish look
            </p>
            <div
              role="radiogroup"
              aria-labelledby={finishLabelId}
              className="kitchen-planning-finish-grid"
            >
              {FINISH_LOOKS.map((option) => {
                const selected = finish === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`kitchen-planning-choice${selected ? " is-selected" : ""}`}
                    onClick={() => setFinish(option.value)}
                    data-testid={`kitchen-planning-finish-${option.value}`}
                  >
                    <span className="kitchen-planning-choice-title">{option.label}</span>
                    <span className="kitchen-planning-choice-sub">{option.sub}</span>
                    {selected ? (
                      <span className="kitchen-planning-choice-check" aria-hidden="true">
                        <Check size={14} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="kitchen-planning-result fr-range-result" aria-live="polite" data-testid="kitchen-planning-result">
          <p className="eyebrow">PLANNING RANGE (INSTALLED CABINETRY)</p>
          {rangeLabel ? (
            <p className="kitchen-planning-figure" data-testid="kitchen-planning-figure">
              {rangeLabel}
            </p>
          ) : (
            <p className="kitchen-planning-figure-empty">Adjust size to see a range.</p>
          )}
          <ul className="kitchen-planning-disclaimer">
            <li>Modeled 2026 Treasure Valley planning figures from our estimator engine (linear feet, door, finish, and construction) for cabinetry supplied and installed.</li>
            <li>Countertops, plumbing, electrical, demolition, and haul-away are scoped separately when needed. Not a firm bid.</li>
          </ul>
          <a className="text-link" href="/estimate" data-testid="kitchen-planning-cta">
            {CTA_REQUEST_QUOTE} <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </aside>
      </div>
      </div>
    </section>
  );
}
