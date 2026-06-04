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
import { GuidedFlowShell, type GuidedStep } from "@/components/guided-flow";
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
  getCabinetLineOptions,
  getDoorStyleOptions,
  getFinishColorOptions,
  applyFinishSlug,
  getFinishTint,
  FINISH_CATEGORY_OPTIONS,
  FINISH_TIER_OPTIONS,
  CONSTRUCTION_OPTIONS,
  STORAGE_OPTIONS,
  getDefaultSelectionsForProject,
  calculateEstimate,
  buildStoredEstimate,
  buildSelectionSummary,
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

type WizardStepId = "project" | "size" | "layout" | "line" | "style" | "quality" | "result";

const WIZARD_META: Record<WizardStepId, GuidedStep> = {
  project: { id: "project", label: "Your project", shortLabel: "Project" },
  size: { id: "size", label: "How big?", shortLabel: "Size" },
  layout: { id: "layout", label: "Layout", shortLabel: "Layout" },
  line: { id: "line", label: "Cabinet line", shortLabel: "Line" },
  style: { id: "style", label: "Door & finish", shortLabel: "Style" },
  quality: { id: "quality", label: "Quality & storage", shortLabel: "Quality" },
  result: { id: "result", label: "Your range", shortLabel: "Range" },
};

function getWizardStepIds(project: ProjectType): WizardStepId[] {
  const vis = getStepVisibility(project);
  const ids: WizardStepId[] = ["project", "size"];
  if (vis.layout) ids.push("layout");
  ids.push("line", "style", "quality", "result");
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
              "relative flex flex-col items-start gap-1 p-4 min-h-[44px] rounded-sm text-left transition-all border bg-card",
              active ? "border-foreground/40 border-[1.5px] bg-muted/40" : "border-border",
            )}
          >
            {active && (
              <Check className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-foreground z-10" />
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
    } else {
      document.getElementById("consult")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const layoutOptions = getLayoutOptions(project);
  const lineOptions = getCabinetLineOptions();
  const doorOptions = getDoorStyleOptions();
  const finishColorOptions = visibility.doorStyle
    ? getFinishColorOptions(selections.doorStyle)
    : [];

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

  function isStepComplete(index: number): boolean {
    const id = stepIds[index];
    switch (id) {
      case "project":
        return true;
      case "size":
        return selections.size >= sizeConfig.min;
      case "layout":
        return !!selections.layout;
      case "line":
        return !!selections.cabinetLine;
      case "style":
        return visibility.doorStyle
          ? !!selections.doorStyle && !!selections.finishCategory
          : !!selections.finishCategory;
      case "quality":
        return !!selections.construction && !!selections.storage;
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
      case "line":
        markTouched("line");
        break;
      case "style":
        if (visibility.doorStyle) markTouched("doorStyle");
        markTouched("finish");
        break;
      case "quality":
        markTouched("construction");
        markTouched("storage");
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
            <p className="text-sm text-muted-foreground">
              Choose what you&apos;re planning. We&apos;ll guide you through size, style, and quality.
            </p>
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
                    <OptionVisual icon={info.icon} />
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
            <p className="text-sm text-muted-foreground">{sizeConfig.sizeStepLabel}</p>
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
            <p className="text-sm text-muted-foreground mb-4">Pick the shape closest to your space.</p>
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
      case "line":
        return (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Choose your cabinet line.</p>
            <SelectButton
              value={selections.cabinetLine}
              options={lineOptions}
              onChange={(v) => updateField("cabinetLine", v, "line")}
              testIdPrefix="button-line"
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
                  className="max-h-[280px] overflow-y-auto pr-1 gap-3"
                  columns={3}
                  items={finishColorOptions.map((opt) => ({
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
              <label className="brc-label mb-3 block">Smart Storage</label>
              <SelectButton
                value={selections.storage}
                options={STORAGE_OPTIONS}
                onChange={(v) => updateField("storage", v, "storage")}
                testIdPrefix="button-storage"
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
      continueLabel={isLast ? "Book a design visit" : "Continue"}
      mobileStickyFooter={
        !isLast ? (
          <div className="text-center text-xs text-muted-foreground mb-2">
            {selectionSummary} · planning range updates as you go
          </div>
        ) : undefined
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
