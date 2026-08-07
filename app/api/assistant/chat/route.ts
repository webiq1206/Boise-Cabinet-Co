import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { buildSystemPrompt } from "@/lib/assistant/systemPrompt";
import {
  ASSISTANT_TOOLS,
  executeAssistantTool,
  type AssistantToolContext,
} from "@/lib/assistant/tools";
import { calculateCombinedEstimate } from "@/shared/estimateEngine";
import { validateCombinedEstimate } from "@/shared/estimateValidation";
import { MAX_ROOMS, roomSelectionsSchema } from "@/shared/estimateInputSchema";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Conversational estimating assistant.
 *
 * Stateless per request: the client sends the conversation history and the
 * shared structured project state each turn. All pricing goes through the
 * calculate_estimate tool (same engine module as the guided estimator); all
 * business facts go through get_business_info. The model itself never
 * originates a number or a business claim - see lib/assistant/tools.ts.
 */

// Abuse / cost protection for this paid AI endpoint (remove-cabinets pattern).
const PER_IP_LIMIT = 20;
const PER_IP_WINDOW_MS = 10 * 60 * 1000; // 20 turns / 10 min per IP
const GLOBAL_LIMIT = 300;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000; // 300 turns / hour overall

const MAX_TOOL_ROUNDS = 6;
const MAX_IMAGE_CHARS = 3 * 1024 * 1024; // ~2.2MB decoded per photo
const MAX_IMAGES_PER_TURN = 3;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8_000),
  /** Data URLs of photos attached to a user message (context only). */
  images: z.array(z.string().max(MAX_IMAGE_CHARS)).max(MAX_IMAGES_PER_TURN).optional(),
});

const bodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
  rooms: z.array(roomSelectionsSchema).max(MAX_ROOMS).optional().default([]),
  /** Pathname the widget is open on, for page-aware context. */
  page: z.string().max(200).optional().default(""),
});

const FRIENDLY_UNAVAILABLE =
  "The assistant isn't available right now. You can call or text (208) 477-1169, or use the estimate form - everything works without chat.";

type ImageBlock = {
  type: "image";
  source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; data: string };
};

function parseImageDataUrl(dataUrl: string): ImageBlock | null {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: match[1] as ImageBlock["source"]["media_type"],
      data: match[2],
    },
  };
}

/** Availability probe: the widget only renders its launcher when this is true. */
export async function GET() {
  return NextResponse.json({ available: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const perIp = rateLimit(`assistant-chat:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
    if (!perIp.ok) {
      return NextResponse.json(
        { error: "You're sending messages faster than the assistant can keep up. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(perIp.retryAfter) } },
      );
    }
    const global = rateLimit("assistant-chat:global", GLOBAL_LIMIT, GLOBAL_WINDOW_MS);
    if (!global.ok) {
      return NextResponse.json(
        { error: "The assistant is busy right now. Please try again shortly, or call or text (208) 477-1169." },
        { status: 429, headers: { "Retry-After": String(global.retryAfter) } },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: FRIENDLY_UNAVAILABLE }, { status: 503 });
    }

    const body = bodySchema.parse(await request.json());
    if (body.messages[body.messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Plain-text transcript for the lead record (text only, no image data).
    const transcript = body.messages
      .map((m) => `${m.role === "user" ? "Homeowner" : "Assistant"}: ${m.content}`)
      .join("\n");

    const ctx: AssistantToolContext = {
      rooms: body.rooms,
      transcript,
      clientIp: ip,
      leadSaved: false,
      handoffRequested: false,
    };

    // Build Anthropic messages. Photos are attached only from the latest user
    // turn (context-only; bounded cost); the per-turn context block carries the
    // page and the shared project state so wizard progress is never re-asked.
    const messages: Anthropic.MessageParam[] = body.messages.map((m, i) => {
      const isLast = i === body.messages.length - 1;
      if (m.role === "assistant") {
        return { role: "assistant", content: m.content || "..." };
      }
      const blocks: Anthropic.ContentBlockParam[] = [];
      if (isLast) {
        for (const img of m.images ?? []) {
          const block = parseImageDataUrl(img);
          if (block) blocks.push(block);
        }
      } else if (m.images?.length) {
        blocks.push({ type: "text", text: "[The homeowner shared a photo of their space here.]" });
      }
      const contextBlock = isLast
        ? `[context]\npage: ${body.page || "unknown"}\nproject state (shared with the guided estimator): ${JSON.stringify(ctx.rooms)}\n[/context]\n\n`
        : "";
      blocks.push({ type: "text", text: `${contextBlock}${m.content || "(photo only)"}` });
      return { role: "user", content: blocks };
    });

    const client = new Anthropic({ apiKey });
    const model = process.env.ASSISTANT_MODEL || "claude-opus-5";
    const system: Anthropic.TextBlockParam[] = [
      {
        type: "text",
        text: buildSystemPrompt(),
        cache_control: { type: "ephemeral" },
      },
    ];

    let reply = "";
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await client.messages.create({
        model,
        max_tokens: 2048,
        system,
        messages,
        tools: ASSISTANT_TOOLS as Anthropic.ToolUnion[],
      });

      if (response.stop_reason === "refusal") {
        reply =
          "I can't help with that one - but I'm happy to help you plan cabinets or answer questions about Boise Cabinet Co.";
        break;
      }

      const textParts = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text);
      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );

      if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
        reply = textParts.join("\n").trim();
        break;
      }
      if (round === MAX_TOOL_ROUNDS) {
        // Bound runaway loops; surface whatever text accompanied the last round.
        reply =
          textParts.join("\n").trim() ||
          "Let me pause there - could you tell me a bit more about your project?";
        break;
      }

      // Execute every requested tool and return all results in ONE user message.
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const use of toolUses) {
        let result: Record<string, unknown>;
        try {
          result = await executeAssistantTool(use.name, use.input, ctx);
        } catch (toolErr) {
          console.error(`[assistant] tool ${use.name} threw:`, toolErr);
          result = { error: "Tool failed. Do not state any price or fact you could not retrieve." };
        }
        results.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: JSON.stringify(result),
        });
      }
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: results });
    }

    if (!reply) {
      reply = "Sorry - I lost my train of thought. Could you say that again?";
    }

    // The widget's estimate card renders only engine-validated numbers.
    const combined = calculateCombinedEstimate(ctx.rooms);
    const estimate = validateCombinedEstimate(combined, ctx.rooms).ok ? combined : null;

    return NextResponse.json({
      reply,
      rooms: ctx.rooms,
      estimate,
      leadSaved: ctx.leadSaved,
      handoffRequested: ctx.handoffRequested,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (error instanceof Anthropic.APIError) {
      // Never forward provider error text to the client.
      console.error(`[assistant] Anthropic API error ${error.status}:`, error.message);
      return NextResponse.json(
        { error: "The assistant hit a snag. Please try again in a moment." },
        { status: 502 },
      );
    }
    console.error("[assistant] chat error:", error);
    return NextResponse.json(
      { error: "The assistant hit a snag. Please try again in a moment." },
      { status: 500 },
    );
  }
}
