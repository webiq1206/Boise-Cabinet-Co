import { db } from "@/lib/db";
import { leads, users, notifications } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "../storage";
import {
  sendLeadPriceDropEmail,
  sendContractorNewLeadAvailable,
  sendAdminAutoDeclineNotification,
} from "./emailNotifications";

export type LeadPriceChange = {
  leadId: string;
  city: string;
  serviceType: string;
  oldPrice: string;
  newPrice: string;
};

export async function runLeadPriceUpdates(): Promise<LeadPriceChange[]> {
  if (!db) return [];

  const now = new Date();
  const changes: LeadPriceChange[] = [];
  const availableLeads = await db.select().from(leads).where(eq(leads.status, "available"));

  for (const lead of availableLeads) {
    if (!lead.lastPriceUpdate) continue;

    const hoursSinceUpdate =
      (now.getTime() - new Date(lead.lastPriceUpdate).getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 24) continue;

    const currentPrice = parseFloat(lead.currentLeadPrice as string);
    const basePrice = parseFloat(lead.baseLeadPrice as string);
    const ratePercent = Math.max(0, parseFloat(String(lead.priceReductionRate || "1.50")));
    const dailyFactor = Math.max(0, Math.min(1, 1 - ratePercent / 100));
    const minPrice = basePrice * 0.2;
    const daysSinceUpdate = Math.floor(
      (now.getTime() - new Date(lead.lastPriceUpdate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const raw = currentPrice * Math.pow(dailyFactor, daysSinceUpdate);
    const floored = Math.max(raw, minPrice);
    const minRoundedFloor = Math.max(10, Math.ceil(minPrice));
    const finalPrice = Math.max(Math.floor(floored), minRoundedFloor);
    const newPriceStr = finalPrice.toFixed(2);

    if (newPriceStr === String(lead.currentLeadPrice)) continue;

    await db
      .update(leads)
      .set({
        currentLeadPrice: newPriceStr,
        lastPriceUpdate: now,
        updatedAt: now,
      })
      .where(eq(leads.id, lead.id));

    changes.push({
      leadId: lead.id,
      city: lead.city,
      serviceType: lead.serviceType,
      oldPrice: String(lead.currentLeadPrice),
      newPrice: newPriceStr,
    });
  }

  return changes;
}

export async function notifyPriceDropWatchers(change: LeadPriceChange): Promise<void> {
  if (!db) return;

  const subs = await db.select().from(users).where(eq(users.role, "subcontractor"));

  for (const sub of subs) {
    const watched = (sub.watchedLeads as string[] | null) || [];
    if (!watched.includes(change.leadId)) continue;

    const prefs = (sub.notificationPreferences as Record<string, boolean>) ?? {};
    if (prefs.notifyPriceDrops === false) continue;
    if (sub.emailNotificationsEnabled === false) continue;
    if (!sub.email) continue;

    await storage.createNotification({
      userId: sub.id,
      type: "lead_price_drop",
      title: "Lead price drop",
      message: `A watched lead in ${change.city} dropped to $${parseFloat(change.newPrice).toFixed(2)}.`,
      leadId: change.leadId,
    });

    try {
      await sendLeadPriceDropEmail(sub.email, change);
    } catch (err) {
      console.error(`[price-drop] Email failed for user ${sub.id}:`, err);
    }
  }
}

export async function runAutoDeclinePendingLeads(): Promise<number> {
  if (!db) return 0;

  const now = Date.now();
  const pending = await db.select().from(leads).where(eq(leads.status, "pending_admin"));
  let declined = 0;

  for (const lead of pending) {
    const hoursPending = (now - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursPending < 48) continue;

    await db
      .update(leads)
      .set({
        status: "available",
        adminDeclined: true,
        adminReviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, lead.id));

    const [updated] = await db.select().from(leads).where(eq(leads.id, lead.id));

    try {
      await sendAdminAutoDeclineNotification({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        city: lead.city,
        serviceType: lead.serviceType,
        finalQuote: lead.finalQuote || "0",
        address: lead.address || undefined,
        hoursPending,
      });
    } catch (err) {
      console.error(`[auto-decline] Admin notify failed for lead ${lead.id}:`, err);
    }

    const subs = await db.select().from(users).where(eq(users.role, "subcontractor"));
    for (const sub of subs) {
      await db.insert(notifications).values({
        userId: sub.id,
        type: "new_lead",
        title: "New Lead Available",
        message: `A new ${lead.serviceType} lead in ${lead.city} is now available.`,
        leadId: lead.id,
      });

      if (sub.email && sub.emailNotificationsEnabled !== false) {
        sendContractorNewLeadAvailable(sub.email, updated as any).catch(() => {});
      }
    }

    declined++;
  }

  return declined;
}
