import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { uploadFile } from "@/lib/storage/blob";
import { createEntityDocument } from "@/server/services/projectService";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = formData.get("type") as string | null;
    const entityType = formData.get("entityType") as string | null;
    const entityId = formData.get("entityId") as string | null;
    const category = (formData.get("category") as string) || "attachment";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (uploadType === "entity") {
      if (!entityType || !entityId) {
        return NextResponse.json(
          { error: "entityType and entityId required" },
          { status: 400 }
        );
      }

      if (user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const key = `${entityType}/${entityId}/${Date.now()}-${file.name}`;
      const fileUrl = await uploadFile(key, buffer, file.type);

      const doc = await createEntityDocument({
        entityType,
        entityId,
        category,
        fileUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        uploadedBy: session.userId,
      });

      return NextResponse.json(doc);
    }

    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  } catch (error) {
    console.error("[documents upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
