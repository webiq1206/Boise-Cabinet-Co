import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteSettings } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const results = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  for (const row of results) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await request.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));

  if (existing.length > 0) {
    await db.update(siteSettings).set({
      value: String(value),
      updatedAt: new Date(),
      updatedBy: session.userId,
    }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({
      key,
      value: String(value),
      updatedBy: session.userId,
    });
  }

  const updated = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  return NextResponse.json(updated[0]);
}
