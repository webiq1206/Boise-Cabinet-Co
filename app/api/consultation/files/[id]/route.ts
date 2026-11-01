import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { consultationFiles } from "@/shared/schema";
import { verifyFileSignature } from "@/server/services/consultationFiles";

/**
 * Serves one attached file to whoever holds its signed link (the internal
 * email, the lead notes, the p5 intake and HubSpot). The id is a random UUID
 * and the signature an HMAC of it, so links cannot be guessed; there is no
 * listing. A wrong or missing signature reads as "not found".
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function notFound() {
  return NextResponse.json({ message: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(`consultation-file-read:${getClientIp(request)}`, 120, 15 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  const { id } = await context.params;
  if (!UUID.test(id) || !verifyFileSignature(id, request.nextUrl.searchParams.get("sig"))) return notFound();
  if (!db) return NextResponse.json({ message: "Unavailable" }, { status: 503 });
  const [row] = await db.select().from(consultationFiles).where(eq(consultationFiles.id, id)).limit(1);
  if (!row) return notFound();
  const bytes = Buffer.from(row.dataBase64, "base64");
  const asciiName = row.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": row.contentType,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `inline; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(row.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
