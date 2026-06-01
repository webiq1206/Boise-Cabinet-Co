import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import {
  getComplianceDocsForUser,
  getComplianceSummaryForUser,
} from "@/server/services/complianceService";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userIdParam = request.nextUrl.searchParams.get("userId");
    const targetUserId =
      user.role === "admin" && userIdParam ? userIdParam : session.userId;

    if (user.role !== "admin" && targetUserId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const docs = await getComplianceDocsForUser(targetUserId);
    const summary = await getComplianceSummaryForUser(targetUserId);

    return NextResponse.json({ docs, summary });
  } catch (error) {
    console.error("[compliance GET]", error);
    return NextResponse.json({ error: "Failed to fetch compliance" }, { status: 500 });
  }
}
