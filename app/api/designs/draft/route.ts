import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cabinetDesigns } from "@/shared/schema";

/**
 * Anonymous autosave drafts for the Design Studio.
 *
 * Keyed by a client-generated `draftId` (stored in the row's unique
 * `shareToken` column) so a visitor can refresh, or resume on another device
 * via `/design-studio?draft=<id>`, without logging in. The full reopenable
 * snapshot is stored verbatim under `layoutJson.snapshot` so partial designs
 * (no room/layout yet) round-trip losslessly.
 */
const draftSchema = z.object({
  draftId: z.string().min(8).max(128),
  snapshot: z.record(z.unknown()),
  projectId: z.string().min(1).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, snapshot, projectId } = draftSchema.parse(body);

    if (!db) {
      // No database configured: the client keeps its localStorage mirror.
      return NextResponse.json({ ok: true, id: draftId, local: true });
    }

    const roomType =
      (typeof snapshot.roomType === "string" && snapshot.roomType) || "unset";
    const collectionId =
      (typeof snapshot.collection === "string" && snapshot.collection) ||
      "custom";
    const name =
      (typeof snapshot.designName === "string" && snapshot.designName) ||
      "Autosaved design";
    const photoUrl =
      typeof snapshot.photoUrl === "string" ? snapshot.photoUrl : null;

    const existing = await db
      .select({ id: cabinetDesigns.id })
      .from(cabinetDesigns)
      .where(eq(cabinetDesigns.shareToken, draftId))
      .limit(1);

    const values = {
      roomType,
      collectionId,
      name,
      photoUrl: photoUrl ?? undefined,
      layoutJson: { snapshot },
      styleJson: {},
      status: "draft" as const,
      projectId: projectId ?? undefined,
      updatedAt: new Date(),
    };

    if (existing[0]) {
      await db
        .update(cabinetDesigns)
        .set(values)
        .where(eq(cabinetDesigns.id, existing[0].id));
      return NextResponse.json({ ok: true, id: existing[0].id, draftId });
    }

    const [row] = await db
      .insert(cabinetDesigns)
      .values({ ...values, shareToken: draftId })
      .returning({ id: cabinetDesigns.id });

    return NextResponse.json({ ok: true, id: row?.id ?? null, draftId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Save draft error:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const draftId = request.nextUrl.searchParams.get("draftId");
  if (!draftId) {
    return NextResponse.json({ error: "draftId required" }, { status: 400 });
  }
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  try {
    const rows = await db
      .select()
      .from(cabinetDesigns)
      .where(eq(cabinetDesigns.shareToken, draftId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    const layoutJson = (row.layoutJson ?? {}) as Record<string, unknown>;
    const snapshot = layoutJson.snapshot ?? null;
    return NextResponse.json({
      draftId,
      snapshot,
      updatedAt: row.updatedAt,
    });
  } catch (error) {
    console.error("Load draft error:", error);
    return NextResponse.json(
      { error: "Failed to load draft" },
      { status: 500 },
    );
  }
}
