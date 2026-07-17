import { createHash } from "crypto";

/**
 * Meta Conversions API (server-side events).
 *
 * Complements the browser pixel: server events survive ad-blockers, iOS ITP,
 * and cookie loss, which raises match quality and lowers cost per result.
 *
 * DEDUPLICATION IS MANDATORY. The browser pixel already fires `Lead` on the
 * same submit, so both sides send the SAME `event_id` and `event_name`; Meta
 * then counts one conversion. Without this you would double-count every lead.
 *
 * Requires META_CAPI_ACCESS_TOKEN (server-only secret, NOT NEXT_PUBLIC):
 *   Events Manager > Boise Cabinet Co > Settings > Conversions API >
 *   Generate access token, then add it to Replit Secrets.
 * Until that is set every call is a safe no-op.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "899086193239991";
const API_VERSION = "v21.0";

/** Meta requires values normalized (trim + lowercase) before SHA-256. */
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const hashNormalized = (value: string) => sha256(value.trim().toLowerCase());

function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Meta wants E.164 digits without the leading '+'. Assume US for 10 digits.
  const e164 = digits.length === 10 ? `1${digits}` : digits;
  return sha256(e164);
}

export interface CapiLeadInput {
  /** Shared with the browser pixel's eventID so Meta dedupes the pair. */
  eventId?: string;
  eventSourceUrl?: string;
  email?: string;
  phone?: string;
  name?: string;
  zip?: string;
  clientIp?: string;
  userAgent?: string;
  /** Meta browser cookies; materially improve match quality when present. */
  fbp?: string;
  fbc?: string;
}

/**
 * Send a server-side `Lead`. Never throws: analytics must not be able to break
 * a real lead submission.
 */
export async function sendCapiLead(input: CapiLeadInput): Promise<void> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) return; // not configured yet: no-op

  try {
    const user_data: Record<string, unknown> = {};
    if (input.email) user_data.em = [hashNormalized(input.email)];
    if (input.phone) user_data.ph = [hashPhone(input.phone)];
    if (input.zip) user_data.zp = [hashNormalized(input.zip)];
    if (input.name) {
      const [first, ...rest] = input.name.trim().split(/\s+/);
      if (first) user_data.fn = [hashNormalized(first)];
      if (rest.length) user_data.ln = [hashNormalized(rest.join(" "))];
    }
    // These two are sent unhashed by design (Meta matches on them directly).
    if (input.clientIp) user_data.client_ip_address = input.clientIp;
    if (input.userAgent) user_data.client_user_agent = input.userAgent;
    if (input.fbp) user_data.fbp = input.fbp;
    if (input.fbc) user_data.fbc = input.fbc;

    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        data: [
          {
            event_name: "Lead",
            event_time: Math.floor(Date.now() / 1000),
            event_id: input.eventId,
            event_source_url: input.eventSourceUrl,
            action_source: "website",
            user_data,
            custom_data: { content_name: "Consultation request" },
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[meta-capi] Lead send failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[meta-capi] Lead send error:", err);
  }
}
