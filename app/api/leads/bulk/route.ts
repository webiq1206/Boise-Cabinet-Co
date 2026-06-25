import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Batch lead status updates so bulk admin actions are a single request (one
 * toast) instead of a client-side loop. Supports accept, archive, and a generic
 * set_status used to undo a prior bulk action.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const { action, leadIds, status } = body as {
    action?: string;
    leadIds?: unknown;
    status?: string;
  };

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: "leadIds is required" }, { status: 400 });
  }
  const ids = leadIds.filter((id): id is string => typeof id === "string");
  if (ids.length === 0) {
    return NextResponse.json({ error: "No valid leadIds" }, { status: 400 });
  }

  let patch: Record<string, unknown>;
  if (action === "accept") {
    patch = {
      status: "accepted",
      adminReviewedBy: session.userId,
      adminReviewedAt: new Date(),
      adminDeclined: false,
      updatedAt: new Date(),
    };
  } else if (action === "archive") {
    patch = { status: "archived", updatedAt: new Date() };
  } else if (action === "set_status" && typeof status === "string") {
    patch = { status, updatedAt: new Date() };
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await db.update(leads).set(patch).where(inArray(leads.id, ids));

  console.log(`[ADMIN] Bulk ${action} on ${ids.length} leads by ${session.userId}`);

  return NextResponse.json({ success: true, updated: ids.length, action });
}
