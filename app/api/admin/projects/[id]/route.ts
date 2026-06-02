import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import {
  getProjectById,
  updateProject,
  getProjectAssignments,
  assignSubcontractorToProject,
  removeProjectAssignment,
  getChangeOrdersForProject,
  createChangeOrder,
  updateChangeOrderStatus,
  getEntityDocuments,
  addProjectActivityNote,
  getAdminProjectInvoices,
  getAdminProjectMessages,
  createProjectInvoice,
  updateProjectInvoice,
  sendAdminProjectMessage,
  linkCustomerToProject,
} from "@/server/services/projectService";
import { storage } from "@/server/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [assignments, changeOrders, documents, invoices, messages] = await Promise.all([
      getProjectAssignments(params.id),
      getChangeOrdersForProject(params.id),
      getEntityDocuments("project", params.id),
      getAdminProjectInvoices(params.id),
      getAdminProjectMessages(params.id),
    ]);

    return NextResponse.json({ project, assignments, changeOrders, documents, invoices, messages });
  } catch (error) {
    console.error("[admin project GET]", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const project = await updateProject(params.id, body);
    return NextResponse.json(project);
  } catch (error) {
    console.error("[admin project PATCH]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { action } = body;

    switch (action) {
      case "assign": {
        const assignment = await assignSubcontractorToProject(
          params.id,
          body.subcontractorId,
          session.userId,
          body.role ?? "primary"
        );
        const project = await getProjectById(params.id);
        const sub = await storage.getUser(body.subcontractorId);
        if (sub && project) {
          await storage.createNotification({
            userId: body.subcontractorId,
            type: "project_assigned",
            title: "New project assignment",
            message: `You have been assigned to ${project.title}`,
            projectId: params.id,
          });
          if (sub.emailNotificationsEnabled !== false) {
            const { sendProjectAssignedEmail } = await import("@/server/services/complianceEmails");
            await sendProjectAssignedEmail(sub, project.title);
          }
        }
        return NextResponse.json(assignment);
      }
      case "remove_assignment": {
        await removeProjectAssignment(body.assignmentId, session.userId);
        return NextResponse.json({ success: true });
      }
      case "add_note": {
        await addProjectActivityNote(params.id, body.text, session.userId);
        return NextResponse.json({ success: true });
      }
      case "create_change_order": {
        const order = await createChangeOrder(params.id, {
          title: body.title,
          description: body.description,
          amountDelta: String(body.amountDelta ?? 0),
          scopeDelta: body.scopeDelta,
          createdBy: session.userId,
        });
        return NextResponse.json(order);
      }
      case "update_change_order": {
        const order = await updateChangeOrderStatus(
          body.changeOrderId,
          body.status,
          session.userId
        );
        return NextResponse.json(order);
      }
      case "create_invoice": {
        const invoice = await createProjectInvoice(params.id, {
          description: body.description,
          amount: String(body.amount),
          dueDate: body.dueDate,
          status: "draft",
        });
        return NextResponse.json(invoice);
      }
      case "update_invoice": {
        const invoice = await updateProjectInvoice(body.invoiceId, {
          status: body.status,
        });
        return NextResponse.json(invoice);
      }
      case "send_message": {
        const message = await sendAdminProjectMessage(
          params.id,
          session.userId,
          body.body,
        );
        return NextResponse.json(message);
      }
      case "link_customer": {
        const result = await linkCustomerToProject(params.id);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[admin project POST]", error);
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
