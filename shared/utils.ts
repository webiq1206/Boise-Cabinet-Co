/**
 * Shared utility functions for quote calculations and formatting
 */

/**
 * Rounds a quote value UP to the nearest $5 or $0
 * Per requirements: ALL estimates must end in $0 or $5 and round UP
 * 
 * @param value - The quote value to round
 * @returns The rounded value (always ends in 0 or 5)
 * 
 * @example
 * roundUpToNearest5(123) => 125
 * roundUpToNearest5(120) => 120
 * roundUpToNearest5(0) => 0
 * roundUpToNearest5(127.5) => 130
 */
export function roundUpToNearest5(value: number): number {
  if (!value || value <= 0 || isNaN(value)) {
    return 0;
  }
  
  // Round up to nearest 5
  return Math.ceil(value / 5) * 5;
}

/**
 * Safely parses and formats a quote value, ensuring it meets rounding requirements
 * 
 * @param value - String or number to parse and format
 * @returns Rounded numeric value or 0 if invalid
 */
export function parseAndRoundQuote(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue < 0) {
    return 0;
  }
  
  return roundUpToNearest5(numValue);
}

/**
 * Formats a quote value for display with proper rounding and thousands separator
 * 
 * @param value - The value to format
 * @param showPending - If true, returns "Pending" for zero/invalid values
 * @returns Formatted string (e.g., "1,250" or "Pending")
 */
export function formatQuoteForDisplay(
  value: string | number | null | undefined, 
  showPending: boolean = false
): string {
  const rounded = parseAndRoundQuote(value);
  
  if (rounded === 0 && showPending) {
    return 'Pending';
  }
  
  return rounded.toLocaleString();
}

/**
 * Email-friendly LineItem interface
 */
export interface EmailLineItem {
  service: string;
  description: string;
  price: number;
}

/**
 * Normalizes line items for email templates
 * Transforms from internal format to email-friendly format with proper service names and rounded prices
 * 
 * @param lineItems - Raw line items from pricing calculation
 * @param serviceRatesMap - Map of service IDs to service names (from SERVICE_RATES)
 * @param servicesDataMap - Map of service slugs to service data (from PRIORITY_SERVICES)
 * @returns Normalized line items ready for email templates
 */
export function normalizeLineItemsForEmail(
  lineItems: any[],
  serviceRatesMap: Record<string, string>,
  servicesDataMap: Record<string, { name: string; shortDescription: string }>
): EmailLineItem[] {
  if (!lineItems || !Array.isArray(lineItems)) {
    return [];
  }

  return lineItems.map((item) => {
    const serviceId = item.service || item.serviceId;
    
    // Get service name from SERVICE_RATES map
    const serviceName = serviceRatesMap[serviceId] || serviceId;
    
    // Get service description from PRIORITY_SERVICES map
    const serviceData = servicesDataMap[serviceId];
    const description = serviceData?.shortDescription || item.description || '';
    
    // Round the price up to nearest $5
    const price = roundUpToNearest5(
      typeof item.adjustedPrice === 'number' 
        ? item.adjustedPrice 
        : parseFloat(item.adjustedPrice || item.price || 0)
    );

    return {
      service: serviceName,
      description: description,
      price: price
    };
  });
}
