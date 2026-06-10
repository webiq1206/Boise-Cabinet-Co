import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { fetchAddressSuggestions } from "@/server/services/geocoding";

const PER_IP_LIMIT = 60;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`address-autocomplete:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { suggestions: [], error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const input = request.nextUrl.searchParams.get("input") ?? "";
  if (input.trim().length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await fetchAddressSuggestions(input);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[address/autocomplete]", err);
    return NextResponse.json(
      { suggestions: [], error: "Unable to fetch suggestions" },
      { status: 500 }
    );
  }
}
