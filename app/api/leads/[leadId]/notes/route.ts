import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { recordLeadActivity, actorNameFromUser } from "@/server/services/leadActivity";

function parseNotesArray(val: unknown): Array<{ text: string; addedBy: string; addedAt: string }> {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export async function POST(request: Request, { params }: { params: { leadId: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { leadId } = params;
  const body = await request.json();
  // Accept either { text } or { note } so the timeline and legacy notes UI agree.
  const text = body?.text ?? body?.note;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Note text is required" }, { status: 400 });
  }

  const result = await db.select().from(leads).where(eq(leads.id, leadId));
  const lead = result[0];
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const existingNotes = parseNotesArray(lead.notes);
  const addedBy = actorNameFromUser(user);

  existingNotes.push({
    text: text.trim(),
    addedBy,
    addedAt: new Date().toISOString(),
  });

  await db.update(leads).set({ notes: existingNotes }).where(eq(leads.id, leadId));
  const updated = await db.select().from(leads).where(eq(leads.id, leadId));

  // Mirror the note into the unified activity timeline.
  await recordLeadActivity({
    leadId,
    type: "note",
    message: text.trim(),
    actorId: user.id,
    actorName: addedBy,
  });

  return NextResponse.json(updated[0]);
}
