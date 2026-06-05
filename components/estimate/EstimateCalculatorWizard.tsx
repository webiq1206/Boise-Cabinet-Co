"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { LAYOUT_DIAGRAM_SVG } from "@/shared/catalog/generated/layoutDiagrams";
import { cn } from "@/lib/utils";
import { DisplayNum } from "@/components/marketing";
import { EstimateResultPanel } from "@/components/estimate/EstimateResultPanel";
import { VisualOptionGrid } from "@/components/catalog/visual";
import { getMostLovedFinishes } from "@/shared/catalog/finishFilters";
import { GuidedFlowShell, type GuidedStep } from "@/components/guided-flow";
import { useModals } from "@/components/modals/ModalProvider";
import { trackEstimatorEvent } from "@/lib/design/designAnalytics";
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
  getDoorStyleOptions,
  getFinishColorOptions,
  applyFinishSlug,
  getFinishTint,
  FINISH_CATEGORY_OPTIONS,
  FINISH_TIER_OPTIONS,
  CONSTRUCTION_OPTIONS,
  ACCESSORY_OPTIONS,
  getDefaultSelectionsForProject,
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

type WizardStepId = "project" | "size" | "layout" | "style" | "quality" | "result";

const WIZARD_META: Record<WizardStepId, GuidedStep> = {
  project: { id: "project", label: "Your project", shortLabel: "Project" },
  size: { id: "size", label: "How big?", shortLabel: "Size" },
  layout: { id: "layout", label: "Layout", shortLabel: "Layout" },
  style: { id: "style", label: "Door & finish", shortLabel: "Style" },
  quality: { id: "quality", label: "Quality & storage", shortLabel: "Quality" },
  result: { id: "result", label: "Your range", shortLabel: "Range" },
};

