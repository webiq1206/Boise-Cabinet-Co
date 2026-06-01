import type { ComplianceDocument, User } from "@shared/schema";

export type ComplianceIssue =
  | "missing_coi"
  | "missing_w9"
  | "coi_pending"
  | "w9_pending"
  | "coi_expired"
  | "coi_expiring_soon"
  | "coi_rejected"
  | "w9_rejected";

export type ComplianceSummary = {
  status: "compliant" | "non_compliant" | "expiring_soon";
  issues: ComplianceIssue[];
  coi: ComplianceDocument | null;
  w9: ComplianceDocument | null;
  coiExpiresAt: Date | null;
  daysUntilCoiExpiry: number | null;
};

const DEFAULT_EXPIRING_WINDOW_DAYS = 30;

export function getCurrentDoc(
  docs: ComplianceDocument[],
  type: "coi" | "w9"
): ComplianceDocument | null {
  return docs.find((d) => d.type === type && d.isCurrent) ?? null;
}

export function computeComplianceSummary(
  docs: ComplianceDocument[],
  expiringWindowDays = DEFAULT_EXPIRING_WINDOW_DAYS
): ComplianceSummary {
  const coi = getCurrentDoc(docs, "coi");
  const w9 = getCurrentDoc(docs, "w9");
  const issues: ComplianceIssue[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let coiExpiresAt: Date | null = null;
  let daysUntilCoiExpiry: number | null = null;

  if (!w9) {
    issues.push("missing_w9");
  } else if (w9.status === "pending_review") {
    issues.push("w9_pending");
  } else if (w9.status === "rejected") {
    issues.push("w9_rejected");
  }

  if (!coi) {
    issues.push("missing_coi");
  } else if (coi.status === "pending_review") {
    issues.push("coi_pending");
  } else if (coi.status === "rejected") {
    issues.push("coi_rejected");
  } else if (coi.status === "approved" && coi.expiresAt) {
    coiExpiresAt = new Date(coi.expiresAt);
    coiExpiresAt.setHours(0, 0, 0, 0);
    daysUntilCoiExpiry = Math.ceil(
      (coiExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilCoiExpiry < 0) {
      issues.push("coi_expired");
    } else if (daysUntilCoiExpiry <= expiringWindowDays) {
      issues.push("coi_expiring_soon");
    }
  }

  const hasBlockingIssue = issues.some((i) =>
    [
      "missing_coi",
      "missing_w9",
      "coi_expired",
      "coi_rejected",
      "w9_rejected",
    ].includes(i)
  );

  const isExpiringSoon = issues.includes("coi_expiring_soon") && !hasBlockingIssue;

  let status: ComplianceSummary["status"] = "compliant";
  if (hasBlockingIssue || issues.includes("coi_pending") || issues.includes("w9_pending")) {
    status = "non_compliant";
  } else if (isExpiringSoon) {
    status = "expiring_soon";
  }

  const approvedCoi =
    coi?.status === "approved" &&
    coi.expiresAt &&
    new Date(coi.expiresAt) >= now;
  const approvedW9 = w9?.status === "approved";

  if (!approvedCoi || !approvedW9) {
    status = "non_compliant";
  } else if (isExpiringSoon) {
    status = "expiring_soon";
  } else {
    status = "compliant";
  }

  return {
    status,
    issues,
    coi,
    w9,
    coiExpiresAt,
    daysUntilCoiExpiry,
  };
}

export function isSubcontractorCompliant(docs: ComplianceDocument[]): boolean {
  return computeComplianceSummary(docs).status === "compliant" ||
    computeComplianceSummary(docs).status === "expiring_soon";
}

export function canPurchaseLeads(docs: ComplianceDocument[]): boolean {
  const summary = computeComplianceSummary(docs);
  return summary.status === "compliant" || summary.status === "expiring_soon";
}

export function canBeAssignedToProject(docs: ComplianceDocument[]): boolean {
  return computeComplianceSummary(docs).status === "compliant";
}

export function formatSubcontractorName(user: User): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : user.email ?? "Unknown";
}
