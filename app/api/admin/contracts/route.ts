import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import {
  getAllContractTemplates,
  upsertContractTemplate,
  createContract,
  sendContract,
  getContractsForProject,
  getContractById,
  voidContract,
  seedDefaultContractTemplate,
} from "@/server/services/contractService";
import { storage } from "@/server/storage";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await seedDefaultContractTemplate();

    const projectId = request.nextUrl.searchParams.get("projectId");
    if (projectId) {
      const contracts = await getContractsForProject(projectId);
      return NextResponse.json(contracts);
    }

    const templates = await getAllContractTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error("[admin contracts GET]", error);
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
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (body.action === "save_template") {
      const template = await upsertContractTemplate(body);
      return NextResponse.json(template);
    }

    if (body.action === "create") {
      const contract = await createContract({
        projectId: body.projectId,
        subcontractorId: body.subcontractorId,
        templateId: body.templateId,
        title: body.title,
        bodyHtml: body.bodyHtml,
        createdBy: session.userId,
      });
      return NextResponse.json(contract);
    }

    if (body.action === "send") {
      const contract = await sendContract(body.contractId);
      if (contract) {
        const sub = await storage.getUser(contract.subcontractorId);
        await storage.createNotification({
          userId: contract.subcontractorId,
          type: "contract_sent",
          title: "Contract ready for signature",
          message: `Please review and sign: ${contract.title}`,
          projectId: contract.projectId,
          contractId: contract.id,
        });
        if (sub?.emailNotificationsEnabled !== false && sub) {
          const { sendContractSentEmail } = await import("@/server/services/complianceEmails");
          await sendContractSentEmail(sub, contract.title);
        }
      }
      return NextResponse.json(contract);
    }

    if (body.action === "void") {
      const contract = await voidContract(body.contractId);
      return NextResponse.json(contract);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[admin contracts POST]", error);
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
