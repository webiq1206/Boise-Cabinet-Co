import { db } from "@/lib/db";
import { siteSettings } from "@/shared/schema";
import { eq } from "drizzle-orm";

/**
 * Admin-editable copy for the cold-outreach templates.
 *
 * The template *structure* (greeting, signature, CAN-SPAM footer, unsubscribe,
 * tracking pixel, em-dash stripping) stays code-owned and safe. What an admin
 * can edit here is the wording of the human parts: subject, opener/intro, the
 * main message, and the closing line. Values are stored in `site_settings`
 * under a single JSON key and merged over the code defaults, so a missing or
 * blank field always falls back to a sensible default and nothing can break.
 *
 * Editable text supports simple tokens that are filled in per contractor at
 * send time (see OUTREACH_TEMPLATE_TOKENS): {business} {city} {owner}
 * {company} {phone}.
 */

export const OUTREACH_TEMPLATE_CONTENT_KEY = "outreach_template_content";

export interface PersonalTemplateContent {
  subject: string;
  opener: string;
  pitch: string;
  closing: string;
}

export interface BrandedTemplateContent {
  subject: string;
  intro: string;
  bullets: string[];
  closing: string;
}

export interface OutreachTemplateContent {
  personal: PersonalTemplateContent;
  branded: BrandedTemplateContent;
}

export const DEFAULT_TEMPLATE_CONTENT: OutreachTemplateContent = {
  personal: {
    subject: "Taking the cabinet work off your plate in {city}",
    opener:
      "I run a custom cabinet shop here in the Treasure Valley, and I wanted to reach out and introduce myself.",
    pitch:
      "I spent several years running a remodeling business in Colorado before my family moved to Boise, where I opened a custom cabinet shop. These days I build custom cabinets right here in the valley for contractors who would rather hand off the cabinet portion of a job than manage it themselves. You get one person handling design, build, and install, pricing that stays competitive, and solid work your clients will be glad to show off. In practice that means one less trade to chase down and a budget that holds together.",
    closing:
      "If you have a kitchen, bath, or built in coming up, I would be glad to put a bid together so you can see the numbers, with no pressure either way. Just reply to this email or call me at {phone} and I will take it from there.",
  },
  branded: {
    subject: "{company}: your local cabinet partner in {city}",
    intro:
      "I am {owner} with {company}. After several years running a remodeling business in Colorado, my family moved to Boise and I opened this custom cabinet shop. I partner with contractors who would rather hand off the cabinet portion of a remodel than juggle it in house.",
    bullets: [
      "Custom kitchens, baths, and built ins, designed and built right here in the valley.",
      "Competitive pricing that keeps your project budget on track.",
      "Solid, well built work your clients will be proud to show off.",
      "One point of contact for design, build, and install, so you have one less trade to manage.",
    ],
    closing:
      "If you have a project coming up where the cabinets need pricing, just reply here or call me at {phone} and I will put a bid together. No pressure at all.",
  },
};

/** Tokens an admin can drop into editable copy; replaced per contractor. */
export const OUTREACH_TEMPLATE_TOKENS: { token: string; description: string }[] = [
  { token: "{business}", description: "The contractor's business name" },
  { token: "{city}", description: "The contractor's city" },
  { token: "{owner}", description: "Your name" },
  { token: "{company}", description: "Your company name" },
  { token: "{phone}", description: "Your phone number" },
];

/** Per-template field metadata used to render the editor form. */
export const OUTREACH_TEMPLATE_FIELDS: Record<
  "personal" | "branded",
  { key: string; label: string; help: string; list?: boolean }[]
> = {
  personal: [
    { key: "subject", label: "Subject line", help: "The email subject." },
    { key: "opener", label: "Opening line", help: "The first sentence, introduces you." },
    { key: "pitch", label: "Main message", help: "Your story and what you offer." },
    { key: "closing", label: "Closing line", help: "The low-pressure sign off." },
  ],
  branded: [
    { key: "subject", label: "Subject line", help: "The email subject." },
    { key: "intro", label: "Introduction", help: "A short company introduction." },
    {
      key: "bullets",
      label: "What we do",
      help: "One point per line. Shown as a bulleted list.",
      list: true,
    },
    { key: "closing", label: "Closing line", help: "The low-pressure sign off." },
  ],
};

export interface TemplateTokens {
  business: string;
  city: string;
  owner: string;
  company: string;
  phone: string;
}

/** Replace {token} placeholders with their per-contractor values. */
export function applyTokens(text: string, tokens: TemplateTokens): string {
  return text
    .replace(/\{business\}/g, tokens.business)
    .replace(/\{city\}/g, tokens.city)
    .replace(/\{owner\}/g, tokens.owner)
    .replace(/\{company\}/g, tokens.company)
    .replace(/\{phone\}/g, tokens.phone);
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function lines(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const cleaned = value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    if (cleaned.length > 0) return cleaned;
  }
  return fallback;
}

/** Merge stored (possibly partial/invalid) content over the code defaults. */
export function mergeTemplateContent(raw: unknown): OutreachTemplateContent {
  const d = DEFAULT_TEMPLATE_CONTENT;
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const personal = (obj.personal && typeof obj.personal === "object"
    ? obj.personal
    : {}) as Record<string, unknown>;
  const branded = (obj.branded && typeof obj.branded === "object"
    ? obj.branded
    : {}) as Record<string, unknown>;

  return {
    personal: {
      subject: str(personal.subject, d.personal.subject),
      opener: str(personal.opener, d.personal.opener),
      pitch: str(personal.pitch, d.personal.pitch),
      closing: str(personal.closing, d.personal.closing),
    },
    branded: {
      subject: str(branded.subject, d.branded.subject),
      intro: str(branded.intro, d.branded.intro),
      bullets: lines(branded.bullets, d.branded.bullets),
      closing: str(branded.closing, d.branded.closing),
    },
  };
}

/**
 * Load the effective (saved-or-default) editable template content. Always
 * returns a complete object; on any error it returns the code defaults so
 * sending never breaks.
 */
export async function getOutreachTemplateContent(): Promise<OutreachTemplateContent> {
  if (!db) return mergeTemplateContent(null);
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, OUTREACH_TEMPLATE_CONTENT_KEY))
      .limit(1);
    if (rows.length === 0) return mergeTemplateContent(null);
    return mergeTemplateContent(JSON.parse(rows[0].value));
  } catch {
    return mergeTemplateContent(null);
  }
}
