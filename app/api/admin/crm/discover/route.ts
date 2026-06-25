import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { discoverBusinessLeadsForCity, isDiscoveryConfigured } from "@/lib/outreach/discovery";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json({ configured: isDiscoveryConfigured() });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const city = (body?.city as string | undefined)?.trim();
  if (!city) return NextResponse.json({ error: "city required" }, { status: 400 });

  const result = await discoverBusinessLeadsForCity(city, {
    maxPages: Math.min(3, Math.max(1, Number(body.maxPages) || 2)),
    scrapeEmails: body.scrapeEmails !== false,
  });

  return NextResponse.json(result);
}
