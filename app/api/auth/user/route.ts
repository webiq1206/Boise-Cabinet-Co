import { NextResponse } from "next/server";
import { getSession, getUserFromDb, sanitizeUser, clearAuthHint } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session.userId) {
      await clearAuthHint();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.expiresAt && session.expiresAt < Date.now() / 1000) {
      session.destroy();
      await clearAuthHint();
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (!user) {
      await clearAuthHint();
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    return NextResponse.json(sanitizeUser(user));
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 });
  }
}
