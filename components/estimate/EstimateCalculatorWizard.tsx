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
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { LAYOUT_DIAGRAM_SVG } from "@/shared/catalog/generated/layoutDiagrams";
import { cn } from "@/lib/utils";
import { DisplayNum } from "@/components/marketing";
import { Button } from "@/components/ui/button";
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
import { ConsultationFields } from "@/components/consultation/ConsultationFields";
import { trackEstimatorEvent } from "@/lib/design/designAnalytics";
import { loadWizardState, saveWizardState } from "@/lib/estimate/wizardPersistence";
import {
  type ProjectType,
  type EstimateSelections,
  type EstimateResult,
  type SelectOption,
  PROJECT_LABELS,
  getProjectSizeConfig,
  getStepVisibility,
  getLayoutOptions,
  getDoorStyleOptions,
  getFinishColorOptions,
  applyFinishSlug,
  getFinishTint,
  FINISH_CATEGORY_OPTIONS,
  CONSTRUCTION_OPTIONS,
  emptySelectionsForProject,
  buildStoredEstimate,
  roomSelectionsMade,
  calculateCombinedEstimate,
  buildCombinedStoredEstimate,
  mapEstimateProjectToConsultType,
} from "@/shared/estimateEngine";
import { safeCombinedEstimate } from "@/shared/estimateValidation";
import { CTA_BOOK_VISIT } from "@/shared/ctaCopy";

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

type StepKind = "project" | "size" | "quality" | "layout" | "style" | "result" | "contact";

/** A single step in the flow. Per-room steps carry the room's index. */
interface WizardStep {
  kind: StepKind;
  /** Room index for the per-room steps (size/quality/layout/style). */
  room?: number;
}

const PER_ROOM_META: Record<
  "size" | "quality" | "layout" | "style",
  { label: string; shortLabel: string }
> = {
  size: { label: "size", shortLabel: "Size" },
  quality: { label: "construction", shortLabel: "Quality" },
  layout: { label: "layout", shortLabel: "Layout" },
  style: { label: "door & finish", shortLabel: "Style" },
};

/**
 * Build the dynamic step list. The project step is first (a multi-select), then
 * every selected room contributes its own size → quality → (layout) → style
 * steps, then the shared combined result and contact steps. Adding or removing a
 * project on the first step reshapes everything after it.
 */
function buildWizardSteps(
  rooms: EstimateSelections[],
  includeContact: boolean,
): WizardStep[] {
  const steps: WizardStep[] = [{ kind: "project" }];
  rooms.forEach((room, i) => {
    const project = room.project as ProjectType | null;
    if (!project) return;
    steps.push({ kind: "size", room: i });
    steps.push({ kind: "quality", room: i });
    if (getStepVisibility(project).layout) steps.push({ kind: "layout", room: i });
    steps.push({ kind: "style", room: i });
  });
  steps.push({ kind: "result" });
  // The terminal contact step is only part of the flow when the wizard owns
  // contact capture (the modal and the standalone /estimate page). When a host
  // page provides its own consultation form via `onBookVisit` (e.g. the
  // homepage `#consult` section), we defer to it instead of duplicating it.
  if (includeContact) steps.push({ kind: "contact" });
  return steps;
}

const CONTACT_FORM_ID = "quote-consultation-form";

/**
 * Customer-facing stages, coarser than the internal per-room step list (which
 * can run to 7+ steps for a single kitchen). "quality" and "layout" fold into
 * the "Size & Scope" stage so the visitor sees "Stage 2 of 5", never a raw
 * step count that grows with every room they add.
 */
const STAGE_LABELS = ["Project Details", "Size & Scope", "Options & Finishes", "Your Range", "Book Your Visit"];

function customerStageIndex(kind: StepKind): number {
  switch (kind) {
    case "project":
      return 0;
    case "size":
    case "quality":
    case "layout":
      return 1;
    case "style":
      return 2;
    case "result":
      return 3;
    case "contact":
      return 4;
    default:
      return 0;
  }
}

const DEFAULT_OPTION_VISUAL_ALT = "Cabinet project option illustration";

