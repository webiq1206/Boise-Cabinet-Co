import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { leads, users, leadPurchases, creditTransactions, notifications } from "@/shared/schema";
import { eq, sql } from "drizzle-orm";
import { getSession, getUserFromDb } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function roundToNearestDollar(value: number): number {
  return Math.round(value);
}

function calculateLeadPrice(finalQuote: number): { basePrice: number; currentPrice: number } {
  let basePrice = finalQuote * 0.10;
  basePrice = Math.max(10, basePrice);
  basePrice = Math.min(100, basePrice);
  basePrice = roundToNearestDollar(basePrice);
  return { basePrice, currentPrice: basePrice };
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p;
    } catch {}
  }
  return [];
}

function parseNotes(val: unknown): Array<{ text: string; addedBy: string; addedAt: string }> {
  if (Array.isArray(val)) return val as Array<{ text: string; addedBy: string; addedAt: string }>;
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p;
    } catch {}
  }
  return [];
}

function parseLineItems(val: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(val)) return val as Array<Record<string, unknown>>;
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p;
    } catch {}
  }
  return [];
}

function lineItemKey(item: Record<string, unknown>): string {
  return String(item.serviceId ?? item.service ?? item.serviceName ?? item.description ?? JSON.stringify(item));
}

function lineItemPrice(item: Record<string, unknown>): number {
  const candidates = [item.price, item.adjustedPrice, item.basePrice];
  for (const c of candidates) {
    const n = typeof c === "number" ? c : parseFloat(String(c ?? ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

export async function POST(request: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "Database not available" }, { status: 503 });

    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const admin = await getUserFromDb(session.userId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { targetLeadId, sourceLeadId } = body as { targetLeadId?: string; sourceLeadId?: string };

    if (!targetLeadId || !sourceLeadId) {
      return NextResponse.json({ error: "targetLeadId and sourceLeadId are required" }, { status: 400 });
    }
    if (targetLeadId === sourceLeadId) {
      return NextResponse.json({ error: "Cannot merge a lead with itself" }, { status: 400 });
    }

    const [targetRowRaw] = await db.select().from(leads).where(eq(leads.id, targetLeadId));
    const [sourceRowRaw] = await db.select().from(leads).where(eq(leads.id, sourceLeadId));
    if (!targetRowRaw) return NextResponse.json({ error: "Target lead not found" }, { status: 404 });
    if (!sourceRowRaw) return NextResponse.json({ error: "Source lead not found" }, { status: 404 });

    // Enforce business rule: older lead is always kept as target, newer is archived.
    // If the caller passed them in the opposite order, transparently swap.
    const targetCreated = new Date(targetRowRaw.createdAt ?? 0).getTime();
    const sourceCreated = new Date(sourceRowRaw.createdAt ?? 0).getTime();
    let targetRow = targetRowRaw;
    let sourceRow = sourceRowRaw;
    let directionSwapped = false;
    if (sourceCreated < targetCreated) {
      targetRow = sourceRowRaw;
      sourceRow = targetRowRaw;
      directionSwapped = true;
    }

    if (sourceRow.status === "archived") {
      return NextResponse.json({ error: "Newer (source) lead is already archived" }, { status: 400 });
    }
    if (targetRow.status === "archived") {
      return NextResponse.json({ error: "Older (target) lead is archived; cannot merge into it" }, { status: 400 });
    }

    // Merge selectedServices
    const tServices = Array.isArray(targetRow.selectedServices) ? targetRow.selectedServices : [];
    const sServices = Array.isArray(sourceRow.selectedServices) ? sourceRow.selectedServices : [];
    const mergedServices = Array.from(new Set([...tServices, ...sServices]));

    // Merge serviceData (target wins for conflicts)
    const tSvcData = (targetRow.serviceData && typeof targetRow.serviceData === "object" ? targetRow.serviceData : {}) as Record<string, unknown>;
    const sSvcData = (sourceRow.serviceData && typeof sourceRow.serviceData === "object" ? sourceRow.serviceData : {}) as Record<string, unknown>;
    const mergedServiceData: Record<string, unknown> = { ...sSvcData, ...tSvcData };

    // Merge lineItems (dedupe by key, target wins)
    const tItems = parseLineItems(targetRow.lineItems);
    const sItems = parseLineItems(sourceRow.lineItems);
    const itemMap = new Map<string, Record<string, unknown>>();
    for (const it of sItems) itemMap.set(lineItemKey(it), it);
    for (const it of tItems) itemMap.set(lineItemKey(it), it);
    const mergedLineItems = Array.from(itemMap.values());

    // Recalculate finalQuote
    let mergedFinalQuote = mergedLineItems.reduce((sum, it) => sum + lineItemPrice(it), 0);
    if (mergedFinalQuote <= 0) {
      const tQ = parseFloat(targetRow.finalQuote || "0") || 0;
      const sQ = parseFloat(sourceRow.finalQuote || "0") || 0;
      mergedFinalQuote = tQ + sQ;
    }
    const { basePrice, currentPrice } = calculateLeadPrice(mergedFinalQuote);

    // Build merge audit notes
    const now = new Date().toISOString();
    const adminLabel = admin.email || admin.id;

    const sourceSnapshot = {
      id: sourceRow.id,
      name: sourceRow.name,
      email: sourceRow.email,
      phone: sourceRow.phone,
      address: sourceRow.address,
      city: sourceRow.city,
      serviceType: sourceRow.serviceType,
      selectedServices: sourceRow.selectedServices,
      serviceData: sourceRow.serviceData,
      lineItems: sourceRow.lineItems,
      finalQuote: sourceRow.finalQuote,
      baseLeadPrice: sourceRow.baseLeadPrice,
      currentLeadPrice: sourceRow.currentLeadPrice,
      status: sourceRow.status,
      purchasedBy: sourceRow.purchasedBy,
      purchasedAt: sourceRow.purchasedAt,
      stripePaymentIntentId: sourceRow.stripePaymentIntentId,
      notes: sourceRow.notes,
      createdAt: sourceRow.createdAt,
    };

    const targetNotes = parseNotes(targetRow.notes);
    targetNotes.push({
      text: `[MERGE] Merged source lead ${sourceRow.id} into this lead. Previous finalQuote=${targetRow.finalQuote ?? "0"}, new finalQuote=${mergedFinalQuote.toFixed(2)}. Snapshot: ${JSON.stringify(sourceSnapshot)}`,
      addedBy: adminLabel,
      addedAt: now,
    });

    const sourceNotes = parseNotes(sourceRow.notes);
    sourceNotes.push({
      text: `[MERGE] This lead was merged into ${targetRow.id} and archived.`,
      addedBy: adminLabel,
      addedAt: now,
    });

    // Refund source purchase if it exists and wasn't already refunded.
    // CRITICAL: process the Stripe refund BEFORE any DB mutations so that a
    // failure aborts the entire merge cleanly. We only mark `refunded=true`
    // after Stripe + credit refunds have actually succeeded.
    let refundInfo: {
      purchaseId: string;
      userId: string;
      amount: string;
      stripeRefundId: string | null;
      creditsRefunded: string;
    } | null = null;

    const [sourcePurchase] = await db.select().from(leadPurchases).where(eq(leadPurchases.leadId, sourceRow.id));
    let stripeRefundId: string | null = null;
    let cashPaid = 0;
    let creditsUsed = 0;
    let purchasePrice = "0";
    if (sourcePurchase && !sourcePurchase.refunded) {
      purchasePrice = sourcePurchase.purchasePrice || "0";
      creditsUsed = parseFloat(sourcePurchase.creditsUsed || "0") || 0;
      cashPaid = Math.max(0, parseFloat(purchasePrice) - creditsUsed);

      const piId = sourcePurchase.stripePaymentIntentId;
      const isRefundableStripeCharge =
        cashPaid > 0 && !!piId && !piId.startsWith("credit_purchase") && !piId.startsWith("pi_admin_resolved_");

      if (isRefundableStripeCharge) {
        if (!stripe) {
          return NextResponse.json(
            { error: "Stripe not configured; cannot refund the prior purchase. Merge aborted." },
            { status: 503 }
          );
        }
        try {
          const refund = await stripe.refunds.create({
            payment_intent: piId!,
            amount: Math.round(cashPaid * 100),
            reason: "duplicate",
          });
          stripeRefundId = refund.id;
        } catch (e) {
          console.error("[merge] Stripe refund failed; aborting merge:", e);
          return NextResponse.json(
            {
              error: `Stripe refund failed for the prior purchase; merge aborted. ${e instanceof Error ? e.message : ""}`.trim(),
            },
            { status: 502 }
          );
        }
      }
    }

    // Update target lead with merged data
    const [updatedTarget] = await db.update(leads).set({
      selectedServices: mergedServices,
      serviceData: mergedServiceData,
      lineItems: mergedLineItems,
      finalQuote: mergedFinalQuote.toFixed(2),
      baseLeadPrice: basePrice.toFixed(2),
      currentLeadPrice: currentPrice.toFixed(2),
      lastPriceUpdate: new Date(),
      notes: targetNotes,
      updatedAt: new Date(),
    }).where(eq(leads.id, targetRow.id)).returning();

    // Archive source lead
    await db.update(leads).set({
      status: "archived",
      notes: sourceNotes,
      updatedAt: new Date(),
    }).where(eq(leads.id, sourceRow.id));

    // Now that Stripe refund (if any) has succeeded and the merge has been
    // committed, finalize the refund bookkeeping: credit-back any credits
    // used and mark the purchase refunded.
    if (sourcePurchase && !sourcePurchase.refunded) {
      if (creditsUsed > 0) {
        await db.update(users).set({
          creditBalance: sql`CAST(${users.creditBalance} AS DECIMAL(10,2)) + ${String(creditsUsed)}`,
          updatedAt: new Date(),
        }).where(eq(users.id, sourcePurchase.userId));

        try {
          const [freshUser] = await db.select({ creditBalance: users.creditBalance }).from(users).where(eq(users.id, sourcePurchase.userId));
          await db.insert(creditTransactions).values({
            userId: sourcePurchase.userId,
            amount: String(creditsUsed),
            type: "merge_refund",
            description: `Refund for merged duplicate lead ${sourceRow.id} into ${targetRow.id}`,
            adminId: admin.id,
            leadPurchaseId: sourcePurchase.id,
            balanceAfter: freshUser?.creditBalance || "0",
          });
        } catch (e) {
          console.error("[merge] Credit transaction record failed:", e);
        }
      }

      await db.update(leadPurchases).set({
        refunded: true,
        refundReason: `Duplicate of lead ${targetRow.id} (admin merge)${stripeRefundId ? ` [stripe_refund=${stripeRefundId}]` : ""}`,
        refundedAt: new Date(),
      }).where(eq(leadPurchases.id, sourcePurchase.id));

      refundInfo = {
        purchaseId: sourcePurchase.id,
        userId: sourcePurchase.userId,
        amount: purchasePrice,
        stripeRefundId,
        creditsRefunded: String(creditsUsed),
      };
    }

    // Notify watchers of either lead and clean watchedLeads
    const allUsers = await db.select().from(users);
    const notifiedUserIds: string[] = [];
    for (const u of allUsers) {
      const watched = parseJsonArray(u.watchedLeads);
      const watchesSource = watched.includes(sourceRow.id);
      const watchesTarget = watched.includes(targetRow.id);
      if (!watchesSource && !watchesTarget) continue;

      // Remove source from any watchedLeads (it's archived); ensure target stays
      if (watchesSource) {
        const cleaned = watched.filter((id) => id !== sourceRow.id);
        await db.update(users).set({ watchedLeads: cleaned, updatedAt: new Date() }).where(eq(users.id, u.id));
      }

      try {
        await db.insert(notifications).values({
          userId: u.id,
          type: "lead_merged",
          title: "Watched lead merged",
          message: watchesSource && watchesTarget
            ? `Two leads you were watching have been merged. View the combined lead.`
            : watchesSource
              ? `A lead you were watching was merged into another and archived.`
              : `A duplicate lead was merged into a lead you are watching. Services and pricing updated.`,
          leadId: updatedTarget.id,
        });
        notifiedUserIds.push(u.id);
      } catch (e) {
        console.error("[merge] Notification insert failed for user", u.id, e);
      }
    }

    // Also notify the buyer of the source lead (refunded) if not already notified
    if (refundInfo && !notifiedUserIds.includes(refundInfo.userId)) {
      try {
        await db.insert(notifications).values({
          userId: refundInfo.userId,
          type: "lead_merged",
          title: "Lead refunded",
          message: `A lead you purchased was identified as a duplicate and has been refunded ($${refundInfo.amount}).`,
          leadId: updatedTarget.id,
        });
        notifiedUserIds.push(refundInfo.userId);
      } catch (e) {
        console.error("[merge] Buyer refund notification failed:", e);
      }
    }

    // Email the buyer of the source lead about the refund (respects their email pref).
    if (refundInfo) {
      try {
        const [buyer] = await db.select().from(users).where(eq(users.id, refundInfo.userId));
        if (buyer && buyer.email && buyer.emailNotificationsEnabled !== false) {
          // Only report a card refund if Stripe actually executed one for this merge.
          const cashRefunded = refundInfo.stripeRefundId
            ? Math.max(
                0,
                (parseFloat(refundInfo.amount) || 0) - (parseFloat(refundInfo.creditsRefunded) || 0)
              )
            : 0;
          const { sendLeadMergeRefundNotification } = await import("@/server/services/emailNotifications");
          try {
            await sendLeadMergeRefundNotification(buyer.email, {
              contractorName: buyer.firstName ?? null,
              refundAmount: refundInfo.amount,
              creditsRefunded: refundInfo.creditsRefunded,
              stripeRefunded: cashRefunded.toFixed(2),
              sourceLeadId: sourceRow.id,
              targetLeadId: updatedTarget.id,
              targetLead: {
                id: updatedTarget.id,
                city: updatedTarget.city,
                serviceType: updatedTarget.serviceType,
                selectedServices: Array.isArray(updatedTarget.selectedServices)
                  ? (updatedTarget.selectedServices as string[])
                  : null,
                lineItems: updatedTarget.lineItems,
              },
            });
          } catch (e) {
            console.error("[merge] Buyer refund email failed:", e);
          }
        }
      } catch (e) {
        console.error("[merge] Buyer refund email lookup failed:", e);
      }
    }

    console.log(
      `[ADMIN] Merge: source=${sourceRow.id} -> target=${targetRow.id} by ${admin.id}; finalQuote=${mergedFinalQuote.toFixed(2)}; refunded=${refundInfo ? "yes" : "no"}`
    );

    return NextResponse.json({
      success: true,
      lead: updatedTarget,
      targetLeadId: targetRow.id,
      sourceLeadId: sourceRow.id,
      directionSwapped,
      refund: refundInfo,
      notifiedUserCount: notifiedUserIds.length,
    });
  } catch (error) {
    console.error("Error merging leads:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to merge leads" },
      { status: 500 }
    );
  }
}
