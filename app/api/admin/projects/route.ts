import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import {
  getAllProjects,
  getProjectById,
  updateProject,
  convertLeadToProject,
  getProjectAssignments,
  assignSubcontractorToProject,
  removeProjectAssignment,
  getChangeOrdersForProject,
  createChangeOrder,
  updateChangeOrderStatus,
  getEntityDocuments,
  addProjectActivityNote,
} from "@/server/services/projectService";

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

    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const projects = await getAllProjects(status ? { status } : undefined);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[admin projects GET]", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
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
    const { leadId, ...projectData } = body;

    if (leadId) {
      const project = await convertLeadToProject(leadId, session.userId);
      return NextResponse.json(project);
    }

    const { createProject } = await import("@/server/services/projectService");
    const project = await createProject({
      ...projectData,
      createdBy: session.userId,
      status: projectData.status ?? "draft",
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[admin projects POST]", error);
    const message = error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
