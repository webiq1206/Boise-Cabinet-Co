/**
 * MeasurementBundle - Consolidated property measurements for remodeling project scoping.
 *
 * Derived from assessor data to support automated pricing and lead qualification
 * for kitchen remodels, bathroom remodels, additions, and whole-home renovations.
 */

export interface MeasurementBundle {
  // Core property data
  parcelId?: string;
  address: string;
  city: string;

  // Area measurements (square feet)
  lotSizeSqFt: number;           // Total lot size
  buildingFootprintSqFt: number; // Building footprint (ground floor + garage)
  interiorSqFt: number;          // Finished interior living area

  // Linear measurements (feet)
  lotPerimeterFt: number;        // Full property perimeter

  // Structural
  rooflineFt: number;            // Roofline length (for additions)

  // Confidence metadata
  source: 'assessor' | 'manual' | 'estimated';
  confidence: 'high' | 'medium' | 'low';
  timestamp: string;
}

/**
 * Create a MeasurementBundle from assessor property data
 */
export function createMeasurementBundleFromAssessor(
  propertyData: {
    parcel?: string;
    address: string;
    city: string;
    lotSizeSqFt?: number;
    lotSizeAcres?: number;
    buildingSqFt?: number;
    groundFloorSqFt?: number;
    garageSqFt?: number;
    deckPatioPoolSqFt?: number;
    totalLivingAreaSqFt?: number;
    lotPerimeterFt?: number;
    estimatedRoofLineFt?: number;
  }
): MeasurementBundle {
  const lotSizeSqFt = propertyData.lotSizeSqFt ||
    (propertyData.lotSizeAcres ? Math.round(propertyData.lotSizeAcres * 43560) : 0);

  const buildingFootprintSqFt = (propertyData.groundFloorSqFt || 0) +
    (propertyData.garageSqFt || 0);

  const interiorSqFt = propertyData.totalLivingAreaSqFt ||
    propertyData.buildingSqFt || 0;

  const estimatedPerimeter = Math.round(Math.sqrt(lotSizeSqFt) * 4);
  const lotPerimeterFt = propertyData.lotPerimeterFt || estimatedPerimeter;

  const estimatedRoofline = Math.round(Math.sqrt(buildingFootprintSqFt || 2000) * 4);
  const rooflineFt = propertyData.estimatedRoofLineFt || estimatedRoofline;

  const hasDirectData = Boolean(propertyData.lotSizeSqFt && propertyData.groundFloorSqFt);
  const confidence = hasDirectData ? 'high' : (lotSizeSqFt > 0 ? 'medium' : 'low');

  return {
    parcelId: propertyData.parcel,
    address: propertyData.address,
    city: propertyData.city,
    lotSizeSqFt,
    buildingFootprintSqFt,
    interiorSqFt,
    lotPerimeterFt,
    rooflineFt,
    source: 'assessor',
    confidence,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a default MeasurementBundle when no assessor data is available
 */
export function createDefaultMeasurementBundle(
  address: string = '',
  city: string = ''
): MeasurementBundle {
  const defaultLotSqFt = 8000;
  const defaultBuildingSqFt = 2000;

  return {
    address,
    city,
    lotSizeSqFt: defaultLotSqFt,
    buildingFootprintSqFt: defaultBuildingSqFt,
    interiorSqFt: defaultBuildingSqFt,
    lotPerimeterFt: Math.round(Math.sqrt(defaultLotSqFt) * 4),
    rooflineFt: Math.round(Math.sqrt(defaultBuildingSqFt) * 4),
    source: 'estimated',
    confidence: 'low',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get a human-readable summary of the measurement bundle
 */
export function getMeasurementSummary(bundle: MeasurementBundle): string[] {
  const items: string[] = [];

  if (bundle.interiorSqFt > 0) {
    items.push(`${bundle.interiorSqFt.toLocaleString()} sq ft interior`);
  }

  if (bundle.lotSizeSqFt > 0) {
    items.push(`${bundle.lotSizeSqFt.toLocaleString()} sq ft lot`);
  }

  if (bundle.lotPerimeterFt > 0) {
    items.push(`${bundle.lotPerimeterFt} ft perimeter`);
  }

  return items;
}

/**
 * Format confidence level for display
 */
export function getConfidenceLabel(confidence: MeasurementBundle['confidence']): {
  label: string;
  color: string;
} {
  switch (confidence) {
    case 'high':
      return { label: 'Verified from county records', color: 'green' };
    case 'medium':
      return { label: 'Estimated from property data', color: 'yellow' };
    case 'low':
      return { label: 'Using typical estimates', color: 'gray' };
  }
}
