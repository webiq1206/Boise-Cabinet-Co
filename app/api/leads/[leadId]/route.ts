import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { HOUSE_NUMBER_REGEX, HOUSE_NUMBER_ERROR_MESSAGE } from "@/shared/addressValidation";
import { recordLeadActivity, actorNameFromUser } from "@/server/services/leadActivity";

const patchSchema = z
  .object({
    address: z
      .string()
      .min(5, "Please enter a valid street address")
      .refine((v) => HOUSE_NUMBER_REGEX.test(v.trim()), HOUSE_NUMBER_ERROR_MESSAGE)
      .optional(),
    city: z.string().min(2).optional(),
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    propertyType: z.string().optional(),
    serviceType: z.string().optional(),
    selectedServices: z.array(z.string()).optional(),
    frequency: z.string().optional(),
    finalQuote: z.union([z.string(), z.number()]).optional(),
    currentLeadPrice: z.union([z.string(), z.number()]).optional(),
    baseLeadPrice: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.any().optional(),
    message: z.string().nullable().optional(),
    serviceData: z.any().optional(),
    lineItems: z.any().optional(),
    addressMissingHouseNumber: z.boolean().optional(),
    propertyProfile: z.record(z.unknown()).optional(),
  })
  .strict();

export async function PATCH(request: Request, { params }: { params: { leadId: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { leadId } = params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = patchSchema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message || "Validation error", details: e.errors },
        { status: 400 },
      );
    }
    throw e;
  }

  const result = await db.select().from(leads).where(eq(leads.id, leadId));
  const lead = result[0];
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const update: Record<string, unknown> = { ...parsed };
  if (typeof update.address === "string") {
    update.addressMissingHouseNumber = false;
  }

  await db.update(leads).set(update).where(eq(leads.id, leadId));
  const updated = await db.select().from(leads).where(eq(leads.id, leadId));

  // Log meaningful changes to the unified activity timeline.
  const actorName = actorNameFromUser(user);
  const STATUS_LABELS: Record<string, string> = {
    pending_admin: "Pending review",
    pending: "Pending",
    accepted: "Accepted",
    converted: "Converted",
    archived: "Archived",
    declined: "Declined",
  };

  if (parsed.status !== undefined && parsed.status !== lead.status) {
    const fromLabel = STATUS_LABELS[lead.status] || lead.status;
    const toLabel = STATUS_LABELS[parsed.status] || parsed.status;
    await recordLeadActivity({
      leadId,
      type: "status_change",
      message: `Status changed from ${fromLabel} to ${toLabel}`,
      detail: { from: lead.status, to: parsed.status },
      actorId: user.id,
      actorName,
    });
  }

  const priceFields: Array<{ key: "finalQuote" | "currentLeadPrice"; label: string }> = [
    { key: "finalQuote", label: "Customer quote" },
    { key: "currentLeadPrice", label: "Lead price" },
  ];
  for (const { key, label } of priceFields) {
    if (parsed[key] === undefined) continue;
    const before = lead[key] == null ? null : String(lead[key]);
    const after = String(parsed[key]);
    if (before === after) continue;
    await recordLeadActivity({
      leadId,
      type: "price_change",
      message: `${label} changed from ${before ?? "none"} to ${after}`,
      detail: { field: key, from: before, to: after },
      actorId: user.id,
      actorName,
    });
  }

  return NextResponse.json(updated[0]);
}
