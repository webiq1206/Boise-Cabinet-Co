import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  getComplianceDocsForUser,
  wasReminderSentToday,
  wasReminderSentWithinDays,
  logComplianceReminder,
  getComplianceReminderDays,
} from "@/server/services/complianceService";
import { computeComplianceSummary } from "@/lib/compliance/complianceStatus";
import { storage } from "@/server/storage";
import { sendComplianceReminderEmail } from "@/server/services/complianceEmails";

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

function prefsAllowReminder(
  sub: typeof users.$inferSelect,
  docType: string
): boolean {
  const prefs = (sub.notificationPreferences as Record<string, boolean>) ?? {};
  if (docType === "coi" && prefs.coiReminders === false) return false;
  if (docType === "w9" && prefs.w9Reminders === false) return false;
  return true;
}

async function runComplianceReminders() {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  const reminderDays = await getComplianceReminderDays();
  const subs = await db
    .select()
    .from(users)
    .where(eq(users.role, "subcontractor"));

  let sent = 0;

  for (const sub of subs) {
    if (sub.isActive === false) continue;
    if (sub.complianceNotificationsEnabled === false) continue;

    const docs = await getComplianceDocsForUser(sub.id);
    const summary = computeComplianceSummary(docs);

    const reminders: Array<{ docType: string; reminderType: string; message: string; weekly?: boolean }> = [];

    if (summary.issues.includes("missing_coi")) {
      reminders.push({
        docType: "coi",
        reminderType: "missing",
        message: "Your Certificate of Insurance (COI) is missing. Please upload it immediately.",
        weekly: true,
      });
    }
    if (summary.issues.includes("missing_w9")) {
      reminders.push({
        docType: "w9",
        reminderType: "missing",
        message: "Your W-9 form is missing. Please upload it immediately.",
        weekly: true,
      });
    }
    if (summary.issues.includes("coi_expired")) {
      reminders.push({
        docType: "coi",
        reminderType: "expired",
        message: "Your Certificate of Insurance has expired. Please upload a current COI.",
        weekly: true,
      });
    }

    const days = summary.daysUntilCoiExpiry;
    if (days !== null && days >= 0) {
      for (const d of reminderDays) {
        if (days === d) {
          reminders.push({
            docType: "coi",
            reminderType: `expiring_${d}`,
            message: `Your COI expires in ${d} day${d === 1 ? "" : "s"}. Please upload an updated certificate.`,
          });
        }
      }
    }

    for (const reminder of reminders) {
      if (!prefsAllowReminder(sub, reminder.docType)) continue;

      const alreadySent = reminder.weekly
        ? await wasReminderSentWithinDays(sub.id, reminder.docType, reminder.reminderType, 7)
        : await wasReminderSentToday(sub.id, reminder.docType, reminder.reminderType);
      if (alreadySent) continue;

      await storage.createNotification({
        userId: sub.id,
        type: reminder.reminderType.startsWith("expiring")
          ? "compliance_expiring"
          : reminder.reminderType === "expired"
            ? "compliance_expired"
            : "compliance_missing",
        title: "Compliance action required",
        message: reminder.message,
      });

      if (sub.emailNotificationsEnabled !== false) {
        await sendComplianceReminderEmail(sub, reminder.message);
      }

      const admins = await storage.getAllAdmins();
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "compliance_missing",
          title: `Compliance issue: ${sub.company ?? sub.email}`,
          message: reminder.message,
        });
      }

      await logComplianceReminder(sub.id, reminder.docType, reminder.reminderType);
      sent++;
    }
  }

  return NextResponse.json({ success: true, remindersSent: sent });
}

export async function POST(request: NextRequest) {
  const isAuthed = await authenticateCron(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runComplianceReminders();
}

export async function GET(request: NextRequest) {
  const isAuthed = await authenticateCron(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runComplianceReminders();
}
