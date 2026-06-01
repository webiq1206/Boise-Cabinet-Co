import { NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { getAdminComplianceDashboard } from "@/server/services/complianceService";
import { getContractStats } from "@/server/services/contractService";

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

    const [compliance, contracts] = await Promise.all([
      getAdminComplianceDashboard(),
      getContractStats(),
    ]);

    const rows = compliance.contractors.map(({ user: sub, summary }) => ({
      name: [sub.firstName, sub.lastName].filter(Boolean).join(" ") || sub.email,
      email: sub.email,
      company: sub.company,
      status: summary.status,
      issues: summary.issues.join("; "),
      coiExpires: summary.coiExpiresAt
        ? new Date(summary.coiExpiresAt).toLocaleDateString()
        : "",
    }));

    const header = "Name,Email,Company,Status,Issues,COI Expires\n";
    const csv =
      header +
      rows
        .map((r) =>
          [r.name, r.email, r.company, r.status, r.issues, r.coiExpires]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const contractHeader = "\n\nUnsigned Contracts," + contracts.unsigned;
    const fullCsv = csv + contractHeader;

    return new NextResponse(fullCsv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="compliance-report.csv"',
      },
    });
  } catch (error) {
    console.error("[compliance export]", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
