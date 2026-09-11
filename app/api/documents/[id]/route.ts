import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import {
  getEntityDocumentById,
  deleteEntityDocument,
} from "@/server/services/projectService";

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const doc = await getEntityDocumentById(params.id);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteEntityDocument(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[documents DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
