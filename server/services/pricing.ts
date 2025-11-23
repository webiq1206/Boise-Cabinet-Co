import OpenAI from "openai";

// Initialize OpenAI with Replit AI Integrations
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY!,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL!,
});

/**
 * Round price UP to nearest $5 or $0
 * Examples: $147 → $150, $143 → $145, $152 → $155, $198 → $200
 */
function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

// Service pricing rates (base costs for subcontractors + overhead)
// Updated 2025-11-23: Adjusted rates to match Idaho market research
export const SERVICE_RATES = {
  // Lawn Care (per sq ft per visit)
  "lawn-mowing": { baseRate: 0.015, name: "Lawn Mowing", unit: "sqft" as const }, // Updated: $0.012 → $0.015 (Boise market: $0.015-0.020/sq ft)
  "lawn-maintenance": { baseRate: 0.015, name: "Full Lawn Maintenance", unit: "sqft" as const },
  "aeration": { baseRate: 0.018, name: "Core Aeration", unit: "sqft" as const },
  "fertilization": { baseRate: 0.014, name: "Fertilization Treatment", unit: "sqft" as const },
  "weed-control": { baseRate: 0.013, name: "Weed Control", unit: "sqft" as const },
  "hedge-trimming": { baseRate: 2.00, name: "Hedge Trimming", unit: "linear_ft" as const }, // Updated: $0.010/sqft → $2.00/linear_ft (Idaho market: $2-4/linear ft)
  "seasonal-cleanup": { baseRate: 0.016, name: "Seasonal Cleanup", unit: "sqft" as const },
  "sprinkler-blowout": { baseRate: 0.008, name: "Sprinkler Winterization", unit: "sqft" as const },
  "dethatching": { baseRate: 0.017, name: "Dethatching", unit: "sqft" as const },
  
  // Landscaping (per sq ft - one-time projects)
  "patio": { baseRate: 35.00, name: "Patio Installation", unit: "project" as const },
  "retaining-walls": { baseRate: 40.00, name: "Retaining Wall", unit: "linear_ft" as const },
  "sod-installation": { baseRate: 1.20, name: "Sod Installation", unit: "sqft" as const },
  "fence": { baseRate: 25.00, name: "Fence Installation", unit: "linear_ft" as const }, // Verified: Within Idaho market range ($20-30/linear ft)
  "pond": { baseRate: 5000.00, name: "Pond Installation", unit: "project" as const },
  "christmas-lights": { baseRate: 3.50, name: "Christmas Light Installation", unit: "linear_ft" as const }, // Verified: Within Idaho market range ($3-5/linear ft)
};

// Property type multipliers
export const PROPERTY_MULTIPLIERS = {
  residential: 1.0,
  commercial: 1.3,
  hoa: 1.2,
  "property-management": 1.25,
};

// Frequency discounts (for recurring services)
export const FREQUENCY_DISCOUNTS = {
  "one-time": 0,
  weekly: 0.15,      // 15% discount
  "bi-weekly": 0.10,  // 10% discount
  monthly: 0.05,      // 5% discount
};

// Profit margin (40-50% markup on costs)
export const PROFIT_MARGIN = 0.45; // 45% markup

interface PropertyDetails {
  address: string;
  city: string;
  propertySize: number; // sq ft
  propertyType: string;
  serviceType: string;
  frequency?: string;
  selectedServices?: string[];
}

interface AIAnalysis {
  terrainDifficulty: "flat" | "sloped" | "steep";
  obstacles: string[];
  grassCondition: "well-maintained" | "overgrown" | "moderate";
  accessibility: "easy" | "moderate" | "difficult";
  estimatedTimeMultiplier: number; // 1.0 - 2.0
  complexityScore: number; // 1.0 - 2.0
  reasoning: string;
}

interface LineItem {
  service: string;
  description: string;
  basePrice: number;
  adjustedPrice: number;
}

interface QuoteResult {
  baseCost: number;
  adjustedCost: number;
  finalQuote: number;
  lineItems: LineItem[];
  aiAnalysis: AIAnalysis;
  complexityScore: number;
  breakdown: {
    laborCost: number;
    materialsCost: number;
    overhead: number;
    profit: number;
  };
}

/**
 * Analyze property using AI to assess complexity factors
 */
