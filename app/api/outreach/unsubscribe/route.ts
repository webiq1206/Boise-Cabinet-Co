import { db } from "@/lib/db";
import { outreachProspects, outreachSuppressions, leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { createUnsubscribeHandlers } from "@/lib/outreach/unsubscribe";

export const dynamic = "force-dynamic";

async function addSuppression(email: string | null | undefined): Promise<void> {
  if (!db || !email) return;
  await db
    .insert(outreachSuppressions)
    .values({ email: email.toLowerCase(), reason: "unsubscribe" })
    .onConflictDoNothing();
}

// Legacy prospect-token unsubscribe.
async function suppressProspectByToken(token: string): Promise<boolean> {
  if (!db || !token) return false;
  const rows = await db
    .select()
    .from(outreachProspects)
    .where(eq(outreachProspects.unsubscribeToken, token))
    .limit(1);
  const prospect = rows[0];
  if (!prospect) return false;

  await addSuppression(prospect.email);
  await db
    .update(outreachProspects)
    .set({ status: "unsubscribed", unsubscribedAt: new Date(), updatedAt: new Date() })
    .where(eq(outreachProspects.id, prospect.id));
  return true;
}

// Unified lead-token unsubscribe (runs and sequences).
async function suppressLeadByToken(token: string): Promise<boolean> {
  if (!db || !token) return false;
  const rows = await db.select().from(leads).where(eq(leads.unsubscribeToken, token)).limit(1);
  const lead = rows[0];
  if (!lead) return false;

  await addSuppression(lead.email);
  await db
    .update(leads)
    .set({ emailStatus: "unsubscribed", emailable: false, updatedAt: new Date() })
    .where(eq(leads.id, lead.id));
  return true;
}

// Honors either token type so one unsubscribe link works across the platform.
async function suppressByToken(token: string): Promise<boolean> {
  if (!db) throw new Error("Unsubscribe storage unavailable");
  if (await suppressLeadByToken(token)) return true;
  return suppressProspectByToken(token);
}

const handlers = createUnsubscribeHandlers({
  businessName: SITE_CONFIG.name,
  siteUrl: SITE_CONFIG.siteUrl,
  suppress: suppressByToken,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
