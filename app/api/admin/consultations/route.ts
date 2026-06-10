import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { consultationRequests } from "@/shared/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const rows = await db
    .select()
    .from(consultationRequests)
    .orderBy(desc(consultationRequests.createdAt));

  return NextResponse.json(rows);
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "contacted", "converted", "closed"]),
});

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [updated] = await db
    .update(consultationRequests)
    .set({ status: parsed.data.status })
    .where(eq(consultationRequests.id, parsed.data.id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
