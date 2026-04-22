import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quotes, leads, users, notifications } from "@/shared/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { verifyEditToken } from "@/lib/leadDedupe";
import { getRecurringEligibleServices } from "@shared/serviceSeasonality";

const RECURRING_ELIGIBLE_SERVICE_IDS = getRecurringEligibleServices();

const SERVICE_PRICING_RATES: Record<
  string,
  { lowRate: number; highRate: number; unit: string; minimum: number; includedZones?: number }
> = {
  "lawn-mowing": { lowRate: 0.00625, highRate: 0.010, unit: "sqft", minimum: 35 },
  "aeration": { lowRate: 0.0125, highRate: 0.018, unit: "sqft", minimum: 75 },
  "fertilization": { lowRate: 0.005, highRate: 0.008, unit: "sqft", minimum: 50 },
  "weed-control": { lowRate: 0.00375, highRate: 0.006, unit: "sqft", minimum: 50 },
  "overseeding": { lowRate: 0.0125, highRate: 0.030, unit: "sqft", minimum: 100 },
  "dethatching": { lowRate: 0.0125, highRate: 0.020, unit: "sqft", minimum: 100 },
  "sod-installation": { lowRate: 1.25, highRate: 2.00, unit: "sqft", minimum: 500 },
  "lawn-renovation": { lowRate: 0.0625, highRate: 0.100, unit: "sqft", minimum: 500 },
  "lawn-edging": { lowRate: 0.625, highRate: 1.50, unit: "linear_ft", minimum: 50 },
  "christmas-light-installation": { lowRate: 3.125, highRate: 7.00, unit: "linear_ft", minimum: 400 },
  "landscape-lighting": { lowRate: 187.50, highRate: 350.00, unit: "per_fixture", minimum: 500 },
  "sprinkler-blowout": { lowRate: 12.50, highRate: 15.00, unit: "per_zone", minimum: 50, includedZones: 5 },
  "sprinkler-repair": { lowRate: 85.00, highRate: 150.00, unit: "base_service", minimum: 85 },
  "sprinkler-system-installation": { lowRate: 0.50, highRate: 0.80, unit: "sqft", minimum: 2000 },
  "irrigation-repair": { lowRate: 85.00, highRate: 150.00, unit: "base_service", minimum: 85 },
  "irrigation-maintenance": { lowRate: 12.50, highRate: 15.00, unit: "per_zone", minimum: 65 },
  "patio-installation": { lowRate: 12.50, highRate: 24.00, unit: "per_sqft", minimum: 1500 },
  "retaining-walls": { lowRate: 25.00, highRate: 50.00, unit: "per_sqft", minimum: 1000 },
  "fire-pit-installation": { lowRate: 500.00, highRate: 2500.00, unit: "base_project", minimum: 500 },
  "fence": { lowRate: 25.00, highRate: 45.00, unit: "linear_ft", minimum: 1000 },
  "tree-removal": { lowRate: 625.00, highRate: 1000.00, unit: "per_tree", minimum: 500 },
  "tree-trimming": { lowRate: 250.00, highRate: 450.00, unit: "per_tree", minimum: 200 },
  "stump-grinding": { lowRate: 3.75, highRate: 5.00, unit: "per_inch", minimum: 100 },
  "hedge-trimming": { lowRate: 0.015, highRate: 0.035, unit: "sqft", minimum: 75 },
  "spring-cleanup": { lowRate: 0.0125, highRate: 0.025, unit: "sqft", minimum: 150 },
  "fall-cleanup": { lowRate: 0.01875, highRate: 0.030, unit: "sqft", minimum: 175 },
  "seasonal-cleanup": { lowRate: 0.0125, highRate: 0.025, unit: "sqft", minimum: 150 },
  "mulch-installation": { lowRate: 87.50, highRate: 110.00, unit: "per_cubic_yard", minimum: 150 },
  "snow-removal": { lowRate: 50.00, highRate: 90.00, unit: "base_service", minimum: 40 },
  "gutter-cleaning": { lowRate: 1.25, highRate: 2.00, unit: "linear_ft", minimum: 75 },
  "lawn-maintenance": { lowRate: 0.010, highRate: 0.018, unit: "sqft", minimum: 50 },
};

const PROPERTY_MULTIPLIERS: Record<string, number> = {
  residential: 1.0,
  commercial: 1.3,
  hoa: 1.2,
  "property-management": 1.25,
};

function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

function roundToNearestDollar(price: number): number {
  return Math.ceil(price);
}

interface ServiceMeasurement {
  propertySize?: number;
  linearFeet?: number;
  perimeterFt?: number;
  zones?: number;
  treeCount?: number;
  fixtureCount?: number;
  frequency?: string;
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
  const sqft = serviceData?.propertySize || fallbackSqFt || 5000;
  const linearFeet = serviceData?.linearFeet || serviceData?.perimeterFt || Math.round(Math.sqrt(Math.max(1, sqft)) * 4 * 0.6);
  const zones = serviceData?.zones || 6;
  let cost = 0;
  switch (config.unit) {
    case "sqft": cost = sqft * typicalRate; break;
    case "linear_ft": cost = linearFeet * typicalRate; break;
    case "per_zone": {
      const included = config.includedZones || 5;
      cost = Math.max(included, zones) * typicalRate;
      break;
    }
    case "per_tree": cost = (serviceData?.treeCount || 1) * typicalRate; break;
    case "per_fixture": cost = (serviceData?.fixtureCount || 10) * typicalRate; break;
    case "per_cubic_yard": cost = 3 * typicalRate; break;
    case "per_sqft": cost = (sqft * 0.02) * typicalRate; break;
    case "per_inch": cost = 12 * typicalRate; break;
    case "base_service":
    case "base_project": cost = typicalRate; break;
    default: cost = config.minimum;
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
  serviceFrequencies: z.record(z.string(), z.string()).optional(),
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
    frequency: lead.frequency,
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
      Number(existingServiceData[lead.serviceType]?.propertySize) || 5000;

    const serviceFrequencies = data.serviceFrequencies || {};
    const newServiceData: Record<string, ServiceMeasurement> = {};
    const lineItems = data.selectedServices.map((sid) => {
      const sd = existingServiceData[sid] || existingServiceData[lead.serviceType] || {};
      const svcFreq = serviceFrequencies[sid] || sd?.frequency || lead.frequency || "one-time";
      newServiceData[sid] = { ...sd, frequency: svcFreq };
      const price = calculateServicePrice(sid, sd, fallbackSqFt, propertyMultiplier);
      return {
        serviceId: sid,
        serviceName: sid.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        price,
        isRecurring: svcFreq !== "one-time" && RECURRING_ELIGIBLE_SERVICE_IDS.has(sid),
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
            const { sendEmail } = await import("@/server/services/emailNotifications");
            const url = `https://lawncarekuna.com/subcontractor/portal?leadId=${encodeURIComponent(lead.id)}`;
            await sendEmail(
              u.email,
              `Watched lead updated in ${lead.city}`,
              `<p>A lead you're watching has been updated by the customer.</p><p>City: ${lead.city}<br/>New estimated value: $${estimatedTotal.toLocaleString()}</p><p><a href="${url}">View lead</a></p>`
            );
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
