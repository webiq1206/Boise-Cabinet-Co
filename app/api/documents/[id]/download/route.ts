import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { getEntityDocumentById } from "@/server/services/projectService";

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
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let fileUrl: string | null = null;
    let fileName = "document";

    const doc = await getEntityDocumentById(params.id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    fileUrl = doc.fileUrl;
    fileName = doc.fileName;

    if (!fileUrl) {
      return NextResponse.json({ error: "File not available" }, { status: 404 });
    }

    if (fileUrl.startsWith("http")) {
      return NextResponse.redirect(fileUrl);
    }

    return NextResponse.redirect(new URL(fileUrl, _request.url));
  } catch (error) {
    console.error("[documents download]", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
