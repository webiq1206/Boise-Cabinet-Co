import { getSession, getUserFromDb } from "@/lib/auth";
import { NextResponse } from "next/server";

/** Server-side admin gate for outreach API routes. */
export async function requireAdmin() {
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
