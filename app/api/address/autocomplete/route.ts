import { NextRequest, NextResponse } from "next/server";
import { fetchAddressSuggestions } from "@/server/services/geocoding";

export async function GET(request: NextRequest) {
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
