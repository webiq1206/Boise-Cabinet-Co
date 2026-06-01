import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { storage } from "@/server/storage";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await storage.getNotificationsByUser(session.userId);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[notifications GET]", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
