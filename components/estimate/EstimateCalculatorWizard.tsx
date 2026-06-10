"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  ChefHat,
  Bath,
  House,
  Boxes,
  Warehouse,
  Columns2,
  LayoutDashboard,
  LayoutPanelLeft,
  Square,
  Grid2x2,
  Rows2,
  Container,
  LayoutGrid,
  Layers,
  Star,
  Gem,
  Shield,
  ShieldCheck,
  Crown,
  Box,
  Package,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { LAYOUT_DIAGRAM_SVG } from "@/shared/catalog/generated/layoutDiagrams";
import { cn } from "@/lib/utils";
import { DisplayNum } from "@/components/marketing";
import { AnimatedPrice, EstimateResultPanel } from "@/components/estimate/EstimateResultPanel";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisualOptionGrid } from "@/components/catalog/visual";
import { getMostLovedFinishes } from "@/shared/catalog/finishFilters";
import { GuidedFlowShell, type GuidedStep } from "@/components/guided-flow";
import { useModals } from "@/components/modals/ModalProvider";
import { trackEstimatorEvent } from "@/lib/design/designAnalytics";
import { loadWizardState, saveWizardState } from "@/lib/estimate/wizardPersistence";
import {
  type ProjectType,
  type EstimateSelections,
  type SelectionStepKey,
  type SelectOption,
  EMPTY_SELECTIONS,
  PROJECT_LABELS,
  getProjectSizeConfig,
  getStepVisibility,
  getVisibleSteps,
  getLayoutOptions,
  getDoorStyleOptions,
  getFinishColorOptions,
  applyFinishSlug,
  getFinishTint,
  FINISH_CATEGORY_OPTIONS,
  CONSTRUCTION_OPTIONS,
  emptySelectionsForProject,
  isPriceable,
  calculateEstimate,
  buildStoredEstimate,
  buildSelectionSummary,
  formatPlanningCurrency,
} from "@/shared/estimateEngine";

const OPTION_ICONS: Record<string, LucideIcon> = {
  ChefHat,
  Bath,
  House,
  Boxes,
  Warehouse,
  Columns2,
  LayoutDashboard,
  LayoutPanelLeft,
  Square,
  Grid2x2,
  Rows2,
  Container,
  LayoutGrid,
  Layers,
  Star,
  Gem,
  Shield,
  ShieldCheck,
  Crown,
  Box,
  Package,
  Sparkles,
};

type WizardStepId = "project" | "size" | "layout" | "style" | "result";

const WIZARD_META: Record<WizardStepId, GuidedStep> = {
  project: { id: "project", label: "Your project", shortLabel: "Project" },
  size: { id: "size", label: "Size & quality", shortLabel: "Size" },
  layout: { id: "layout", label: "Layout", shortLabel: "Layout" },
  style: { id: "style", label: "Door & finish", shortLabel: "Style" },
  result: { id: "result", label: "Your range", shortLabel: "Range" },
};

function getWizardStepIds(project: ProjectType | null): WizardStepId[] {
  const ids: WizardStepId[] = ["project", "size"];
  if (project && getStepVisibility(project).layout) ids.push("layout");
  ids.push("style", "result");
  return ids;
}

const DEFAULT_OPTION_VISUAL_ALT = "Cabinet project option illustration";

function OptionVisual({
  image,
  imageAlt,
  icon,
  svg,
  svgStyle,
}: {
  image?: string;
  imageAlt?: string;
  icon?: string;
  svg?: string;
  svgStyle?: React.CSSProperties;
}) {
  const alt = imageAlt?.trim() || DEFAULT_OPTION_VISUAL_ALT;

  if (svg) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={svgStyle}
        className="relative w-full aspect-[4/3] mb-2.5 overflow-hidden rounded-sm bg-muted [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }
  if (image) {
    return (
      <div className="relative w-full aspect-[4/3] mb-2.5 overflow-hidden rounded-sm bg-muted">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 50vw, 200px"
          className="object-cover img-brand-grade"
        />
      </div>
    );
  }
  if (icon) {
    const Icon = OPTION_ICONS[icon];
    if (!Icon) return null;
    return (
      <span className="flex items-center justify-center h-9 w-9 mb-2.5 rounded-sm border border-border bg-muted/50 text-foreground/80">
        <Icon className="h-4 w-4" />
      </span>
    );
  }
  return null;
}

