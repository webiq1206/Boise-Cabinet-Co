/**
 * Client-side pricing utilities for calculating accurate price ranges
 * Mirrors the server-side pricing logic but calculates min/max ranges
 */

// Service pricing configuration (matches server/services/pricing.ts)
export const SERVICE_PRICING_CONFIG = {
  // Lawn services (sqft based)
  "lawn-mowing": { rate: 0.003, unit: "sqft", name: "Lawn Mowing & Edging", tripCharge: 35 },
  "aeration": { rate: 0.018, unit: "sqft", name: "Core Aeration" },
  "fertilization": { rate: 0.014, unit: "sqft", name: "Fertilization Treatment" },
  "weed-control": { rate: 0.013, unit: "sqft", name: "Weed Control" },
  "overseeding": { rate: 0.016, unit: "sqft", name: "Overseeding" },
  "dethatching": { rate: 0.017, unit: "sqft", name: "Dethatching" },
  "sod-installation": { rate: 1.20, unit: "sqft", name: "Sod Installation" },
  "lawn-renovation": { rate: 0.025, unit: "sqft", name: "Lawn Renovation" },
  "lawn-edging": { rate: 1.50, unit: "linear_ft", name: "Lawn Edging" },
  
  // Christmas lights & landscape lighting
  "christmas-light-installation": { rate: 3.50, unit: "linear_ft", name: "Christmas Light Installation", permanentRate: 15.00 },
  "landscape-lighting": { rate: 75.00, unit: "per_fixture", name: "Landscape Lighting" },
  
  // Irrigation
  "sprinkler-blowout": { rate: 65, unit: "base_service", name: "Sprinkler Winterization", extraZoneRate: 5, includedZones: 6 },
  "sprinkler-repair": { rate: 85.00, unit: "base_service", name: "Sprinkler Repair" },
  "sprinkler-system-installation": { rate: 0.50, unit: "sqft", name: "Sprinkler System Installation" },
  "irrigation-repair": { rate: 85.00, unit: "base_service", name: "Irrigation Repair" },
  "irrigation-maintenance": { rate: 50.00, unit: "per_zone", name: "Irrigation Maintenance" },
  
  // Hardscape
  "patio-installation": { rate: 35.00, unit: "per_sqft", name: "Patio Installation" },
  "retaining-walls": { rate: 40.00, unit: "linear_ft", name: "Retaining Wall Installation" },
  "fire-pit-installation": { rate: 1500.00, unit: "base_project", name: "Fire Pit Installation" },
  "fence": { rate: 25.00, unit: "linear_ft", name: "Fence Installation" },
  
  // Tree services
  "tree-removal": { rate: 500.00, unit: "per_tree", name: "Tree Removal" },
  "tree-trimming": { rate: 250.00, unit: "per_tree", name: "Tree Trimming & Pruning" },
  "stump-grinding": { rate: 150.00, unit: "per_stump", name: "Stump Grinding" },
  
  // Hedge & seasonal
  "hedge-trimming": { rate: 2.00, unit: "linear_ft", name: "Hedge & Shrub Trimming" },
  "spring-cleanup": { rate: 0.016, unit: "sqft", name: "Spring Cleanup" },
  "fall-cleanup": { rate: 0.016, unit: "sqft", name: "Fall Cleanup" },
  "seasonal-cleanup": { rate: 0.016, unit: "sqft", name: "Seasonal Cleanup" },
  "mulch-installation": { rate: 0.45, unit: "sqft", name: "Mulch Installation" },
  
  // Snow removal
  "snow-removal": { rate: 75.00, unit: "base_service", name: "Snow Removal" },
} as const;

