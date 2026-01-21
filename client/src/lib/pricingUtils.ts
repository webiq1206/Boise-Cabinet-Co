/**
 * Client-side pricing utilities for calculating accurate price ranges
 * Mirrors the server-side pricing logic but calculates min/max ranges
 */

// Service pricing configuration (matches server/services/pricing.ts)
// Rates are from the official pricing calculator spreadsheet
// All rates use lowRate/highRate for price ranges, with minimum pricing
export const SERVICE_PRICING_CONFIG = {
  // Lawn services (per 1,000 sq ft - divide by 1000 for per sq ft rate)
  "lawn-mowing": { lowRate: 0.00625, highRate: 0.010, unit: "sqft", name: "Lawn Mowing & Edging", minimum: 35 },
  "aeration": { lowRate: 0.0125, highRate: 0.018, unit: "sqft", name: "Core Aeration", minimum: 75 },
  "fertilization": { lowRate: 0.005, highRate: 0.008, unit: "sqft", name: "Fertilization Treatment", minimum: 50 },
  "weed-control": { lowRate: 0.00375, highRate: 0.006, unit: "sqft", name: "Weed Control", minimum: 50 },
  "overseeding": { lowRate: 0.0125, highRate: 0.030, unit: "sqft", name: "Overseeding", minimum: 100 },
  "dethatching": { lowRate: 0.0125, highRate: 0.020, unit: "sqft", name: "Dethatching", minimum: 100 },
  "sod-installation": { lowRate: 1.25, highRate: 2.00, unit: "sqft", name: "Sod Installation", minimum: 500 },
  "lawn-renovation": { lowRate: 0.0625, highRate: 0.100, unit: "sqft", name: "Lawn Renovation", minimum: 500 },
  "lawn-edging": { lowRate: 0.625, highRate: 1.50, unit: "linear_ft", name: "Lawn Edging", minimum: 50 },
  
  // Christmas lights & landscape lighting
  "christmas-light-installation": { lowRate: 3.125, highRate: 7.00, unit: "linear_ft", name: "Christmas Light Installation", minimum: 400, permanentLowRate: 12.00, permanentHighRate: 18.00 },
  "landscape-lighting": { lowRate: 187.50, highRate: 350.00, unit: "per_fixture", name: "Landscape Lighting (Low Voltage)", minimum: 500 },
  
  // Irrigation
  "sprinkler-blowout": { lowRate: 12.50, highRate: 15.00, unit: "per_zone", name: "Sprinkler Winterization", minimum: 50, includedZones: 5 },
  "sprinkler-repair": { lowRate: 85.00, highRate: 150.00, unit: "base_service", name: "Sprinkler Repair", minimum: 85 },
  "sprinkler-system-installation": { lowRate: 0.50, highRate: 0.80, unit: "sqft", name: "Sprinkler System Installation", minimum: 2000 },
  "irrigation-repair": { lowRate: 85.00, highRate: 150.00, unit: "base_service", name: "Irrigation Repair", minimum: 85 },
  "irrigation-maintenance": { lowRate: 12.50, highRate: 15.00, unit: "per_zone", name: "Irrigation Maintenance", minimum: 65 },
  
  // Hardscape
  "patio-installation": { lowRate: 12.50, highRate: 24.00, unit: "per_sqft", name: "Patio Installation", minimum: 1500 },
  "retaining-walls": { lowRate: 25.00, highRate: 50.00, unit: "per_sqft", name: "Retaining Wall Installation", minimum: 1000 },
  "fire-pit-installation": { lowRate: 500.00, highRate: 2500.00, unit: "base_project", name: "Fire Pit Installation", minimum: 500 },
  "fence": { lowRate: 25.00, highRate: 45.00, unit: "linear_ft", name: "Fence Installation", minimum: 1000 },
  
  // Tree services (medium tree size as default)
  "tree-removal": { lowRate: 625.00, highRate: 1000.00, unit: "per_tree", name: "Tree Removal", minimum: 500 },
  "tree-trimming": { lowRate: 250.00, highRate: 450.00, unit: "per_tree", name: "Tree Trimming & Pruning", minimum: 200 },
  "stump-grinding": { lowRate: 3.75, highRate: 5.00, unit: "per_inch", name: "Stump Grinding", minimum: 100 },
  
  // Hedge & seasonal
  "hedge-trimming": { lowRate: 6.25, highRate: 15.00, unit: "per_shrub", name: "Hedge & Shrub Trimming", minimum: 50 },
  "spring-cleanup": { lowRate: 0.0125, highRate: 0.025, unit: "sqft", name: "Spring Cleanup", minimum: 150 },
  "fall-cleanup": { lowRate: 0.01875, highRate: 0.030, unit: "sqft", name: "Fall Cleanup", minimum: 175 },
  "seasonal-cleanup": { lowRate: 0.0125, highRate: 0.025, unit: "sqft", name: "Seasonal Cleanup", minimum: 150 },
  "mulch-installation": { lowRate: 87.50, highRate: 110.00, unit: "per_cubic_yard", name: "Mulch Installation", minimum: 150 },
  
  // Snow removal
  "snow-removal": { lowRate: 50.00, highRate: 90.00, unit: "base_service", name: "Snow Removal", minimum: 40 },
  
  // Gutter cleaning
  "gutter-cleaning": { lowRate: 1.25, highRate: 2.00, unit: "linear_ft", name: "Gutter Cleaning", minimum: 75 },
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
      if (serviceId === "christmas-light-installation" && measurements.lightingType === "Permanent Lighting") {
        lowCost = measurementValue * (config.permanentLowRate || 12.00);
        highCost = measurementValue * (config.permanentHighRate || 18.00);
      } else {
        lowCost = measurementValue * config.lowRate;
        highCost = measurementValue * config.highRate;
      }
      break;

    case "per_zone":
      measurementValue = measurements.zones || 6;
      const includedZones = config.includedZones || 5;
      const billableZones = Math.max(includedZones, measurementValue);
      lowCost = billableZones * config.lowRate;
      highCost = billableZones * config.highRate;
      break;

    case "per_tree":
      measurementValue = measurements.treeCount || 1;
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "per_inch":
      measurementValue = measurements.treeCount || 12; // default 12" diameter stump
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "per_shrub":
      measurementValue = measurements.treeCount || 5; // default 5 shrubs
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "per_fixture":
      measurementValue = measurements.fixtureCount || 10;
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "per_cubic_yard":
      // Estimate cubic yards from property size (1 cu yd per 100 sq ft at 3" depth)
      const sqft = measurements.propertySize || 500;
      measurementValue = Math.ceil(sqft / 100);
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
      break;

    case "base_service":
    case "base_project":
      measurementValue = 1;
      lowCost = config.lowRate;
      highCost = config.highRate;
      break;

    case "per_sqft":
      measurementValue = measurements.propertySize || 100;
      lowCost = measurementValue * config.lowRate;
      highCost = measurementValue * config.highRate;
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
