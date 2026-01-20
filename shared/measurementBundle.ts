/**
 * MeasurementBundle - Consolidated property measurements for automated quoting
 * 
 * This schema consolidates all property measurements derived from assessor data
 * to enable automated, accurate pricing across all services.
 */

export interface MeasurementBundle {
  // Core property data
  parcelId?: string;
  address: string;
  city: string;
  
  // Area measurements (square feet)
  lotSizeSqFt: number;           // Total lot size
  buildingFootprintSqFt: number; // Building footprint (ground floor + garage)
  lawnAreaSqFt: number;          // Calculated: lot - building - hardscape
  
  // Linear measurements (feet)
  lotPerimeterFt: number;        // Full property perimeter (for fencing)
  lawnPerimeterFt: number;       // Lawn perimeter (for edging) - ~75% of lot
  rooflineFt: number;            // Roofline length
  rooflineWithOverhangFt: number; // Roofline + 25% for eaves (for lights)
  estimatedHedgeFt: number;      // Estimated hedge length (~40% of perimeter)
  
  // Irrigation
  estimatedZones: number;        // Typical zone count based on lot size
  
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
    estimatedLawnSqFt?: number;
    lotPerimeterFt?: number;
    lawnPerimeterFt?: number;
    estimatedRoofLineFt?: number;
    rooflineWithOverhangFt?: number;
    estimatedHedgeFt?: number;
  }
): MeasurementBundle {
  // Calculate lot size in sqft
  const lotSizeSqFt = propertyData.lotSizeSqFt || 
    (propertyData.lotSizeAcres ? Math.round(propertyData.lotSizeAcres * 43560) : 0);
  
  // Calculate building footprint (ground floor + garage)
  const buildingFootprintSqFt = (propertyData.groundFloorSqFt || 0) + 
    (propertyData.garageSqFt || 0);
  
  // Use assessor's lawn estimate or calculate from lot - building - hardscape
  const hardscapeSqFt = propertyData.deckPatioPoolSqFt || 0;
  const lawnAreaSqFt = propertyData.estimatedLawnSqFt || 
    Math.max(0, lotSizeSqFt - buildingFootprintSqFt - hardscapeSqFt);
  
  // Perimeter calculations - use assessor data or estimate from lot size
  const estimatedPerimeter = Math.round(Math.sqrt(lotSizeSqFt) * 4);
  const lotPerimeterFt = propertyData.lotPerimeterFt || estimatedPerimeter;
  const lawnPerimeterFt = propertyData.lawnPerimeterFt || Math.round(lotPerimeterFt * 0.75);
  
  // Roofline - use assessor data or estimate from building footprint
  const estimatedRoofline = Math.round(Math.sqrt(buildingFootprintSqFt || 2000) * 4);
  const rooflineFt = propertyData.estimatedRoofLineFt || estimatedRoofline;
  const rooflineWithOverhangFt = propertyData.rooflineWithOverhangFt || Math.round(rooflineFt * 1.25);
  
  // Hedge length - typical ~40% of lot perimeter
  const estimatedHedgeFt = propertyData.estimatedHedgeFt || Math.round(lotPerimeterFt * 0.4);
  
  // Estimate irrigation zones based on lawn size (1 zone per ~1,500 sqft typical)
  const estimatedZones = Math.max(4, Math.min(12, Math.round(lawnAreaSqFt / 1500)));
  
  // Determine confidence level
  const hasDirectData = Boolean(
    propertyData.lotSizeSqFt && 
    propertyData.groundFloorSqFt
  );
  const confidence = hasDirectData ? 'high' : (lotSizeSqFt > 0 ? 'medium' : 'low');
  
  return {
    parcelId: propertyData.parcel,
    address: propertyData.address,
    city: propertyData.city,
    lotSizeSqFt,
    buildingFootprintSqFt,
    lawnAreaSqFt,
    lotPerimeterFt,
    lawnPerimeterFt,
    rooflineFt,
    rooflineWithOverhangFt,
    estimatedHedgeFt,
    estimatedZones,
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
  // Use typical residential property estimates
  const defaultLotSqFt = 8000;
  const defaultBuildingSqFt = 2000;
  const defaultLawnSqFt = 5000;
  
  return {
    address,
    city,
    lotSizeSqFt: defaultLotSqFt,
    buildingFootprintSqFt: defaultBuildingSqFt,
    lawnAreaSqFt: defaultLawnSqFt,
    lotPerimeterFt: Math.round(Math.sqrt(defaultLotSqFt) * 4),
    lawnPerimeterFt: Math.round(Math.sqrt(defaultLotSqFt) * 4 * 0.75),
    rooflineFt: Math.round(Math.sqrt(defaultBuildingSqFt) * 4),
    rooflineWithOverhangFt: Math.round(Math.sqrt(defaultBuildingSqFt) * 4 * 1.25),
    estimatedHedgeFt: Math.round(Math.sqrt(defaultLotSqFt) * 4 * 0.4),
    estimatedZones: 6,
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
  
  if (bundle.lawnAreaSqFt > 0) {
    items.push(`${bundle.lawnAreaSqFt.toLocaleString()} sq ft lawn`);
  }
  
  if (bundle.rooflineWithOverhangFt > 0) {
    items.push(`${bundle.rooflineWithOverhangFt} ft roofline`);
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
