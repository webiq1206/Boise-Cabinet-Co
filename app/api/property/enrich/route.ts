import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  enrichPropertyFromFormattedAddress,
  enrichPropertyFromPlaceId,
} from "@/server/services/propertyEnrichment";

const bodySchema = z.object({
  placeId: z.string().min(1).optional(),
  formattedAddress: z.string().min(5).optional(),
}).refine((d) => d.placeId || d.formattedAddress, {
  message: "placeId or formattedAddress is required",
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { placeId, formattedAddress } = parsed.data;
    let profile;
    if (placeId) {
      profile = await enrichPropertyFromPlaceId(placeId);
      if (!profile) {
        return NextResponse.json(
          { message: "Could not resolve address" },
          { status: 404 }
        );
      }
    } else {
      profile = await enrichPropertyFromFormattedAddress(formattedAddress!);
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[property/enrich]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