// Property type multipliers
export const PROPERTY_MULTIPLIERS = {
  residential: { min: 1.0, max: 1.0 },
  commercial: { min: 1.2, max: 1.3 },
  hoa: { min: 1.1, max: 1.2 },
  "property-management": { min: 1.15, max: 1.25 },
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
  fixtureCount?: number;      // For landscape lighting
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
 */
export function calculateServicePriceRange(
  serviceId: string,
  measurements: ServiceMeasurements,
  propertyType: string = "residential",
  frequency: string = "one-time"
): PriceRangeResult | null {
  const config = SERVICE_PRICING_CONFIG[serviceId as keyof typeof SERVICE_PRICING_CONFIG];
  if (!config) return null;

  // Get measurement value based on service unit
  let baseCost = 0;
  let measurementValue = 0;
  const unit = config.unit;

  switch (config.unit) {
    case "sqft":
      measurementValue = measurements.propertySize || 5000;
      if (serviceId === "lawn-mowing") {
        const tripCharge = (config as any).tripCharge || 35;
        baseCost = tripCharge + measurementValue * config.rate;
      } else {
        baseCost = measurementValue * config.rate;
      }
      break;

    case "linear_ft":
      measurementValue = measurements.linearFeet || 100;
      if (serviceId === "christmas-light-installation" && measurements.lightingType === "Permanent Lighting") {
        baseCost = measurementValue * ((config as any).permanentRate || 15.00);
      } else {
        baseCost = measurementValue * config.rate;
      }
      break;

    case "per_zone":
      measurementValue = measurements.zones || 6;
      baseCost = measurementValue * config.rate;
      break;

    case "per_tree":
    case "per_stump":
      measurementValue = measurements.treeCount || 1;
      baseCost = measurementValue * config.rate;
      break;

    case "per_fixture":
      measurementValue = measurements.fixtureCount || 10;
      baseCost = measurementValue * config.rate;
      break;

    case "base_service":
      if (serviceId === "sprinkler-blowout") {
        const zones = measurements.zones || 6;
        const includedZones = (config as any).includedZones || 6;
        const extraZoneRate = (config as any).extraZoneRate || 5;
        const extraZones = Math.max(0, zones - includedZones);
        baseCost = config.rate + extraZones * extraZoneRate;
        measurementValue = zones;
      } else {
        baseCost = config.rate;
        measurementValue = 1;
      }
      break;

    case "base_project":
      baseCost = config.rate;
      measurementValue = 1;
      break;

    case "per_sqft":
      measurementValue = measurements.propertySize || 100;
      baseCost = measurementValue * config.rate;
      break;
  }

  // Get property multiplier bounds
  const propMult = PROPERTY_MULTIPLIERS[propertyType as keyof typeof PROPERTY_MULTIPLIERS] 
    || PROPERTY_MULTIPLIERS.residential;

  // Get frequency discount
  const freqDiscount = FREQUENCY_DISCOUNTS[frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;

  // Calculate low estimate (min property mult, min complexity)
  // Note: Even min prices round UP per business requirement (all quotes end in $0 or $5)
  const lowCost = baseCost * propMult.min * COMPLEXITY_BOUNDS.min * (1 - freqDiscount);
  const lowPrice = applyGrossMargin(lowCost);
  const minPrice = roundUpToNearest5(lowPrice);

  // Calculate high estimate (max property mult, max complexity)
  const highCost = baseCost * propMult.max * COMPLEXITY_BOUNDS.max * (1 - freqDiscount);
  const highPrice = applyGrossMargin(highCost);
  const maxPrice = roundUpToNearest5(highPrice);

  // Calculate typical estimate (typical complexity)
  const typicalCost = baseCost * propMult.min * COMPLEXITY_BOUNDS.typical * (1 - freqDiscount);
  const typicalPrice = applyGrossMargin(typicalCost);
  const typical = roundUpToNearest5(typicalPrice);

  // Ensure min is not greater than max
  const finalMin = Math.max(5, Math.min(minPrice, maxPrice));
  const finalMax = Math.max(finalMin + 5, maxPrice);

  return {
    min: finalMin,
    max: finalMax,
    typical,
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
  frequency: string = "one-time"
): TotalPriceRange {
  const breakdown: PriceRangeResult[] = [];
  let totalMin = 0;
  let totalMax = 0;
  let totalTypical = 0;

  for (const serviceId of selectedServices) {
    // Get service-specific measurements or fall back to shared
    const serviceMeasurements = serviceData[serviceId] || {};
    const measurements: ServiceMeasurements = {
      propertySize: serviceMeasurements.propertySize || sharedMeasurements.propertySize,
      linearFeet: serviceMeasurements.linearFeet || sharedMeasurements.linearFeet,
      zones: serviceMeasurements.zones || sharedMeasurements.zones,
      treeCount: serviceMeasurements.treeCount || sharedMeasurements.treeCount,
      fixtureCount: serviceMeasurements.fixtureCount || sharedMeasurements.fixtureCount,
      lightingType: serviceMeasurements.lightingType,
    };

    const range = calculateServicePriceRange(serviceId, measurements, propertyType, frequency);
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
