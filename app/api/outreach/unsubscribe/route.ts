import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachProspects, outreachSuppressions, leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";

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
  if (await suppressLeadByToken(token)) return true;
  return suppressProspectByToken(token);
}

function confirmationPage(success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1C1F1E">
  <title>Unsubscribe | ${SITE_CONFIG.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital@1&family=Montserrat:wght@300;400&display=swap" rel="stylesheet">
  <style>
    /* Boise Cabinet Co dark brand system - nothing bolder than 400. */
    body { font-family: 'Montserrat', 'Helvetica Neue', system-ui, sans-serif; font-weight:400; background:#1C1F1E; color:#E6E3DE; margin:0; padding:24px; }
    .wrap { max-width: 520px; margin: 80px auto; background:#262B29; border:1px solid #39403D; border-radius:8px; padding:44px; text-align:center; }
    .brand { font-size: 15px; letter-spacing:0.14em; text-transform:uppercase; color:#F7F5F3; margin-bottom:28px; }
    .brand em { font-family:'Libre Baskerville', Georgia, serif; font-style:italic; text-transform:none; letter-spacing:0; color:#F7F5F3; }
    h1 { font-size: 24px; font-weight:300; letter-spacing:-0.01em; color:#F7F5F3; margin:0 0 12px; }
    p { font-size: 15px; line-height:1.7; color:#9AA098; margin:0 0 12px; }
    a { color:#7AAAAA; text-decoration:none; }
    a:hover { text-decoration:underline; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="brand">Boise Cabinet <em>Co.</em></div>
    <h1>${success ? "You are unsubscribed" : "Link not recognized"}</h1>
    <p>${
      success
        ? `You will not receive any further outreach emails from ${SITE_CONFIG.name}. We are sorry for the interruption.`
        : `We could not find this unsubscribe link. If you keep receiving messages, reply to the email and we will remove you right away.`
    }</p>
    <p><a href="${SITE_CONFIG.siteUrl}">${SITE_CONFIG.siteUrl.replace(/^https?:\/\//, "")}</a></p>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const ok = await suppressByToken(token);
  return new NextResponse(confirmationPage(ok), {
    status: ok ? 200 : 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// RFC 8058 one-click unsubscribe (mailbox providers POST to this URL).
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const ok = await suppressByToken(token);
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 404 });
}
