import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { discoverContractorsForCity, isDiscoveryConfigured } from "@/lib/outreach/discovery";
import { CITIES } from "@/shared/contentData";

const bodySchema = z.object({
  cities: z.array(z.string()).optional(),
  maxPages: z.number().int().min(1).max(3).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  if (!isDiscoveryConfigured()) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured. Add it to enable discovery." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const allCityNames = CITIES.map((c) => c.name);
  const requested = parsed.data.cities?.length
    ? parsed.data.cities.filter((c) => allCityNames.includes(c))
    : allCityNames;

  const results = [];
  for (const city of requested) {
    const r = await discoverContractorsForCity(city, parsed.data.maxPages ?? 2);
    results.push(r);
  }

  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
  return NextResponse.json({ results, totalInserted });
}
