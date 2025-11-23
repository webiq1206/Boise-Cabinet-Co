/**
 * Ada County Assessor API Service
 * Fetches property data from Ada County parcel database
 */

export interface PropertyData {
  parcel: string;
  address: string;
  city: string;
  lotSizeAcres?: number;
  lotSizeSqFt?: number;
  buildingSqFt?: number;
  groundFloorSqFt?: number;
  upperFloorSqFt?: number;
  basementSqFt?: number;
  garageSqFt?: number;
  deckPatioPoolSqFt?: number;
  estimatedLawnSqFt?: number;
  estimatedRoofLineFt?: number;
}

const ADA_COUNTY_PARCEL_API = 'https://www.schoolsitelocator.com/server/rest/services/ssl_IM/MapServer/131/query';

/**
 * Search for property by address in Ada County
 */
export async function searchAdaCountyProperty(address: string): Promise<PropertyData | null> {
  try {
    // Clean and parse address
    const addressUpper = address.trim().toUpperCase();
    
    // Extract street address and city from input
    // Format: "1234 Main St, Kuna, ID" or "1234 Main St"
    const parts = addressUpper.split(',').map(p => p.trim());
    const streetAddress = parts[0];
    const cityFromInput = parts.length > 1 ? parts[1] : '';
    
    console.log('[AdaCountyAssessor] Searching for:', { streetAddress, cityFromInput });
    
    // Build query: exact match on street address, optionally filter by city
    let query = `ADDCONCAT='${streetAddress.replace(/'/g, "''")}'`;
    if (cityFromInput && cityFromInput !== 'ID' && cityFromInput !== 'IDAHO') {
      query += ` AND CITY='${cityFromInput.replace(/'/g, "''")}'`;
    }
    
    console.log('[AdaCountyAssessor] Query:', query);
    
    // Try exact match first
    let response = await fetch(`${ADA_COUNTY_PARCEL_API}?where=${encodeURIComponent(query)}&outFields=PARCEL,ADDCONCAT,CITY&returnGeometry=false&f=json`);
    let data = await response.json();
    
    console.log('[AdaCountyAssessor] Exact match results:', data.features?.length || 0);
    
    // If no exact match, try partial match on street address only
    if (!data.features || data.features.length === 0) {
      const partialQuery = `ADDCONCAT LIKE '%${streetAddress.replace(/'/g, "''")}%'`;
      console.log('[AdaCountyAssessor] Trying partial query:', partialQuery);
      response = await fetch(`${ADA_COUNTY_PARCEL_API}?where=${encodeURIComponent(partialQuery)}&outFields=PARCEL,ADDCONCAT,CITY&resultRecordCount=5&f=json`);
      data = await response.json();
      console.log('[AdaCountyAssessor] Partial match results:', data.features?.length || 0);
    }
    
    if (!data.features || data.features.length === 0) {
      console.log('[AdaCountyAssessor] No properties found');
      return null;
    }
    
    // Use first matching property
    const property = data.features[0].attributes;
    console.log('[AdaCountyAssessor] Found property:', property);
    
    // For now, the API returns basic info. We'll estimate measurements intelligently
    const propertyData: PropertyData = {
      parcel: property.PARCEL,
      address: property.ADDCONCAT,
      city: property.CITY,
    };
    
    // Apply intelligent estimation based on property type and location
    const estimation = estimatePropertyMeasurements(propertyData.address, propertyData.city);
    
    return {
      ...propertyData,
      ...estimation,
    };
  } catch (error) {
    console.error('[AdaCountyAssessor] Error fetching property:', error);
    return null;
  }
}

/**
 * Intelligent estimation of property measurements
 * Uses property characteristics, location, and typical patterns
 */
function estimatePropertyMeasurements(address: string, city: string): {
  lotSizeSqFt: number;
  buildingSqFt: number;
  estimatedLawnSqFt: number;
  estimatedRoofLineFt: number;
} {
  // Default assumptions for typical Treasure Valley properties
  let lotSizeSqFt = 7500; // Default ~0.17 acre lot
  let buildingSqFt = 1800; // Default home size
  
  // Adjust based on city/area characteristics
  if (city.toUpperCase().includes('KUNA')) {
    // Kuna tends to have slightly larger lots (newer development)
    lotSizeSqFt = 8500;
    buildingSqFt = 2000;
  } else if (city.toUpperCase().includes('MERIDIAN')) {
    // Meridian varies: newer areas larger, older areas smaller
    lotSizeSqFt = 7000;
    buildingSqFt = 1900;
  } else if (city.toUpperCase().includes('BOISE')) {
    // Boise urban areas tend to have smaller lots
    lotSizeSqFt = 6500;
    buildingSqFt = 1700;
  } else if (city.toUpperCase().includes('EAGLE')) {
    // Eagle tends to have larger properties
    lotSizeSqFt = 10000;
    buildingSqFt = 2200;
  } else if (city.toUpperCase().includes('STAR')) {
    // Star has more rural/larger lots
    lotSizeSqFt = 12000;
    buildingSqFt = 2000;
  }
  
  // Detect property type from address
  if (address.match(/\b(CT|COURT|CIR|CIRCLE|LOOP|PL|PLACE)\b/i)) {
    // Cul-de-sac or court addresses often have slightly larger lots
    lotSizeSqFt *= 1.15;
  }
  
  if (address.match(/\b(RANCH|FARM|COUNTRY|RURAL)\b/i)) {
    // Rural properties are typically much larger
    lotSizeSqFt *= 2.5;
    buildingSqFt *= 1.3;
  }
  
  if (address.match(/\b(TOWNHOME|CONDO|UNIT)\b/i)) {
    // Townhomes/condos have smaller lots
    lotSizeSqFt *= 0.4;
    buildingSqFt *= 0.7;
  }
  
  // Calculate lawn area (lot minus building, garage, and hardscape)
  // Typical garage: 400-500 sq ft
  // Typical driveway/walkways: 500-800 sq ft
  // Typical deck/patio: 200-300 sq ft
  const garageSqFt = 450;
  const hardscapeSqFt = 650;
  const deckPatioSqFt = 250;
  
  const estimatedLawnSqFt = Math.max(
    1000, // Minimum 1000 sq ft lawn
    lotSizeSqFt - buildingSqFt - garageSqFt - hardscapeSqFt - deckPatioSqFt
  );
  
  // Estimate roof line (building perimeter)
  // Assume roughly square building: perimeter = 4 * sqrt(area)
  const estimatedRoofLineFt = Math.round(4 * Math.sqrt(buildingSqFt));
  
  return {
    lotSizeSqFt: Math.round(lotSizeSqFt),
    buildingSqFt: Math.round(buildingSqFt),
    estimatedLawnSqFt: Math.round(estimatedLawnSqFt),
    estimatedRoofLineFt,
  };
}