function getWizardStepIds(project: ProjectType): WizardStepId[] {
  const vis = getStepVisibility(project);
  const ids: WizardStepId[] = ["project", "size"];
  if (vis.layout) ids.push("layout");
  ids.push("style", "quality", "result");
  return ids;
}

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
  if (svg) {
    return (
      <div
        role="img"
        aria-label={imageAlt ?? ""}
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
          alt={imageAlt ?? ""}
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
  value: T;
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

function MultiSelectButton({
  values,
  options,
  onToggle,
  testIdPrefix,
}: {
  values: string[];
  options: SelectOption[];
  onToggle: (v: string) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
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
            <OptionVisual image={opt.image} imageAlt={opt.imageAlt} icon={opt.icon} />
            <span className="font-medium text-xs text-foreground pr-5">{opt.label}</span>
            {opt.sub && (
              <span className="text-[11px] leading-snug text-muted-foreground line-clamp-2">{opt.sub}</span>
            )}
          </button>
        );
      })}
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
  const [selections, setSelections] = useState<EstimateSelections>(DEFAULT_SELECTIONS);
  const [touched, setTouched] = useState<Set<SelectionStepKey>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllColors, setShowAllColors] = useState(false);
  const { openConsult } = useModals();

  const { project } = selections;
  const stepIds = useMemo(() => getWizardStepIds(project), [project]);
  const wizardSteps = useMemo(() => stepIds.map((id) => WIZARD_META[id]), [stepIds]);
  const sizeConfig = getProjectSizeConfig(project);
  const visibility = getStepVisibility(project);
  const visibleSteps = useMemo(() => getVisibleSteps(project), [project]);

  const selectionsMade = useMemo(
    () => visibleSteps.filter((s) => touched.has(s)).length,
    [visibleSteps, touched],
  );

  const result = useMemo(
    () => calculateEstimate(selections, selectionsMade),
    [selections, selectionsMade],
  );

  const selectionSummary = buildSelectionSummary(selections);

  useEffect(() => {
    sessionStorage.setItem(
      "brc_estimate",
      JSON.stringify(buildStoredEstimate(selections, selectionsMade)),
    );
    window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
  }, [selections, selectionsMade]);

  const sliderPct = Math.round(
    ((selections.size - sizeConfig.min) / (sizeConfig.max - sizeConfig.min)) * 100,
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
    [markTouched],
  );

  function handleSelectProject(type: ProjectType) {
    if (type === project) return;
    // Error prevention: switching projects resets the other choices, so confirm
    // once the visitor has actually made some.
    const hasProgress = ["size", "layout", "doorStyle", "finish", "construction", "accessories"].some(
      (k) => touched.has(k as SelectionStepKey),
    );
    if (
      hasProgress &&
      typeof window !== "undefined" &&
      !window.confirm("Switching projects will reset your other selections. Continue?")
    ) {
      return;
    }
    setSelections(getDefaultSelectionsForProject(type));
    setTouched(new Set());
    setCurrentIndex(0);
    trackEstimatorEvent("estimator_step_view", { step: "project" });
  }

  function handleBookVisit() {
    sessionStorage.setItem(
      "brc_estimate",
      JSON.stringify(buildStoredEstimate(selections, selectionsMade)),
    );
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

  const layoutOptions = getLayoutOptions(project);
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

  const layoutTintStyle = touched.has("finish")
    ? (() => {
        const tint = getFinishTint(selections.finishCategory, selections.finishTier);
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
    size: sizeConfig.sizeStepLabel,
    layout: "Pick the shape closest to your space.",
    style: "Choose your door style and finish. Color is optional - your range won't change.",
    quality: "Pick construction quality and any smart storage you'd like.",
    result: undefined,
  };

  function isStepComplete(index: number): boolean {
    const id = stepIds[index];
    switch (id) {
      case "project":
        return true;
      case "size":
        return selections.size >= sizeConfig.min;
      case "layout":
        return !!selections.layout;
      case "style":
        return visibility.doorStyle
          ? !!selections.doorStyle && !!selections.finishCategory
          : !!selections.finishCategory;
      case "quality":
        return !!selections.construction;
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
        break;
      case "layout":
        markTouched("layout");
        break;
      case "style":
        if (visibility.doorStyle) markTouched("doorStyle");
        markTouched("finish");
        break;
      case "quality":
        markTouched("construction");
        markTouched("accessories");
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
        return (
          <div className="space-y-4">
            <DisplayNum className="text-3xl leading-none text-foreground">
              {selections.size.toLocaleString()}{" "}
              <span className="text-sm font-sans text-muted-foreground">{sizeConfig.unitShort}</span>
            </DisplayNum>
            <input
              type="range"
              className="brc-slider w-full min-h-[44px]"
              min={sizeConfig.min}
              max={sizeConfig.max}
              step={sizeConfig.step}
              value={selections.size}
              onChange={(e) => updateField("size", Number(e.target.value), "size")}
              style={{ background: sliderBackground }}
              data-testid="slider-size"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                <DisplayNum>{sizeConfig.min.toLocaleString()}</DisplayNum> {sizeConfig.unitShort}
              </span>
              <span>
                <DisplayNum>{sizeConfig.max.toLocaleString()}</DisplayNum> {sizeConfig.unitShort}
              </span>
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
                  Pick a color now or explore the full palette later - your planning range doesn&apos;t depend on the exact color.
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
        );
      case "quality":
        return (
          <div className="space-y-6">
            <div>
              <label className="brc-label mb-3 block">Construction quality</label>
              <SelectButton
                value={selections.construction}
                options={CONSTRUCTION_OPTIONS}
                onChange={(v) => updateField("construction", v, "construction")}
                testIdPrefix="button-construction"
              />
            </div>
            <div>
              <label className="brc-label mb-3 block">
                Smart storage <span className="text-muted-foreground font-normal">(optional, pick any)</span>
              </label>
              <MultiSelectButton
                values={selections.accessories}
                options={ACCESSORY_OPTIONS}
                onToggle={(slug) => {
                  setSelections((prev) => {
                    const has = prev.accessories.includes(slug);
                    return {
                      ...prev,
                      accessories: has
                        ? prev.accessories.filter((s) => s !== slug)
                        : [...prev.accessories, slug],
                    };
                  });
                  markTouched("accessories");
                }}
                testIdPrefix="button-accessory"
              />
            </div>
          </div>
        );
      case "result":
        return (
          <EstimateResultPanel
            result={result}
            selectionSummary={selectionSummary}
            scopeSummary={result.scopeSummary}
            onBookVisit={handleBookVisit}
            project={project}
            doorStyle={visibility.doorStyle ? selections.doorStyle : undefined}
            finishSlug={selections.finishSlug || undefined}
            size={selections.size}
            variant="full"
          />
        );
      default:
        return null;
    }
  })();

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
      continueLabel="Continue"
      hidePrimaryOnLast
      stepDescription={stepDescription[currentStepId]}
      mobileSummary={
        !isLast
          ? `${formatPlanningCurrency(result.priceLow)}–${formatPlanningCurrency(result.priceHigh)} · updates as you go`
          : undefined
      }
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
