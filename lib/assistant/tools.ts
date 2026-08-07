import { z } from "zod";
import { NextRequest } from "next/server";
import {
  PROJECT_LABELS,
  PROJECT_LAYOUT_SLUGS,
  PROJECT_SIZE_CONFIG,
  ESTIMATE_RANGE_DISCLAIMER,
  buildCombinedStoredEstimate,
  buildCombinedConsultationPayload,
  calculateCombinedEstimate,
  formatEstimateRangeShort,
  isPriceable,
  mapEstimateProjectToConsultType,
  normalizeSelections,
  type EstimateSelections,
  type ProjectType,
} from "@/shared/estimateEngine";
import { buildEstimateRecord } from "@/shared/estimateRecord";
import { validateCombinedEstimate } from "@/shared/estimateValidation";
import {
  MAX_ROOMS,
  PROJECT_TYPE_VALUES,
  roomSelectionsSchema,
} from "@/shared/estimateInputSchema";
import {
  KNOWLEDGE_TOPIC_KEYS,
  getKnowledgeTopic,
} from "@/shared/assistantKnowledge";
import { SITE_CONFIG } from "@/shared/siteConfig";

/**
 * Deterministic tool layer for the estimating assistant.
 *
 * Every dollar figure the assistant can utter originates in calculate_estimate,
 * which calls the same engine module the guided estimator renders from and
 * passes the validation layer before returning. Every business fact originates
 * in get_business_info, which reads the controlled knowledge module. The model
 * never computes prices and never recalls facts from its own training.
 *
 * Executors are pure functions of (input, context) so they are unit-testable
 * without an LLM in the loop.
 */

export interface AssistantToolContext {
  /** Structured project state, shared with the guided estimator. Mutated by update_project. */
  rooms: EstimateSelections[];
  /** Plain-text transcript of the conversation so far (built by the route). */
  transcript: string;
  /** Original client IP, forwarded to the consultation route for rate limiting. */
  clientIp: string;
  /** Set true once a lead is saved this turn, so the route can tell the client. */
  leadSaved: boolean;
  /** Set true when a human handoff was requested. */
  handoffRequested: boolean;
}

// ── Tool definitions (Anthropic Messages API shape) ─────────────────────────

const DOOR_STYLE_VALUES = ["", "slab", "three-piece", "modern-shaker", "thin-shaker", "alpha-shaker", "beta-shaker"];

const roomJsonSchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    project: {
      description: "Room type, or null if not yet known.",
      enum: [...PROJECT_TYPE_VALUES, null],
    },
    layout: {
      type: "string",
      description:
        'Layout slug. Kitchens: galley, l-shape, u-shape, island, peninsula. Bathrooms: single-vanity, double-vanity. Use "" for other rooms or when unknown.',
    },
    size: {
      type: ["number", "null"],
      description:
        "Base (lower) cabinet run in linear feet, or vanity feet for bathrooms. null until the homeowner gives it.",
    },
    sizeUpper: {
      type: ["number", "null"],
      description:
        "Wall (upper) cabinet run in linear feet; 0 means few/no uppers. Required before pricing for kitchen, laundry, mudroom, home-office, entertainment, and built-ins. Always null for bathroom and pantry.",
    },
    doorStyle: {
      enum: DOOR_STYLE_VALUES,
      description: 'Door style id, or "" when not chosen yet.',
    },
    finishCategory: {
      enum: ["", "matte", "woodgrain", "gloss"],
      description: 'Finish style, or "" when not chosen yet.',
    },
    finishTier: {
      enum: ["", "standard", "premium", "reserve"],
      description:
        'Finish price tier ($ / $$ / $$$), or "" when not chosen yet. Only set when the homeowner expresses a budget preference for finishes.',
    },
    construction: {
      enum: ["", "good", "better", "best"],
      description: 'Box construction quality, or "" when not chosen yet.',
    },
  },
  required: [
    "project",
    "layout",
    "size",
    "sizeUpper",
    "doorStyle",
    "finishCategory",
    "finishTier",
    "construction",
  ],
};

