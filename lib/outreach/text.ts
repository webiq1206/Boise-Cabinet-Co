/** Em-dash (U+2014) and en-dash (U+2013) detection for outreach copy. */
export function hasEmDash(text: string | null | undefined): boolean {
  if (!text) return false;
  return /[\u2014\u2013]/.test(text);
}
