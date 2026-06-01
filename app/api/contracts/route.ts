import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import {
  getContractsForSubcontractor,
  getContractById,
  signContract,
} from "@/server/services/contractService";
import { storage } from "@/server/storage";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "admin") {
      const { getContractStats } = await import("@/server/services/contractService");
      const stats = await getContractStats();
      return NextResponse.json(stats);
    }

    const contracts = await getContractsForSubcontractor(session.userId);
    return NextResponse.json(contracts);
  } catch (error) {
    console.error("[contracts GET]", error);
    return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    if (body.action === "sign") {
      const contract = await getContractById(body.contractId);
      if (!contract) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }

      if (
        user.role !== "admin" &&
        contract.subcontractorId !== session.userId
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (!body.signature?.trim()) {
        return NextResponse.json({ error: "Signature required" }, { status: 400 });
      }

      const rawIp =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const ip = rawIp.split(",")[0].trim();
      const userAgent = request.headers.get("user-agent") || "unknown";

      const signed = await signContract(
        body.contractId,
        body.signature,
        ip,
        userAgent
      );

      if (signed) {
        const admins = await storage.getAllAdmins();
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: "contract_signed",
            title: "Contract signed",
            message: `${body.signature} signed ${signed.title}`,
            projectId: signed.projectId,
            contractId: signed.id,
          });
        }
      }

      return NextResponse.json(signed);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[contracts POST]", error);
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
