import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quotes, leads, users, notifications } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { sendQuoteConfirmationEmail, sendAdminNotificationEmail } from "@/lib/resend";

const quoteSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  propertyType: z.enum(["residential", "commercial", "hoa", "property-management"]).optional(),
  propertySize: z.number().optional(),
  serviceType: z.string().optional(),
  services: z.array(z.string()).optional(),
  selectedServices: z.array(z.string()).optional(),
  frequency: z.enum(["one-time", "weekly", "bi-weekly", "monthly"]).optional(),
  estimatedTotal: z.number().optional(),
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

function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

function calculateLeadPrice(params: {
  finalQuote: number;
  frequency: string;
  serviceType: string;
}): { basePrice: number; currentPrice: number } {
  const { finalQuote, frequency, serviceType } = params;

  const RECURRING_LEAD_BASE_PRICES: Record<string, number> = {
    "lawn-mowing": 45,
    "lawn-care": 50,
    "lawn-maintenance": 50,
    "fertilization": 60,
    "aeration": 75,
    "weed-control": 55,
    "tree-trimming": 85,
    "hedge-trimming": 65,
    "landscaping": 80,
    "mulching": 70,
    "mulch-installation": 70,
    "seasonal-cleanup": 90,
    "spring-cleanup": 90,
    "fall-cleanup": 90,
    "christmas-light-installation": 150,
  };

  let basePrice: number =
    frequency && frequency !== "one-time"
      ? (RECURRING_LEAD_BASE_PRICES[serviceType] ?? 60)
      : finalQuote * 0.10;

  basePrice = Math.max(15, basePrice);
  basePrice = roundToNearestFive(basePrice);

  return {
    basePrice,
    currentPrice: basePrice,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = quoteSubmissionSchema.parse(body);

    const services = validatedData.selectedServices || validatedData.services || [];
    const primaryService = validatedData.serviceType || services[0] || "lawn-mowing";
    const frequency = validatedData.frequency || "one-time";
    const propertyType = validatedData.propertyType || "residential";

    console.log("[QUOTE] Quote submission received:", {
      name: validatedData.name,
      email: validatedData.email,
      city: validatedData.city,
      services,
      primaryService,
    });

    let quoteId = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let leadId: string | null = null;

    if (db) {
      try {
        const [savedQuote] = await db.insert(quotes).values({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || "Not provided",
          address: validatedData.address,
          city: validatedData.city,
          propertyType,
          propertySize: validatedData.propertySize?.toString(),
          serviceType: primaryService,
          selectedServices: services,
          frequency,
          serviceData: validatedData.serviceData || null,
          message: validatedData.message || null,
          status: "pending",
        }).returning();

        quoteId = savedQuote.id;
        console.log("[QUOTE] Quote saved to database:", quoteId);

        const estimatedTotal = validatedData.estimatedTotal || 200;
        const { basePrice, currentPrice } = calculateLeadPrice({
          finalQuote: estimatedTotal,
          frequency,
          serviceType: primaryService,
        });

        const [savedLead] = await db.insert(leads).values({
          quoteId: savedQuote.id,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || "Not provided",
          address: validatedData.address || null,
          city: validatedData.city,
          propertyType,
          serviceType: primaryService,
          selectedServices: services,
          frequency,
          finalQuote: estimatedTotal.toFixed(2),
          serviceData: validatedData.serviceData || null,
          message: validatedData.message || null,
          baseLeadPrice: basePrice.toFixed(2),
          currentLeadPrice: currentPrice.toFixed(2),
          status: "pending_admin",
        }).returning();

        leadId = savedLead.id;
        console.log("[QUOTE] Lead created:", leadId, "price:", basePrice.toFixed(2));

        try {
          const admins = await db.select().from(users).where(eq(users.role, "admin"));
          for (const admin of admins) {
            await db.insert(notifications).values({
              userId: admin.id,
              type: "admin_new_quote",
              title: "New Quote Submitted",
              message: `New ${primaryService} lead in ${validatedData.city}: ${validatedData.name}`,
              leadId: savedLead.id,
            });
          }
          console.log("[QUOTE] Admin notifications created for", admins.length, "admins");
        } catch (notifyError) {
          console.error("[QUOTE] Failed to create admin notifications:", notifyError);
        }
      } catch (dbError) {
        console.error("[QUOTE] Database error saving quote/lead:", dbError);
      }
    } else {
      console.warn("[QUOTE] Database not available - quote not saved to DB");
    }

    let customerEmailSent = false;
    let adminEmailSent = false;

    try {
      console.log("[QUOTE] Sending customer confirmation email to:", validatedData.email);
      await sendQuoteConfirmationEmail({
        to: validatedData.email,
        customerName: validatedData.name,
        quoteId,
        address: validatedData.address,
        city: validatedData.city,
        services,
        frequency,
      });
      customerEmailSent = true;
      console.log("[QUOTE] Customer email sent successfully");
    } catch (emailError: any) {
      console.error("[QUOTE] FAILED to send customer email:", emailError?.message || emailError);
      console.error("[QUOTE] Customer email error details:", JSON.stringify(emailError, null, 2));
    }

    await new Promise(r => setTimeout(r, 600));

    try {
      console.log("[QUOTE] Sending admin notification email");
      await sendAdminNotificationEmail({
        customerName: validatedData.name,
        customerEmail: validatedData.email,
        customerPhone: validatedData.phone || "Not provided",
        quoteId,
        address: validatedData.address,
        city: validatedData.city,
        services,
        frequency,
        message: validatedData.message,
        propertySize: validatedData.propertySize,
      });
      adminEmailSent = true;
      console.log("[QUOTE] Admin email sent successfully");
    } catch (emailError: any) {
      console.error("[QUOTE] FAILED to send admin email:", emailError?.message || emailError);
      console.error("[QUOTE] Admin email error details:", JSON.stringify(emailError, null, 2));
    }

    console.log("[QUOTE] Quote processing complete:", {
      quoteId,
      leadId,
      customerEmailSent,
      adminEmailSent,
    });

    return NextResponse.json({
      success: true,
      quoteId,
      id: quoteId,
      message: "Thank you! We've received your quote request and will contact you within 24 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[QUOTE] Validation error:", error.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: error.errors[0]?.message || "Validation error",
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error("[QUOTE] Unexpected error processing quote:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get("id");

  if (!quoteId) {
    return NextResponse.json(
      { error: "Quote ID required" },
      { status: 400 }
    );
  }

  if (db) {
    try {
      const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
      if (quote) {
        const [lead] = await db.select().from(leads).where(eq(leads.quoteId, quoteId));
        return NextResponse.json({
          id: quote.id,
          status: quote.status || "pending",
          message: "Your quote is being processed",
          lead: lead ? { status: lead.status, createdAt: lead.createdAt } : null,
        });
      }
    } catch (dbError) {
      console.error("[QUOTE] Error fetching quote status:", dbError);
    }
  }

  return NextResponse.json({
    id: quoteId,
    status: "pending",
    message: "Your quote is being processed",
  });
}
