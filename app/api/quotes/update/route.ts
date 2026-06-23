import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quotes, leads, users, notifications } from "@/shared/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { verifyEditToken } from "@/lib/leadDedupe";
import { HOUSE_NUMBER_REGEX, HOUSE_NUMBER_ERROR_MESSAGE } from "@/shared/addressValidation";

const SERVICE_PRICING_RATES: Record<string, { lowRate: number; highRate: number; unit: string; minimum: number }> = {
  "kitchen-remodel": { lowRate: 25000, highRate: 75000, unit: "base_project", minimum: 15000 },
  "bathroom-remodel": { lowRate: 8000, highRate: 35000, unit: "base_project", minimum: 5000 },
  "whole-home-remodel": { lowRate: 80000, highRate: 300000, unit: "base_project", minimum: 50000 },
  "room-addition": { lowRate: 50000, highRate: 150000, unit: "base_project", minimum: 30000 },
  "basement-finish": { lowRate: 30, highRate: 65, unit: "sqft", minimum: 10000 },
  "outdoor-living": { lowRate: 15000, highRate: 60000, unit: "base_project", minimum: 8000 },
};

const PROPERTY_MULTIPLIERS: Record<string, number> = {
  residential: 1.0,
  commercial: 1.3,
};

function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

function roundToNearestDollar(price: number): number {
  return Math.round(price);
}

interface ServiceMeasurement {
  propertySize?: number;
  [key: string]: unknown;
}

function calculateServicePrice(
  serviceId: string,
  serviceData: ServiceMeasurement | null | undefined,
  fallbackSqFt: number,
  propertyMultiplier: number
): number {
  const config = SERVICE_PRICING_RATES[serviceId];
  if (!config) return 200;
  const typicalRate = (config.lowRate + config.highRate) / 2;
  const sqft = serviceData?.propertySize || fallbackSqFt || 2000;
  let cost = 0;
  switch (config.unit) {
    case "sqft": cost = sqft * typicalRate; break;
    case "base_project":
    default: cost = typicalRate;
  }
  cost = Math.max(config.minimum, cost);
  cost *= propertyMultiplier;
  return roundToNearestFive(cost);
}

function calculateLeadPrice(finalQuote: number): { basePrice: number; currentPrice: number } {
  let basePrice = finalQuote * 0.10;
  basePrice = Math.max(10, basePrice);
  basePrice = Math.min(100, basePrice);
  basePrice = roundToNearestDollar(basePrice);
  return { basePrice, currentPrice: basePrice };
}

