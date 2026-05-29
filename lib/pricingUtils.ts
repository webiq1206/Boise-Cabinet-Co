/**
 * Client-side pricing utilities for calculating accurate price ranges
 * Mirrors the server-side pricing logic but calculates min/max ranges
 */

// Service pricing configuration (matches server/services/pricing.ts)
// Rates are from the official pricing calculator spreadsheet
// All rates use lowRate/highRate for price ranges, with minimum pricing
export const SERVICE_PRICING_CONFIG = {
  "kitchen-remodel": { lowRate: 25000, highRate: 75000, unit: "base_project", name: "Kitchen Remodel", minimum: 15000 },
  "bathroom-remodel": { lowRate: 8000, highRate: 35000, unit: "base_project", name: "Bathroom Remodel", minimum: 5000 },
  "whole-home-remodel": { lowRate: 80000, highRate: 300000, unit: "base_project", name: "Whole-Home Remodel", minimum: 50000 },
  "room-addition": { lowRate: 50000, highRate: 150000, unit: "base_project", name: "Room Addition", minimum: 30000 },
  "basement-finish": { lowRate: 30, highRate: 65, unit: "sqft", name: "Basement Finish", minimum: 10000 },
  "outdoor-living": { lowRate: 15000, highRate: 60000, unit: "base_project", name: "Outdoor Living Space", minimum: 8000 },
};

// Complexity bounds (simulates AI analysis range)
export const COMPLEXITY_BOUNDS = {
  min: 1.0,  // Simple, flat, easy access
  max: 2.0,  // Complex, steep, many obstacles
  typical: 1.2,  // Average complexity
};

// Frequency discounts
export const FREQUENCY_DISCOUNTS = {
  "one-time": 0,
  weekly: 0.15,      // 15% discount
  "bi-weekly": 0.10, // 10% discount
  monthly: 0.05,     // 5% discount
};

// Gross margin (45%)
export const GROSS_MARGIN = 0.45;

/**
 * Round UP to nearest $5
 */
export function roundUpToNearest5(value: number): number {
  if (!value || value <= 0 || isNaN(value)) return 0;
  return Math.ceil(value / 5) * 5;
}


/**
 * Apply gross margin to convert cost to customer price
 */
function applyGrossMargin(cost: number): number {
  if (!Number.isFinite(cost) || cost <= 0) return 0;
  return cost / (1 - GROSS_MARGIN);
}

export interface ServiceMeasurements {
  propertySize?: number;      // Lawn area in sqft
  linearFeet?: number;        // For fencing, hedges, edging, lights
  zones?: number;             // For irrigation
  treeCount?: number;         // For tree services
  fixtureCount?: number;      // For fixture-based pricing
  lightingType?: string;      // 'Permanent Lighting' or 'Traditional'
}

export interface PriceRangeResult {
  min: number;
  max: number;
  typical: number;
  serviceName: string;
  unit: string;
  measurement: number;
}

/**
 * Calculate price range for a single service based on measurements
 * Uses lowRate/highRate from pricing config with minimum pricing enforced
 */
