/**
 * The short quote form and the "Have us call you" callback (owner, 1 November:
 * "They should also always have the option just to call us or have us give them
 * a call too") post to /api/consultation like every other consultation surface.
 * This module holds the parts of that contract the short form added, so the
 * full request and the callback shape are testable without a database:
 *
 * - email is optional unless the visitor asked us to reply by email;
 * - project type is optional, and defaults to a value the team can sort on;
 * - a callback carries a plain "CALLBACK REQUEST" marker in the notes, which
 *   reach the database row, the lead manager, the internal email, the lead
 *   dashboard and the p5 intake exactly where the visitor's own words did.
 *
 * Older clients (the /contact steps, the planning wizard, the assistant) send
 * email and project type as before and are unaffected.
 */
import { z } from "zod";
import { phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE } from "@/shared/phoneValidation";

export const PREFERRED_CONTACT_VALUES = ["call", "text", "email"] as const;
export type PreferredContact = (typeof PREFERRED_CONTACT_VALUES)[number];

export const REQUEST_KIND_VALUES = ["request", "callback"] as const;
export type RequestKind = (typeof REQUEST_KIND_VALUES)[number];

/** The project type a callback is filed under when the visitor names none. */
export const CALLBACK_PROJECT_TYPE = "Callback request";
/** The value the old form sent for "Other / Whole-home"; p5 intake already lists it. */
export const DEFAULT_PROJECT_TYPE = "other";

const PREFERRED_CONTACT_LABEL: Record<PreferredContact, string> = {
  call: "Call me",
  text: "Text me",
  email: "Email me",
};

/** Optional email: blank is allowed, anything else must be a real address. */
export const optionalEmailSchema = z
  .string()
  .trim()
  .max(254)
  .optional()
  .default("")
  .refine((value) => value === "" || z.string().email().safeParse(value).success, "Please enter a valid email");

/** The fields the short form adds to the consultation body. */
export const quoteRequestFields = {
  /** "callback" is the "Have us call you" switch: name and phone only. */
  requestKind: z.enum(REQUEST_KIND_VALUES).optional().default("request"),
  /** How should we reach you? Absent from older clients. */
  preferredContact: z.enum(PREFERRED_CONTACT_VALUES).optional(),
  /** Callback only: the visitor's "Best time to call", free text from a short list. */
  bestTime: z.string().trim().max(60).optional().default(""),
};

/**
 * Email is required only when the visitor asked to be emailed. Kept as a
 * superRefine on the route's object schema so the error lands on `email`.
 */
export function requireEmailWhenChosen(
  data: { email: string; preferredContact?: PreferredContact },
  ctx: z.RefinementCtx,
): void {
  if (data.preferredContact === "email" && !data.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Enter your email so we can reply by email.",
    });
  }
}

/** The stored project type: the visitor's own, or a sortable default. */
export function resolveProjectType(data: { projectType?: string; requestKind: RequestKind }): string {
  const given = data.projectType?.trim() ?? "";
  if (given) return given;
  return data.requestKind === "callback" ? CALLBACK_PROJECT_TYPE : DEFAULT_PROJECT_TYPE;
}

/**
 * The notes every destination receives. The visitor's own words are unchanged
 * and stay last; a callback leads with a marker nobody can miss, and the chosen
 * reply channel is stated so the team answers the way they were asked to.
 */
export function buildLeadNotes(data: {
  requestKind: RequestKind;
  preferredContact?: PreferredContact;
  bestTime?: string;
  phone: string;
  message?: string;
}): string {
  const lines: string[] = [];
  if (data.requestKind === "callback") {
    const when = data.bestTime?.trim();
    lines.push(
      `CALLBACK REQUEST: please call ${data.phone.trim()}${when ? `. Best time to call: ${when}` : ""}.`,
    );
  } else if (data.preferredContact) {
    lines.push(`How to reach them: ${PREFERRED_CONTACT_LABEL[data.preferredContact]}.`);
  }
  const own = data.message?.trim();
  if (own) lines.push(own);
  return lines.join("\n\n");
}

