/**
 * Deterministic tests for the assistant's tool layer - no LLM in the loop.
 *
 * Run with: npm run test:assistant   (npx tsx tests/assistant/tools.test.ts)
 *
 * Covers: update_project normalization and missing-info reporting,
 * calculate_estimate parity with the engine, knowledge grounding (every topic
 * resolves; no dollar figures can leak in via knowledge), and save_lead body
 * parity with the consultation form the wizard submits.
 */

import {
  ASSISTANT_TOOLS,
  buildAssistantLeadBody,
  executeAssistantTool,
  type AssistantToolContext,
} from "../../lib/assistant/tools";
import {
  KNOWLEDGE_TOPICS,
  KNOWLEDGE_TOPIC_KEYS,
} from "../../shared/assistantKnowledge";
import {
  EMPTY_SELECTIONS,
  buildCombinedConsultationPayload,
  buildCombinedStoredEstimate,
  calculateCombinedEstimate,
  getDefaultSelectionsForProject,
} from "../../shared/estimateEngine";
import { buildEstimateRecord } from "../../shared/estimateRecord";

let passed = 0;
let failed = 0;

function check(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${message}`);
  }
}

function ctx(rooms = [] as AssistantToolContext["rooms"]): AssistantToolContext {
  return {
    rooms,
    transcript: "Homeowner: hi\nAssistant: hello",
    clientIp: "test",
    leadSaved: false,
    handoffRequested: false,
  };
}

async function main() {
  // ── Tool definitions are well-formed ──────────────────────────────────────
  check(ASSISTANT_TOOLS.length === 5, "five tools defined");
  for (const tool of ASSISTANT_TOOLS) {
    check(
      tool.input_schema.additionalProperties === false &&
        Array.isArray(tool.input_schema.required),
      `${tool.name}: strict schema shape`,
    );
  }

  // ── update_project ────────────────────────────────────────────────────────
  {
    const c = ctx();
    const result = (await executeAssistantTool(
      "update_project",
      { rooms: [{ ...EMPTY_SELECTIONS, project: "kitchen", size: 24 }] },
      c,
    )) as { ok?: boolean; rooms?: Array<Record<string, unknown>> };
    check(result.ok === true, "update_project accepts a partial kitchen");
    check(c.rooms.length === 1 && c.rooms[0].project === "kitchen", "context rooms updated");
    const status = result.rooms?.[0] as {
      priceable: boolean;
      missingForPricing: string[];
      optionalRefinements: string[];
    };
    check(status.priceable === false, "kitchen without uppers is not yet priceable");
    check(
      status.missingForPricing.some((m) => m.includes("upper")),
      "missing info names the upper run",
    );
    check(
      status.optionalRefinements.some((r) => r.includes("door style")),
      "refinements include door style",
    );

    const bad = (await executeAssistantTool(
      "update_project",
      { rooms: [{ project: "castle" }] },
      c,
    )) as { error?: string };
    check(Boolean(bad.error), "update_project rejects unknown project types");
    check(c.rooms[0].project === "kitchen", "rejected update leaves state untouched");

    // Oversized values normalize exactly as the engine clamps them.
    const clamped = (await executeAssistantTool(
      "update_project",
      { rooms: [{ ...EMPTY_SELECTIONS, project: "kitchen", size: 999, sizeUpper: 999 }] },
      c,
    )) as { rooms?: Array<{ normalizedValues: { size: number; sizeUpper: number } }> };
    check(
      clamped.rooms?.[0].normalizedValues.size === 60 &&
        clamped.rooms?.[0].normalizedValues.sizeUpper === 50,
      "oversized runs normalize to the engine's project maxima",
    );
  }

  // ── calculate_estimate ────────────────────────────────────────────────────
  {
    const empty = (await executeAssistantTool("calculate_estimate", {}, ctx())) as {
      priceable: boolean;
    };
    check(empty.priceable === false, "no rooms -> priceable false, never a number");

    const rooms = [
      getDefaultSelectionsForProject("kitchen"),
      getDefaultSelectionsForProject("bathroom"),
    ];
    const c = ctx(rooms);
    const result = (await executeAssistantTool("calculate_estimate", {}, c)) as {
      priceable: boolean;
      priceLow: number;
      priceHigh: number;
      rooms: Array<{ priceLow: number; priceHigh: number }>;
      requiredDisclaimer: string;
    };
    const direct = calculateCombinedEstimate(rooms)!;
    check(result.priceable === true, "defaults are priceable");
    check(
      result.priceLow === direct.priceLow && result.priceHigh === direct.priceHigh,
      `tool total EXACTLY equals the wizard's engine result (${direct.priceLow}..${direct.priceHigh})`,
    );
    check(
      result.rooms.every(
        (r, i) =>
          r.priceLow === direct.rooms[i].priceLow && r.priceHigh === direct.rooms[i].priceHigh,
      ),
      "tool per-room breakdown EXACTLY equals the engine's",
    );
    check(
      result.requiredDisclaimer.includes("general investment range"),
      "estimate carries the range disclaimer",
    );

    const partial = (await executeAssistantTool(
      "calculate_estimate",
      {},
      ctx([{ ...EMPTY_SELECTIONS, project: "kitchen", size: 24 }]),
    )) as { priceable: boolean; rooms?: Array<{ missingForPricing: string[] }> };
    check(
      partial.priceable === false &&
        Boolean(partial.rooms?.[0].missingForPricing.length),
      "unpriceable rooms report what's missing instead of a number",
    );
  }

  // ── get_business_info ─────────────────────────────────────────────────────
  {
    for (const key of KNOWLEDGE_TOPIC_KEYS) {
      const result = (await executeAssistantTool("get_business_info", { topic: key }, ctx())) as {
        content?: string;
      };
      check(Boolean(result.content && result.content.length > 40), `topic "${key}" resolves`);
    }
    const unknown = (await executeAssistantTool(
      "get_business_info",
      { topic: "secret-discounts" },
      ctx(),
    )) as { error?: string; availableTopics?: string[] };
    check(
      Boolean(unknown.error) && Array.isArray(unknown.availableTopics),
      "unknown topic returns the topic index, not fabricated content",
    );

    // Spot-check grounding against the published sources.
    const warranty = KNOWLEDGE_TOPICS.find((t) => t.key === "warranty")!;
    check(
      warranty.content.toLowerCase().includes("limited lifetime warranty"),
      "warranty topic states the published warranty",
    );
    const leadTime = KNOWLEDGE_TOPICS.find((t) => t.key === "lead-time")!;
    check(leadTime.content.includes("4-8 weeks"), "lead-time topic states the published figure");
    const areas = KNOWLEDGE_TOPICS.find((t) => t.key === "service-areas")!;
    for (const city of ["Boise", "Meridian", "Eagle", "Nampa", "Kuna", "Star", "Middleton", "Caldwell"]) {
      check(areas.content.includes(city), `service areas include ${city}`);
    }

    // No dollar figures may ever enter through knowledge - prices come only
    // from calculate_estimate.
    for (const topic of KNOWLEDGE_TOPICS) {
      check(
        !/\$\s?\d/.test(topic.content),
        `topic "${topic.key}" contains no dollar figures`,
      );
    }
  }

  // ── save_lead body parity with the consultation form ──────────────────────
  {
    const rooms = [
      getDefaultSelectionsForProject("kitchen"),
      getDefaultSelectionsForProject("bathroom"),
    ];
    const input = {
      name: "Test Homeowner",
      phone: "(208) 555-0100",
      email: "test@example.com",
      address: "123 Main St, Boise, ID 83702",
      message: "Kitchen and bath refresh",
      budget: "$30k - $50k",
      timeline: "1 - 3 months",
    };
    const body = buildAssistantLeadBody(input, { rooms, transcript: "Homeowner: hi" });

    // The estimate payload must be byte-identical to what ConsultationFields
    // builds for the same rooms.
    const expectedEstimate = buildCombinedConsultationPayload(
      buildCombinedStoredEstimate(rooms),
    );
    check(
      JSON.stringify(body.estimate) === JSON.stringify(expectedEstimate),
      "assistant lead estimate payload EXACTLY equals the wizard's",
    );

    const expectedRecord = buildEstimateRecord({
      rooms,
      capturedAt: "x",
      budget: input.budget,
      notes: input.message,
      propertyAddress: input.address,
    })!;
    check(
      body.estimateRecord?.rangeLow === expectedRecord.rangeLow &&
        body.estimateRecord?.rangeHigh === expectedRecord.rangeHigh &&
        body.estimateRecord?.roomCount === 2,
      "assistant estimate record matches the wizard's ranges and rooms",
    );
    check(body.projectType === "other", "multi-room lead resolves to whole-home type");
    check(body.source === "assistant" && body.sourceDetail === "assistant_chat", "source fields set");
    check(typeof body.conversationTranscript === "string", "transcript attached");
    check(body.companyWebsite === "", "honeypot left empty");

    const single = buildAssistantLeadBody(input, {
      rooms: [getDefaultSelectionsForProject("bathroom")],
      transcript: "",
    });
    check(single.projectType === "bathroom", "single bathroom maps to its consult type");

    const noRooms = buildAssistantLeadBody(input, { rooms: [], transcript: "" });
    check(
      noRooms.estimate === null && noRooms.estimateRecord === null,
      "lead without priceable rooms attaches no estimate (never fabricated)",
    );

    // Invalid contact details are rejected before any submission.
    const invalid = (await executeAssistantTool(
      "save_lead",
      { ...input, email: "not-an-email" },
      ctx(rooms),
    )) as { saved: boolean; error?: string };
    check(invalid.saved === false && Boolean(invalid.error), "invalid email rejected pre-submit");
  }

  // ── unknown tool ──────────────────────────────────────────────────────────
  {
    const result = (await executeAssistantTool("rm_rf", {}, ctx())) as { error?: string };
    check(Boolean(result.error), "unknown tool name returns an error");
  }

  console.log(`\n${passed} checks passed, ${failed} failed.`);
  if (failed > 0) {
    console.error("Assistant tool suite FAILED.");
    process.exit(1);
  }
  console.log("Assistant tool suite passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
