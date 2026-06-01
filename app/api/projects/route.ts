import { NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { getProjectsForSubcontractor } from "@/server/services/projectService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (!user || (user.role !== "subcontractor" && user.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const projects = await getProjectsForSubcontractor(session.userId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[sub projects GET]", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
