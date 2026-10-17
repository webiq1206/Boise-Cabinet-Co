import {
  PROJECT_PRICING,
  calculateEstimate,
  formatPlanningCurrency,
  getDefaultSelectionsForProject,
  type ProjectType,
} from "./estimateEngine";

/**
 * A room's typical planning range, from the estimator's canonical defaults
 * (typical size, modern-shaker door, matte/standard finish, Better construction).
 * Rooms without a pricing model return null. Callers must not invent a number.
 */
export function getTypicalRoomRange(roomSlug: string): { priceLow: number; priceHigh: number } | null {
  if (!(roomSlug in PROJECT_PRICING)) return null;
  const project = roomSlug as ProjectType;
  const result = calculateEstimate(getDefaultSelectionsForProject(project));
  return result ? { priceLow: result.priceLow, priceHigh: result.priceHigh } : null;
}

/** The same "$17k to $29k" style label the cost card and the kitchen FAQ both show. */
export function formatTypicalRoomRange(roomSlug: string): string | null {
  const range = getTypicalRoomRange(roomSlug);
  if (!range) return null;
  return `${formatPlanningCurrency(range.priceLow)} to ${formatPlanningCurrency(range.priceHigh)}`;
}
