import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { scrapePublicEmail } from "@/lib/outreach/emailScraper";

const bodySchema = z.object({
  limit: z.number().int().min(1).max(15).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const limit = parsed.success ? parsed.data.limit ?? 8 : 8;

  // Only scrape prospects that have a website and have not yet been processed.
  const pending = await db
    .select()
    .from(outreachProspects)
    .where(and(eq(outreachProspects.status, "discovered"), isNotNull(outreachProspects.website)))
    .limit(limit);

  let withEmail = 0;
  let withoutEmail = 0;

  for (const prospect of pending) {
    if (!prospect.website) continue;
    const { email, sourceUrl } = await scrapePublicEmail(prospect.website);
    if (email) {
      await db
        .update(outreachProspects)
        .set({
          email,
          emailSourceUrl: sourceUrl,
          status: "ready",
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(outreachProspects.id, prospect.id));
      withEmail++;
    } else {
      await db
        .update(outreachProspects)
        .set({
          status: "needs_email",
          lastError: "No publicly listed email found on website.",
          updatedAt: new Date(),
        })
        .where(eq(outreachProspects.id, prospect.id));
      withoutEmail++;
    }
  }

  return NextResponse.json({
    processed: pending.length,
    withEmail,
    withoutEmail,
    remaining: pending.length === limit,
  });
}
