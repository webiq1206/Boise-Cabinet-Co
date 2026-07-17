import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  EMAIL_BRAND,
  SITE_BASE_URL,
  emailStyles,
  buildTextLogo,
  escapeHtml,
  htmlToPlainText,
} from "./emailLayout";

export interface RenderTemplateInput {
  subject: string;
  openingLine?: string | null;
  mainMessage?: string | null;
  closingLine?: string | null;
  body?: string | null; // plain-body mode (overrides structured fields when set)
  signerName?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaUrl?: string | null;
}

// Supported substitution tokens. Missing values drop gracefully.
export interface RenderTokens {
  firstName?: string | null;
  business?: string | null;
  city?: string | null;
  projectType?: string | null;
  serviceArea?: string | null;
  planningRange?: string | null;
  phone?: string | null;
}

export interface RenderContext {
  template: RenderTemplateInput;
  tokens: RenderTokens;
  unsubscribeUrl: string;
  openPixelUrl?: string | null;
  // Wraps an outbound URL so clicks are tracked, then redirected.
  clickTracker?: (url: string) => string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const TOKEN_KEYS: (keyof RenderTokens)[] = [
  "firstName",
  "business",
  "city",
  "projectType",
  "serviceArea",
  "planningRange",
  "phone",
];

/**
 * Replaces {token} placeholders with values. Missing values are dropped
 * gracefully: the placeholder is removed and any doubled spaces or dangling
 * punctuation left behind are tidied so copy never reads "in  ." or "for {city}".
 */
export function substituteTokens(input: string, tokens: RenderTokens): string {
  let out = input;
  // House style: no em or en dashes in any outreach copy. Convert them (and any
  // surrounding whitespace) to a comma so even operator-typed dashes never ship;
  // the tidy pass below cleans up any resulting doubled or dangling punctuation.
  out = out.replace(/\s*[\u2014\u2013]\s*/g, ", ");
  for (const key of TOKEN_KEYS) {
    const value = tokens[key];
    const re = new RegExp(`\\{${key}\\}`, "g");
    out = out.replace(re, value ? String(value) : "");
  }
  // Tidy artifacts from dropped tokens.
  out = out
    .replace(/ {2,}/g, " ") // collapse double spaces
    .replace(/\(\s*\)/g, "") // empty parens
    .replace(/\s+([,.!?;:])/g, "$1") // space before punctuation
    .replace(/,\s*,/g, ",") // doubled commas
    .replace(/(^|\n)\s*[,.;:]\s*/g, "$1") // leading punctuation on a line
    .trim();
  return out;
}

// Greeting with a graceful fallback. Never "Hi there,".
function buildGreeting(tokens: RenderTokens): string {
  const first = tokens.firstName?.trim();
  if (first) return `Hi ${first},`;
  return "Hello,";
}

function paragraph(html: string): string {
  return `<p style="margin:0 0 18px 0; color:${EMAIL_BRAND.charcoal}; font-size:15px; line-height:1.7;">${html}</p>`;
}

// Splits a block into spaced paragraphs on blank lines and single newlines.
function renderBlock(raw: string, tokens: RenderTokens): string {
  const substituted = substituteTokens(raw, tokens);
  if (!substituted) return "";
  return substituted
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => paragraph(escapeHtml(block).replace(/\n/g, "<br />")))
    .join("\n");
}

function renderCta(label: string | null | undefined, url: string | null | undefined, clickTracker?: (u: string) => string): string {
  if (!label || !url) return "";
  const finalUrl = clickTracker ? clickTracker(url) : url;
  return `<a href="${finalUrl}" style="display:inline-block; background:${EMAIL_BRAND.bone}; color:${EMAIL_BRAND.onAccent}; padding:14px 32px; text-decoration:none; border-radius:6px; font-weight:600; margin:8px 8px 8px 0;">${escapeHtml(label)}</a>`;
}

function buildSignature(signerName?: string | null): string {
  const name = signerName?.trim() || "The Boise Cabinet Co team";
  return `
    <div style="margin-top:28px; padding-top:20px; border-top:1px solid ${EMAIL_BRAND.border};">
      <p style="margin:0; color:${EMAIL_BRAND.charcoal}; font-size:15px;">Warm regards,</p>
      <p style="margin:4px 0 0 0; color:${EMAIL_BRAND.charcoal}; font-size:15px; font-weight:600;">${escapeHtml(name)}</p>
      <p style="margin:2px 0 0 0; color:${EMAIL_BRAND.charcoalLight}; font-size:13px;">Boise Cabinet Co</p>
      <p style="margin:2px 0 0 0; font-size:13px;"><a href="${SITE_BASE_URL}" style="color:${EMAIL_BRAND.charcoal};">boisecabinet.co</a> &middot; <a href="${SITE_CONFIG.phoneHref}" style="color:${EMAIL_BRAND.charcoal};">${escapeHtml(SITE_CONFIG.phone)}</a></p>
    </div>
  `;
}

