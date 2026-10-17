import { NextResponse } from "next/server";
import { addEnhancedConversionSuppression } from "@/lib/ads/enhancedConversionSuppression";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

/** Store hashes of an email or phone. The raw value is not saved. */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as { email?: unknown; phone?: unknown } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Send an email or a 10-digit US phone number." }, { status: 400 });
  }
  const stored = await addEnhancedConversionSuppression({
    email: typeof body.email === "string" ? body.email : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
  });
  if (!stored.email && !stored.phone) {
    return NextResponse.json({ error: "Send an email or a 10-digit US phone number." }, { status: 400 });
  }
  return NextResponse.json({ stored });
}