export function calculateServicePriceRange(
  serviceId: string,
  measurements: ServiceMeasurements,
  propertyType: string = "residential",
  frequency: string = "one-time"
): PriceRangeResult | null {
  const config = SERVICE_PRICING_CONFIG[serviceId as keyof typeof SERVICE_PRICING_CONFIG] as any;
  if (!config) return null;

  // Get measurement value and calculate low/high costs based on service unit
  let lowCost = 0;
  let highCost = 0;
  let measurementValue = 0;
  const unit = config.unit;
  const minimum = config.minimum || 0;

  switch (config.unit) {
    case "sqft":
      measurementValue = measurements.propertySize || 5000;
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "linear_ft":
      measurementValue = measurements.linearFeet || 100;
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "per_sqft":
    case "per_zone":
    case "per_tree":
    case "per_inch":
    case "per_shrub":
    case "per_fixture":
    case "per_cubic_yard":
      measurementValue = measurements.propertySize || 100;
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "base_service":
    case "base_project":
      measurementValue = 1;
      lowCost = config.lowRate;
      highCost = config.highRate;
      break;
  }

  // Get property multiplier bounds
  const propMult = PROPERTY_MULTIPLIERS[propertyType as keyof typeof PROPERTY_MULTIPLIERS] 
    || PROPERTY_MULTIPLIERS.residential;

  // Get frequency discount
  const freqDiscount = FREQUENCY_DISCOUNTS[frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;

  // Apply property multiplier and frequency discount
  const adjustedLowCost = lowCost * propMult.min * (1 - freqDiscount);
  const adjustedHighCost = highCost * propMult.max * (1 - freqDiscount);

  // Apply gross margin and enforce minimum pricing
  const lowPrice = Math.max(minimum, applyGrossMargin(adjustedLowCost));
  const highPrice = Math.max(minimum, applyGrossMargin(adjustedHighCost));

  // Round UP to nearest $5 per business requirement
  const minPrice = roundUpToNearest5(lowPrice);
  const maxPrice = roundUpToNearest5(highPrice);

  // Calculate typical estimate (midpoint)
  const typicalPrice = roundUpToNearest5((minPrice + maxPrice) / 2);

  // Ensure min is not greater than max
  const finalMin = Math.max(5, Math.min(minPrice, maxPrice));
  const finalMax = Math.max(finalMin, maxPrice);

  return {
    min: finalMin,
    max: finalMax,
    typical: typicalPrice,
    serviceName: config.name,
    unit: config.unit,
    measurement: measurementValue,
  };
}

export interface TotalPriceRange {
  min: number;
  max: number;
  typical: number;
  serviceCount: number;
  breakdown: PriceRangeResult[];
}

/**
 * Calculate total price range for multiple services
 */
export function calculateTotalPriceRange(
  selectedServices: string[],
  serviceData: Record<string, ServiceMeasurements>,
  sharedMeasurements: ServiceMeasurements,
  propertyType: string = "residential",
  frequency: string = "one-time",
  serviceFrequencies?: Record<string, string>
): TotalPriceRange {
  const breakdown: PriceRangeResult[] = [];
  let totalMin = 0;
  let totalMax = 0;
  let totalTypical = 0;

  for (const serviceId of selectedServices) {
    const serviceMeasurements = serviceData[serviceId] || {};
    const measurements: ServiceMeasurements = {
      propertySize: serviceMeasurements.propertySize || sharedMeasurements.propertySize,
      linearFeet: serviceMeasurements.linearFeet || sharedMeasurements.linearFeet,
      zones: serviceMeasurements.zones || sharedMeasurements.zones,
      treeCount: serviceMeasurements.treeCount || sharedMeasurements.treeCount,
      fixtureCount: serviceMeasurements.fixtureCount || sharedMeasurements.fixtureCount,
      lightingType: serviceMeasurements.lightingType,
    };

    const svcFreq = serviceFrequencies?.[serviceId] || frequency;
    const range = calculateServicePriceRange(serviceId, measurements, propertyType, svcFreq);
    if (range) {
      breakdown.push(range);
      totalMin += range.min;
      totalMax += range.max;
      totalTypical += range.typical;
    }
  }

  return {
    min: totalMin,
    max: totalMax,
    typical: totalTypical,
    serviceCount: breakdown.length,
    breakdown,
  };
}

/**
 * Format price range for display
 */
export function formatPriceRange(min: number, max: number): string {
  if (min === 0 && max === 0) return "$0";
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

/**
 * Get a quick estimate for a service before full calculation
 * Uses default/typical measurements for display in service lists
 */
export function getServiceQuickEstimate(
  serviceId: string,
  typicalLawnSize: number = 5000,
  frequency: string = "one-time"
): { min: number; max: number; label: string } | null {
  const measurements: ServiceMeasurements = {
    propertySize: typicalLawnSize,
    linearFeet: Math.round(Math.sqrt(typicalLawnSize) * 4 * 0.6), // ~60% of perimeter
    zones: 6,
    treeCount: 1,
    fixtureCount: 10,
  };

  const range = calculateServicePriceRange(serviceId, measurements, "residential", frequency);
  if (!range) return null;

  // Create a display label based on unit
  let label = "";
  switch (range.unit) {
    case "sqft":
      label = `for ${(typicalLawnSize / 1000).toFixed(0)}k sq ft`;
      break;
    case "linear_ft":
      label = `per linear foot`;
      break;
    case "per_zone":
      label = `for 6 zones`;
      break;
    case "per_tree":
    case "per_stump":
      label = `per tree`;
      break;
    case "per_fixture":
      label = `for 10 fixtures`;
      break;
    case "base_service":
    case "base_project":
      label = `starting at`;
      break;
    default:
      label = "";
  }

  return { min: range.min, max: range.max, label };
}
