/**
 * Canyon County Assessor API Service
 * 
 * NOTE: Canyon County does not currently have a publicly accessible REST API
 * for parcel data like Ada County does. This implementation provides graceful
 * degradation with helpful error messaging.
 * 
 * Future Enhancement: Canyon County offers free GIS data downloads via FTP
 * (contact 2cAsr@canyoncounty.id.gov). This data could be:
 * - Downloaded and hosted in a custom PostGIS database
 * - Exposed via custom REST API
 * - Integrated into this service
 */

import type { PropertySearchResult, PropertyData } from '../adaCountyAssessor';

// Known Canyon County cities with common misspellings
const CITY_MAPPINGS: Record<string, string> = {
  'NAMPA': 'NAMPA',
  'CALDWELL': 'CALDWELL',
  'CALDWEL': 'CALDWELL', // Common misspelling
  'MIDDLETON': 'MIDDLETON',
  'MIDLETON': 'MIDDLETON', // Common misspelling
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
 * Extract city from address string
 */
function extractCityFromAddress(address: string): string | null {
  const addressUpper = address.trim().toUpperCase();
  
  // Known Canyon County cities (sorted by length descending)
  const CANYON_CITIES = Object.values(CITY_MAPPINGS)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b.length - a.length);
  
  // Try to find city name in the address
  for (const city of CANYON_CITIES) {
    const searchPattern = ` ${city}`;
    const lastIndex = addressUpper.lastIndexOf(searchPattern);
    
    if (lastIndex !== -1) {
      const afterCity = addressUpper.substring(lastIndex + searchPattern.length).trim();
      
      // City should be followed by nothing, "ID", "IDAHO", or ZIP code
      if (
        afterCity === '' || 
        afterCity === 'ID' || 
        afterCity === 'IDAHO' || 
        /^ID\s/.test(afterCity) || 
        /^IDAHO\s/.test(afterCity) ||
        /^\d{5}(-\d{4})?$/.test(afterCity) ||
        /^ID\s+\d{5}(-\d{4})?$/.test(afterCity) ||
        /^IDAHO\s+\d{5}(-\d{4})?$/.test(afterCity)
      ) {
        return city;
      }
    }
  }
  
  // Check for comma-separated format
  if (addressUpper.includes(',')) {
    const parts = addressUpper.split(',').map(p => p.trim());
    if (parts.length > 1) {
      const cityPart = parts[1].replace(/\s+(ID|IDAHO|,.*)/g, '').trim();
      return normalizeCity(cityPart);
    }
  }
  
  return null;
}

/**
 * Search for properties by address in Canyon County
 * 
 * Currently returns a helpful error message explaining that Canyon County
 * data is not available via API and manual entry is required.
 */
export async function searchCanyonCountyProperties(
  address: string,
  cityContext?: string
): Promise<PropertySearchResult> {
  console.log('[CanyonCountyAssessor] Search requested:', { address, cityContext });
  
  // Extract city from address or use cityContext
  const cityFromAddress = extractCityFromAddress(address);
  const normalizedCity = normalizeCity(cityFromAddress || cityContext || '');
  
  // Verify this is actually a Canyon County city
  const canyonCities = ['NAMPA', 'CALDWELL', 'MIDDLETON'];
  const isCanyonCity = normalizedCity && canyonCities.includes(normalizedCity);
  
  console.log('[CanyonCountyAssessor] Detected city:', normalizedCity, 'Is Canyon County:', isCanyonCity);
  
  if (isCanyonCity) {
    // This is a Canyon County city - return helpful error
    return {
      success: false,
      properties: [],
      error: `Canyon County property data is not yet available through automatic lookup.`,
      suggestion: `Canyon County (${normalizedCity}) addresses require manual measurement entry. Please use the "Edit Measurements" option to enter your property dimensions, or use the map measurement tool.`
    };
  } else {
    // Not a recognized Canyon County city - return generic error
    return {
      success: false,
      properties: [],
      error: 'Property not found in Canyon County.',
      suggestion: normalizedCity 
        ? `${normalizedCity} may not be in Canyon County. Canyon County includes: Nampa, Caldwell, and Middleton.`
        : 'Canyon County includes: Nampa, Caldwell, and Middleton. Please include the city name in your address.'
    };
  }
}

/**
 * Backward-compatible search function that returns single property
 * @deprecated Use searchCanyonCountyProperties instead
 */
export async function searchCanyonCountyProperty(
  address: string,
  cityContext?: string
): Promise<PropertyData | null> {
  const result = await searchCanyonCountyProperties(address, cityContext);
  return result.success && result.properties.length > 0 ? result.properties[0] : null;
}
