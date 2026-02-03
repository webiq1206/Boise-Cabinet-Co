import { NextResponse } from "next/server";
import { z } from "zod";
import { 
  calculateTotalPriceRange, 
  formatPriceRange,
  type ServiceMeasurements 
} from "@/lib/pricingUtils";

// Schema for quote calculation request
const calculateQuoteSchema = z.object({
  selectedServices: z.array(z.string()).min(1, "At least one service required"),
  serviceData: z.record(z.string(), z.object({
    propertySize: z.number().optional(),
    linearFeet: z.number().optional(),
    zones: z.number().optional(),
    treeCount: z.number().optional(),
    fixtureCount: z.number().optional(),
    lightingType: z.string().optional(),
  })).optional(),
  sharedMeasurements: z.object({
    propertySize: z.number().optional(),
    linearFeet: z.number().optional(),
    zones: z.number().optional(),
    treeCount: z.number().optional(),
    fixtureCount: z.number().optional(),
  }).optional(),
  propertyType: z.enum(["residential", "commercial", "hoa", "property-management"]).optional(),
  frequency: z.enum(["one-time", "weekly", "bi-weekly", "monthly"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request
    const validatedData = calculateQuoteSchema.parse(body);
    
    // Calculate price range
    const priceRange = calculateTotalPriceRange(
      validatedData.selectedServices,
      validatedData.serviceData || {},
      validatedData.sharedMeasurements || {},
      validatedData.propertyType || "residential",
      validatedData.frequency || "one-time"
    );
    
    return NextResponse.json({
      success: true,
      quote: {
        min: priceRange.min,
        max: priceRange.max,
        typical: priceRange.typical,
        serviceCount: priceRange.serviceCount,
        formatted: formatPriceRange(priceRange.min, priceRange.max),
        breakdown: priceRange.breakdown.map(item => ({
          serviceId: item.serviceName,
          serviceName: item.serviceName,
          min: item.min,
          max: item.max,
          typical: item.typical,
          unit: item.unit,
          measurement: item.measurement,
        })),
        frequency: validatedData.frequency || "one-time",
        propertyType: validatedData.propertyType || "residential",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request data",
          details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    
    console.error("Error calculating quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate quote" },
      { status: 500 }
    );
  }
}