/** Subject line for the internal email, so a callback reads as one in the inbox. */
export function internalSubject(data: { requestKind: RequestKind; name: string }): string {
  return data.requestKind === "callback"
    ? `New callback request: ${data.name}`
    : `New consultation request: ${data.name}`;
}

const propertyProfileSchema = z
  .object({
    formattedAddress: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  })
  .passthrough()
  .optional()
  .nullable();

export const consultationBodySchema = z.object({
  name: z.string().min(2),
  phone: z.string().refine(phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE),
  /**
   * Optional since the short quote form:
   * blank is accepted, a typed address must be valid, and it is required when
   * the visitor picked "Email me". Older clients always send one.
   */
  email: optionalEmailSchema,
  address: z.string().optional().default(""),
  zip: z.string().optional().default(""),
  /** Optional: a callback names none, and the stored value falls back to a sortable default. */
  projectType: z.string().trim().max(200).optional().default(""),
  message: z.string().optional(),
  propertyProfile: propertyProfileSchema,
  estimate: z
    .object({
      project: z.string(),
      finish: z.string(),
      priceLow: z.number(),
      priceHigh: z.number(),
      roi: z.number(),
      sizeLabel: z.string().optional(),
      confidenceLabel: z.string().optional(),
      // Per-room breakdown when the visitor planned multiple rooms at once.
      // Without this the multi-room detail is silently dropped by zod.
      rooms: z
        .array(
          z.object({
            project: z.string(),
            finish: z.string(),
            sizeLabel: z.string(),
            priceLow: z.number(),
            priceHigh: z.number(),
          }),
        )
        .optional(),
    })
    .optional()
    .nullable(),
  /** Homeowner's stated budget band, when they chose one. */
  budget: z.string().optional().default(""),
  /** When they want to start; required by the estimator, optional elsewhere. */
  timeline: z.string().optional().default(""),
  /**
   * The complete record of what the homeowner selected and was shown in the
   * estimator. Declared explicitly (and permissively) because zod strips
   * unknown keys - anything not named here would be silently dropped before it
   * ever reached the CRM, which is exactly the failure this record exists to
   * prevent. Kept loose so adding a field to the record never 400s a real lead.
   */
  estimateRecord: z
    .object({
      version: z.number(),
      capturedAt: z.string(),
      rangeLow: z.number(),
      rangeHigh: z.number(),
      rangeFormatted: z.string(),
      confidenceLabel: z.string(),
      confidencePercent: z.number(),
      roomCount: z.number(),
      rooms: z.array(z.record(z.any())),
      included: z.array(z.string()),
      excluded: z.array(z.string()),
      assumptions: z.array(z.string()),
      disclaimers: z.array(z.string()),
      budget: z.string().nullable(),
      notes: z.string().nullable(),
      propertyAddress: z.string().nullable(),
    })
    .passthrough()
    .optional()
    .nullable(),
  /**
   * Lead origin. Whitelisted: the estimating assistant submits through this
   * same route so its leads flow into the identical pipeline, distinguished
   * only by source for CRM filtering.
   */
  source: z.enum(["consultation", "assistant"]).optional().default("consultation"),
  sourceDetail: z
    .enum(["consultation_form", "assistant_chat", "assistant_handoff"])
    .optional(),
  /**
   * Plain-text transcript of the assistant conversation that produced this
   * lead. Stored in the submission's raw payload (top-level string, so the
   * admin lead detail renders it directly) - never parsed or acted on.
   */
  conversationTranscript: z.string().max(60_000).optional(),
  /** Shared event id for Meta pixel + Conversions API deduplication. */
  metaEventId: z.string().optional(),
  /** Honeypot - must be empty; bots often fill hidden fields. */
  companyWebsite: z.string().optional().default(""),
  /** Short quote form: request or callback, how to reach them, best time to call. */
  ...quoteRequestFields,
}).superRefine(requireEmailWhenChosen);
