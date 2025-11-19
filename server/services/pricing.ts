import OpenAI from "openai";

// Initialize OpenAI with Replit AI Integrations
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY!,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL!,
});

// Service pricing rates (base costs for subcontractors + overhead)
export const SERVICE_RATES = {
  // Lawn Care (per sq ft per visit)
  "lawn-mowing": { baseRate: 0.012, name: "Lawn Mowing", unit: "sqft" as const },
  "lawn-maintenance": { baseRate: 0.015, name: "Full Lawn Maintenance", unit: "sqft" as const },
  "aeration": { baseRate: 0.018, name: "Core Aeration", unit: "sqft" as const },
  "fertilization": { baseRate: 0.014, name: "Fertilization Treatment", unit: "sqft" as const },
  "weed-control": { baseRate: 0.013, name: "Weed Control", unit: "sqft" as const },
  "hedge-trimming": { baseRate: 0.010, name: "Hedge Trimming", unit: "sqft" as const },
  "seasonal-cleanup": { baseRate: 0.016, name: "Seasonal Cleanup", unit: "sqft" as const },
  "sprinkler-blowout": { baseRate: 0.008, name: "Sprinkler Winterization", unit: "sqft" as const },
  "dethatching": { baseRate: 0.017, name: "Dethatching", unit: "sqft" as const },
  
  // Landscaping (per sq ft - one-time projects)
  "patio": { baseRate: 35.00, name: "Patio Installation", unit: "project" as const },
  "retaining-walls": { baseRate: 40.00, name: "Retaining Wall", unit: "linear_ft" as const },
  "sod-installation": { baseRate: 1.20, name: "Sod Installation", unit: "sqft" as const },
  "fence": { baseRate: 25.00, name: "Fence Installation", unit: "linear_ft" as const },
  "pond": { baseRate: 5000.00, name: "Pond Installation", unit: "project" as const },
  "christmas-lights": { baseRate: 3.50, name: "Christmas Light Installation", unit: "linear_ft" as const },
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
    item.adjustedPrice = item.basePrice * propertyMultiplier * aiAnalysis.complexityScore;
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
    baseCost: Math.round(baseCost * 100) / 100,
    adjustedCost: Math.round(adjustedCost * 100) / 100,
    finalQuote: Math.round(finalQuote * 100) / 100,
    lineItems,
    aiAnalysis,
    complexityScore: aiAnalysis.complexityScore,
    breakdown: {
      laborCost: Math.round(laborCost * 100) / 100,
      materialsCost: Math.round(materialsCost * 100) / 100,
      overhead: Math.round(overhead * 100) / 100,
      profit: Math.round(profit * 100) / 100,
    },
  };
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
    min: Math.round(minPrice),
    max: Math.round(maxPrice),
  };
}
