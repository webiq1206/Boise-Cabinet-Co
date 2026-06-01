import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storage } from "@/server/storage";

export async function POST() {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await storage.markAllNotificationsAsRead(session.userId);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("[notifications mark-all-read]", error);
    return NextResponse.json({ error: "Failed to mark notifications" }, { status: 500 });
  }
}
