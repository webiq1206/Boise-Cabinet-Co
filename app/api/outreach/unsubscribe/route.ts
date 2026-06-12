import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachProspects, outreachSuppressions } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";

async function suppressByToken(token: string): Promise<boolean> {
  if (!db || !token) return false;
  const rows = await db
    .select()
    .from(outreachProspects)
    .where(eq(outreachProspects.unsubscribeToken, token))
    .limit(1);
  const prospect = rows[0];
  if (!prospect) return false;

  if (prospect.email) {
    const email = prospect.email.toLowerCase();
    const existing = await db
      .select({ email: outreachSuppressions.email })
      .from(outreachSuppressions)
      .where(eq(outreachSuppressions.email, email))
      .limit(1);
    if (existing.length === 0) {
      await db
        .insert(outreachSuppressions)
        .values({ email, reason: "unsubscribe" })
        .onConflictDoNothing();
    }
  }

  await db
    .update(outreachProspects)
    .set({ status: "unsubscribed", unsubscribedAt: new Date(), updatedAt: new Date() })
    .where(eq(outreachProspects.id, prospect.id));

  return true;
}

function confirmationPage(success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe | ${SITE_CONFIG.name}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background:#F5F3EF; color:#3A3E3D; margin:0; padding:0; }
    .wrap { max-width: 520px; margin: 80px auto; background:#fff; border:1px solid #E0DDD8; border-radius:8px; padding:40px; text-align:center; }
    h1 { font-size: 22px; font-weight:600; }
    p { font-size: 15px; line-height:1.6; color:#5A5F5C; }
    a { color:#3A3E3D; }
  </style>
</head>
<body>
  <div class="wrap">
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