export async function analyzePropertyComplexity(
  address: string,
  city: string,
  propertySize: number,
  serviceType: string
): Promise<AIAnalysis> {
  try {
    const prompt = `You are an expert lawn care and landscaping estimator. Analyze this property for service complexity:

Address: ${address}, ${city}, Idaho
Property Size: ${propertySize.toLocaleString()} sq ft
Service Requested: ${serviceType}

Based on typical properties in ${city}, Idaho (Treasure Valley region), assess:
1. Terrain difficulty (flat/sloped/steep)
2. Likely obstacles (trees, flower beds, slopes, fences, tight spaces)
3. Grass/lawn condition estimate
4. Accessibility for equipment
5. Time multiplier (1.0 for standard, up to 2.0 for very complex)

Respond in JSON format:
{
  "terrainDifficulty": "flat|sloped|steep",
  "obstacles": ["obstacle1", "obstacle2"],
  "grassCondition": "well-maintained|moderate|overgrown",
  "accessibility": "easy|moderate|difficult",
  "estimatedTimeMultiplier": 1.0-2.0,
  "complexityScore": 1.0-2.0,
  "reasoning": "brief explanation"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}") as AIAnalysis;
    
    // Ensure complexity score is within bounds
    analysis.complexityScore = Math.max(1.0, Math.min(2.0, analysis.complexityScore || 1.2));
    
    return analysis;
  } catch (error) {
    console.error("AI analysis error:", error);
    // Fallback to moderate complexity
    return {
      terrainDifficulty: "flat",
      obstacles: ["standard residential features"],
      grassCondition: "moderate",
      accessibility: "easy",
      estimatedTimeMultiplier: 1.2,
      complexityScore: 1.2,
      reasoning: "Using standard complexity estimate",
    };
  }
}

/**
 * Calculate detailed quote with AI-powered pricing
 */
export async function calculateIntelligentQuote(
  details: PropertyDetails
): Promise<QuoteResult> {
  const {
    address,
    city,
    propertySize,
    propertyType,
    serviceType,
    frequency = "one-time",
    selectedServices = [],
  } = details;

  // Step 1: Get AI analysis of property complexity
  const aiAnalysis = await analyzePropertyComplexity(address, city, propertySize, serviceType);

  // Step 2: Calculate base costs for each service
  const lineItems: LineItem[] = [];
  let baseCost = 0;

  // Main service
  const mainService = SERVICE_RATES[serviceType as keyof typeof SERVICE_RATES];
  if (mainService) {
    const serviceBase = mainService.unit === "project" 
      ? mainService.baseRate 
      : propertySize * mainService.baseRate;
    
    baseCost += serviceBase;
    lineItems.push({
      service: serviceType,
      description: mainService.name,
      basePrice: serviceBase,
      adjustedPrice: serviceBase,
    });
  }

  // Add-on services
  for (const service of selectedServices) {
    const serviceRate = SERVICE_RATES[service as keyof typeof SERVICE_RATES];
    if (serviceRate) {
      const serviceBase = serviceRate.unit === "project"
        ? serviceRate.baseRate
        : propertySize * serviceRate.baseRate;
      
      baseCost += serviceBase;
      lineItems.push({
        service,
        description: serviceRate.name,
        basePrice: serviceBase,
        adjustedPrice: serviceBase,
      });
    }
  }

  // Step 3: Apply property type multiplier
  const propertyMultiplier = PROPERTY_MULTIPLIERS[propertyType as keyof typeof PROPERTY_MULTIPLIERS] || 1.0;
  baseCost *= propertyMultiplier;

  // Step 4: Apply complexity adjustments (AI-driven)
  const adjustedCost = baseCost * aiAnalysis.complexityScore;
  
  // Update line items with adjusted prices
  lineItems.forEach(item => {
    item.adjustedPrice = roundToNearestFive(item.basePrice * propertyMultiplier * aiAnalysis.complexityScore);
  });

  // Step 5: Apply frequency discount
  const discount = FREQUENCY_DISCOUNTS[frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;
  const afterDiscount = adjustedCost * (1 - discount);

  // Step 6: Add profit margin (40-50% markup)
  const finalQuote = afterDiscount * (1 + PROFIT_MARGIN);

  // Step 7: Calculate breakdown
  const laborCost = afterDiscount * 0.35; // 35% labor
  const materialsCost = afterDiscount * 0.15; // 15% materials
  const overhead = afterDiscount * 0.20; // 20% overhead
  const profit = finalQuote - afterDiscount;

  return {
    baseCost: roundToNearestFive(baseCost),
    adjustedCost: roundToNearestFive(adjustedCost),
    finalQuote: roundToNearestFive(finalQuote),
    lineItems,
    aiAnalysis,
    complexityScore: aiAnalysis.complexityScore,
    breakdown: {
      laborCost: roundToNearestFive(laborCost),
      materialsCost: roundToNearestFive(materialsCost),
      overhead: roundToNearestFive(overhead),
      profit: roundToNearestFive(profit),
    },
  };
}

/**
 * Enhanced service rates with measurement-based pricing
 */
const SERVICE_PRICING_CONFIG = {
  // Lawn services (property size based)
  "lawn-mowing": { rate: 0.012, unit: "sqft", name: "Lawn Mowing & Edging" },
  "aeration": { rate: 0.018, unit: "sqft", name: "Core Aeration" },
  "fertilization": { rate: 0.014, unit: "sqft", name: "Fertilization Treatment" },
  "weed-control": { rate: 0.013, unit: "sqft", name: "Weed Control" },
  "overseeding": { rate: 0.016, unit: "sqft", name: "Overseeding" },
  "dethatching": { rate: 0.017, unit: "sqft", name: "Dethatching" },
  "sod-installation": { rate: 1.20, unit: "sqft", name: "Sod Installation" },
  "lawn-renovation": { rate: 0.025, unit: "sqft", name: "Lawn Renovation" },
  "lawn-edging": { rate: 1.50, unit: "linear_ft", name: "Lawn Edging" },
  
  // Christmas lights & landscape lighting (linear feet)
  "christmas-light-installation": { rate: 3.50, unit: "linear_ft", name: "Christmas Light Installation" },
  "landscape-lighting": { rate: 75.00, unit: "per_fixture", name: "Landscape Lighting" },
  
  // Irrigation (zone-based or property size)
  "sprinkler-blowout": { rate: 45.00, unit: "per_zone", name: "Sprinkler Winterization" },
  "sprinkler-repair": { rate: 85.00, unit: "base_service", name: "Sprinkler Repair" },
  "sprinkler-system-installation": { rate: 0.50, unit: "sqft", name: "Sprinkler System Installation" },
  "irrigation-repair": { rate: 85.00, unit: "base_service", name: "Irrigation Repair" },
  "irrigation-maintenance": { rate: 50.00, unit: "per_zone", name: "Irrigation Maintenance" },
  
  // Hardscape (dimensions-based or project)
  "patio-installation": { rate: 35.00, unit: "per_sqft", name: "Patio Installation" },
  "retaining-walls": { rate: 40.00, unit: "linear_ft", name: "Retaining Wall Installation" },
  "fire-pit-installation": { rate: 1500.00, unit: "base_project", name: "Fire Pit Installation" },
  
  // Tree services (per tree)
  "tree-removal": { rate: 500.00, unit: "per_tree", name: "Tree Removal" },
  "tree-trimming": { rate: 250.00, unit: "per_tree", name: "Tree Trimming & Pruning" },
  "stump-grinding": { rate: 150.00, unit: "per_stump", name: "Stump Grinding" },
  
  // Hedge & seasonal (linear feet or property size)
  "hedge-trimming": { rate: 2.00, unit: "linear_ft", name: "Hedge & Shrub Trimming" },
  "spring-cleanup": { rate: 0.016, unit: "sqft", name: "Spring Cleanup" },
  "fall-cleanup": { rate: 0.016, unit: "sqft", name: "Fall Cleanup" },
  "seasonal-cleanup": { rate: 0.016, unit: "sqft", name: "Seasonal Cleanup" },
  "mulch-installation": { rate: 0.45, unit: "sqft", name: "Mulch Installation" },
};

interface ServiceSpecificData {
  [serviceId: string]: {
    propertySize?: number;
    linearFeet?: number;
    zones?: number;
    dimensions?: string;
    material?: string;
    treeCount?: number;
    treeSize?: string;
    quantity?: number;
    height?: number;
    [key: string]: any;
  };
}

interface MultiServiceQuoteData {
  selectedServices: string[];
  serviceData: ServiceSpecificData;
  propertyType?: string;
  city?: string;
  address?: string;
}

/**
 * Calculate itemized quote for multiple services with service-specific measurements
 */
export async function calculateMultiServiceQuote(
  data: MultiServiceQuoteData
): Promise<{
  lineItems: QuoteLineItem[];
  subtotal: number;
  total: number;
  aiAnalysis?: AIAnalysis;
}> {
  const {
    selectedServices,
    serviceData,
    propertyType = "residential",
    city = "Kuna",
    address = ""
  } = data;

  const lineItems: QuoteLineItem[] = [];
  let subtotal = 0;

  // Calculate price for each service based on its specific measurements
  for (const serviceId of selectedServices) {
    const config = SERVICE_PRICING_CONFIG[serviceId as keyof typeof SERVICE_PRICING_CONFIG];
    if (!config) {
      console.warn(`No pricing config found for service: ${serviceId}`);
      continue;
    }

    // Get service-specific measurements from serviceData
    const measurements = serviceData[serviceId] || {};
    let basePrice = 0;
    let description = config.name;

    // Helper to get valid number or default
    const getNumber = (value: any, defaultVal: number): number => {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return value;
      }
      return defaultVal;
    };

    // Calculate base price based on measurement unit
    switch (config.unit) {
      case "sqft":
        // Property size from this service's measurements
        const sqft = getNumber(measurements.propertySize, 5000);
        basePrice = sqft * config.rate;
        description += ` (${sqft.toLocaleString()} sq ft)`;
        break;

      case "linear_ft":
        // Linear feet from this service's measurements
        const linearFt = getNumber(measurements.linearFeet, 100);
        basePrice = linearFt * config.rate;
        
        // Add service-specific calculation context
        if (serviceId === 'hedge-trimming') {
          description += ` (${linearFt} linear feet, estimated as 40% of lot perimeter)`;
        } else if (serviceId === 'christmas-light-installation') {
          description += ` (${linearFt} linear feet, roofline with overhang)`;
        } else if (serviceId === 'fence-installation') {
          description += ` (${linearFt} linear feet, lot perimeter)`;
        } else if (serviceId === 'lawn-edging') {
          description += ` (${linearFt} linear feet, lawn perimeter)`;
        } else {
          description += ` (${linearFt} linear feet)`;
        }
        break;

      case "per_zone":
        // Number of zones from this service's measurements
        const zones = getNumber(measurements.zones, 6);
        basePrice = zones * config.rate;
        description += ` (${zones} zones)`;
        break;

      case "per_tree":
        const trees = getNumber(measurements.treeCount, 1);
        const sizeMultiplier = getSizeMultiplier(measurements.treeSize);
        basePrice = trees * config.rate * sizeMultiplier;
        description += ` (${trees} tree${trees > 1 ? 's' : ''})`;
        break;

      case "per_fixture":
        const fixtures = getNumber(measurements.quantity, 10);
        basePrice = fixtures * config.rate;
        description += ` (${fixtures} fixtures)`;
        break;

      case "per_stump":
        const stumps = getNumber(measurements.quantity, 1);
        basePrice = stumps * config.rate;
        description += ` (${stumps} stump${stumps > 1 ? 's' : ''})`;
        break;

      case "per_sqft":
        // For patio/hardscape - parse dimensions from this service's measurements
        const dims = parseDimensions(measurements.dimensions);
        basePrice = dims * config.rate;
        description += ` (${dims} sq ft)`;
        break;

      case "base_service":
        basePrice = config.rate;
        break;

      case "base_project":
        basePrice = config.rate;
        break;

      default:
        console.warn(`Unknown unit type for service ${serviceId}: ${config.unit}`);
        basePrice = config.rate;
    }

    // Apply property type multiplier
    const propertyMultiplier = PROPERTY_MULTIPLIERS[propertyType as keyof typeof PROPERTY_MULTIPLIERS] || 1.0;
    const adjustedPrice = basePrice * propertyMultiplier;

    lineItems.push({
      serviceId,
      serviceName: config.name,
      basePrice: roundToNearestFive(basePrice),
      adjustedPrice: roundToNearestFive(adjustedPrice),
      description,
    });

    subtotal += adjustedPrice;
  }

  // Add profit margin to get final total
  const total = subtotal * (1 + PROFIT_MARGIN);

  return {
    lineItems,
    subtotal: roundToNearestFive(subtotal),
    total: roundToNearestFive(total),
  };
}

// Helper functions
function getSizeMultiplier(size?: string): number {
  if (!size) return 1.0;
  if (size.includes("Small")) return 0.7;
  if (size.includes("Medium")) return 1.0;
  if (size.includes("Large")) return 1.5;
  if (size.includes("Very Large")) return 2.0;
  return 1.0;
}

function parseDimensions(dims?: string): number {
  if (!dims) return 300; // Default patio size
  
  // Try to parse "20x15" or "300" format
  const match = dims.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (match) {
    return parseInt(match[1]) * parseInt(match[2]);
  }
  
  const num = parseInt(dims);
  return isNaN(num) ? 300 : num;
}

interface QuoteLineItem {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  adjustedPrice: number;
  description: string;
}

/**
 * Get instant price estimate (simpler, faster)
 */
export function getInstantEstimate(
  propertySize: number,
  serviceType: string,
  propertyType: string = "residential",
  frequency: string = "one-time"
): { min: number; max: number } {
  const service = SERVICE_RATES[serviceType as keyof typeof SERVICE_RATES];
  if (!service || service.unit === "project") {
    return { min: 100, max: 500 };
  }

  const basePrice = propertySize * service.baseRate;
  const propertyMultiplier = PROPERTY_MULTIPLIERS[propertyType as keyof typeof PROPERTY_MULTIPLIERS] || 1.0;
  const discount = FREQUENCY_DISCOUNTS[frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;

  // Estimate with complexity range (1.0 - 1.5)
  const minComplexity = 1.0;
  const maxComplexity = 1.5;

  const minPrice = basePrice * propertyMultiplier * minComplexity * (1 - discount) * (1 + PROFIT_MARGIN);
  const maxPrice = basePrice * propertyMultiplier * maxComplexity * (1 - discount) * (1 + PROFIT_MARGIN);

  return {
    min: roundToNearestFive(minPrice),
    max: roundToNearestFive(maxPrice),
  };
}
