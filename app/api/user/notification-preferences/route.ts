import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getSession, getUserFromDb, sanitizeUser } from "@/lib/auth";
import { z } from "zod";

const notificationPrefsSchema = z.object({
  notifyNewLeads: z.boolean().optional(),
  notifyPriceDrops: z.boolean().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  complianceNotificationsEnabled: z.boolean().optional(),
  coiReminders: z.boolean().optional(),
  w9Reminders: z.boolean().optional(),
  contractReminders: z.boolean().optional(),
  leadEmails: z.boolean().optional(),
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

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.emailNotificationsEnabled !== undefined) {
      updateData.emailNotificationsEnabled = parsed.emailNotificationsEnabled;
    } else if (parsed.notifyNewLeads !== undefined) {
      updateData.emailNotificationsEnabled = parsed.notifyNewLeads;
    } else if (parsed.leadEmails !== undefined) {
      updateData.emailNotificationsEnabled = parsed.leadEmails;
    }

    if (parsed.complianceNotificationsEnabled !== undefined) {
      updateData.complianceNotificationsEnabled = parsed.complianceNotificationsEnabled;
    }

    const currentPrefs =
      (user.notificationPreferences as Record<string, boolean>) ?? {};
    const newPrefs = {
      ...currentPrefs,
      ...(parsed.notifyPriceDrops !== undefined
        ? { notifyPriceDrops: parsed.notifyPriceDrops }
        : {}),
      ...(parsed.coiReminders !== undefined
        ? { coiReminders: parsed.coiReminders }
        : {}),
      ...(parsed.w9Reminders !== undefined ? { w9Reminders: parsed.w9Reminders } : {}),
      ...(parsed.contractReminders !== undefined
        ? { contractReminders: parsed.contractReminders }
        : {}),
      ...(parsed.leadEmails !== undefined ? { leadEmails: parsed.leadEmails } : {}),
    };

    if (Object.keys(newPrefs).length > 0) {
      updateData.notificationPreferences = newPrefs;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.userId))
      .returning();

    return NextResponse.json(sanitizeUser(updatedUser));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update preferences",
      },
      { status: 500 }
    );
  }
}
