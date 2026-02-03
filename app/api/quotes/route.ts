import { NextResponse } from "next/server";
import { z } from "zod";

// Quote submission schema - supports both simple form and full wizard submissions
const quoteSubmissionSchema = z.object({
  // Contact info
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
  
  // Property info
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  propertyType: z.enum(["residential", "commercial", "hoa", "property-management"]).optional(),
  propertySize: z.number().optional(),
  
  // Service info
  serviceType: z.string().optional(), // Primary service
  services: z.array(z.string()).optional(), // Simple form format
  selectedServices: z.array(z.string()).optional(), // Wizard format
  frequency: z.enum(["one-time", "weekly", "bi-weekly", "monthly"]).optional(),
  
  // Pricing
  estimatedTotal: z.number().optional(),
  
  // Service-specific measurements
  serviceData: z.record(z.string(), z.object({
    propertySize: z.number().optional(),
    linearFeet: z.number().optional(),
    zones: z.number().optional(),
    perimeterFt: z.number().optional(),
    hedgeLengthFt: z.number().optional(),
    treeCount: z.number().optional(),
    fixtureCount: z.number().optional(),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = quoteSubmissionSchema.parse(body);
    
    // Normalize services array (support both formats)
    const services = validatedData.selectedServices || validatedData.services || [];
    
    // In production, this would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Create lead record
    
    // For now, log and return success
    console.log("Quote submission received:", {
      ...validatedData,
      services,
    });
    
    // Generate a quote ID
    const quoteId = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      quoteId,
      id: quoteId, // Alias for compatibility
      message: "Thank you! We've received your quote request and will contact you within 24 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Quote validation error:", error.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: error.errors[0]?.message || "Validation error",
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    
    console.error("Error processing quote:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // This could be used to check quote status
  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get("id");
  
  if (!quoteId) {
    return NextResponse.json(
      { error: "Quote ID required" },
      { status: 400 }
    );
  }
  
  // For now, return a mock response
  return NextResponse.json({
    id: quoteId,
    status: "pending",
    message: "Your quote is being processed",
  });
}
