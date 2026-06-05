import { isScannedRoom } from "./roomScanGeometry";
import type { RoomMeta } from "./roomMeta";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";

/** Canonical Design Studio step ids, in flow order. */
export type DesignStepId =
  | "room"
  | "layout"
  | "door"
  | "finish"
  | "hardware"
  | "addons"
  | "review"
  | "quote";

export interface DesignStepDef {
  id: DesignStepId;
  /** Default full label (the layout step adapts to the room, see label fn). */
  label: string;
  shortLabel: string;
  /** Optional steps can always be advanced past (a sensible default applies). */
  optional: boolean;
  /** Rough minutes for the "time left" estimate. */
  minutes: number;
}

export const DESIGN_STEPS: readonly DesignStepDef[] = [
  { id: "room", label: "Your room", shortLabel: "Room", optional: false, minutes: 1 },
  { id: "layout", label: "Layout", shortLabel: "Layout", optional: false, minutes: 1 },
  { id: "door", label: "Cabinet style", shortLabel: "Style", optional: false, minutes: 1 },
  { id: "finish", label: "Finish & color", shortLabel: "Finish", optional: false, minutes: 1 },
  { id: "hardware", label: "Hardware", shortLabel: "Hardware", optional: true, minutes: 1 },
  { id: "addons", label: "Add-ons", shortLabel: "Add-ons", optional: true, minutes: 1 },
  { id: "review", label: "Review design", shortLabel: "Review", optional: false, minutes: 1 },
  { id: "quote", label: "Estimate & consult", shortLabel: "Quote", optional: false, minutes: 2 },
] as const;

export const DESIGN_STEP_IDS: readonly DesignStepId[] = DESIGN_STEPS.map(
  (s) => s.id,
);

/** Window event used to request a step jump from anywhere in the studio. */
export const GOTO_STEP_EVENT = "brc-studio-goto-step";

/** Request the wizard navigate to a step (handled by DesignWizard). */
export function gotoDesignStep(id: DesignStepId): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GOTO_STEP_EVENT, { detail: id }));
}

/** Minimal shape needed to evaluate step completion. */
export interface DesignStepInput {
  roomType: string | null;
  roomMeta: RoomMeta | null;
  layout: string | null;
  doorStyle: string | null;
  finish: string | null;
  hardware: string | null;
  accessories: string[];
  lineItemSlugs: string[];
  pricingSubmitted: boolean;
}

/** Adaptive label for the layout step (no hard-coded "Kitchen"). */
export function layoutStepLabel(roomType: string | null): string {
  if (!roomType) return "Layout";
  if (roomType === "kitchen") return "Kitchen layout";
  if (roomType === "bathroom") return "Vanity layout";
  const name = ROOM_BY_SLUG[roomType]?.name;
  return name ? `${name} layout` : "Layout";
}

export function designStepLabel(
  id: DesignStepId,
  roomType: string | null,
): string {
  if (id === "layout") return layoutStepLabel(roomType);
  return DESIGN_STEPS.find((s) => s.id === id)?.label ?? id;
}

/** Whether a concrete selection has been made for a step (drives check marks). */
export function stepHasSelection(d: DesignStepInput, id: DesignStepId): boolean {
  switch (id) {
    case "room":
      return d.roomType !== null && isScannedRoom(d.roomMeta);
    case "layout":
      return d.layout !== null;
    case "door":
      return d.doorStyle !== null;
    case "finish":
      return d.finish !== null;
    case "hardware":
      return d.hardware !== null;
    case "addons":
      return d.accessories.length > 0 || d.lineItemSlugs.length > 0;
    case "review":
      return (
        d.roomType !== null &&
        isScannedRoom(d.roomMeta) &&
        d.layout !== null &&
        d.doorStyle !== null &&
        d.finish !== null
      );
    case "quote":
      return d.pricingSubmitted;
    default:
      return false;
  }
}

/** Whether the wizard may advance past a step (optional steps always can). */
export function canAdvanceStep(d: DesignStepInput, id: DesignStepId): boolean {
  const def = DESIGN_STEPS.find((s) => s.id === id);
  if (def?.optional) return true;
  if (id === "quote") return d.pricingSubmitted;
  return stepHasSelection(d, id);
}

export interface DesignProgress {
  /** 0-100 completion across required steps. */
  percent: number;
  completedRequired: number;
  totalRequired: number;
  /** Estimated minutes remaining across not-yet-complete steps. */
  minutesLeft: number;
}

/** Required-step completion percentage + rough time remaining. */
export function getDesignProgress(d: DesignStepInput): DesignProgress {
  const required = DESIGN_STEPS.filter((s) => !s.optional && s.id !== "quote");
  const completedRequired = required.filter((s) =>
    stepHasSelection(d, s.id),
  ).length;
  const totalRequired = required.length;
  const percent =
    totalRequired === 0
      ? 0
      : Math.round((completedRequired / totalRequired) * 100);
  const minutesLeft = DESIGN_STEPS.filter(
    (s) => !stepHasSelection(d, s.id),
  ).reduce((sum, s) => sum + s.minutes, 0);
  return { percent, completedRequired, totalRequired, minutesLeft };
}