function SelectButton<T extends string>({
  value,
  options,
  onChange,
  testIdPrefix,
  svgByValue,
  svgStyle,
}: {
  value: T | "";
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  testIdPrefix: string;
  svgByValue?: Record<string, string>;
  svgStyle?: React.CSSProperties;
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
              "relative flex flex-col items-start gap-1 p-4 min-h-[44px] rounded-md text-left transition-all border bg-card",
              active
                ? "border-foreground/40 border-[1.5px] bg-muted/40"
                : "border-border hover:border-foreground/30",
            )}
          >
            {active && (
              <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            <OptionVisual
              image={opt.image}
              imageAlt={opt.imageAlt}
              icon={opt.icon}
              svg={svgByValue?.[opt.value]}
              svgStyle={svgStyle}
            />
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

/** Good / Better / Best rank, used to fill the tier-strength meter. */
const CONSTRUCTION_TIER_RANK: Record<string, number> = { good: 1, better: 2, best: 3 };

/** Three ascending bars filled up to the tier's rank, signalling the ladder. */
function TierStrength({ rank }: { rank: number }) {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full transition-colors",
            i === 1 ? "h-1.5" : i === 2 ? "h-2.5" : "h-3.5",
            i <= rank ? "bg-foreground" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

/**
 * Dedicated Good / Better / Best selector. Full-width stacked cards read as an
 * ascending quality ladder far better than a wrapping 2-up grid. Keeps the same
 * `${testIdPrefix}-${value}` hooks and aria-pressed semantics as SelectButton.
 */
function ConstructionTierSelect({
  value,
  options,
  onChange,
  testIdPrefix,
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const active = value === opt.value;
        const rank = CONSTRUCTION_TIER_RANK[opt.value] ?? 1;
        const Icon = opt.icon ? OPTION_ICONS[opt.icon] : undefined;
        const popular = opt.value === "better";
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            data-testid={`${testIdPrefix}-${opt.value}`}
            aria-pressed={active}
            className={cn(
              "group relative flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all",
              active
                ? "border-foreground/40 border-[1.5px] bg-muted/40 shadow-sm"
                : "border-border bg-card hover:border-foreground/30 hover:bg-muted/20",
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors",
                active
                  ? "border-foreground/30 bg-background text-foreground"
                  : "border-border bg-muted/40 text-foreground/70 group-hover:text-foreground",
              )}
            >
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium text-sm text-foreground">{opt.label}</span>
                <TierStrength rank={rank} />
                {popular && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                    Most popular
                  </span>
                )}
              </span>
              {opt.sub && (
                <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">
                  {opt.sub}
                </span>
              )}
            </span>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                active ? "border-foreground bg-foreground text-background" : "border-border bg-transparent",
              )}
            >
              {active && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * A single labelled linear-foot slider. Starts visually unset (no number, grey
 * track) until the visitor drags it, so nothing is pre-selected.
 */
function SizeSlider({
  label,
  value,
  min,
  max,
  step,
  unitNoun,
  unitShort,
  testId,
  hint,
  onChange,
}: {
  label: string;
  value: number | null;
  min: number;
  max: number;
  step: number;
  unitNoun: string;
  unitShort: string;
  testId: string;
  hint: string;
  onChange: (v: number) => void;
}) {
  const pct = value != null ? Math.round(((value - min) / (max - min)) * 100) : 0;
  const background = `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${pct}%, hsl(var(--border)) ${pct}%, hsl(var(--border)) 100%)`;
  return (
    <div>
      <label className="brc-label mb-3 block">{label}</label>
      <div className="space-y-4">
        {value != null ? (
          <DisplayNum className="text-3xl leading-none text-foreground">
            {value.toLocaleString()}{" "}
            <span className="text-sm font-sans text-muted-foreground">{unitNoun}</span>
          </DisplayNum>
        ) : (
          <p className="text-sm text-muted-foreground" data-testid={`${testId}-unset-hint`}>
            {hint}
          </p>
        )}
        <input
          type="range"
          className="brc-slider w-full min-h-[44px]"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          aria-label={label}
          aria-valuetext={value != null ? `${value} ${unitNoun}` : "Not set"}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background }}
          data-testid={testId}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            <DisplayNum>{min.toLocaleString()}</DisplayNum> {unitShort}
          </span>
          <span>
            <DisplayNum>{max.toLocaleString()}</DisplayNum> {unitShort}
          </span>
        </div>
      </div>
    </div>
  );
}

interface EstimateCalculatorWizardProps {
  inModal?: boolean;
  onBookVisit?: () => void;
}

export function EstimateCalculatorWizard({
  inModal = false,
  onBookVisit: onBookVisitProp,
}: EstimateCalculatorWizardProps) {
  const [selections, setSelections] = useState<EstimateSelections>(EMPTY_SELECTIONS);
  const [touched, setTouched] = useState<Set<SelectionStepKey>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllColors, setShowAllColors] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const { openConsult } = useModals();

  // Guards the persistence effect so the initial EMPTY_SELECTIONS render does
  // not clobber stored progress before the hydration effect has run.
  const hydratedRef = useRef(false);

  const { project } = selections;
  const stepIds = useMemo(() => getWizardStepIds(project), [project]);
  const wizardSteps = useMemo(() => stepIds.map((id) => WIZARD_META[id]), [stepIds]);
  const sizeConfig = project ? getProjectSizeConfig(project) : null;
  const visibility = project
    ? getStepVisibility(project)
    : { layout: false, doorStyle: true };
  const visibleSteps = useMemo(
    () => (project ? getVisibleSteps(project) : []),
    [project],
  );

  const selectionsMade = useMemo(
    () => visibleSteps.filter((s) => touched.has(s)).length,
    [visibleSteps, touched],
  );

  // Null until the visitor has chosen a project and size; the UI then shows the
  // "make your selections" prompt instead of a fabricated range.
  const result = useMemo(
    () => calculateEstimate(selections, selectionsMade),
    [selections, selectionsMade],
  );

  const selectionSummary = buildSelectionSummary(selections);

  // Only persist an estimate once it is priceable. A visitor who skips the
  // estimator (or hasn't picked a project + size) leaves nothing behind, so the
  // consultation form never shows pricing they didn't intentionally create.
  useEffect(() => {
    const stored = buildStoredEstimate(selections, selectionsMade);
    if (stored) {
      sessionStorage.setItem("brc_estimate", JSON.stringify(stored));
    } else {
      sessionStorage.removeItem("brc_estimate");
    }
    window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
  }, [selections, selectionsMade]);

  // Persist full progress (selections, touched steps, current step) so it can
  // be restored across navigations and return visits. Declared before the
  // hydration effect so that on mount it runs first and the `hydratedRef`
  // guard skips the initial EMPTY_SELECTIONS render, never clobbering stored
  // progress before hydration has applied it.
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveWizardState({ selections, touched: [...touched], currentIndex });
  }, [selections, touched, currentIndex]);

  // Hydrate in-progress wizard state on mount so a visitor who started an
  // estimate anywhere (home, /estimate, the modal) sees it again here. Runs
  // after first paint to avoid an SSR hydration mismatch.
  useEffect(() => {
    const stored = loadWizardState();
    if (stored) {
      setSelections(stored.selections);
      setTouched(new Set(stored.touched));
      const maxIndex = getWizardStepIds(stored.selections.project).length - 1;
      setCurrentIndex(Math.min(Math.max(stored.currentIndex, 0), maxIndex));
    }
    hydratedRef.current = true;
    // Intentionally run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markTouched = useCallback((key: SelectionStepKey) => {
    setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  const updateField = useCallback(
    <K extends keyof EstimateSelections>(key: K, value: EstimateSelections[K], step: SelectionStepKey) => {
      setSelections((prev) => ({ ...prev, [key]: value }));
      markTouched(step);
    },
    [markTouched],
  );

  function handleSelectProject(type: ProjectType) {
    if (type === project) return;
    // Error prevention: switching projects resets the other choices, so confirm
    // once the visitor has actually made some.
    const hasProgress = ["size", "layout", "doorStyle", "finish", "construction"].some(
      (k) => touched.has(k as SelectionStepKey),
    );
    if (
      hasProgress &&
      typeof window !== "undefined" &&
      !window.confirm("Switching projects will reset your other selections. Continue?")
    ) {
      return;
    }
    setSelections(emptySelectionsForProject(type));
    setTouched(new Set());
    setCurrentIndex(0);
    trackEstimatorEvent("estimator_step_view", { step: "project" });
  }

  function handleBookVisit() {
    const stored = buildStoredEstimate(selections, selectionsMade);
    if (stored) {
      sessionStorage.setItem("brc_estimate", JSON.stringify(stored));
    } else {
      sessionStorage.removeItem("brc_estimate");
    }
    window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
    trackEstimatorEvent("estimator_book_visit");
    if (onBookVisitProp) {
      onBookVisitProp();
      return;
    }
    // Prefer an on-page consult section (homepage); otherwise open the consult
    // modal so the CTA always works (e.g. the dedicated /estimate page).
    const consultEl = document.getElementById("consult");
    if (consultEl) {
      consultEl.scrollIntoView({ behavior: "smooth" });
    } else {
      openConsult();
    }
  }

  const layoutOptions = project ? getLayoutOptions(project) : [];
  const doorOptions = getDoorStyleOptions();
  const finishColorOptions = visibility.doorStyle
    ? getFinishColorOptions(selections.doorStyle)
    : [];

  // Progressive disclosure: lead with a small curated set of colors, not the
  // full compatible palette (which is the whole 299-finish catalog).
  const CURATED_COLOR_COUNT = 9;
  const curatedColorOptions = (() => {
    if (finishColorOptions.length <= CURATED_COLOR_COUNT) return finishColorOptions;
    const order = new Map(finishColorOptions.map((o, i) => [o.value, i] as const));
    const lovedSlugs = getMostLovedFinishes(CURATED_COLOR_COUNT)
      .map((f) => f.slug)
      .filter((slug) => order.has(slug));
    const picked = new Set(lovedSlugs);
    // Keep whatever the visitor already chose visible in the curated set.
    if (selections.finishSlug && order.has(selections.finishSlug)) {
      picked.add(selections.finishSlug);
    }
    const curated = finishColorOptions.filter((o) => picked.has(o.value));
    for (const o of finishColorOptions) {
      if (curated.length >= CURATED_COLOR_COUNT) break;
      if (!picked.has(o.value)) curated.push(o);
    }
    return curated.slice(0, CURATED_COLOR_COUNT);
  })();
  const visibleColorOptions = showAllColors ? finishColorOptions : curatedColorOptions;
  const hasMoreColors = finishColorOptions.length > visibleColorOptions.length;

  const layoutTintStyle = touched.has("finish") && selections.finishCategory
    ? (() => {
        const tint = getFinishTint(
          selections.finishCategory,
          selections.finishTier || "standard",
        );
        return {
          "--cab-fill": tint.fill,
          "--cab-stroke": tint.stroke,
          "--cab-island": tint.island,
        } as React.CSSProperties;
      })()
    : undefined;

  const currentStepId = stepIds[currentIndex] ?? "project";
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === stepIds.length - 1;

  const stepDescription: Record<WizardStepId, string | undefined> = {
    project: "Choose what you're planning - we'll guide you from here.",
    size: "Set your cabinet run - base and wall cabinets - then pick a construction quality.",
    layout: "Pick the shape closest to your space.",
    style: "Choose your door style and finish. Finish style and color can refine your planning range.",
    result: undefined,
  };

  function isStepComplete(index: number): boolean {
    const id = stepIds[index];
    switch (id) {
      case "project":
        return !!selections.project;
      case "size": {
        // Base run must be set; for projects with uppers, the wall run must be
        // set too (it can be 0). Construction stays optional and refines.
        const upperSet = !sizeConfig?.uppers || selections.sizeUpper != null;
        return selections.size != null && upperSet;
      }
      case "layout":
        return !!selections.layout;
      case "style":
        // Door style is the headline pick; finish color/style stay optional.
        return visibility.doorStyle ? !!selections.doorStyle : true;
      case "result":
        return true;
      default:
        return false;
    }
  }

  function markWizardStepTouched(id: WizardStepId) {
    switch (id) {
      case "size":
        markTouched("size");
        // Construction is optional; only count it once intentionally chosen.
        if (selections.construction) markTouched("construction");
        break;
      case "layout":
        markTouched("layout");
        break;
      case "style":
        if (visibility.doorStyle && selections.doorStyle) markTouched("doorStyle");
        // Finish is optional; only count it once a style/color is chosen.
        if (selections.finishCategory || selections.finishSlug) markTouched("finish");
        break;
      case "result":
        trackEstimatorEvent("estimator_complete");
        break;
      default:
        break;
    }
  }

  const goNext = () => {
    if (!isStepComplete(currentIndex) || isLast) return;
    markWizardStepTouched(currentStepId);
    setCurrentIndex((i) => Math.min(i + 1, stepIds.length - 1));
    trackEstimatorEvent("estimator_step_view", { step: stepIds[currentIndex + 1] ?? "result" });
  };

  const goBack = () => {
    if (isFirst) return;
    setCurrentIndex((i) => i - 1);
  };

  const stepBody = (() => {
    switch (currentStepId) {
      case "project":
        return (
          <div className="space-y-4">
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
                      "relative flex flex-col items-start gap-1.5 p-5 min-h-[44px] rounded-sm text-left transition-all border bg-card",
                      active ? "border-foreground/40 border-[1.5px] bg-muted/40" : "border-border",
                    )}
                  >
                    {active && (
                      <Check className="absolute top-3 right-3 h-4 w-4 text-foreground z-10" />
                    )}
                    <OptionVisual image={info.image} imageAlt={`${info.label} cabinetry`} icon={info.icon} />
                    <span className="font-medium text-sm text-foreground pr-5">{info.label}</span>
                    <span className="text-xs text-muted-foreground">{info.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "size":
        if (!sizeConfig) return null;
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <SizeSlider
                label={sizeConfig.sizeStepLabel}
                value={selections.size}
                min={sizeConfig.min}
                max={sizeConfig.max}
                step={sizeConfig.step}
                unitNoun={sizeConfig.unitNoun}
                unitShort={sizeConfig.unitShort}
                testId="slider-size"
                hint={`Drag to set your ${sizeConfig.uppers ? "base cabinet run" : "project size"} in ${sizeConfig.unitNoun}.`}
                onChange={(v) => updateField("size", v, "size")}
              />
              {sizeConfig.uppers && (
                <SizeSlider
                  label={sizeConfig.uppers.label}
                  value={selections.sizeUpper}
                  min={0}
                  max={sizeConfig.uppers.max}
                  step={sizeConfig.uppers.step}
                  unitNoun={sizeConfig.unitNoun}
                  unitShort={sizeConfig.unitShort}
                  testId="slider-size-upper"
                  hint="Drag to set your wall cabinet run, or set it to 0 if there are few or none."
                  onChange={(v) => updateField("sizeUpper", v, "size")}
                />
              )}
            </div>
            <div>
              <label className="brc-label mb-3 block">Construction quality</label>
              <ConstructionTierSelect
                value={selections.construction}
                options={CONSTRUCTION_OPTIONS}
                onChange={(v) => updateField("construction", v as typeof selections.construction, "construction")}
                testIdPrefix="button-construction"
              />
            </div>
          </div>
        );
      case "layout":
        return (
          <div>
            <SelectButton
              value={selections.layout}
              options={layoutOptions}
              onChange={(v) => updateField("layout", v, "layout")}
              testIdPrefix="button-layout"
              svgByValue={LAYOUT_DIAGRAM_SVG}
              svgStyle={layoutTintStyle}
            />
          </div>
        );
      case "style":
        return (
          <div className="space-y-6">
            {visibility.doorStyle && (
              <div>
                <label className="brc-label mb-3 block">Door style</label>
                <SelectButton
                  value={selections.doorStyle}
                  options={doorOptions}
                  onChange={(v) => {
                    setSelections((prev) =>
                      applyFinishSlug({ ...prev, doorStyle: v }, prev.finishSlug),
                    );
                    setShowAllColors(false);
                    markTouched("doorStyle");
                  }}
                  testIdPrefix="button-door"
                />
              </div>
            )}
            {finishColorOptions.length > 0 && (
              <div>
                <label className="brc-label mb-3 block">Finish color (optional)</label>
                <VisualOptionGrid
                  className={cn("gap-3", showAllColors && "max-h-[280px] overflow-y-auto pr-1")}
                  columns={4}
                  variant="swatch"
                  items={visibleColorOptions.map((opt) => ({
                    id: opt.value,
                    label: opt.label,
                    meta: opt.sub,
                    imageSrc: opt.image,
                    imageAlt: opt.imageAlt,
                  }))}
                  selectedId={selections.finishSlug || undefined}
                  onSelect={(slug) => {
                    setSelections((prev) => applyFinishSlug(prev, slug));
                    markTouched("finish");
                  }}
                  testIdPrefix="button-finish-color"
                />
                {hasMoreColors && !showAllColors && (
                  <button
                    type="button"
                    onClick={() => setShowAllColors(true)}
                    className="mt-3 text-xs font-medium text-accent underline underline-offset-2"
                    data-testid="button-show-all-finish-colors"
                  >
                    See all {finishColorOptions.length} colors
                  </button>
                )}
                {showAllColors && (
                  <button
                    type="button"
                    onClick={() => setShowAllColors(false)}
                    className="mt-3 text-xs font-medium text-muted-foreground underline underline-offset-2"
                  >
                    Show fewer
                  </button>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Pick a color now or explore the full palette later - finish style can refine your planning range.
                </p>
              </div>
            )}
            <div>
              <label className="brc-label mb-3 block">Finish style</label>
              <SelectButton
                value={selections.finishCategory}
                options={FINISH_CATEGORY_OPTIONS}
                onChange={(v) => updateField("finishCategory", v, "finish")}
                testIdPrefix="button-finish-category"
              />
            </div>
          </div>
        );
      case "result":
        return (
          <div className="mx-auto max-w-xl">
            <EstimateResultPanel
              result={result}
              selectionSummary={selectionSummary}
              scopeSummary={result?.scopeSummary}
              onBookVisit={handleBookVisit}
              project={project ?? undefined}
              variant="full"
            />
          </div>
        );
      default:
        return null;
    }
  })();

  // Persistent live estimate: sticky right column on desktop, stacked below the
  // step on mobile. Shown on every step except the final review (where the full
  // result panel is already the step body, so a sidebar would duplicate it).
  const estimateSidePanel =
    currentStepId !== "result" ? (
      <EstimateResultPanel
        result={result}
        selectionSummary={selectionSummary}
        scopeSummary={result?.scopeSummary}
        onBookVisit={handleBookVisit}
        project={project ?? undefined}
        variant="sidebar"
      />
    ) : undefined;

  const stepContinueLabels: Record<WizardStepId, string> = {
    project: "Continue",
    size: "Continue",
    layout: "Continue",
    style: "See your range",
    result: "Book free visit",
  };

  const mobileSummaryNode =
    !isLast ? (
      <Drawer open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-sm border bg-background px-3 py-2 text-left min-h-11 transition-transform active:scale-[0.99]"
            data-testid="button-open-estimate-sheet"
          >
            <span className="text-sm min-w-0 tabular-nums">
              {result ? (
                <>
                  <AnimatedPrice value={result.priceLow} />
                  <span className="text-muted-foreground"> to </span>
                  <AnimatedPrice value={result.priceHigh} />
                </>
              ) : (
                <span className="text-muted-foreground">
                  Make your selections to see your range
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
              Details
              <ChevronUp className="h-4 w-4" />
            </span>
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle className="sr-only">Planning range summary</DrawerTitle>
          <div className="max-h-[82vh] overflow-y-auto p-4 pt-2">
            <EstimateResultPanel
              result={result}
              selectionSummary={selectionSummary}
              scopeSummary={result?.scopeSummary}
              onBookVisit={handleBookVisit}
              project={project ?? undefined}
              variant="sidebar"
            />
          </div>
        </DrawerContent>
      </Drawer>
    ) : undefined;

  const shell = (
    <GuidedFlowShell
      steps={wizardSteps}
      currentIndex={currentIndex}
      isStepComplete={isStepComplete}
      onStepClick={(index) => index <= currentIndex && setCurrentIndex(index)}
      onBack={goBack}
      onNext={isLast ? handleBookVisit : goNext}
      isFirst={isFirst}
      isLast={isLast}
      canAdvance={isStepComplete(currentIndex)}
      continueLabel={stepContinueLabels[currentStepId]}
      hidePrimaryOnLast
      stepDescription={stepDescription[currentStepId]}
      sidePanel={estimateSidePanel}
      mobileSummary={mobileSummaryNode}
    >
      {stepBody}
    </GuidedFlowShell>
  );

  if (inModal) {
    return (
      <div className="max-h-[min(85dvh,720px)] overflow-y-auto overscroll-contain">
        {shell}
      </div>
    );
  }

  return shell;
}