function OptionVisual({
  image,
  imageAlt,
  icon,
  svg,
  svgStyle,
  aspectClass = "aspect-[16/10] sm:aspect-[4/3]",
  /** How the image fills its box. Use "object-contain" to always show the whole
   * image (e.g. door-style thumbnails) instead of cropping to fill. */
  imageFit = "object-cover",
}: {
  image?: string;
  imageAlt?: string;
  icon?: string;
  svg?: string;
  svgStyle?: React.CSSProperties;
  aspectClass?: string;
  imageFit?: "object-cover" | "object-contain";
}) {
  const alt = imageAlt?.trim() || DEFAULT_OPTION_VISUAL_ALT;

  if (svg) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={svgStyle}
        className={cn(
          "relative w-full mb-1.5 overflow-hidden rounded-sm bg-muted [&>svg]:h-full [&>svg]:w-full",
          imageFit === "object-contain" ? "[&>svg]:object-contain" : "[&>svg]:object-cover",
          aspectClass,
        )}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }
  if (image) {
    return (
      <div className={cn("relative w-full mb-1.5 overflow-hidden rounded-sm bg-muted", aspectClass)}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 33vw, 160px"
          className={cn(imageFit, "img-brand-grade")}
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
  columns = 2,
  aspectClass,
  gridClassName,
  imageFit,
}: {
  value: T | "";
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  testIdPrefix: string;
  svgByValue?: Record<string, string>;
  svgStyle?: React.CSSProperties;
  columns?: 2 | 3;
  aspectClass?: string;
  /** Overrides the default column classes (e.g. a responsive grid). */
  gridClassName?: string;
  imageFit?: "object-cover" | "object-contain";
}) {
  return (
    <div className={cn("grid gap-2", gridClassName ?? (columns === 3 ? "grid-cols-3" : "grid-cols-2"))}>
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
              "relative flex flex-col items-start gap-0.5 p-1.5 min-h-[44px] rounded-md text-left transition-all border bg-card",
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
              aspectClass={aspectClass}
              imageFit={imageFit}
            />
            <span className="w-full truncate font-medium text-xs text-foreground leading-tight">{opt.label}</span>
            {opt.sub && (
              <span className="hidden text-[12px] leading-snug text-muted-foreground line-clamp-1 sm:block">
                {opt.sub}
              </span>
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
              "group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
              active
                ? "border-accent border-[1.5px] bg-accent/5 shadow-sm"
                : "border-border bg-card hover:border-foreground/30 hover:bg-muted/20",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors",
                active
                  ? "border-accent/30 bg-background text-accent"
                  : "border-border bg-muted/40 text-foreground/70 group-hover:text-foreground",
              )}
            >
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-medium text-sm text-foreground">{opt.label}</span>
                <TierStrength rank={rank} />
                {popular && (
                  <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[12px] font-medium uppercase tracking-wide text-accent">
                    Most popular
                  </span>
                )}
              </span>
              {opt.sub && (
                <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                  {opt.sub}
                </span>
              )}
            </span>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-transparent",
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
    <div className="rounded-lg border border-border bg-card p-3">
      <label className="mb-1.5 block text-[12px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="mb-1.5 flex items-baseline gap-1.5" data-testid={value == null ? `${testId}-unset-hint` : undefined}>
        {value != null ? (
          <>
            <DisplayNum className="text-2xl leading-none text-foreground">
              {value.toLocaleString()}
            </DisplayNum>
            <span className="text-xs text-muted-foreground">{unitNoun}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Drag to set</span>
        )}
      </div>
      {/* Generous vertical touch area around the thin visual track. */}
      <div className="py-2">
        <input
          type="range"
          className="brc-slider block w-full"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          aria-label={label}
          aria-valuetext={value != null ? `${value} ${unitNoun}` : "Not set"}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background }}
          data-unset={value == null ? "true" : undefined}
          data-testid={testId}
        />
      </div>
      <div className="flex justify-between text-[12px] text-muted-foreground">
        <span>
          <DisplayNum>{min.toLocaleString()}</DisplayNum> {unitShort}
        </span>
        <span>
          <DisplayNum>{max.toLocaleString()}</DisplayNum> {unitShort}
        </span>
      </div>
    </div>
  );
}

interface EstimateCalculatorWizardProps {
  inModal?: boolean;
  onBookVisit?: () => void;
  /** Open directly on a specific step (e.g. "contact" for "just talk to us"). */
  startStep?: StepKind;
  /**
   * Viewport-fit layout: pins the step header + primary CTA so the whole step
   * stays on screen without page scroll. Used by the standalone `/estimate`
   * page and the modal; the in-page homepage embed leaves it off.
   */
  fitViewport?: boolean;
}

const CURATED_COLOR_COUNT = 9;