const updateSchema = z.object({
  token: z.string().min(10),
  selectedServices: z.array(z.string()).min(1, "Please select at least one service"),
  // Optional defensively. The current customer self-service flow doesn't
  // resubmit address, but if it ever starts to (or an admin uses this
  // endpoint), the leading-house-number rule must hold for parity with
  // app/api/quotes/route.ts so we never persist a numberless address.
  address: z
    .string()
    .min(5, "Please enter a valid address")
    .refine(
      (val) => HOUSE_NUMBER_REGEX.test(val.trim()),
      HOUSE_NUMBER_ERROR_MESSAGE
    )
    .optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const decoded = verifyEditToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const [lead] = await db.select().from(leads).where(eq(leads.id, decoded.leadId));
  if (!lead) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (decoded.quoteId && lead.quoteId && decoded.quoteId !== lead.quoteId) {
    return NextResponse.json({ error: "Token does not match this quote." }, { status: 401 });
  }

  if (lead.status === "purchased") {
    return NextResponse.json({ error: "This quote is already being handled. Please contact us." }, { status: 409 });
  }
  if (lead.status === "archived" || lead.status === "declined_admin") {
    return NextResponse.json({ error: "This quote is no longer editable." }, { status: 410 });
  }

  return NextResponse.json({
    leadId: lead.id,
    quoteId: lead.quoteId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    address: lead.address,
    city: lead.city,
    propertyType: lead.propertyType,
    selectedServices: lead.selectedServices || [],
    serviceData: lead.serviceData || {},
    finalQuote: lead.finalQuote,
    lineItems: lead.lineItems || [],
    updatedAt: lead.updatedAt,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const decoded = verifyEditToken(data.token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
    }
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const [lead] = await db.select().from(leads).where(eq(leads.id, decoded.leadId));
    if (!lead) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    if (decoded.quoteId && lead.quoteId && decoded.quoteId !== lead.quoteId) {
      return NextResponse.json({ error: "Token does not match this quote." }, { status: 401 });
    }

    if (lead.status === "purchased") {
      return NextResponse.json({ error: "This quote is already being handled by a contractor." }, { status: 409 });
    }
    if (lead.status === "archived" || lead.status === "declined_admin") {
      return NextResponse.json({ error: "This quote is no longer editable." }, { status: 410 });
    }

    const propertyMultiplier = PROPERTY_MULTIPLIERS[lead.propertyType] || 1.0;
    const existingServiceData =
      (lead.serviceData as Record<string, ServiceMeasurement> | null) || {};
    const fallbackSqFt =
      Number(existingServiceData[lead.serviceType]?.propertySize) || 2000;

    const newServiceData: Record<string, ServiceMeasurement> = {};
    const lineItems = data.selectedServices.map((sid) => {
      const sd = existingServiceData[sid] || existingServiceData[lead.serviceType] || {};
      newServiceData[sid] = { ...sd };
      const price = calculateServicePrice(sid, sd, fallbackSqFt, propertyMultiplier);
      return {
        serviceId: sid,
        serviceName: sid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        price,
      };
    });

    const estimatedTotal = lineItems.reduce((sum, i) => sum + i.price, 0);
    const { basePrice, currentPrice } = calculateLeadPrice(estimatedTotal);
    const primaryService = data.selectedServices[0];
    const now = new Date();

    // Atomic update: quote and lead are written together in a real
    // transaction (neon-serverless Pool driver) so they cannot diverge.
    await db.transaction(async (tx) => {
      if (lead.quoteId) {
        await tx
          .update(quotes)
          .set({
            selectedServices: data.selectedServices,
            serviceType: primaryService,
            serviceData: newServiceData,
            lineItems,
            finalQuote: estimatedTotal.toFixed(2),
          })
          .where(eq(quotes.id, lead.quoteId));
      }
      await tx
        .update(leads)
        .set({
          selectedServices: data.selectedServices,
          serviceType: primaryService,
          serviceData: newServiceData,
          lineItems,
          finalQuote: estimatedTotal.toFixed(2),
          baseLeadPrice: basePrice.toFixed(2),
          currentLeadPrice: currentPrice.toFixed(2),
          updatedAt: now,
        })
        .where(eq(leads.id, lead.id));
    });

    // Notify watchlist subscribers, throttled per-user/per-lead.
    // Skip both in-app and email if we already notified this user about this
    // lead in the last NOTIFY_THROTTLE_MIN minutes.
    const NOTIFY_THROTTLE_MIN = 30;
    try {
      const throttleCutoff = new Date(Date.now() - NOTIFY_THROTTLE_MIN * 60 * 1000);
      const watchers = await db
        .select()
        .from(users)
        .where(eq(users.role, "subcontractor"));
      for (const u of watchers) {
        const watched = (u.watchedLeads as string[] | null) || [];
        if (!Array.isArray(watched) || !watched.includes(lead.id)) continue;

        const recent = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, u.id),
              eq(notifications.leadId, lead.id),
              eq(notifications.type, "lead_updated"),
              gte(notifications.createdAt, throttleCutoff)
            )
          )
          .orderBy(desc(notifications.createdAt))
          .limit(1);
        if (recent.length > 0) continue;

        await db.insert(notifications).values({
          userId: u.id,
          type: "lead_updated",
          title: "Watched Lead Updated",
          message: `A lead you're watching in ${lead.city} was updated by the customer.`,
          leadId: lead.id,
        });
        if (u.email && u.emailNotificationsEnabled !== false) {
          try {
            const { sendWatchedLeadUpdatedEmail } = await import("@/server/services/emailNotifications");
            await sendWatchedLeadUpdatedEmail(u.email, {
              city: lead.city,
              estimatedTotal,
              leadId: lead.id,
            });
          } catch (emailErr) {
            console.error(
              `[QUOTE-UPDATE] Watcher email failed for user ${u.id}, lead ${lead.id}:`,
              emailErr
            );
          }
        }
      }
    } catch (e) {
      console.error("[QUOTE-UPDATE] Failed to notify watchers:", e);
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      quoteId: lead.quoteId,
      finalQuote: estimatedTotal,
      lineItems,
      message: "Your quote has been updated.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("[QUOTE-UPDATE] Error:", err);
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}
