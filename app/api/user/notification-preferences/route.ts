import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { getSession, getUserFromDb } from "@/lib/auth";
import { z } from "zod";

const notificationPrefsSchema = z.object({
  notifyNewLeads: z.boolean().optional(),
  notifyPriceDrops: z.boolean().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromDb(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = notificationPrefsSchema.parse(body);

    let emailEnabled: boolean | undefined;

    if (parsed.notifyNewLeads !== undefined) {
      emailEnabled = parsed.notifyNewLeads;
    } else if (parsed.emailNotificationsEnabled !== undefined) {
      emailEnabled = parsed.emailNotificationsEnabled;
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (emailEnabled !== undefined) {
      updateData.emailNotificationsEnabled = emailEnabled;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.userId))
      .returning();

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update preferences" },
      { status: 500 }
    );
  }
}
