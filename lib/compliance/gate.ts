import { getComplianceDocsForUser } from "@/server/services/complianceService";
import { canPurchaseLeads } from "@/lib/compliance/complianceStatus";

export async function assertSubcontractorCanPurchase(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const docs = await getComplianceDocsForUser(userId);
  if (!canPurchaseLeads(docs)) {
    return {
      allowed: false,
      reason:
        "Compliance documents required. Please upload an approved COI and W-9 before purchasing leads.",
    };
  }
  return { allowed: true };
}
