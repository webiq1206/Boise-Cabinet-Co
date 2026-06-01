import { NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { getAdminComplianceDashboard } from "@/server/services/complianceService";
import { getContractStats } from "@/server/services/contractService";
import { getProjectStats } from "@/server/services/projectService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [compliance, contracts, projects] = await Promise.all([
      getAdminComplianceDashboard(),
      getContractStats(),
      getProjectStats(),
    ]);

    return NextResponse.json({ compliance, contracts, projects });
  } catch (error) {
    console.error("[admin compliance dashboard]", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
