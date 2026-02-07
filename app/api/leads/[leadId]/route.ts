import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { leadId: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { leadId } = params;
  const body = await request.json();

  const result = await db.select().from(leads).where(eq(leads.id, leadId));
  const lead = result[0];
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  await db.update(leads).set(body).where(eq(leads.id, leadId));
  const updated = await db.select().from(leads).where(eq(leads.id, leadId));

  return NextResponse.json(updated[0]);
}