export const ASSISTANT_TOOLS = [
  {
    name: "update_project",
    description:
      "Replace the homeowner's structured project state with the updated full list of rooms. Call this whenever they share or change pricing-relevant details (rooms, sizes, door style, finish, construction). Carry forward every previously known value - this REPLACES the whole state. Returns each room's normalized values and what is still missing before it can be priced.",
    strict: true,
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        rooms: {
          type: "array",
          description: `The complete updated list of rooms being planned (at most ${MAX_ROOMS}).`,
          items: roomJsonSchema,
        },
      },
      required: ["rooms"],
    },
  },
  {
    name: "calculate_estimate",
    description:
      "Calculate the planning price range for the current project state using Boise Cabinet Co's pricing engine - the ONLY source of any dollar figure you may state. Call after any update_project, and always before mentioning price. Returns the combined range, per-room breakdown, what's included, and required disclaimers; or priceable=false with what's missing.",
    strict: true,
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_business_info",
    description:
      "Look up verified Boise Cabinet Co business information - the ONLY source of business facts (warranty, lead times, service areas, process, products, policies) you may state. If the answer isn't in the returned content, say you don't have that detail and offer the free consultation.",
    strict: true,
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        topic: {
          enum: KNOWLEDGE_TOPIC_KEYS,
          description: "The topic to retrieve.",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "save_lead",
    description:
      "Save the homeowner's consultation request with their current estimate attached - the same pipeline as the site's forms. Only call AFTER the homeowner has clearly agreed to be contacted and has given at least their name, phone, and email. Never invent or guess contact details.",
    strict: true,
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        name: { type: "string", description: "Homeowner's full name, as they gave it." },
        phone: { type: "string", description: "Phone number, as they gave it." },
        email: { type: "string", description: "Email address, as they gave it." },
        address: {
          type: ["string", "null"],
          description: "Property address if shared; null otherwise.",
        },
        message: {
          type: ["string", "null"],
          description:
            "Short summary of their goals/notes in their own words; null if none.",
        },
        budget: {
          type: ["string", "null"],
          description: 'Stated budget band if shared (e.g. "$30k - $50k"); null otherwise.',
        },
        timeline: {
          type: ["string", "null"],
          description: 'Stated start timeline if shared (e.g. "1 - 3 months"); null otherwise.',
        },
      },
      required: ["name", "phone", "email", "address", "message", "budget", "timeline"],
    },
  },
  {
    name: "request_human_handoff",
    description:
      "Hand the conversation to the Boise Cabinet Co team when the homeowner asks for a human, has a question you cannot answer from tools, or has a complaint/warranty/scheduling matter. If contact details are known, this saves a priority lead flagged for follow-up; otherwise it returns the direct phone number to share.",
    strict: true,
    input_schema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        reason: {
          type: "string",
          description: "One sentence on why the handoff is needed.",
        },
        name: { type: ["string", "null"], description: "Homeowner's name if known." },
        phone: { type: ["string", "null"], description: "Phone if known." },
        email: { type: ["string", "null"], description: "Email if known." },
      },
      required: ["reason", "name", "phone", "email"],
    },
  },
];

// ── Executors ───────────────────────────────────────────────────────────────

const updateProjectInput = z.object({
  rooms: z.array(roomSelectionsSchema).max(MAX_ROOMS),
});

const saveLeadInput = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  address: z.string().nullable(),
  message: z.string().nullable(),
  budget: z.string().nullable(),
  timeline: z.string().nullable(),
});

const handoffInput = z.object({
  reason: z.string().min(1),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
});

/** What a room still needs before the engine can price it. */
function missingForPricing(room: EstimateSelections): string[] {
  const missing: string[] = [];
  if (!room.project) {
    missing.push("which room this is");
    return missing;
  }
  const cfg = PROJECT_SIZE_CONFIG[room.project];
  if (room.size == null || room.size <= 0) {
    missing.push(`base run size in ${cfg.unitNoun} (typical ${cfg.min}-${cfg.max})`);
  }
  if (cfg.uppers && room.sizeUpper == null) {
    missing.push("wall (upper) cabinet run in linear feet (0 if none)");
  }
  return missing;
}

