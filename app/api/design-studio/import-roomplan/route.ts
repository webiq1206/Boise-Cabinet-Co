import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { inchesToM, metersToInches } from "@/lib/design/roomMeta";

export const runtime = "nodejs";

const PER_IP_LIMIT = 20;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;

const openingSchema = z.object({
  type: z.enum(["window", "door", "appliance", "column"]),
  wall: z.enum(["back", "front", "left", "right"]),
  offsetIn: z.number().min(0),
  widthIn: z.number().min(6),
  label: z.string().optional(),
});

const bodySchema = z
  .object({
    widthIn: z.number().min(48).max(480).optional(),
    depthIn: z.number().min(48).max(480).optional(),
    ceilingIn: z.number().min(84).max(144).optional(),
    walls: z
      .array(
        z.object({
          lengthIn: z.number().min(12),
          transform: z
            .object({
              position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
            })
            .optional(),
        }),
      )
      .optional(),
    openings: z.array(openingSchema).optional(),
    floorPolygon: z.array(z.object({ x: z.number(), z: z.number() })).optional(),
  })
  .passthrough();

/** Map Apple RoomPlan-style JSON into planner room dimensions. */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const perIp = rateLimit(`import-roomplan:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
    if (!perIp.ok) {
      return NextResponse.json(
        { error: "Too many imports. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(perIp.retryAfter) } },
      );
    }

    const raw = await request.json();
    const data = bodySchema.parse(raw);

    let widthIn = data.widthIn;
    let depthIn = data.depthIn;

    if ((!widthIn || !depthIn) && data.walls?.length) {
      const lengths = data.walls.map((w) => w.lengthIn);
      widthIn = widthIn ?? Math.max(...lengths, 120);
      depthIn = depthIn ?? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    }

    if (!widthIn || !depthIn) {
      return NextResponse.json(
        { error: "RoomPlan JSON must include widthIn/depthIn or walls[].lengthIn." },
        { status: 400 },
      );
    }

    let floorPolygon = data.floorPolygon;
    if (!floorPolygon && data.walls?.length) {
      let x = 0;
      let z = 0;
      let angle = 0;
      const pts: { x: number; z: number }[] = [{ x: 0, z: 0 }];
      for (const wall of data.walls) {
        const lenM = inchesToM(wall.lengthIn);
        x += lenM * Math.cos(angle);
        z += lenM * Math.sin(angle);
        pts.push({ x, z });
        angle += Math.PI / 2;
      }
      const xs = pts.map((p) => p.x);
      const zs = pts.map((p) => p.z);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      floorPolygon = pts.map((p) => ({ x: p.x - cx, z: p.z - cz }));
      if (!data.widthIn) widthIn = metersToInches(Math.max(...xs) - Math.min(...xs));
      if (!data.depthIn) depthIn = metersToInches(Math.max(...zs) - Math.min(...zs));
    }

    return NextResponse.json({
      widthIn: Math.round(widthIn),
      depthIn: Math.round(depthIn),
      ceilingIn: data.ceilingIn ?? 96,
      obstacles: data.openings ?? [],
      floorPolygon,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid RoomPlan JSON." }, { status: 400 });
    }
    console.error("import-roomplan error:", error);
    return NextResponse.json({ error: "Could not import RoomPlan." }, { status: 500 });
  }
}
