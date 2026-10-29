/**
 * Phase 2 claims gates.
 *
 * Unproven lifetime-warranty and founding-year lines stay in source.
 * They render only when the matching flag is exactly "true".
 * A badge or stat row that must keep text uses the manufacturer pass-through.
 */

/** Registered entity name + number (Phase 0 X1 / Phase 6.7). */
export const REGISTERED_ENTITY_NAME = "P5 Home Co LLC";

export const IDAHO_REGISTERED_CONTRACTOR =
  "P5 Home Co LLC, Idaho Registered Contractor #8381215";

/** Short number-only form for places that already name the entity nearby. */
export const IDAHO_REGISTRATION_NUMBER = "Idaho Registered Contractor #8381215";

/**
 * Trust line without "bonded" (Phase 6.4: Idaho registration requires no bond;
 * publish bonded only when a surety and amount are named).
 */
export const REGISTERED_BONDED_INSURED =
  "P5 Home Co LLC, Idaho Registered Contractor #8381215. Insured; certificate on request";

/** Proof-strip / warranty claim language (F18, D6, K-5). */
export const MANUFACTURER_WARRANTY_PASS_THROUGH =
  "Warranty claims handled by us";

/** Two-year installation workmanship term (D6). */
export const CABINET_WORKMANSHIP_WARRANTY =
  "2-year workmanship warranty on cabinet installation";

export const PUBLIC_HOURS_LINE =
  "Mon\u2013Fri 9 AM\u20136 PM, Sat 9 AM\u20134 PM (Mountain).";

const LIFETIME_CLAIM =
  /limited lifetime|lifetime warranty|lifetime workmanship|lifetime of original home ownership|lifetime coverage/i;

const FOUNDING_MARK =
  /\b(since|founded|founding|established|est\.?|opening date)\b/i;

function flagOn(value: string | undefined): boolean {
  return value === "true";
}

/** Hidden unless SHOW_LIFETIME_WARRANTY or NEXT_PUBLIC_SHOW_LIFETIME_WARRANTY is exactly "true". */
export function showLifetimeWarranty(
  value: string | undefined = process.env.SHOW_LIFETIME_WARRANTY ??
    process.env.NEXT_PUBLIC_SHOW_LIFETIME_WARRANTY,
): boolean {
  return flagOn(value);
}

/** Hidden unless SHOW_FOUNDING_YEAR or NEXT_PUBLIC_SHOW_FOUNDING_YEAR is exactly "true". */
export function showFoundingYear(
  value: string | undefined = process.env.SHOW_FOUNDING_YEAR ??
    process.env.NEXT_PUBLIC_SHOW_FOUNDING_YEAR,
): boolean {
  return flagOn(value);
}

export function isLifetimeWarrantyClaim(text: string): boolean {
  return LIFETIME_CLAIM.test(text);
}

/** Badge, stat, or comparison row. Keeps the original when the flag is on. */
export function publicWarrantyRow(text: string): string {
  if (showLifetimeWarranty() || !isLifetimeWarrantyClaim(text)) return text;
  return MANUFACTURER_WARRANTY_PASS_THROUGH;
}

function cleanup(text: string): string {
  return text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/,\s*,/g, ",")
    .replace(/^[,\s]+/, "")
    .replace(/\s+$/, "")
    .trim();
}

