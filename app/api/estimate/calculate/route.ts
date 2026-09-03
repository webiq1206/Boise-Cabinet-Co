import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import {
  calculateCombinedEstimate,
  buildCombinedStoredEstimate,
} from "@/shared/estimateEngine";
import { buildEstimateRecord } from "@/shared/estimateRecord";
import { validateCombinedEstimate } from "@/shared/estimateValidation";
import { roomsArraySchema } from "@/shared/estimateInputSchema";

export const runtime = "nodejs";

/**
 * The pricing engine as a service.
 *
 * Imports the exact same module the guided estimator renders from, so any
 * client (the conversational assistant, future integrations) is structurally
 * incapable of producing a different number than the wizard for the same
 * inputs. Every response passes the estimate validation layer before leaving
 * the server.
 */

const PER_IP_LIMIT = 120;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;

/**
 * Contact gate. The estimator never hands out a price without contact details,
 * and this endpoint is held to the same rule as the UI: a caller must identify
 * itself (a name plus at least one way to reach them) before any range is
 * returned. No UI path calls this route, and the conversational assistant does
 * not use it (confirmed by owner 2026-09-03), so requiring contact breaks
 * nothing while closing the anonymous-price hole. The parity test sends a
 * fixture contact so it can still exercise the pricing path.
 */
const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
    phone: z.string().trim().min(10).max(40).optional().or(z.literal("")),
  })
  .refine((c) => Boolean(c.email) || Boolean(c.phone), {
    message: "Provide an email address or a phone number.",
    path: ["email"],
  });

const bodySchema = z.object({
  rooms: roomsArraySchema,
  contact: contactSchema,
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const perIp = rateLimit(`estimate-calc:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
    if (!perIp.ok) {
      return NextResponse.json(
        { error: "Too many estimate requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(perIp.retryAfter) } },
      );
    }

    const { rooms } = bodySchema.parse(await request.json());

    const combined = calculateCombinedEstimate(rooms);
    const validation = validateCombinedEstimate(combined, rooms);
    if (!validation.ok) {
      // The engine is deterministic, so this only trips on corrupt inputs the
      // schema could not catch. Never return a number that failed validation.
      console.error(
        `[estimate-calc] validation failed: ${validation.issues.join("; ")}`,
      );
      return NextResponse.json(
        { error: "We couldn't calculate a reliable range for those selections." },
        { status: 422 },
      );
    }

    if (!combined) {
      // Honest not-priceable answer: at minimum a project and size (and upper
      // run, for rooms with wall cabinets) are required before any number.
      return NextResponse.json({ priceable: false, combined: null, stored: null, record: null });
    }

    return NextResponse.json({
      priceable: true,
      combined,
      stored: buildCombinedStoredEstimate(rooms),
      record: buildEstimateRecord({
        rooms,
        capturedAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid estimate selections.", errors: error.flatten() },
        { status: 400 },
      );
    }
    console.error("[estimate-calc] error:", error);
    return NextResponse.json(
      { error: "We couldn't calculate an estimate right now. Please try again." },
      { status: 500 },
    );
  }
}
