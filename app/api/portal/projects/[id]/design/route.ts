import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerProject } from "@/server/services/portalService";
import { resolveProjectDesign } from "@/lib/catalog/resolveProjectSelections";
import { projectSelectionsToDisplayRows } from "@/lib/catalog/selectionDisplay";

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  const customerId = user?.role === "customer" ? user.id : null;

  const project = await getCustomerProject(params.id, customerId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const resolved = await resolveProjectDesign(params.id);
  if (!resolved) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  return NextResponse.json({
    project,
    design: {
      designId: resolved.designId,
      designName: resolved.designName,
      source: resolved.source,
      selections: resolved.selections,
      rows: projectSelectionsToDisplayRows(resolved.selections),
    },
  });
}
