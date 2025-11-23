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

export interface PropertySearchResult {
  success: boolean;
  properties: PropertyData[];
  error?: string;
  suggestion?: string;
}

const ADA_COUNTY_PARCEL_API = 'https://www.schoolsitelocator.com/server/rest/services/ssl_IM/MapServer/131/query';

// Known Ada County cities with common misspellings
const CITY_MAPPINGS: Record<string, string> = {
  'KUNA': 'KUNA',
  'MERIDIAN': 'MERIDIAN',
  'MERIDAN': 'MERIDIAN', // Common misspelling
  'MERIDIEN': 'MERIDIAN', // Common misspelling
  'BOISE': 'BOISE',
  'BOYSE': 'BOISE', // Common misspelling
  'EAGLE': 'EAGLE',
  'STAR': 'STAR',
  'GARDEN CITY': 'GARDEN CITY',
  'GARDENCITY': 'GARDEN CITY',
  'HIDDEN SPRINGS': 'HIDDEN SPRINGS',
  'HIDDENSPRINGS': 'HIDDEN SPRINGS',
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy city name matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Normalize city name to handle misspellings
 */
function normalizeCity(city: string): string | null {
  if (!city) return null;
  
  const upperCity = city.toUpperCase().trim();
  
  // Direct match
  if (CITY_MAPPINGS[upperCity]) {
    return CITY_MAPPINGS[upperCity];
  }
  
  // Fuzzy match using substring logic
  const cities = Object.keys(CITY_MAPPINGS);
  for (const knownCity of cities) {
    if (upperCity.includes(knownCity) || knownCity.includes(upperCity)) {
      return CITY_MAPPINGS[knownCity];
    }
  }
  
  // Levenshtein distance matching for typos (distance <= 2)
  const uniqueCities = Object.values(CITY_MAPPINGS).filter((v, i, a) => a.indexOf(v) === i);
  let bestMatch: string | null = null;
  let bestDistance = Infinity;
  
  for (const knownCity of uniqueCities) {
    const distance = levenshteinDistance(upperCity, knownCity);
    if (distance <= 2 && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = knownCity;
    }
  }
  
  return bestMatch;
}

/**
 * Search for properties by address in Ada County (with multiple match support)
 */
export async function searchAdaCountyProperties(
  address: string, 
  cityContext?: string
): Promise<PropertySearchResult> {
  try {
    // Clean and parse address
    const addressUpper = address.trim().toUpperCase();
    
    // Extract street address and city from input
    // Supports formats:
    // - "1234 Main St, Kuna, ID"
    // - "1234 Main St Kuna ID" (no commas)
    // - "1234 Main St"
    
    let streetAddress = '';
    let cityFromInput = '';
    
    // Known Ada County cities for detection (normalized, sorted by length descending)
    // Sort by length to match longer city names first (e.g., "GARDEN CITY" before "CITY")
    const ADA_CITIES = Object.values(CITY_MAPPINGS)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b.length - a.length);
    
    if (addressUpper.includes(',')) {
      // Comma-separated format: "1234 Main St, Kuna, ID"
      const parts = addressUpper.split(',').map(p => p.trim());
      streetAddress = parts[0];
      cityFromInput = parts.length > 1 ? parts[1] : '';
    } else {
      // No commas - detect city by matching known cities from the END of the address
      // "1234 Main St Kuna ID" or "1234 Main St KUNA"
      let foundCity = '';
      let cityIndex = -1;
      
      // Try to find city name in the address (prefer matches closer to the end)
      for (const city of ADA_CITIES) {
        // Look for city with a space before it (word boundary)
        const searchPattern = ` ${city}`;
        const lastIndex = addressUpper.lastIndexOf(searchPattern);
        
        if (lastIndex !== -1) {
          // Found the city - verify it's followed by optional state suffix, ZIP code, or end of string
          const afterCity = addressUpper.substring(lastIndex + searchPattern.length).trim();
          
          // City should be followed by nothing, "ID", "IDAHO", ZIP code (5 digits or 5+4), or combinations
          // Examples: "", "ID", "IDAHO", "83634", "ID 83634", "83634-1234"
          if (
            afterCity === '' || 
            afterCity === 'ID' || 
            afterCity === 'IDAHO' || 
            /^ID\s/.test(afterCity) || 
            /^IDAHO\s/.test(afterCity) ||
            /^\d{5}(-\d{4})?$/.test(afterCity) ||  // Just ZIP code
            /^ID\s+\d{5}(-\d{4})?$/.test(afterCity) ||  // "ID 83634" or "ID 83634-1234"
            /^IDAHO\s+\d{5}(-\d{4})?$/.test(afterCity)  // "IDAHO 83634" or "IDAHO 83634-1234"
          ) {
            foundCity = city;
            cityIndex = lastIndex;
            break;
          }
        }
      }
      
      if (foundCity && cityIndex !== -1) {
        // Extract ONLY the street address (everything before city name)
        streetAddress = addressUpper.substring(0, cityIndex).trim();
        cityFromInput = foundCity;
        
        console.log('[AdaCountyAssessor] Extracted:', { streetAddress, cityFromInput, original: addressUpper });
      } else {
        // No city detected - use entire input as street address
        streetAddress = addressUpper;
        console.log('[AdaCountyAssessor] No city detected, using full address as street');
      }
    }
    
    // Remove state suffix from city if present (e.g., "KUNA ID" -> "KUNA")
    if (cityFromInput) {
      cityFromInput = cityFromInput.replace(/\s+(ID|IDAHO|,.*)/g, '').trim();
    }
    
    // CRITICAL: Strip trailing ZIP codes from street address
    // Handles patterns like " 83634" or " 83634-1234" at the end of the street address
    // This ensures clean street address for database queries
    streetAddress = streetAddress.replace(/\s+\d{5}(-\d{4})?$/g, '').trim();
    
    // Normalize city name (handle misspellings)
    let normalizedCity = normalizeCity(cityFromInput);
    
    // If we have a city context from the wizard, use it as fallback
    if (!normalizedCity && cityContext) {
      normalizedCity = normalizeCity(cityContext);
    }
    
    console.log('[AdaCountyAssessor] Parsed:', { streetAddress, cityFromInput, normalizedCity, cityContext });
    
    // Build query: exact match on street address, require city match
    let query = `ADDCONCAT='${streetAddress.replace(/'/g, "''")}'`;
    if (normalizedCity) {
      query += ` AND CITY='${normalizedCity.replace(/'/g, "''")}'`;
    }
    
    console.log('[AdaCountyAssessor] Query:', query);
    
    // Try exact match first
    let response = await fetch(`${ADA_COUNTY_PARCEL_API}?where=${encodeURIComponent(query)}&outFields=PARCEL,ADDCONCAT,CITY&returnGeometry=false&resultRecordCount=10&f=json`);
    let data = await response.json();
    
    console.log('[AdaCountyAssessor] Exact match results:', data.features?.length || 0);
    
    // If no exact match, try partial match on street address
    if (!data.features || data.features.length === 0) {
      // Clean streetAddress for LIKE query by removing any trailing city names that might have been missed
      // This handles cases where parsing failed to detect the city properly
      let cleanStreetForLike = streetAddress;
      for (const city of ADA_CITIES) {
        const pattern = new RegExp(`\\s+${city.replace(/\s+/g, '\\s+')}$`, 'i');
        cleanStreetForLike = cleanStreetForLike.replace(pattern, '').trim();
      }
      
      console.log('[AdaCountyAssessor] Cleaned street for LIKE:', { original: streetAddress, cleaned: cleanStreetForLike });
      
      let partialQuery = `ADDCONCAT LIKE '%${cleanStreetForLike.replace(/'/g, "''")}%'`;
      if (normalizedCity) {
        partialQuery += ` AND CITY='${normalizedCity.replace(/'/g, "''")}'`;
      }
      console.log('[AdaCountyAssessor] Trying partial query:', partialQuery);
      response = await fetch(`${ADA_COUNTY_PARCEL_API}?where=${encodeURIComponent(partialQuery)}&outFields=PARCEL,ADDCONCAT,CITY&resultRecordCount=20&f=json`);
      data = await response.json();
      console.log('[AdaCountyAssessor] Partial match results:', data.features?.length || 0);
      
      // CRITICAL: If we have a normalized city, REQUIRE exact city match
      if (data.features && data.features.length > 0 && normalizedCity) {
        const cityFiltered = data.features.filter((f: any) => 
          f.attributes.CITY && f.attributes.CITY.toUpperCase() === normalizedCity
        );
        console.log('[AdaCountyAssessor] City-filtered results:', cityFiltered.length);
        
        if (cityFiltered.length === 0 && data.features.length > 0) {
          // We found properties but none in the specified city
          const foundCities = Array.from(new Set(data.features.map((f: any) => f.attributes.CITY)));
          return {
            success: false,
            properties: [],
            error: 'No properties found',
            suggestion: `Address found in ${foundCities.join(', ')}, but not in ${normalizedCity}. Please check the city name.`
          };
        }
        
        data.features = cityFiltered;
      }
    }
    
    if (!data.features || data.features.length === 0) {
      console.log('[AdaCountyAssessor] No properties found');
      return {
        success: false,
        properties: [],
        error: 'No properties found',
        suggestion: normalizedCity 
          ? `Try removing the city name and entering just the street address, or check for typos.`
          : `Please include the city name (e.g., "123 Main St, Kuna, ID") or select the city in the form above.`
      };
    }
    
    // Convert all matching properties to PropertyData
    const properties: PropertyData[] = data.features.map((feature: any) => {
      const property = feature.attributes;
      const propertyData: PropertyData = {
        parcel: property.PARCEL,
        address: property.ADDCONCAT,
        city: property.CITY,
      };
      
      // Apply intelligent estimation
      const estimation = estimatePropertyMeasurements(propertyData.address, propertyData.city);
      
      return {
        ...propertyData,
        ...estimation,
      };
    });
    
    console.log('[AdaCountyAssessor] Found properties:', properties.length);
    
    return {
      success: true,
      properties,
    };
  } catch (error) {
    console.error('[AdaCountyAssessor] Error fetching property:', error);
    return {
      success: false,
      properties: [],
      error: 'Unable to connect to property database. Please try again.',
    };
  }
}

/**
 * Backward-compatible search function that returns single property
 * @deprecated Use searchAdaCountyProperties instead
 */
export async function searchAdaCountyProperty(address: string, cityContext?: string): Promise<PropertyData | null> {
  const result = await searchAdaCountyProperties(address, cityContext);
  return result.success && result.properties.length > 0 ? result.properties[0] : null;
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
