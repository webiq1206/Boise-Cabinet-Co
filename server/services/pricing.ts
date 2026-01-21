import OpenAI from "openai";
import { calculateQuoteRange } from "@shared/utils";

let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  if (openaiClient) return openaiClient;

  // Prefer Replit AI Integrations keys, fall back to standard OpenAI key if present
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (!apiKey) return null;

  openaiClient = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
  return openaiClient;
}

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
  // Note: single-service pricing uses SERVICE_PRICING_CONFIG + models below. These legacy rates remain for reference.
  "lawn-mowing": { baseRate: 0.003, name: "Lawn Mowing", unit: "sqft" as const },
  "lawn-maintenance": { baseRate: 0.015, name: "Full Lawn Maintenance", unit: "sqft" as const },
  "aeration": { baseRate: 0.018, name: "Core Aeration", unit: "sqft" as const },
  "fertilization": { baseRate: 0.014, name: "Fertilization Treatment", unit: "sqft" as const },
  "weed-control": { baseRate: 0.013, name: "Weed Control", unit: "sqft" as const },
  "hedge-trimming": { baseRate: 2.00, name: "Hedge Trimming", unit: "linear_ft" as const }, // Updated: $0.010/sqft → $2.00/linear_ft (Idaho market: $2-4/linear ft)
  "seasonal-cleanup": { baseRate: 0.016, name: "Seasonal Cleanup", unit: "sqft" as const },
  "sprinkler-blowout": { baseRate: 0.0, name: "Sprinkler Winterization", unit: "project" as const },
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

// Gross margin (profit margin on revenue).
// If cost is C and gross margin is M, then price = C / (1 - M).
export const GROSS_MARGIN = 0.45;

// Backward-compatible alias (treat as gross margin).
export const PROFIT_MARGIN = GROSS_MARGIN;

function applyGrossMargin(cost: number): number {
  if (!Number.isFinite(cost) || cost <= 0) return 0;
  return cost / (1 - GROSS_MARGIN);
}

