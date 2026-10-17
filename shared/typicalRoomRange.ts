import {
  PROJECT_PRICING,
  PROJECT_SIZE_CONFIG,
  calculateEstimate,
  formatPlanningCurrency,
  getDefaultSelectionsForProject,
  type EstimateSelections,
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

function requireTypicalKitchen(): { priceLow: number; priceHigh: number } {
  const range = getTypicalRoomRange("kitchen");
  if (!range) throw new Error("Kitchen typical range is required.");
  return range;
}

/** "$17k to $29k installed" for the estimator's default Better-tier kitchen. */
export function typicalKitchenInstalledLabel(): string {
  return `${formatTypicalRoomRange("kitchen")} installed`;
}

/** Exact dollars, e.g. "$17,100". */
export function formatDollars(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

/** Exact typical Better kitchen band, e.g. "$17,100 to $28,600". */
export function formatTypicalKitchenDollars(): string {
  const range = requireTypicalKitchen();
  return `${formatDollars(range.priceLow)} to ${formatDollars(range.priceHigh)}`;
}

/** Arithmetic midpoint of the typical Better kitchen, in exact dollars. */
export function typicalKitchenMidpointDollars(): string {
  const range = requireTypicalKitchen();
  return formatDollars(Math.round((range.priceLow + range.priceHigh) / 2));
}

/**
 * Smaller kitchen on the estimator's 2-foot step.
 * Inputs: 16 linear feet of base cabinets, 12 linear feet of uppers, island
 * layout, modern shaker doors, matte standard finish, Better construction.
 */
export function smallKitchenSelections(): EstimateSelections {
  return { ...getDefaultSelectionsForProject("kitchen"), size: 16, sizeUpper: 12 };
}

export function formatSmallKitchenDollars(): string {
  const result = calculateEstimate(smallKitchenSelections());
  if (!result) throw new Error("Small kitchen range is required.");
  return `${formatDollars(result.priceLow)} to ${formatDollars(result.priceHigh)}`;
}

/**
 * Best construction at the estimator's maximum kitchen size.
 * Same layout, door, and finish as the typical Better kitchen.
 * Inputs: 60 linear feet of base cabinets, 50 linear feet of uppers, island
 * layout, modern shaker doors, matte standard finish, Best construction.
 */
export function bestLargeKitchenSelections(): EstimateSelections {
  const cfg = PROJECT_SIZE_CONFIG.kitchen;
  return {
    ...getDefaultSelectionsForProject("kitchen"),
    size: cfg.max,
    sizeUpper: cfg.uppers ? cfg.uppers.max : null,
    construction: "best",
  };
}

export function getBestLargeKitchenRange(): { priceLow: number; priceHigh: number } {
  const result = calculateEstimate(bestLargeKitchenSelections());
  if (!result) throw new Error("Best-tier large kitchen range is required.");
  return { priceLow: result.priceLow, priceHigh: result.priceHigh };
}

/** Exact Best-tier large kitchen band, e.g. "$51,200 to $86,000". */
export function formatBestLargeKitchenRange(): string {
  const range = getBestLargeKitchenRange();
  return `${formatDollars(range.priceLow)} to ${formatDollars(range.priceHigh)}`;
}

export function bestLargeKitchenInstalledLabel(): string {
  return `${formatBestLargeKitchenRange()} installed`;
}

/** Wider top end, with the inputs that produced it, for high-end kitchen copy. */
export function bestLargeKitchenWithInputsPhrase(): string {
  const sel = bestLargeKitchenSelections();
  return `A Best-tier large kitchen (${sel.size} linear feet of base cabinets, ${sel.sizeUpper} linear feet of uppers, island layout, modern shaker doors, matte standard finish) plans from ${bestLargeKitchenInstalledLabel()}`;
}
