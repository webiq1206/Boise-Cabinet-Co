import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (session.expiresAt && session.expiresAt < Date.now() / 1000) {
      session.destroy();
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const body = await request.json();
    const { signature, version } = body;

    if (!signature || typeof signature !== "string" || signature.trim().length === 0) {
      return NextResponse.json({ error: "Signature is required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    const rawClientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ipAddress = rawClientIp.split(",")[0].trim();
    const userAgent = request.headers.get("user-agent") || "unknown";

    const userId = session.userId;
    const user = await getUserFromDb(userId);

    const agreementData = {
      agreementAccepted: true,
      agreementAcceptedAt: new Date(),
      agreementSignature: signature.trim(),
      agreementSignatureIp: ipAddress,
      agreementSignatureUserAgent: userAgent,
      agreementVersion: version || "1.0",
    };

    if (!user) {
      await db.insert(users).values({
        id: userId,
        email: session.claims?.email || null,
        firstName: session.claims?.first_name || null,
        lastName: session.claims?.last_name || null,
        profileImageUrl: session.claims?.profile_image_url || null,
        role: "customer",
        ...agreementData,
      });
    } else {
      await db
        .update(users)
        .set(agreementData)
        .where(eq(users.id, userId));
    }

    const updatedUser = await getUserFromDb(userId);
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user agreement" }, { status: 500 });
    }
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[accept-agreement] Error:", error);
    return NextResponse.json({ error: "Failed to accept agreement" }, { status: 500 });
  }
}