// CAN-SPAM compliant footer: physical identity line + one-click unsubscribe.
function buildOutreachFooter(unsubscribeUrl: string): string {
  const identity = `Boise Cabinet Co · ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.state} · ${SITE_CONFIG.serviceAreaLabel}`;
  return `
    <div style="padding:18px 30px 28px 30px; border-top:1px solid ${EMAIL_BRAND.border};">
      <p style="margin:0 0 4px 0; font-size:12px; color:${EMAIL_BRAND.charcoalLight};">${escapeHtml(identity)}</p>
      <p style="margin:0; font-size:12px; color:${EMAIL_BRAND.charcoalLight};">Would you rather not hear from me? <a href="${unsubscribeUrl}" style="color:${EMAIL_BRAND.charcoalLight}; text-decoration:underline;">Unsubscribe here</a> and I will not reach out again.</p>
    </div>
  `;
}

/**
 * Renders an outreach email: branded shell, greeting with safe fallback, spaced
 * paragraph blocks with token substitution, CTA buttons, signature, and a
 * mandatory unsubscribe footer. Links are routed through click tracking when a
 * tracker is provided, and an open pixel is appended for real sends.
 */
export function renderOutreachEmail(ctx: RenderContext): RenderedEmail {
  const { template, tokens, unsubscribeUrl, openPixelUrl, clickTracker } = ctx;

  const subject = substituteTokens(template.subject, tokens);
  const greeting = buildGreeting(tokens);

  let bodyHtml: string;
  if (template.body && template.body.trim()) {
    bodyHtml = renderBlock(template.body, tokens);
  } else {
    bodyHtml = [template.openingLine, template.mainMessage, template.closingLine]
      .filter((b): b is string => Boolean(b && b.trim()))
      .map((b) => renderBlock(b, tokens))
      .filter(Boolean)
      .join("\n");
  }

  const ctas = [
    renderCta(template.ctaLabel, template.ctaUrl, clickTracker),
    renderCta(template.secondaryCtaLabel, template.secondaryCtaUrl, clickTracker),
  ]
    .filter(Boolean)
    .join("\n");

  const pixel = openPixelUrl
    ? `<img src="${openPixelUrl}" width="1" height="1" alt="" style="display:none;" />`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div style="padding:28px 30px 0 30px;">
      <a href="${clickTracker ? clickTracker(SITE_BASE_URL) : SITE_BASE_URL}" style="text-decoration:none;">${buildTextLogo()}</a>
    </div>
    <div class="content" style="padding-top:12px;">
      ${paragraph(escapeHtml(greeting))}
      ${bodyHtml}
      ${ctas ? `<div style="margin:8px 0 4px 0;">${ctas}</div>` : ""}
      ${buildSignature(template.signerName)}
    </div>
    ${buildOutreachFooter(unsubscribeUrl)}
    ${pixel}
  </div>
</body>
</html>`;

  const text = htmlToPlainText(html);
  return { subject, html, text };
}

// Builds the merge tokens for a lead row.
export function tokensForLead(lead: {
  name?: string | null;
  companyName?: string | null;
  city?: string | null;
  serviceArea?: string | null;
  serviceType?: string | null;
  phone?: string | null;
}, extra?: { planningRange?: string | null; projectType?: string | null }, audience?: string | null): RenderTokens {
  // A business lead's "name" is frequently just the company name (imports copy
  // it across), which would greet them as "Hi {Company}," -- an obvious mail
  // merge tell. Only use a personal first name for non-business audiences when
  // the name is a real person's name (not the company); otherwise fall back to
  // the generic "Hello," greeting.
  const trimmedName = lead.name?.trim() ?? "";
  const trimmedCompany = lead.companyName?.trim() ?? "";
  const nameIsCompany =
    trimmedName.length > 0 &&
    trimmedCompany.length > 0 &&
    trimmedName.toLowerCase() === trimmedCompany.toLowerCase();
  const usePersonalName =
    trimmedName.length > 0 && audience !== "business" && !nameIsCompany;
  const firstName = usePersonalName ? trimmedName.split(/\s+/)[0] : null;
  return {
    firstName: firstName || null,
    business: lead.companyName || null,
    city: lead.city || null,
    serviceArea: lead.serviceArea || lead.city || null,
    projectType: extra?.projectType || lead.serviceType || null,
    planningRange: extra?.planningRange || null,
    phone: lead.phone || SITE_CONFIG.phone,
  };
}
