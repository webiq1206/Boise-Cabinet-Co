import { db } from "@/lib/db";
import {
  complianceDocuments,
  complianceReminderLog,
  users,
  type ComplianceDocument,
  type InsertComplianceDocument,
  type User,
} from "@shared/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import {
  computeComplianceSummary,
  type ComplianceSummary,
} from "@/lib/compliance/complianceStatus";

export async function getComplianceDocsForUser(
  userId: string
): Promise<ComplianceDocument[]> {
  if (!db) return [];
  return db
    .select()
    .from(complianceDocuments)
    .where(eq(complianceDocuments.userId, userId))
    .orderBy(desc(complianceDocuments.uploadedAt));
}

export async function getComplianceSummaryForUser(
  userId: string,
  expiringWindowDays?: number
): Promise<ComplianceSummary> {
  const docs = await getComplianceDocsForUser(userId);
  return computeComplianceSummary(docs, expiringWindowDays);
}

export async function uploadComplianceDocument(
  data: InsertComplianceDocument
): Promise<ComplianceDocument> {
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(complianceDocuments)
    .where(
      and(
        eq(complianceDocuments.userId, data.userId),
        eq(complianceDocuments.type, data.type),
        eq(complianceDocuments.isCurrent, true)
      )
    );

  const nextVersion =
    existing.length > 0 ? (existing[0].version ?? 1) + 1 : 1;

  if (existing.length > 0) {
    await db
      .update(complianceDocuments)
      .set({ isCurrent: false })
      .where(
        and(
          eq(complianceDocuments.userId, data.userId),
          eq(complianceDocuments.type, data.type),
          eq(complianceDocuments.isCurrent, true)
        )
      );
  }

  const [doc] = await db
    .insert(complianceDocuments)
    .values({ ...data, version: nextVersion, isCurrent: true })
    .returning();

  await refreshUserComplianceStatus(data.userId);
  return doc;
}

export async function reviewComplianceDocument(
  docId: string,
  adminId: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<ComplianceDocument | null> {
  if (!db) throw new Error("Database not available");

  const [doc] = await db
    .update(complianceDocuments)
    .set({
      status: action === "approve" ? "approved" : "rejected",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: action === "reject" ? rejectionReason ?? "Rejected" : null,
    })
    .where(eq(complianceDocuments.id, docId))
    .returning();

  if (doc) {
    await refreshUserComplianceStatus(doc.userId);
  }
  return doc ?? null;
}

export async function refreshUserComplianceStatus(userId: string): Promise<void> {
  if (!db) return;
  const summary = await getComplianceSummaryForUser(userId);
  await db
    .update(users)
    .set({ complianceStatus: summary.status, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export type AdminComplianceDashboard = {
  missingCoi: number;
  missingW9: number;
  expiring30: number;
  expiring14: number;
  expiring7: number;
  expired: number;
  pendingReview: number;
  compliant: number;
  contractors: Array<{
    user: User;
    summary: ComplianceSummary;
  }>;
};

export async function getAdminComplianceDashboard(
  expiringWindowDays = 30
): Promise<AdminComplianceDashboard> {
  if (!db) {
    return {
      missingCoi: 0,
      missingW9: 0,
      expiring30: 0,
      expiring14: 0,
      expiring7: 0,
      expired: 0,
      pendingReview: 0,
      compliant: 0,
      contractors: [],
    };
  }

  const subs = await db
    .select()
    .from(users)
    .where(and(eq(users.role, "subcontractor"), eq(users.isActive, true)));

  const dashboard: AdminComplianceDashboard = {
    missingCoi: 0,
    missingW9: 0,
    expiring30: 0,
    expiring14: 0,
    expiring7: 0,
    expired: 0,
    pendingReview: 0,
    compliant: 0,
    contractors: [],
  };

  for (const sub of subs) {
    const docs = await getComplianceDocsForUser(sub.id);
    const summary = computeComplianceSummary(docs, expiringWindowDays);
    dashboard.contractors.push({ user: sub, summary });

    if (summary.issues.includes("missing_coi")) dashboard.missingCoi++;
    if (summary.issues.includes("missing_w9")) dashboard.missingW9++;
    if (summary.issues.includes("coi_expired")) dashboard.expired++;
    if (summary.issues.includes("coi_pending") || summary.issues.includes("w9_pending")) {
      dashboard.pendingReview++;
    }
    if (summary.status === "compliant") dashboard.compliant++;

    const days = summary.daysUntilCoiExpiry;
    if (days !== null && days >= 0) {
      if (days <= 30) dashboard.expiring30++;
      if (days <= 14) dashboard.expiring14++;
      if (days <= 7) dashboard.expiring7++;
    }
  }

  return dashboard;
}

export async function wasReminderSentToday(
  userId: string,
  documentType: string,
  reminderType: string
): Promise<boolean> {
  if (!db) return false;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const rows = await db
    .select()
    .from(complianceReminderLog)
    .where(
      and(
        eq(complianceReminderLog.userId, userId),
        eq(complianceReminderLog.documentType, documentType),
        eq(complianceReminderLog.reminderType, reminderType),
        gte(complianceReminderLog.sentAt, startOfDay)
      )
    )
    .limit(1);

  return rows.length > 0;
}

export async function wasReminderSentWithinDays(
  userId: string,
  documentType: string,
  reminderType: string,
  withinDays: number
): Promise<boolean> {
  if (!db) return false;
  const since = new Date();
  since.setDate(since.getDate() - withinDays);

  const rows = await db
    .select()
    .from(complianceReminderLog)
    .where(
      and(
        eq(complianceReminderLog.userId, userId),
        eq(complianceReminderLog.documentType, documentType),
        eq(complianceReminderLog.reminderType, reminderType),
        gte(complianceReminderLog.sentAt, since)
      )
    )
    .limit(1);

  return rows.length > 0;
}

export async function logComplianceReminder(
  userId: string,
  documentType: string,
  reminderType: string
): Promise<void> {
  if (!db) return;
  await db.insert(complianceReminderLog).values({
    userId,
    documentType,
    reminderType,
  });
}

export async function getComplianceReminderDays(): Promise<number[]> {
  if (!db) return [30, 14, 7];
  const { siteSettings } = await import("@shared/schema");
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "compliance_reminder_days"))
    .limit(1);

  if (rows.length === 0) return [30, 14, 7];
  try {
    const parsed = JSON.parse(rows[0].value);
    return Array.isArray(parsed) ? parsed : [30, 14, 7];
  } catch {
    return [30, 14, 7];
  }
}
