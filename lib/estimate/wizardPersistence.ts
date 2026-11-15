import type { EstimateSelections } from "@/shared/estimateEngine";
import {roomSelectionsSchema,MAX_ROOMS} from '@/shared/estimateInputSchema';

// Persisted across page navigations and return visits so a visitor who starts
// an estimate anywhere (home, /estimate, the modal) keeps their in-progress
// rooms and current step. This is intentionally separate from the sessionStorage
// "brc_estimate" snapshot, which only holds priceable estimates for the
// consultation-form handoff.
export const WIZARD_STATE_KEY = "brc_estimate_wizard";

export interface PersistedWizardState {
  /** One entry per room the visitor is planning (multi-room). */
  rooms: EstimateSelections[];
  currentIndex: number;
}

export function decodeWizardState(value: unknown): PersistedWizardState | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.rooms) || typeof candidate.currentIndex !== 'number' || !Number.isFinite(candidate.currentIndex)) return null;
  // Old snapshots can contain retired fields. Keep valid public choices rather
  // than repeatedly sending unsupported fields or crashing before recovery.
  const rooms = candidate.rooms.slice(0,MAX_ROOMS).flatMap(room=>{
    const parsed=roomSelectionsSchema.safeParse(room);
    return parsed.success?[parsed.data]:[];
  });
  if(candidate.rooms.length && !rooms.length)return null;
  return {rooms,currentIndex:Math.max(0,Math.min(100,Math.floor(candidate.currentIndex)))};
}

export function loadWizardState(): PersistedWizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WIZARD_STATE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return decodeWizardState(parsed);
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