/** Optional refinements that would tighten the range, in ask-next order. */
function refinements(room: EstimateSelections): string[] {
  const out: string[] = [];
  if (!room.doorStyle) out.push("door style");
  if (!room.finishCategory) out.push("finish style (matte / woodgrain / gloss)");
  if (!room.construction) out.push("construction quality (good / better / best)");
  if (
    room.project &&
    PROJECT_LAYOUT_SLUGS[room.project].length > 0 &&
    !room.layout
  ) {
    out.push("layout");
  }
  return out;
}

function roomStatus(room: EstimateSelections) {
  const normalized = room.project ? normalizeSelections(room) : room;
  return {
    room: normalized,
    projectLabel: normalized.project
      ? PROJECT_LABELS[normalized.project as ProjectType].label
      : null,
    priceable: isPriceable(normalized),
    missingForPricing: missingForPricing(normalized),
    optionalRefinements: refinements(normalized),
  };
}

function executeUpdateProject(input: unknown, ctx: AssistantToolContext) {
  const parsed = updateProjectInput.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid rooms payload.", details: parsed.error.flatten() };
  }
  const statuses = parsed.data.rooms.map(roomStatus);
  ctx.rooms = statuses.map((s) => s.room);
  return {
    ok: true,
    rooms: statuses.map((s, i) => ({
      index: i + 1,
      projectLabel: s.projectLabel,
      priceable: s.priceable,
      missingForPricing: s.missingForPricing,
      optionalRefinements: s.optionalRefinements,
      normalizedValues: s.room,
    })),
  };
}

function executeCalculateEstimate(ctx: AssistantToolContext) {
  if (!ctx.rooms.length) {
    return {
      priceable: false,
      reason: "No rooms in the project yet. Call update_project first.",
    };
  }
  const combined = calculateCombinedEstimate(ctx.rooms);
  const validation = validateCombinedEstimate(combined, ctx.rooms);
  if (!validation.ok) {
    console.error(
      `[assistant] calculate_estimate validation failed: ${validation.issues.join("; ")}`,
    );
    return {
      priceable: false,
      reason:
        "The estimate could not be validated. Do not state any price; offer the free in-home consultation instead.",
    };
  }
  if (!combined) {
    return {
      priceable: false,
      reason: "At least one room needs its required details before pricing.",
      rooms: ctx.rooms.map((room, i) => ({
        index: i + 1,
        projectLabel: room.project ? PROJECT_LABELS[room.project as ProjectType].label : null,
        missingForPricing: missingForPricing(room),
      })),
    };
  }
  return {
    priceable: true,
    priceLow: combined.priceLow,
    priceHigh: combined.priceHigh,
    formattedRange: formatEstimateRangeShort(combined.priceLow, combined.priceHigh),
    confidenceLabel: combined.confidenceLabel,
    rooms: combined.rooms.map((room) => ({
      projectLabel: room.projectLabel,
      sizeLabel: room.sizeLabel,
      scopeSummary: room.scopeSummary,
      priceLow: room.priceLow,
      priceHigh: room.priceHigh,
    })),
    included: combined.included,
    refinementsThatWouldTightenTheRange: ctx.rooms
      .filter(isPriceable)
      .flatMap((room, i) =>
        refinements(room).map((r) => `room ${i + 1}: ${r}`),
      ),
    requiredDisclaimer: ESTIMATE_RANGE_DISCLAIMER,
  };
}

function executeGetBusinessInfo(input: unknown) {
  const parsed = z.object({ topic: z.string() }).safeParse(input);
  const topic = parsed.success ? getKnowledgeTopic(parsed.data.topic) : null;
  if (!topic) {
    return {
      error: "Unknown topic.",
      availableTopics: KNOWLEDGE_TOPIC_KEYS,
    };
  }
  return { topic: topic.key, content: topic.content };
}

/**
 * Build the exact request body the consultation form submits, so an assistant
 * lead is indistinguishable from a wizard lead. Exported for the parity tests.
 */
