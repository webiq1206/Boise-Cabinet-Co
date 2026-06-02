import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI, { toFile } from "openai";

export const runtime = "nodejs";
export const maxDuration = 120;

// ~12MB cap on the incoming base64 string to avoid memory abuse.
const MAX_IMAGE_CHARS = 12 * 1024 * 1024;

const bodySchema = z.object({
  // data URL or bare base64 of the room photo
  image: z.string().min(1).max(MAX_IMAGE_CHARS, "Image is too large."),
});

const PROMPT =
  "Remove all existing kitchen and bathroom cabinets, cabinet doors, drawers, " +
  "countertops, islands, and upper wall cabinets from this room photo. " +
  "Reconstruct clean, empty walls and floor where the cabinetry used to be, " +
  "matching the existing wall color, paint, flooring material, baseboards, " +
  "windows, lighting, shadows, and camera perspective. Keep the room itself " +
  "(walls, floor, windows, ceiling) intact and photorealistic. The result " +
  "should look like the same room emptied of all cabinetry, ready for a remodel.";

class BadImageError extends Error {}

function parseDataUrl(input: string): { buffer: Buffer; mime: string } {
  const match = input.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/);
  if (!match) {
    throw new BadImageError(
      "Please upload an image (the photo must be a base64 image data URL).",
    );
  }
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0) {
    throw new BadImageError("The uploaded image is empty or invalid.");
  }
  return { mime: match[1], buffer };
}

function pickSize(width: number, height: number): "1024x1024" | "1536x1024" | "1024x1536" {
  if (!width || !height) return "1536x1024";
  const ratio = width / height;
  if (ratio > 1.2) return "1536x1024";
  if (ratio < 0.83) return "1024x1536";
  return "1024x1024";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = bodySchema.parse(body);
    const aspect = z
      .object({ width: z.number().optional(), height: z.number().optional() })
      .safeParse(body);

    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    if (!apiKey || !baseURL) {
      return NextResponse.json(
        { error: "AI image editing isn't configured right now." },
        { status: 503 },
      );
    }

    const { buffer, mime } = parseDataUrl(image);
    const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
    const file = await toFile(buffer, `room.${ext}`, { type: mime });

    const size = pickSize(
      aspect.success ? aspect.data.width ?? 0 : 0,
      aspect.success ? aspect.data.height ?? 0 : 0,
    );

    const openai = new OpenAI({ apiKey, baseURL });
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt: PROMPT,
      size,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "The AI didn't return an image. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof BadImageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Remove cabinets error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to edit the photo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
