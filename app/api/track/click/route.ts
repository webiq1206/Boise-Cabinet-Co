import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachSends } from "@/shared/schema";
import { eq, sql } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";

// Only redirect to absolute http(s) URLs to avoid open-redirect abuse.
function safeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    /* fall through */
  }
  return SITE_CONFIG.siteUrl;
}

async function recordClick(sendToken: string): Promise<void> {
  if (!db || !sendToken) return;
  try {
    await db
      .update(outreachSends)
      .set({
        firstClickedAt: sql`COALESCE(${outreachSends.firstClickedAt}, NOW())`,
        clickCount: sql`${outreachSends.clickCount} + 1`,
        // A click implies an open even if the pixel was blocked.
        openedAt: sql`COALESCE(${outreachSends.openedAt}, NOW())`,
      })
      .where(eq(outreachSends.trackingToken, sendToken));
  } catch {
    // Tracking must never block the redirect.
  }
}

export async function GET(request: NextRequest) {
  const sendToken = request.nextUrl.searchParams.get("send") ?? "";
  const target = request.nextUrl.searchParams.get("u") ?? "";
  if (sendToken) await recordClick(sendToken);
  return NextResponse.redirect(safeUrl(target), 302);
}
