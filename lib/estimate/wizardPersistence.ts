import type { EstimateSelections, SelectionStepKey } from "@/shared/estimateEngine";

// Persisted across page navigations and return visits so a visitor who starts
// an estimate anywhere (home, /estimate, the modal) keeps their in-progress
// selections and current step. This is intentionally separate from the
// sessionStorage "brc_estimate" snapshot, which only holds priceable estimates
// for the consultation-form handoff.
export const WIZARD_STATE_KEY = "brc_estimate_wizard";

export interface PersistedWizardState {
  selections: EstimateSelections;
  touched: SelectionStepKey[];
  currentIndex: number;
}

function isPersistedWizardState(value: unknown): value is PersistedWizardState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.selections === "object" &&
    candidate.selections !== null &&
    Array.isArray(candidate.touched) &&
    typeof candidate.currentIndex === "number"
  );
}

export function loadWizardState(): PersistedWizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WIZARD_STATE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPersistedWizardState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveWizardState(state: PersistedWizardState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / unavailable storage; persistence is a progressive enhancement.
  }
}

export function clearWizardState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(WIZARD_STATE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}
