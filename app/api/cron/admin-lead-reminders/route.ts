import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import {
  sendAdminDailyDigest,
  sendAdminReminder,
  sendAdminUrgentReminder,
} from "@/server/services/emailNotifications";
import { getAdminRecipientEmails } from "@/server/services/emailLayout";
import { runAutoDeclinePendingLeads } from "@/server/services/leadPriceUpdates";

async function authenticateCron(request?: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }

  const session = await getSession();
  if (!session.userId) return false;
  const user = await getUserFromDb(session.userId);
  return user?.role === "admin";
}

function hoursPending(createdAt: Date | string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
}

async function runJob() {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  const autoDeclined = await runAutoDeclinePendingLeads();

  const pending = await db.select().from(leads).where(eq(leads.status, "pending_admin"));

  const leads24hList = pending.filter((l) => {
    const h = hoursPending(l.createdAt);
    return h >= 24 && h < 48;
  });
  const leads48hList = pending.filter((l) => hoursPending(l.createdAt) >= 48);

  const adminEmails = await getAdminRecipientEmails();

  let digestSent = 0;
  let remindersSent = 0;

  if (adminEmails.length > 0) {
    for (const email of adminEmails) {
      await sendAdminDailyDigest(email, {
        totalPending: pending.length,
        leads24h: leads24hList.length,
        leads48h: leads48hList.length,
        pendingLeads: pending,
        leads24hList,
        leads48hList,
      });
      digestSent++;
    }

    for (const lead of pending) {
      const hours = hoursPending(lead.createdAt);
      if (hours < 24) continue;

      const payload = {
        id: lead.id,
        name: lead.name,
        city: lead.city,
        serviceType: lead.serviceType,
        hoursPending: hours,
        finalQuote: lead.finalQuote || "0",
        address: lead.address || undefined,
        email: lead.email,
        phone: lead.phone || undefined,
      };

      for (const email of adminEmails) {
        if (hours >= 48) {
          await sendAdminUrgentReminder(email, payload);
        } else {
          await sendAdminReminder(email, payload);
        }
        remindersSent++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    autoDeclined,
    digestSent,
    remindersSent,
    pendingCount: pending.length,
  });
}

export async function POST(request: NextRequest) {
  if (!(await authenticateCron(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runJob();
}

export async function GET(request: NextRequest) {
  if (!(await authenticateCron(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runJob();
}