/** Progressive-disclosure curation of the finish palette for one room. */
function curateColorOptions(
  finishColorOptions: SelectOption[],
  selectedSlug: string,
): SelectOption[] {
  if (finishColorOptions.length <= CURATED_COLOR_COUNT) return finishColorOptions;
  const order = new Map(finishColorOptions.map((o, i) => [o.value, i] as const));
  const lovedSlugs = getMostLovedFinishes(CURATED_COLOR_COUNT)
    .map((f) => f.slug)
    .filter((slug) => order.has(slug));
  const picked = new Set(lovedSlugs);
  // Keep whatever the visitor already chose visible in the curated set.
  if (selectedSlug && order.has(selectedSlug)) picked.add(selectedSlug);
  const curated = finishColorOptions.filter((o) => picked.has(o.value));
  for (const o of finishColorOptions) {
    if (curated.length >= CURATED_COLOR_COUNT) break;
    if (!picked.has(o.value)) curated.push(o);
  }
  return curated.slice(0, CURATED_COLOR_COUNT);
}

export function EstimateCalculatorWizard({
  inModal = false,
  onBookVisit: onBookVisitProp,
  startStep,
  fitViewport = false,
}: EstimateCalculatorWizardProps) {
  // One entry per project the visitor is planning; each is a full set of
  // selections with its own size, construction, door, and finish.
  const [rooms, setRooms] = useState<EstimateSelections[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllColors, setShowAllColors] = useState(false);
  // "Explore finishes" is opened per room so each room's style step stays short.
  const [finishesOpen, setFinishesOpen] = useState<Record<number, boolean>>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [contactPending, setContactPending] = useState(false);
  const [contactSucceeded, setContactSucceeded] = useState(false);

  // Guards the persistence effect so the initial empty render does not clobber
  // stored progress before the hydration effect has run.
  const hydratedRef = useRef(false);
  /** True once this instance has actually held at least one room. */
  const sawRoomsRef = useRef(false);

  // When the host page supplies an `onBookVisit` handler it owns contact
  // capture, so the wizard drops its own terminal contact step.
  const includeContactStep = !onBookVisitProp;

  const wizardSteps = useMemo(
    () => buildWizardSteps(rooms, includeContactStep),
    [rooms, includeContactStep],
  );

  const guidedSteps = useMemo<GuidedStep[]>(
    () =>
      wizardSteps.map((s) => {
        if (s.kind === "project")
          return { id: "project", label: "What are you planning?", shortLabel: "Projects" };
        if (s.kind === "result")
          return { id: "result", label: "Your range", shortLabel: "Range" };
        if (s.kind === "contact")
          return { id: "contact", label: "Book your visit", shortLabel: "Visit" };
        const room = rooms[s.room!];
        const roomLabel = room?.project
          ? PROJECT_LABELS[room.project as ProjectType].label
          : "Room";
        const meta = PER_ROOM_META[s.kind as "size" | "quality" | "layout" | "style"];
        return {
          id: `${s.kind}-${s.room}`,
          label: `${roomLabel} ${meta.label}`,
          shortLabel: meta.shortLabel,
        };
      }),
    [wizardSteps, rooms],
  );

  // Keep the current index in range whenever the step list shrinks (e.g. after a
  // room is removed on the project step).
  useEffect(() => {
    setCurrentIndex((i) => Math.min(Math.max(i, 0), wizardSteps.length - 1));
  }, [wizardSteps.length]);

  // Reset the "see all colors" expansion whenever the visitor moves to a new
  // step (it belongs to a single room's finish palette).
  useEffect(() => {
    setShowAllColors(false);
  }, [currentIndex]);

  const safeIndex = Math.min(Math.max(currentIndex, 0), wizardSteps.length - 1);
  const currentStep = wizardSteps[safeIndex] ?? { kind: "project" as const };
  const currentStepId = currentStep.kind;
  const activeRoomIndex = currentStep.room ?? null;
  const activeRoom = activeRoomIndex != null ? rooms[activeRoomIndex] ?? null : null;

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === wizardSteps.length - 1;

  // Live combined estimate across every priceable room. Validated before
  // display: if the result ever fails the sanity checks (corrupt persisted
  // state, drifted inputs) the wizard falls back to its "make your selections"
  // state instead of showing a suspicious number.
  const combined = useMemo(
    () => safeCombinedEstimate(calculateCombinedEstimate(rooms), rooms, "estimate-wizard"),
    [rooms],
  );
  const combinedStored = useMemo(
    () => (combined ? buildCombinedStoredEstimate(rooms) : null),
    [combined, rooms],
  );

  // Adapt the combined estimate to the EstimateResult shape the panel renders;
  // the per-room breakdown carries the detail, so scope/roi are not needed here.
  const combinedResult = useMemo<EstimateResult | null>(() => {
    if (!combined) return null;
    return {
      priceLow: combined.priceLow,
      priceHigh: combined.priceHigh,
      roi: 0,
      included: combined.included,
      confidence: combined.confidence,
      confidenceLabel: combined.confidenceLabel,
      confidencePercent: combined.confidencePercent,
      scopeSummary: "",
      selectionsMade: combined.rooms.length,
      totalSteps: rooms.length,
    };
  }, [combined, rooms.length]);

  // For a single room the panel still shows the classic scope line; for several
  // it shows the per-room breakdown instead.
  const singleRoomResult =
    combined && combined.rooms.length === 1 ? combined.rooms[0] : null;
  const resultScopeSummary = singleRoomResult?.scopeSummary;
  const resultSelectionSummary = singleRoomResult
    ? `${singleRoomResult.projectLabel} · ${singleRoomResult.sizeLabel}`
    : rooms
        .map((r) => (r.project ? PROJECT_LABELS[r.project as ProjectType].label : ""))
        .filter(Boolean)
        .join(" · ");

  // The consultation lead needs a single project type. One room maps to its own
  // type; several rooms are recorded as a whole-home ("other") enquiry.
  const resolvedProjectType = useMemo(() => {
    const projects = rooms
      .map((r) => r.project)
      .filter((p): p is ProjectType => !!p);
    if (projects.length === 1) return mapEstimateProjectToConsultType(projects[0]);
    if (projects.length > 1) return "other";
    return undefined;
  }, [rooms]);

  const handleContactPending = useCallback((pending: boolean) => {
    setContactPending(pending);
  }, []);

  // Only persist an estimate once at least one room is priceable. The in-wizard
  // contact step reads the full combined estimate directly; this single-room
  // snapshot keeps legacy consultation forms (e.g. the homepage `#consult`
  // section) working, so it carries the first priceable room.
  useEffect(() => {
    let stored: ReturnType<typeof buildStoredEstimate> = null;
    for (const room of rooms) {
      const s = buildStoredEstimate(room, roomSelectionsMade(room));
      if (s) {
        stored = s;
        break;
      }
    }
    if (stored) {
      sessionStorage.setItem("brc_estimate", JSON.stringify(stored));
    } else {
      sessionStorage.removeItem("brc_estimate");
    }
    window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
  }, [rooms]);

  // Persist full progress (rooms + current step) so it can be restored across
  // navigations and return visits.
  //
  // The `hydratedRef` guard alone is not enough. React StrictMode re-invokes
  // effects on mount, and the replay closes over the FIRST render's state
  // (rooms: []) while the ref the hydration effect just set is already true -
  // so the replay persisted an empty wizard over real stored progress, and the
  // hydration replay then read that empty state back. The visible symptom was a
  // refresh dropping the visitor's rooms and returning them to step 1.
  //
  // `sawRoomsRef` distinguishes the two cases that both present as an empty
  // rooms array: a pre-hydration echo (never had rooms - skip) and a visitor who
  // genuinely removed their last room (had rooms - persist, so the removal
  // sticks).
  if (rooms.length > 0) sawRoomsRef.current = true;

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (rooms.length === 0 && !sawRoomsRef.current) return;
    saveWizardState({ rooms, currentIndex });
  }, [rooms, currentIndex]);

  // Hydrate in-progress wizard state on mount so a visitor who started an
  // estimate anywhere (home, /estimate, the modal) sees it again here. Runs
  // after first paint to avoid an SSR hydration mismatch.
  useEffect(() => {
    const stored = loadWizardState();
    if (stored && Array.isArray(stored.rooms)) {
      setRooms(stored.rooms);
      const maxIndex = buildWizardSteps(stored.rooms, includeContactStep).length - 1;
      setCurrentIndex(Math.min(Math.max(stored.currentIndex, 0), maxIndex));
    }
    // Deep-link (e.g. "just talk to us" opens straight on the contact step),
    // applied after any stored progress so the visitor's rooms still ride along.
    if (startStep) {
      const ids = buildWizardSteps(stored?.rooms ?? [], includeContactStep);
      const idx = ids.findIndex((s) => s.kind === startStep);
      if (idx >= 0) setCurrentIndex(idx);
    }
    hydratedRef.current = true;
    // Intentionally run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Patch one room's selections, either with a shallow merge or a transform.
  const updateRoom = useCallback(
    (
      index: number,
      patch: Partial<EstimateSelections> | ((r: EstimateSelections) => EstimateSelections),
    ) => {
      setRooms((prev) =>
        prev.map((r, i) =>
          i === index ? (typeof patch === "function" ? patch(r) : { ...r, ...patch }) : r,
        ),
      );
    },
    [],
  );

  function toggleProject(type: ProjectType) {
    const idx = rooms.findIndex((r) => r.project === type);
    if (idx >= 0) {
      // Error prevention: removing a room discards its selections, so confirm
      // once the visitor has actually made some.
      const room = rooms[idx];
      if (
        roomSelectionsMade(room) > 0 &&
        typeof window !== "undefined" &&
        !window.confirm(`Remove ${PROJECT_LABELS[type].label} and its selections?`)
      ) {
        return;
      }
      setRooms((prev) => prev.filter((r) => r.project !== type));
    } else {
      setRooms((prev) => [...prev, emptySelectionsForProject(type)]);
      trackEstimatorEvent("estimator_step_view", { step: "project" });
    }
  }

  function handleBookVisit() {
    trackEstimatorEvent("estimator_book_visit");
    // An external override (legacy callers) can still take over; otherwise the
    // contact step is part of this flow, so advance to it in place.
    if (onBookVisitProp) {
      onBookVisitProp();
      return;
    }
    setCurrentIndex((i) => Math.min(i + 1, wizardSteps.length - 1));
    trackEstimatorEvent("estimator_step_view", { step: "contact" });
  }

  // "Edit the scope and recalculate": jump back to a room's first step (size)
  // with every prior answer preserved - navigation only changes currentIndex,
  // it never mutates `rooms`, so the live recalculation is automatic.
  const handleEditRoom = useCallback(
    (roomIndex: number) => {
      const idx = wizardSteps.findIndex((s) => s.room === roomIndex && s.kind === "size");
      if (idx >= 0) setCurrentIndex(idx);
    },
    [wizardSteps],
  );

  // If the visitor navigates back off the contact step after a success, clear
  // the success flag so the submit CTA returns.
  useEffect(() => {
    if (currentStepId !== "contact" && contactSucceeded) {
      setContactSucceeded(false);
    }
  }, [currentStepId, contactSucceeded]);

  const stepDescription: Record<StepKind, string | undefined> = {
    project: "Pick everything you're planning - add as many rooms as you like.",
    size: "Drag to set your cabinet run - base and wall cabinets.",
    quality: "Pick the box construction that fits your budget and durability.",
    layout: "Pick the shape closest to your space.",
    style: "Pick the door style you like best.",
    result: undefined,
    contact: "Where should we send your range?",
  };

  function isStepComplete(index: number): boolean {
    const s = wizardSteps[index];
    if (!s) return false;
    switch (s.kind) {
      case "project":
        return rooms.length > 0;
      case "size": {
        const room = rooms[s.room!];
        if (!room?.project) return false;
        const cfg = getProjectSizeConfig(room.project as ProjectType);
        // Base run must be set; for projects with uppers, the wall run must be
        // set too (it can be 0).
        const upperSet = !cfg?.uppers || room.sizeUpper != null;
        return room.size != null && upperSet;
      }
      case "quality":
        // Construction refines the range but is never required to advance.
        return true;
      case "layout":
        return !!rooms[s.room!]?.layout;
      case "style": {
        const room = rooms[s.room!];
        const vis = room?.project
          ? getStepVisibility(room.project as ProjectType)
          : { doorStyle: true };
        // Door style is the headline pick; finish color/style stay optional.
        return vis.doorStyle ? !!room?.doorStyle : true;
      }
      case "result":
      case "contact":
        return true;
      default:
        return false;
    }
  }

  const goNext = () => {
    if (!isStepComplete(safeIndex) || isLast) return;
    const next = wizardSteps[safeIndex + 1];
    setCurrentIndex((i) => Math.min(i + 1, wizardSteps.length - 1));
    if (next?.kind === "result") trackEstimatorEvent("estimator_complete");
    trackEstimatorEvent("estimator_step_view", { step: next?.kind ?? "result" });
  };

  const goBack = () => {
    if (isFirst) return;
    setCurrentIndex((i) => i - 1);
  };

  const stepBody = (() => {
    switch (currentStep.kind) {
      case "project":
        return (
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROJECT_LABELS) as ProjectType[]).map((type) => {
              const info = PROJECT_LABELS[type];
              const active = rooms.some((r) => r.project === type);
              const Icon = OPTION_ICONS[info.icon];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleProject(type)}
                  data-testid={`button-project-${type}`}
                  aria-pressed={active}
                  className={cn(
                    "relative flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 min-h-[52px] rounded-md text-left transition-all border bg-card",
                    active
                      ? "border-accent border-[1.5px] bg-accent/5 shadow-sm"
                      : "border-border hover:border-foreground/30 hover:bg-muted/20",
                  )}
                >
                  <span className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    {active && (
                      <span className="absolute inset-0 z-10 flex items-center justify-center bg-accent/90 text-accent-foreground">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                    )}
                    {info.image ? (
                      <Image
                        src={info.image}
                        alt={`${info.label} cabinetry`}
                        fill
                        sizes="40px"
                        className="object-cover img-brand-grade"
                      />
                    ) : Icon ? (
                      <span className="flex h-full w-full items-center justify-center text-foreground/70">
                        <Icon className="h-5 w-5" />
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-[14px] sm:text-sm leading-tight text-foreground hyphens-auto">
                      {info.label}
                    </span>
                    {/* Sub description adds height; on phones the label + image are
                        enough, so we reveal it only where there's vertical room. */}
                    <span className="mt-0.5 hidden text-[12px] leading-snug text-muted-foreground line-clamp-1 sm:block">
                      {info.sub}
                    </span>
                  </span>

                </button>
              );
            })}
          </div>
        );
      case "size": {
        if (activeRoomIndex == null || !activeRoom?.project) return null;
        const cfg = getProjectSizeConfig(activeRoom.project as ProjectType);
        if (!cfg) return null;
        const ri = activeRoomIndex;
        return (
          <div className={cn("grid gap-3", cfg.uppers ? "grid-cols-2" : "grid-cols-1")}>
            <SizeSlider
              label={cfg.sizeStepLabel}
              value={activeRoom.size}
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              unitNoun={cfg.unitNoun}
              unitShort={cfg.unitShort}
              testId="slider-size"
              hint={`Drag to set your ${cfg.uppers ? "base cabinet run" : "project size"} in ${cfg.unitNoun}.`}
              onChange={(v) => updateRoom(ri, { size: v })}
            />
            {cfg.uppers && (
              <SizeSlider
                label={cfg.uppers.label}
                value={activeRoom.sizeUpper}
                min={0}
                max={cfg.uppers.max}
                step={cfg.uppers.step}
                unitNoun={cfg.unitNoun}
                unitShort={cfg.unitShort}
                testId="slider-size-upper"
                hint="Drag to set your wall cabinet run, or set it to 0 if there are few or none."
                onChange={(v) => updateRoom(ri, { sizeUpper: v })}
              />
            )}
          </div>
        );
      }
      case "quality": {
        if (activeRoomIndex == null || !activeRoom) return null;
        const ri = activeRoomIndex;
        return (
          <ConstructionTierSelect
            value={activeRoom.construction}
            options={CONSTRUCTION_OPTIONS}
            onChange={(v) =>
              updateRoom(ri, { construction: v as EstimateSelections["construction"] })
            }
            testIdPrefix="button-construction"
          />
        );
      }
      case "layout": {
        if (activeRoomIndex == null || !activeRoom?.project) return null;
        const ri = activeRoomIndex;
        const layoutOptions = getLayoutOptions(activeRoom.project as ProjectType);
        const tint = activeRoom.finishCategory
          ? getFinishTint(activeRoom.finishCategory, activeRoom.finishTier || "standard")
          : null;
        const layoutTintStyle = tint
          ? ({
              "--cab-fill": tint.fill,
              "--cab-stroke": tint.stroke,
              "--cab-island": tint.island,
            } as React.CSSProperties)
          : undefined;
        return (
          <SelectButton
            value={activeRoom.layout}
            options={layoutOptions}
            onChange={(v) => updateRoom(ri, { layout: v })}
            testIdPrefix="button-layout"
            svgByValue={LAYOUT_DIAGRAM_SVG}
            svgStyle={layoutTintStyle}
          />
        );
      }
      case "style": {
        if (activeRoomIndex == null || !activeRoom?.project) return null;
        const ri = activeRoomIndex;
        const vis = getStepVisibility(activeRoom.project as ProjectType);
        const doorOptions = getDoorStyleOptions();
        const finishColorOptions = vis.doorStyle
          ? getFinishColorOptions(activeRoom.doorStyle)
          : [];
        const curatedColorOptions = curateColorOptions(
          finishColorOptions,
          activeRoom.finishSlug,
        );
        const visibleColorOptions = showAllColors ? finishColorOptions : curatedColorOptions;
        const hasMoreColors = finishColorOptions.length > visibleColorOptions.length;
        const showFinishes = !!finishesOpen[ri];
        return (
          <div className="space-y-3">
            {vis.doorStyle && (
              <div>
                <label className="brc-label mb-1.5 block">Door style</label>
                <SelectButton
                  value={activeRoom.doorStyle}
                  options={doorOptions}
                  gridClassName="grid-cols-3 lg:grid-cols-6"
                  aspectClass="aspect-[3/2]"
                  imageFit="object-contain"
                  onChange={(v) => {
                    updateRoom(ri, (r) => applyFinishSlug({ ...r, doorStyle: v }, r.finishSlug));
                    setShowAllColors(false);
                  }}
                  testIdPrefix="button-door"
                />
              </div>
            )}

            {/* Finishes are optional and tucked away so the step stays short and
                the visitor can reach "See your range" without scrolling. */}
            {!showFinishes ? (
              <button
                type="button"
                onClick={() => setFinishesOpen((prev) => ({ ...prev, [ri]: true }))}
                className="flex w-full items-center justify-between rounded-sm border border-border px-3 py-2 min-h-10 text-left text-[13px] text-muted-foreground"
                data-testid="button-explore-finishes"
              >
                <span>Explore finishes (optional)</span>
                <Sparkles className="h-4 w-4" />
              </button>
            ) : (
              <>
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
                      selectedId={activeRoom.finishSlug || undefined}
                      onSelect={(slug) => updateRoom(ri, (r) => applyFinishSlug(r, slug))}
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
                    <p className="mt-2 text-[12px] text-muted-foreground">
                      Pick a color now or explore the full palette later - finish style can refine your planning range.
                    </p>
                  </div>
                )}
                <div>
                  <label className="brc-label mb-3 block">Finish style</label>
                  <SelectButton
                    value={activeRoom.finishCategory}
                    options={FINISH_CATEGORY_OPTIONS}
                    onChange={(v) => updateRoom(ri, { finishCategory: v })}
                    testIdPrefix="button-finish-category"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFinishesOpen((prev) => ({ ...prev, [ri]: false }))}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-2"
                  data-testid="button-skip-finishes"
                >
                  Skip finishes for now
                </button>
              </>
            )}
          </div>
        );
      }
      case "result":
        return (
          <div className="mx-auto max-w-xl">
            <EstimateResultPanel
              result={combinedResult}
              selectionSummary={resultSelectionSummary}
              scopeSummary={resultScopeSummary}
              breakdown={combined?.rooms}
              onBookVisit={handleBookVisit}
              onEditRoom={handleEditRoom}
              variant="full"
              compact={fitViewport}
              hideCta
            />
          </div>
        );
      case "contact":
        return (
          <div className="mx-auto max-w-xl">
            <ConsultationFields
              combinedEstimate={combinedStored}
              resolvedProjectType={resolvedProjectType}
              // Raw selections travel with the lead so the full estimate
              // record (every choice, the range, and what was disclosed)
              // reaches the CRM, not just the price range.
              estimateRooms={rooms}
              requireDetails
              showEstimateSummary
              formId={CONTACT_FORM_ID}
              hideSubmitButton
              compact={fitViewport}
              onPendingChange={handleContactPending}
              onSuccess={() => setContactSucceeded(true)}
            />
          </div>
        );
      default:
        return null;
    }
  })();

  // Persistent live estimate: sticky right column on desktop, stacked below the
  // step on mobile. Shown on the selection steps only - the result step is the
  // full panel itself, and the contact step shows its own compact summary card.
  const estimateSidePanel =
    currentStep.kind !== "result" && currentStep.kind !== "contact" ? (
      <EstimateResultPanel
        result={combinedResult}
        selectionSummary={resultSelectionSummary}
        scopeSummary={resultScopeSummary}
        breakdown={combined?.rooms}
        onBookVisit={handleBookVisit}
        variant="sidebar"
      />
    ) : undefined;

  const continueLabel = (() => {
    if (currentStep.kind === "result") return CTA_BOOK_VISIT;
    if (currentStep.kind === "contact") return "Send my request";
    if (currentStep.kind === "project") return "Start estimating";
    const next = wizardSteps[safeIndex + 1];
    if (next?.kind === "result") return "See your range";
    return "Continue";
  })();

  // Customer-facing "Stage X of N · Y% complete" framing, independent of the
  // more granular internal per-room step list (which the step rail still uses
  // for its own navigation).
  const totalStages = includeContactStep ? STAGE_LABELS.length : STAGE_LABELS.length - 1;
  const stageIndex = Math.min(customerStageIndex(currentStep.kind), totalStages - 1);
  const stagePercent =
    totalStages > 1 ? Math.round((stageIndex / (totalStages - 1)) * 100) : 100;

  const metaLabel = (() => {
    const base = `Stage ${stageIndex + 1} of ${totalStages} · ${STAGE_LABELS[stageIndex]} · ${stagePercent}% complete`;
    if (currentStep.room == null || rooms.length <= 1) return base;
    const room = rooms[currentStep.room];
    const label = room?.project
      ? PROJECT_LABELS[room.project as ProjectType].label
      : "Room";
    return `${base} - ${label} (Room ${currentStep.room + 1} of ${rooms.length})`;
  })();

  const mobileSummaryNode =
    currentStep.kind !== "result" && currentStep.kind !== "contact" ? (
      <Drawer open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-sm border bg-background px-3 py-1.5 text-left min-h-10 transition-transform active:scale-[0.99]"
            data-testid="button-open-estimate-sheet"
          >
            <span className="text-sm min-w-0 tabular-nums">
              {combinedResult ? (
                <>
                  <AnimatedPrice value={combinedResult.priceLow} />
                  <span className="text-muted-foreground"> to </span>
                  <AnimatedPrice value={combinedResult.priceHigh} />
                </>
              ) : (
                <span
                  className="text-muted-foreground"
                  data-testid="estimate-empty-message"
                >
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
              result={combinedResult}
              selectionSummary={resultSelectionSummary}
              scopeSummary={resultScopeSummary}
              breakdown={combined?.rooms}
              onBookVisit={handleBookVisit}
              variant="sidebar"
            />
          </div>
        </DrawerContent>
      </Drawer>
    ) : undefined;

  const contactSubmitButton = (
    <Button
      type="submit"
      form={CONTACT_FORM_ID}
      variant="brand"
      disabled={contactPending}
      className="min-h-11 w-full"
      data-testid="button-submit-consultation"
    >
      {contactPending ? "Sending…" : "Send my request"}
      {!contactPending && <ArrowRight className="h-4 w-4" />}
    </Button>
  );

  // Mirrors isStepComplete: when Continue is disabled, say exactly what is
  // missing rather than leaving the visitor to guess at a greyed-out button.
  const blockedHint = (() => {
    const s = wizardSteps[safeIndex];
    if (!s || isStepComplete(safeIndex)) return undefined;
    switch (s.kind) {
      case "project":
        return "Choose at least one room to continue.";
      case "size": {
        const room = rooms[s.room!];
        if (!room?.project) return "Choose a room first.";
        const cfg = getProjectSizeConfig(room.project as ProjectType);
        if (room.size == null && cfg?.uppers && room.sizeUpper == null)
          return "Set both cabinet runs to continue.";
        if (room.size == null) return `Set your ${cfg?.sizeStepLabel?.toLowerCase() ?? "size"} to continue.`;
        return "Set your wall cabinet run to continue (use 0 if there are none).";
      }
      case "layout":
        return "Pick a layout to continue.";
      case "style":
        return "Pick a door style to continue.";
      default:
        return undefined;
    }
  })();

  const shell = (
    <GuidedFlowShell
      steps={guidedSteps}
      currentIndex={safeIndex}
      isStepComplete={isStepComplete}
      onStepClick={(index) => index <= safeIndex && setCurrentIndex(index)}
      onBack={goBack}
      onNext={currentStep.kind === "result" ? handleBookVisit : goNext}
      isFirst={isFirst}
      isLast={isLast}
      canAdvance={isStepComplete(safeIndex)}
      blockedHint={blockedHint}
      continueLabel={continueLabel}
      hidePrimaryOnLast={contactSucceeded}
      lastStepAction={
        currentStep.kind === "contact" && !contactSucceeded ? contactSubmitButton : undefined
      }
      stepDescription={stepDescription[currentStep.kind]}
      metaLabel={metaLabel}
      progressPercent={stagePercent}
      sidePanel={estimateSidePanel}
      mobileSummary={mobileSummaryNode}
      fitViewport={fitViewport}
    >
      {stepBody}
    </GuidedFlowShell>
  );

  if (inModal) {
    // The dialog is height-bounded (h-[100dvh] on mobile, capped on desktop), so
    // let the fit shell own the internal layout and pin its own CTA.
    return <div className="flex h-full min-h-0 flex-col">{shell}</div>;
  }

  return shell;
}
