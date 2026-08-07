import {
  isPriceable,
  type CombinedEstimateResult,
  type EstimateResult,
  type EstimateSelections,
} from "./estimateEngine";

/**
 * Estimate validation layer.
 *
 * Every surface that shows a homeowner a dollar figure (guided estimator,
 * conversational assistant, calculate API, consultation handoff) runs the
 * engine's output through these checks first. The engine is deterministic and
 * covered by the pricing regression suite, so a failure here means something
 * upstream corrupted the inputs or the result in transit - in that case the
 * caller must fall back to "make your selections" / "let's book a visit"
 * rather than display a suspicious number.
 */

/** Mirrors the engine's private PRICE_ROUND_TO; pinned by the pricing suite. */
export const ESTIMATE_PRICE_ROUND_TO = 100;

/**
 * Hard sanity ceiling per estimate, in dollars. The engine's maximum possible
 * single-room range tops out around $140k (kitchen at max size with every
 * upgrade), so anything past this bound is corrupt data, not a big project.
 */
const MAX_SANE_PER_ROOM = 500_000;

export interface EstimateValidationOutcome {
  ok: boolean;
  issues: string[];
}

function checkRange(low: number, high: number, label: string): string[] {
  const issues: string[] = [];
  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    issues.push(`${label}: price range is not a finite number`);
    return issues;
  }
  if (!Number.isInteger(low) || !Number.isInteger(high)) {
    issues.push(`${label}: price range is not a whole dollar amount`);
  }
  if (low <= 0 || high <= 0) {
    issues.push(`${label}: price range must be positive (got ${low}..${high})`);
  }
  if (low > high) {
    issues.push(`${label}: priceLow ${low} exceeds priceHigh ${high}`);
  }
  if (low % ESTIMATE_PRICE_ROUND_TO !== 0 || high % ESTIMATE_PRICE_ROUND_TO !== 0) {
    issues.push(
      `${label}: range ${low}..${high} is not rounded to $${ESTIMATE_PRICE_ROUND_TO}`,
    );
  }
  if (high > MAX_SANE_PER_ROOM) {
    issues.push(`${label}: priceHigh ${high} exceeds the sanity ceiling`);
  }
  return issues;
}

/** Validate a single-room engine result against the selections that produced it. */
export function validateEstimateResult(
  result: EstimateResult | null,
  selections: EstimateSelections,
): EstimateValidationOutcome {
  const issues: string[] = [];
  if (!result) {
    // Null is the engine's honest "not priceable yet" answer - only a problem
    // if the inputs actually were priceable.
    if (isPriceable(selections)) {
      issues.push("engine returned null for priceable selections");
    }
    return { ok: issues.length === 0, issues };
  }
  if (!isPriceable(selections)) {
    issues.push("engine returned a price for selections that are not priceable");
  }
  issues.push(...checkRange(result.priceLow, result.priceHigh, "estimate"));
  return { ok: issues.length === 0, issues };
}

/**
 * Validate a combined multi-room result: per-room ranges, the total, and that
 * the total equals the sum of its rooms (each surface renders both, so a
 * mismatch would show the homeowner two different numbers for the same plan).
 */
export function validateCombinedEstimate(
  combined: CombinedEstimateResult | null,
  rooms: EstimateSelections[],
): EstimateValidationOutcome {
  const issues: string[] = [];
  const priceableCount = rooms.filter(isPriceable).length;
  if (!combined) {
    if (priceableCount > 0) {
      issues.push("engine returned null for a plan with priceable rooms");
    }
    return { ok: issues.length === 0, issues };
  }
  if (priceableCount === 0) {
    issues.push("engine returned a combined price for a plan with no priceable rooms");
  }
  if (combined.rooms.length !== priceableCount) {
    issues.push(
      `combined result has ${combined.rooms.length} rooms but ${priceableCount} are priceable`,
    );
  }
  issues.push(...checkRange(combined.priceLow, combined.priceHigh, "combined"));
  let sumLow = 0;
  let sumHigh = 0;
  combined.rooms.forEach((room, i) => {
    issues.push(...checkRange(room.priceLow, room.priceHigh, `room ${i + 1} (${room.projectLabel})`));
    sumLow += room.priceLow;
    sumHigh += room.priceHigh;
  });
  if (combined.rooms.length > 0 && (sumLow !== combined.priceLow || sumHigh !== combined.priceHigh)) {
    issues.push(
      `combined total ${combined.priceLow}..${combined.priceHigh} does not equal the sum of its rooms ${sumLow}..${sumHigh}`,
    );
  }
  return { ok: issues.length === 0, issues };
}

/**
 * Convenience guard for display surfaces: returns the combined result when it
 * validates, otherwise logs the issues and returns null so the caller falls
 * back to its no-estimate state instead of rendering a suspicious figure.
 */
export function safeCombinedEstimate(
  combined: CombinedEstimateResult | null,
  rooms: EstimateSelections[],
  surface: string,
): CombinedEstimateResult | null {
  const outcome = validateCombinedEstimate(combined, rooms);
  if (outcome.ok) return combined;
  console.error(
    `[estimateValidation] ${surface}: suppressing estimate - ${outcome.issues.join("; ")}`,
  );
  return null;
}
