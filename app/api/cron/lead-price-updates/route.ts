import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  runLeadPriceUpdates,
  notifyPriceDropWatchers,
} from "@/server/services/leadPriceUpdates";

async function authenticateCron(request?: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }

  const session = await getSession();
  if (!session.userId) return false;
  const user = await getUserFromDb(session.userId);
  return user?.role === "admin";
}

async function runJob() {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  const changes = await runLeadPriceUpdates();
  let notificationsSent = 0;

  for (const change of changes) {
    await notifyPriceDropWatchers(change);
    notificationsSent++;
  }

  return NextResponse.json({
    success: true,
    priceUpdates: changes.length,
    watcherNotifications: notificationsSent,
    changes,
  });
}

export async function POST(request: NextRequest) {
  if (!(await authenticateCron(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runJob();
}

export async function GET(request: NextRequest) {
  if (!(await authenticateCron(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runJob();
}
