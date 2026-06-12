import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteSettings } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import {
  OUTREACH_SETTING_KEYS,
  getOutreachConfig,
  isOutreachSendable,
} from "@/lib/outreach/config";
import { isDiscoveryConfigured } from "@/lib/outreach/discovery";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const config = await getOutreachConfig();
  return NextResponse.json({
    config,
    readiness: {
      discoveryConfigured: isDiscoveryConfigured(),
      sendable: isOutreachSendable(),
    },
  });
}

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  dryRun: z.boolean().optional(),
  dailyCap: z.number().int().min(1).max(50).optional(),
  minGapMinutes: z.number().int().min(5).max(240).optional(),
});

async function setSetting(key: string, value: string, userId: string) {
  if (!db) return;
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date(), updatedBy: userId })
      .where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value, updatedBy: userId });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const userId = auth.user!.id;
  const d = parsed.data;

  if (d.enabled !== undefined)
    await setSetting(OUTREACH_SETTING_KEYS.enabled, String(d.enabled), userId);
  if (d.dryRun !== undefined)
    await setSetting(OUTREACH_SETTING_KEYS.dryRun, String(d.dryRun), userId);
  if (d.dailyCap !== undefined)
    await setSetting(OUTREACH_SETTING_KEYS.dailyCap, String(d.dailyCap), userId);
  if (d.minGapMinutes !== undefined)
    await setSetting(OUTREACH_SETTING_KEYS.minGapMinutes, String(d.minGapMinutes), userId);

  const config = await getOutreachConfig();
  return NextResponse.json({ config });
}