export function buildAssistantLeadBody(
  input: z.infer<typeof saveLeadInput>,
  ctx: Pick<AssistantToolContext, "rooms" | "transcript">,
  sourceDetail: "assistant_chat" | "assistant_handoff" = "assistant_chat",
) {
  const stored = buildCombinedStoredEstimate(ctx.rooms);
  const record = ctx.rooms.some(isPriceable)
    ? buildEstimateRecord({
        rooms: ctx.rooms,
        capturedAt: new Date().toISOString(),
        budget: input.budget,
        notes: input.message,
        propertyAddress: input.address,
      })
    : null;
  const projects = ctx.rooms
    .map((r) => r.project)
    .filter((p): p is ProjectType => !!p);
  const projectType =
    projects.length === 1
      ? mapEstimateProjectToConsultType(projects[0])
      : projects.length > 1
        ? "other"
        : "other";
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address ?? "",
    zip: "",
    projectType,
    message: input.message ?? "",
    budget: input.budget ?? "",
    timeline: input.timeline ?? "",
    companyWebsite: "",
    propertyProfile: null,
    estimate: buildCombinedConsultationPayload(stored),
    estimateRecord: record,
    source: "assistant" as const,
    sourceDetail,
    conversationTranscript: ctx.transcript.slice(0, 60_000),
  };
}

async function submitLead(
  body: Record<string, unknown>,
  ctx: AssistantToolContext,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  // One lead ingress: invoke the consultation route directly (no extra HTTP
  // hop) with the caller's IP forwarded so rate limiting stays per-visitor.
  const { POST: consultationPost } = await import("@/app/api/consultation/route");
  const request = new NextRequest("http://localhost/api/consultation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ctx.clientIp,
    },
    body: JSON.stringify(body),
  });
  const response = await consultationPost(request);
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, json };
}

async function executeSaveLead(input: unknown, ctx: AssistantToolContext) {
  const parsed = saveLeadInput.safeParse(input);
  if (!parsed.success) {
    return {
      saved: false,
      error:
        "Contact details are incomplete or invalid. Ask the homeowner for the missing or corrected details.",
      details: parsed.error.flatten().fieldErrors,
    };
  }
  const body = buildAssistantLeadBody(parsed.data, ctx);
  const result = await submitLead(body, ctx);
  if (!result.ok) {
    console.error(`[assistant] save_lead failed (${result.status}):`, result.json);
    return {
      saved: false,
      error:
        result.status === 400
          ? "The submission was rejected - a contact field looks invalid. Ask the homeowner to confirm their phone and email."
          : `The lead could not be saved right now. Apologize and share the direct line instead: call or text ${SITE_CONFIG.phone}.`,
    };
  }
  ctx.leadSaved = true;
  return {
    saved: true,
    whatHappensNext:
      "The team replies within one business day to schedule the free 60-90 minute in-home visit. No spam.",
  };
}

async function executeHandoff(input: unknown, ctx: AssistantToolContext) {
  const parsed = handoffInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid handoff request." };
  }
  ctx.handoffRequested = true;
  const { reason, name, phone, email } = parsed.data;
  if (name && phone && email) {
    const body = buildAssistantLeadBody(
      {
        name,
        phone,
        email,
        address: null,
        message: `HUMAN HANDOFF REQUESTED - ${reason}`,
        budget: null,
        timeline: null,
      },
      ctx,
      "assistant_handoff",
    );
    const result = await submitLead(body, ctx);
    if (result.ok) {
      ctx.leadSaved = true;
      return {
        ok: true,
        saved: true,
        tellTheHomeowner: `The team has been notified and will reach out within one business day. For anything urgent they can call or text ${SITE_CONFIG.phone}.`,
      };
    }
    console.error(`[assistant] handoff lead save failed (${result.status})`);
  }
  return {
    ok: true,
    saved: false,
    tellTheHomeowner: `The fastest way to reach the team directly is to call or text ${SITE_CONFIG.phone}, or email ${SITE_CONFIG.email}. If they share their name, phone, and email here, the team will follow up within one business day.`,
  };
}

export async function executeAssistantTool(
  name: string,
  input: unknown,
  ctx: AssistantToolContext,
): Promise<Record<string, unknown>> {
  switch (name) {
    case "update_project":
      return executeUpdateProject(input, ctx);
    case "calculate_estimate":
      return executeCalculateEstimate(ctx);
    case "get_business_info":
      return executeGetBusinessInfo(input);
    case "save_lead":
      return executeSaveLead(input, ctx);
    case "request_human_handoff":
      return executeHandoff(input, ctx);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
