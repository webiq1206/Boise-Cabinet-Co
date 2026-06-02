import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const PER_IP_LIMIT = 15;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;

const bodySchema = z.object({
  image: z.string().min(100).max(12_000_000),
  roomType: z.string().optional(),
});

const openingSchema = z.object({
  type: z.enum(["window", "door", "appliance", "column"]),
  wall: z.enum(["back", "front", "left", "right"]),
  offsetIn: z.number().min(0),
  widthIn: z.number().min(6),
  label: z.string().optional(),
});

const responseSchema = z.object({
  widthIn: z.number().min(48).max(480),
  depthIn: z.number().min(48).max(480),
  ceilingIn: z.number().min(84).max(144).optional(),
  confidence: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
  openings: z.array(openingSchema).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const perIp = rateLimit(`scan-room:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
    if (!perIp.ok) {
      return NextResponse.json(
        { error: "Too many room scans. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(perIp.retryAfter) } },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Room scan from photo is not configured." },
        { status: 503 },
      );
    }

    const body = bodySchema.parse(await request.json());
    const openai = new OpenAI({ apiKey });

    const roomLabel = body.roomType?.replace(/-/g, " ") ?? "kitchen";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You estimate interior room dimensions from a single photo for cabinet layout planning. " +
            "Return JSON only: widthIn, depthIn (wall-to-wall usable floor inches), ceilingIn (optional), " +
            "confidence (low|medium|high), notes (brief), openings (optional array of {type, wall, offsetIn, widthIn, label}). " +
            "Use architectural cues: doors ~80in tall, " +
            "base cabinets ~36in tall, typical US kitchens 10-16ft wide. Be conservative if uncertain.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Estimate floor dimensions for this ${roomLabel} (width = left-right, depth = back-front).`,
            },
            {
              type: "image_url",
              image_url: {
                url: body.image.startsWith("data:")
                  ? body.image
                  : `data:image/jpeg;base64,${body.image}`,
              },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "No estimate returned." }, { status: 502 });
    }

    const parsed = responseSchema.parse(JSON.parse(raw));
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("scan-room error:", error);
    return NextResponse.json(
      { error: "Could not scan room from photo." },
      { status: 500 },
    );
  }
}
