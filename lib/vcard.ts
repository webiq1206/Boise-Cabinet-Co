import { IDAHO_REGISTERED_CONTRACTOR } from "@/shared/claims";
import { SITE_CONFIG } from "@/shared/siteConfig";

/** Escape special characters per vCard 3.0 (RFC 2426). */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatTelE164(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return tel;
}

const textEncoder = new TextEncoder();

function octetLength(value: string): number {
  return textEncoder.encode(value).length;
}

/**
 * Fold one logical line so every physical line is at most 75 octets.
 * A continuation begins with a single space. CRLF separates physical lines.
 */
function foldLine(line: string, max = 75): string {
  if (octetLength(line) <= max) return line;
  const parts: string[] = [];
  let remaining = line;
  let budget = max;
  while (octetLength(remaining) > budget) {
    let take = 0;
    let used = 0;
    for (const char of remaining) {
      const size = octetLength(char);
      if (used + size > budget) break;
      used += size;
      take += char.length;
    }
    if (take === 0) break;
    parts.push(remaining.slice(0, take));
    remaining = remaining.slice(take);
    budget = max - 1;
  }
  if (remaining) parts.push(remaining);
  return parts.map((part, index) => (index === 0 ? part : ` ${part}`)).join("\r\n");
}

/** Build a vCard 3.0 payload from canonical site config (Phase 11). */
export function buildBusinessVCard(): string {
  const tel = formatTelE164(SITE_CONFIG.phoneTel);
  const note = [
    "Custom cabinets designed to your measurements, built to order, installed by our Treasure Valley crew.",
    "A P5 Home Co company.",
    IDAHO_REGISTERED_CONTRACTOR + ".",
  ].join(" ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    foldLine(`N:Perkins;Nick;;;`),
    foldLine(`FN:Nick Perkins`),
    foldLine(`ORG:${escapeVCard(SITE_CONFIG.name)}`),
    foldLine(`TITLE:Founder`),
    foldLine(`TEL;TYPE=WORK,VOICE:${tel}`),
    foldLine(`EMAIL;TYPE=WORK:${escapeVCard(SITE_CONFIG.email)}`),
    foldLine(`URL:${escapeVCard(SITE_CONFIG.siteUrl)}`),
    foldLine(
      `ADR;TYPE=WORK:;;;${escapeVCard(SITE_CONFIG.address.city)};${escapeVCard(SITE_CONFIG.address.state)};83646;USA`,
    ),
    foldLine(`NOTE:${escapeVCard(note)}`),
    "END:VCARD",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export const BUSINESS_VCARD_PATH = "/contact.vcf";
export const BUSINESS_VCARD_FILENAME = "Boise-Cabinet-Co.vcf";
