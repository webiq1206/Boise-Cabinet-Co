/**
 * Multi-County Assessor Abstraction Layer
 * Routes property searches to appropriate county assessor services
 */

import { searchAdaCountyProperties } from './adaCountyAssessor';
import { searchCanyonCountyProperties } from './canyonCountyAssessor';
import type { PropertySearchResult } from './adaCountyAssessor';

export type County = 'ada' | 'canyon';

export interface AssessorQueryParams {
  county: County;
  address: string;
  cityContext?: string;
  enableFallback?: boolean; // Try other county if primary fails
}

/**
 * Query property data from county assessor with intelligent fallback
 * 
 * @param county - Primary county to search ('ada' or 'canyon')
 * @param address - Property address to search
 * @param cityContext - Optional city context from form (e.g., "Kuna", "Nampa")
 * @param enableFallback - If true, tries other county if primary county returns no results
 * 
 * @returns PropertySearchResult with properties or error message
 */
export async function queryAssessor({
  county,
  address,
  cityContext,
  enableFallback = true,
}: AssessorQueryParams): Promise<PropertySearchResult> {
  console.log('[AssessorRouter] Querying:', { county, address, cityContext, enableFallback });

  // Try primary county first
  let result = await queryCounty(county, address, cityContext);

  // If no results and fallback enabled, try the other county
  if (enableFallback && !result.success && result.properties.length === 0) {
    const fallbackCounty: County = county === 'ada' ? 'canyon' : 'ada';
    console.log('[AssessorRouter] Primary county failed, trying fallback:', fallbackCounty);
    
    const fallbackResult = await queryCounty(fallbackCounty, address, cityContext);
    
    if (fallbackResult.success && fallbackResult.properties.length > 0) {
      // Fallback succeeded - return fallback results
      console.log('[AssessorRouter] Fallback succeeded with', fallbackResult.properties.length, 'properties');
      return fallbackResult;
    }
    
    // Both failed - return original error with enhanced messaging
    console.log('[AssessorRouter] Both counties failed');
    return {
      ...result,
      suggestion: result.suggestion || 
        `Property not found in ${formatCountyName(county)}${
          fallbackCounty ? ` or ${formatCountyName(fallbackCounty)}` : ''
        }. Please check the address or enter measurements manually.`
    };
  }

  return result;
}

/**
 * Query a specific county assessor
 */
async function queryCounty(
  county: County,
  address: string,
  cityContext?: string
): Promise<PropertySearchResult> {
  switch (county) {
    case 'ada':
      return searchAdaCountyProperties(address, cityContext);
    case 'canyon':
      return searchCanyonCountyProperties(address, cityContext);
    default:
      return {
        success: false,
        properties: [],
        error: `Unsupported county: ${county}`,
      };
  }
}

/**
 * Format county name for display
 */
function formatCountyName(county: County): string {
  return county === 'ada' ? 'Ada County' : 'Canyon County';
}

/**
 * Determine county from city name
 * Uses the CITIES data from contentData.ts
 */
export function getCountyFromCity(cityName?: string): County {
  if (!cityName) return 'ada'; // Default to Ada County
  
  const upperCity = cityName.toUpperCase().trim();
  
  // Ada County cities
  const adaCities = ['KUNA', 'BOISE', 'MERIDIAN', 'EAGLE', 'STAR', 'GARDEN CITY', 'HIDDEN SPRINGS'];
  if (adaCities.some(city => upperCity.includes(city) || city.includes(upperCity))) {
    return 'ada';
  }
  
  // Canyon County cities
  const canyonCities = ['NAMPA', 'CALDWELL', 'MIDDLETON'];
  if (canyonCities.some(city => upperCity.includes(city) || city.includes(upperCity))) {
    return 'canyon';
  }
  
  // Default to Ada County if city not recognized
  return 'ada';
}

// Re-export types for convenience
export type { PropertyData, PropertySearchResult } from './adaCountyAssessor';