// Boise/Treasure Valley pricing model parameters
const MOWING_RATE_PER_SQFT = 0.003;
const BLOWOUT_BASE_UP_TO_ZONES = 65;
const BLOWOUT_INCLUDED_ZONES = 6;
const BLOWOUT_PER_EXTRA_ZONE = 5;

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
  finalQuoteMin: number;
  finalQuoteMax: number;
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
    const openai = getOpenAIClient();
    if (!openai) {
      // AI not configured - use deterministic fallback
      return {
        terrainDifficulty: "flat",
        obstacles: ["standard residential features"],
        grassCondition: "moderate",
        accessibility: "easy",
        estimatedTimeMultiplier: 1.2,
        complexityScore: 1.2,
        reasoning: "Using standard complexity estimate (AI not configured)",
      };
    }

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

  const calculateServiceBaseCost = (serviceId: string): { cost: number; description: string } => {
    // Prefer unified pricing config
    const cfg = SERVICE_PRICING_CONFIG[serviceId as keyof typeof SERVICE_PRICING_CONFIG] as any;
    const name = cfg?.name || SERVICE_RATES[serviceId as keyof typeof SERVICE_RATES]?.name || serviceId;

    // Default assumptions for single-service path
    const sqft = propertySize;
    const estimatedLinearFt = Math.round(Math.sqrt(Math.max(1, sqft)) * 4 * 0.6); // typical perimeter proxy
    const defaultZones = 6;
    const defaultTreeCount = 1;
    const defaultFixtures = 10;

    // Use typical rate (midpoint) for calculations
    const typicalRate = cfg ? (cfg.lowRate + cfg.highRate) / 2 : 0;
    const minimum = cfg?.minimum || 0;

    // Generic model based on unit
    if (cfg) {
      let cost = 0;
      switch (cfg.unit) {
        case "sqft": {
          cost = Math.max(minimum, sqft * typicalRate);
          return { cost, description: `${name} (${sqft.toLocaleString()} sq ft)` };
        }
        case "linear_ft": {
          cost = Math.max(minimum, estimatedLinearFt * typicalRate);
          return { cost, description: `${name} (${estimatedLinearFt} linear feet)` };
        }
        case "per_zone": {
          const includedZones = cfg.includedZones || 5;
          const extraZones = Math.max(0, defaultZones - includedZones);
          const baseCost = (includedZones * typicalRate) + (extraZones * typicalRate);
          cost = Math.max(minimum, baseCost);
          return { cost, description: `${name} (${defaultZones} zones)` };
        }
        case "per_tree": {
          cost = Math.max(minimum, defaultTreeCount * typicalRate);
          return { cost, description: `${name} (${defaultTreeCount} tree)` };
        }
        case "per_inch": {
          const defaultDiameter = 12;
          cost = Math.max(minimum, defaultDiameter * typicalRate);
          return { cost, description: `${name} (${defaultDiameter}" diameter)` };
        }
        case "per_shrub": {
          const defaultShrubs = 5;
          cost = Math.max(minimum, defaultShrubs * typicalRate);
          return { cost, description: `${name} (${defaultShrubs} shrubs)` };
        }
        case "per_fixture": {
          cost = Math.max(minimum, defaultFixtures * typicalRate);
          return { cost, description: `${name} (${defaultFixtures} fixtures)` };
        }
        case "per_cubic_yard": {
          const defaultCubicYards = 3;
          cost = Math.max(minimum, defaultCubicYards * typicalRate);
          return { cost, description: `${name} (${defaultCubicYards} cubic yards)` };
        }
        case "base_service":
        case "base_project": {
          cost = Math.max(minimum, typicalRate);
          return { cost, description: name };
        }
        case "per_sqft": {
          // For hardscape like patios, use smaller default area
          const hardscapeArea = 100;
          cost = Math.max(minimum, hardscapeArea * typicalRate);
          return { cost, description: `${name} (${hardscapeArea} sq ft)` };
        }
      }
    }

    // Fallback to legacy SERVICE_RATES
    const legacy = SERVICE_RATES[serviceId as keyof typeof SERVICE_RATES];
    if (legacy) {
      const cost = legacy.unit === "project" ? legacy.baseRate : sqft * legacy.baseRate;
      return { cost, description: legacy.name };
    }

    return { cost: 0, description: name };
  };

  // Main service
  {
    const { cost, description } = calculateServiceBaseCost(serviceType);
    baseCost += cost;
    lineItems.push({
      service: serviceType,
      description,
      basePrice: cost,
      adjustedPrice: cost,
    });
  }

  // Add-on services
  for (const service of selectedServices) {
    const { cost, description } = calculateServiceBaseCost(service);
    baseCost += cost;
    lineItems.push({
      service,
      description,
      basePrice: cost,
      adjustedPrice: cost,
    });
  }

  // Step 3: Apply property type multiplier
  const propertyMultiplier = PROPERTY_MULTIPLIERS[propertyType as keyof typeof PROPERTY_MULTIPLIERS] || 1.0;
  baseCost *= propertyMultiplier;

  // Step 4: Apply complexity adjustments (AI-driven)
  const adjustedCost = baseCost * aiAnalysis.complexityScore;

  // Step 5: Apply frequency discount
  const discount = FREQUENCY_DISCOUNTS[frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;
  const afterDiscount = adjustedCost * (1 - discount);

  // Step 6: Apply gross margin and round line items consistently
  lineItems.forEach((item) => {
    const itemAfterProperty = item.basePrice * propertyMultiplier;
    const itemAfterComplexity = itemAfterProperty * aiAnalysis.complexityScore;
    const itemAfterDiscount = itemAfterComplexity * (1 - discount);
    item.adjustedPrice = roundToNearestFive(applyGrossMargin(itemAfterDiscount));
  });

  // Ensure total matches itemized prices (sum of rounded line items)
  const finalQuote = lineItems.reduce((sum, item) => sum + item.adjustedPrice, 0);
  const rangePct = Math.max(0.1, Math.min(0.2, 0.1 + (aiAnalysis.complexityScore - 1) * 0.1));
  const { min: finalQuoteMin, max: finalQuoteMax } = calculateQuoteRange(finalQuote, rangePct);

  // Step 7: Calculate breakdown
  const laborCost = afterDiscount * 0.35; // 35% labor
  const materialsCost = afterDiscount * 0.15; // 15% materials
  const overhead = afterDiscount * 0.20; // 20% overhead
  const profit = finalQuote - afterDiscount;

  return {
    baseCost: roundToNearestFive(baseCost),
    adjustedCost: roundToNearestFive(adjustedCost),
    finalQuote,
    finalQuoteMin,
    finalQuoteMax,
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
 * Exported for use in email templates to display rate per unit
 * Rates are from the official pricing calculator spreadsheet
 * All rates use lowRate/highRate for price ranges, with minimum pricing
 */
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
  propertySize?: number; // optional fallback sqft (shared measurement)
  frequency?: string;
}

/**
 * Calculate itemized quote for multiple services with service-specific measurements
 */
export async function calculateMultiServiceQuote(
  data: MultiServiceQuoteData
): Promise<{
  lineItems: QuoteLineItem[];
  baseCost: number;
  adjustedCost: number;
  subtotal: number;
  total: number;
  finalQuote: number;
  finalQuoteMin: number;
  finalQuoteMax: number;
  aiAnalysis: AIAnalysis;
  complexityScore: number;
  breakdown: {
    laborCost: number;
    materialsCost: number;
    overhead: number;
    profit: number;
  };
}> {
  const {
    selectedServices,
    serviceData,
    propertyType = "residential",
    city = "Kuna",
    address = "",
    propertySize: fallbackPropertySize,
    frequency = "one-time",
  } = data;

  const lineItems: QuoteLineItem[] = [];
  let baseCost = 0;      // after property multiplier (pre-complexity)
  let adjustedCost = 0;  // after complexity (pre-discount)
  let subtotal = 0;      // after discount (pre-gross-margin)
  let total = 0;         // final customer price (sum of rounded line items)

  // Derive a representative sqft for AI analysis (best-effort)
  const representativeSqft = (() => {
    const sqftCandidates = selectedServices
      .map((id) => serviceData?.[id]?.propertySize)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
    if (sqftCandidates.length > 0) return Math.max(...sqftCandidates);
    if (typeof fallbackPropertySize === "number" && Number.isFinite(fallbackPropertySize) && fallbackPropertySize > 0) {
      return fallbackPropertySize;
    }
    return 5000;
  })();

  const aiAnalysis = await analyzePropertyComplexity(
    address || `${city}, Idaho`,
    city,
    representativeSqft,
    selectedServices.join(", ")
  );

  const propertyMultiplier =
    PROPERTY_MULTIPLIERS[propertyType as keyof typeof PROPERTY_MULTIPLIERS] || 1.0;
  const frequencyDiscount =
    FREQUENCY_DISCOUNTS[frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;

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

    // Track calculation explanation separately
    let calculationExplanation: string | undefined;

    // Use typical rate (midpoint between low and high) for server-side calculations
    const cfg = config as any;
    const typicalRate = (cfg.lowRate + cfg.highRate) / 2;
    const minimum = cfg.minimum || 0;

    // Calculate base price based on measurement unit
    switch (config.unit) {
      case "sqft":
        // Property size from this service's measurements
        const sqft = getNumber(
          measurements.propertySize,
          typeof fallbackPropertySize === "number" && Number.isFinite(fallbackPropertySize) && fallbackPropertySize > 0
            ? fallbackPropertySize
            : 5000
        );
        basePrice = sqft * typicalRate;
        description += ` (${sqft.toLocaleString()} sq ft)`;
        if (serviceId === "lawn-mowing") {
          calculationExplanation =
            "Lawn mowing is estimated from your lawn area (sq ft) and adjusted for property type, access/complexity, and frequency. Final pricing is confirmed after a quick site assessment.";
        }
        break;

      case "linear_ft":
        // Linear feet from this service's measurements
        const linearFt = getNumber(measurements.linearFeet, 100);
        
        // Apply special pricing for permanent lighting vs traditional Christmas lights
        if (serviceId === 'christmas-light-installation') {
          const isPermanent = measurements.lightingType === 'Permanent Lighting';
          const rate = isPermanent 
            ? ((cfg.permanentLowRate + cfg.permanentHighRate) / 2) 
            : typicalRate;
          basePrice = linearFt * rate;
          description += isPermanent 
            ? ` - Permanent Lighting (${linearFt} linear feet)`
            : ` - Traditional Seasonal (${linearFt} linear feet)`;
          calculationExplanation = isPermanent
            ? `Permanent lighting is a one-time installation with year-round app control. Track lights remain discreetly mounted on your roofline 365 days a year. Control millions of colors, patterns, and schedules from your smartphone for every holiday and event.`
            : `Traditional seasonal Christmas light installation is calculated using your roofline with overhang (roofline + 25% for eaves and overhangs). This ensures adequate coverage for a professional holiday display. Includes installation, mid-season service, and post-holiday removal.`;
        } else {
          basePrice = linearFt * typicalRate;
          description += ` (${linearFt} linear feet)`;
          
          // Add service-specific calculation context
          if (serviceId === 'hedge-trimming') {
            calculationExplanation = `Hedge trimming is estimated as 40% of your lot perimeter. This assumes hedges along the front of the property plus one side, which is typical for most residential properties.`;
          } else if (serviceId === 'fence') {
            calculationExplanation = `Fence installation is calculated using your full lot perimeter. This measurement comes from property records and represents the boundary of your property.`;
          } else if (serviceId === 'lawn-edging') {
            calculationExplanation = `Lawn edging is calculated using your lawn perimeter (approximately 75% of lot perimeter). This accounts for buildings, driveways, and hardscaping that reduce the edgeable lawn area.`;
          }
        }
        break;

      case "per_zone":
        // Number of zones from this service's measurements
        const zones = getNumber(measurements.zones, 6);
        const includedZones = cfg.includedZones || 5;
        const extraZones = Math.max(0, zones - includedZones);
        // Base fee for included zones plus per-extra-zone rate (using typical rate)
        basePrice = (includedZones * typicalRate) + (extraZones * typicalRate);
        description += ` (${zones} zones)`;
        if (serviceId === "sprinkler-blowout") {
          calculationExplanation =
            "Sprinkler winterization pricing is based on the number of irrigation zones in your system.";
        }
        break;

      case "per_tree":
        const trees = getNumber(measurements.treeCount, 1);
        const sizeMultiplier = getSizeMultiplier(measurements.treeSize);
        basePrice = trees * typicalRate * sizeMultiplier;
        description += ` (${trees} tree${trees > 1 ? 's' : ''})`;
        break;

      case "per_inch":
        const stumpDiameter = getNumber(measurements.quantity || measurements.treeCount, 12);
        basePrice = stumpDiameter * typicalRate;
        description += ` (${stumpDiameter}" diameter)`;
        break;

      case "per_shrub":
        const shrubs = getNumber(measurements.quantity || measurements.treeCount, 5);
        basePrice = shrubs * typicalRate;
        description += ` (${shrubs} shrub${shrubs > 1 ? 's' : ''})`;
        break;

      case "per_fixture":
        const fixtures = getNumber(measurements.quantity, 10);
        basePrice = fixtures * typicalRate;
        description += ` (${fixtures} fixtures)`;
        break;

      case "per_cubic_yard":
        const cubicYards = getNumber(measurements.quantity, 3);
        basePrice = cubicYards * typicalRate;
        description += ` (${cubicYards} cubic yards)`;
        break;

      case "per_sqft":
        // For patio/hardscape - parse dimensions from this service's measurements
        const dims = parseDimensions(measurements.dimensions);
        basePrice = dims * typicalRate;
        description += ` (${dims} sq ft)`;
        break;

      case "base_service":
      case "base_project":
        basePrice = typicalRate;
        break;

      default:
        console.warn(`Unknown unit type for service ${serviceId}: ${config.unit}`);
        basePrice = typicalRate;
    }

    // Enforce minimum pricing before any multipliers
    basePrice = Math.max(basePrice, minimum);

    // Apply discount only to services that are eligible to be recurring
    const serviceDiscount = isRecurringEligible(serviceId) ? frequencyDiscount : 0;

    const afterProperty = basePrice * propertyMultiplier;
    const afterComplexity = afterProperty * aiAnalysis.complexityScore;
    const afterDiscount = afterComplexity * (1 - serviceDiscount);
    const finalLinePrice = roundToNearestFive(applyGrossMargin(afterDiscount));

    lineItems.push({
      serviceId,
      serviceName: config.name,
      basePrice: roundToNearestFive(basePrice),
      adjustedPrice: finalLinePrice,
      description,
      calculationExplanation,
    });

    baseCost += afterProperty;
    adjustedCost += afterComplexity;
    subtotal += afterDiscount;
    total += finalLinePrice;
  }

  // Breakdown (based on discounted cost basis)
  const laborCost = subtotal * 0.35;
  const materialsCost = subtotal * 0.15;
  const overhead = subtotal * 0.20;
  const profit = total - subtotal;
  const rangePct = Math.max(0.1, Math.min(0.2, 0.1 + (aiAnalysis.complexityScore - 1) * 0.1));
  const { min: finalQuoteMin, max: finalQuoteMax } = calculateQuoteRange(total, rangePct);

  return {
    lineItems,
    baseCost: roundToNearestFive(baseCost),
    adjustedCost: roundToNearestFive(adjustedCost),
    subtotal: roundToNearestFive(subtotal),
    total,
    finalQuote: total,
    finalQuoteMin,
    finalQuoteMax,
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

const RECURRING_ELIGIBLE_SERVICE_IDS = new Set<string>([
  "lawn-mowing",
  "lawn-maintenance",
  "fertilization",
  "weed-control",
  "irrigation-maintenance",
]);

function isRecurringEligible(serviceId: string): boolean {
  return RECURRING_ELIGIBLE_SERVICE_IDS.has(serviceId);
}

interface QuoteLineItem {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  adjustedPrice: number;
  description: string;
  calculationExplanation?: string;
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

  const minCost = basePrice * propertyMultiplier * minComplexity * (1 - discount);
  const maxCost = basePrice * propertyMultiplier * maxComplexity * (1 - discount);
  const minPrice = applyGrossMargin(minCost);
  const maxPrice = applyGrossMargin(maxCost);

  return {
    min: roundToNearestFive(minPrice),
    max: roundToNearestFive(maxPrice),
  };
}
