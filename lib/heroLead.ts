/**
 * Heroes carry one support line under the H1. Everything else a hero used to
 * say moves, word for word, into the first section below it (family plan
 * Phase 3). This splits a paragraph at its first sentence so the two halves
 * together are exactly the original text.
 *
 * A sentence ends at ".", "!" or "?" followed by whitespace and a capital
 * letter, digit or opening quote. Abbreviations such as "Mon-Fri" or "3/4 in."
 * never end a sentence because no capital follows them in this site's copy.
 */
export function splitLead(text: string | undefined | null): { lead: string; rest: string } {
  const source = (text ?? "").trim();
  const match = /^(.+?[.!?])\s+(?=[A-Z0-9"“(])/.exec(source);
  if (!match) return { lead: source, rest: "" };
  return { lead: match[1], rest: source.slice(match[0].length).trim() };
}
