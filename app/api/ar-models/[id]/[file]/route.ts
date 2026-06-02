import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { arModels } from "@/shared/schema";
import { purgeExpiredArModels } from "@/lib/db/arModels";

export const runtime = "nodejs";

/**
 * Serve a previously stored AR model as binary so native device viewers can
 * fetch it over HTTPS. `file` is either `model.glb` (Android Scene Viewer) or
 * `model.usdz` (iOS AR Quick Look); the .glb/.usdz extension matters to those
 * viewers, so it is part of the URL path.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; file: string } },
) {
  const { id, file } = params;

  const isGlb = file === "model.glb";
  const isUsdz = file === "model.usdz";
  if (!isGlb && !isUsdz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!db) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  try {
    // Best-effort cleanup of any expired previews on each fetch.
    void purgeExpiredArModels();

    const rows = await db
      .select()
      .from(arModels)
      .where(eq(arModels.id, id))
      .limit(1);
    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Treat expired previews as gone even if the purge hasn't removed them yet.
    if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const base64 = isGlb ? row.glb : row.usdz;
    if (!base64) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = Buffer.from(base64, "base64");
    const contentType = isGlb ? "model/gltf-binary" : "model/vnd.usdz+zip";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=86400",
        "Content-Disposition": `inline; filename="${file}"`,
      },
    });
  } catch (error) {
    console.error("Serve AR model error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