function stripFounding(sentence: string): string {
  if (showFoundingYear() || !/\b2020\b/.test(sentence) || !FOUNDING_MARK.test(sentence)) {
    return sentence;
  }
  const next = sentence
    .replace(/\bwas founded in 2020 and\b/gi, "")
    .replace(/\bfounded in 2020,?\s*/gi, "")
    .replace(/\bFounded [\w .&']+?\s+in 2020\s*/g, "")
    .replace(/,?\s*since 2020\b/gi, "")
    .replace(/\bEst\.?\s*2020\b/gi, "")
    .replace(/\bOpening date:\s*2020\b/gi, "")
    .replace(/\bfoundingDate\b[:\s]*["']?2020["']?/gi, "");
  if (/\b2020\b/.test(next) && FOUNDING_MARK.test(next)) return "";
  return next;
}

function stripLifetime(sentence: string): string {
  if (showLifetimeWarranty() || !LIFETIME_CLAIM.test(sentence)) return sentence;
  const next = sentence
    .replace(/,?\s*backed by (?:a |our )?(?:limited )?lifetime(?: workmanship)? warranty/gi, "")
    .replace(/,?\s*and back our work with a lifetime workmanship warranty(?: to the original homeowner)?/gi, "")
    .replace(/,?\s*with a (?:limited )?lifetime(?: workmanship)? warranty/gi, "")
    .replace(/,?\s*and a lifetime workmanship warranty/gi, "")
    .replace(/,?\s*and lifetime workmanship warranty/gi, "")
    .replace(/\s+and backed by (?:a |our )?(?:limited )?lifetime(?: workmanship)? warranty/gi, "")
    .replace(/,?\s*and lifetime warranty support(?: through your portal)?/gi, "")
    .replace(/\s+and lifetime warranty on every cabinet/gi, "")
    .replace(/,?\s*carrying a (?:limited )?lifetime(?: workmanship)? warranty/gi, "");
  if (LIFETIME_CLAIM.test(next)) return "";
  return next;
}

function hideSentence(sentence: string): string {
  const next = cleanup(stripLifetime(stripFounding(sentence))).replace(/\s+and(?=\s*[.])/gi, "");
  return next.replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

/** Public copy. Source strings stay put; unproven sentences and clauses do not render. */
export function publicText(text: string): string {
  if (showLifetimeWarranty() && showFoundingYear()) return text;
  return text
    .split(/(\n+)/)
    .map((part) => {
      if (/^\n+$/.test(part)) return part;
      const pieces = part.split(/(?<=[.!?])\s+/);
      return cleanup(pieces.map(hideSentence).filter((piece) => piece && !/^[.\s]*$/.test(piece)).join(" "));
    })
    .join("");
}

type QaItem = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

/** Drops a FAQ when hiding the claim leaves no answer. Source arrays stay intact. */
export function publicQa<T extends QaItem>(items: T[]): T[] {
  return items.flatMap((item) => {
    const questionKey = item.question !== undefined ? "question" : "q";
    const answerKey = item.answer !== undefined ? "answer" : "a";
    const rawQuestion = String(item[questionKey as keyof T] ?? "");
    const rawAnswer = String(item[answerKey as keyof T] ?? "");
    const question = publicText(rawQuestion);
    const answer = publicText(rawAnswer);
    if (!question || !answer) return [];
    if (question === rawQuestion && answer === rawAnswer) return [item];
    return [{ ...item, [questionKey]: question, [answerKey]: answer }];
  });
}

function stripClaimMarkup(inner: string): string {
  if (!showFoundingYear()) {
    inner = inner
      .replace(/\bwas founded in 2020 and\b/gi, "")
      .replace(/\bfounded in 2020,?\s*/gi, "")
      .replace(/\bFounded [\w .&']+?\s+in 2020\s*/g, "")
      .replace(/,?\s*since 2020\b/gi, "")
      .replace(/\bEst\.?\s*2020\b/gi, "");
  }
  if (!showLifetimeWarranty()) {
    inner = inner
      .replace(/,?\s*backed by (?:a |our )?(?:limited )?lifetime(?: workmanship)? warranty/gi, "")
      .replace(/,?\s*and back our work with a lifetime workmanship warranty(?: to the original homeowner)?/gi, "")
      .replace(/,?\s*with a (?:limited )?lifetime(?: workmanship)? warranty/gi, "")
      .replace(/,?\s*and a lifetime workmanship warranty/gi, "")
      .replace(/,?\s*and lifetime workmanship warranty/gi, "")
      .replace(/\s+and backed by (?:a |our )?(?:limited )?lifetime(?: workmanship)? warranty/gi, "")
      .replace(/,?\s*and lifetime warranty support(?: through your portal)?/gi, "")
      .replace(/\s+and lifetime warranty on every cabinet/gi, "");
  }
  return inner;
}

/** Article HTML. Block copy that is only an unproven claim is omitted, not deleted from source. */
export function publicHtml(html: string): string {
  if (showLifetimeWarranty() && showFoundingYear()) return html;
  return html.replace(
    /<(p|li|h2|h3|blockquote|td)(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag: string, attrs: string, inner: string) => {
      const plain = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const next = publicText(plain);
      if (!next) return tag === "td" ? `<${tag}${attrs}></${tag}>` : "";
      if (next === plain) return full;
      if (/<[a-z]/i.test(inner)) {
        const stripped = stripClaimMarkup(inner);
        const visible = publicText(stripped.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
        if (!visible) return tag === "td" ? `<${tag}${attrs}></${tag}>` : "";
        return `<${tag}${attrs}>${stripped}</${tag}>`;
      }
      return `<${tag}${attrs}>${next}</${tag}>`;
    },
  );
}
