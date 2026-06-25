import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachProspects, outreachSends } from "@/shared/schema";
import { eq, sql } from "drizzle-orm";

// 1x1 fully transparent GIF served to the recipient's mail client. Loading it
// is the open signal. We never block on the DB write affecting the response so
// the pixel always renders.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

function pixelResponse(): NextResponse {
  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      // Mail clients / proxies must not cache, so repeat opens still register.
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

async function recordOpen(token: string): Promise<void> {
  if (!db || !token) return;
  try {
    const rows = await db
      .select()
      .from(outreachProspects)
      .where(eq(outreachProspects.unsubscribeToken, token))
      .limit(1);
    const prospect = rows[0];
    if (!prospect) return;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    // Record the first open timestamp once and never overwrite it.
    if (!prospect.openedAt) updates.openedAt = new Date();
    // Only advance a "sent" prospect to "opened". Never downgrade a later
    // lifecycle state (replied, bounced, unsubscribed) back to opened.
    if (prospect.status === "sent") updates.status = "opened";

    await db
      .update(outreachProspects)
      .set(updates)
      .where(eq(outreachProspects.id, prospect.id));
  } catch {
    // Tracking must never surface an error to the recipient's mail client.
  }
}

// Unified open tracking keyed by the per-send tracking token (outreach_sends).
async function recordSendOpen(sendToken: string): Promise<void> {
  if (!db || !sendToken) return;
  try {
    await db
      .update(outreachSends)
      .set({
        openedAt: sql`COALESCE(${outreachSends.openedAt}, NOW())`,
        openCount: sql`${outreachSends.openCount} + 1`,
      })
      .where(eq(outreachSends.trackingToken, sendToken));
  } catch {
    // Tracking must never surface an error to the recipient's mail client.
  }
}

export async function GET(request: NextRequest) {
  // New unified path uses ?send=<trackingToken>; legacy prospect path uses ?token=.
  const sendToken = request.nextUrl.searchParams.get("send") ?? "";
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (sendToken) await recordSendOpen(sendToken);
  if (token) await recordOpen(token);
  return pixelResponse();
}
