/**
 * Shared OSC catalog SKU code patterns (PDF text extraction).
 */

/** Words that match substrings of real codes but are not SKUs */
export const OSC_SKU_DENYLIST = new Set([
  "FLAT",
  "FLOATING",
  "FLORAL",
  // Category / marketing words the patterns over-match (not product SKUs).
  "EPIC",
  "FILLER",
  "FILLERS",
  "HOODS",
  // pdftotext splits "FLFH-?D-2ROT" into "FLFH-?D-2 ROT"; the bare prefix is an
  // artifact, not a SKU (the real codes FLFH-1D-2ROT / FLFH-2D-2ROT are in catalog).
  "FLFH-1D-2",
  "FLFH-2D-2",
]);

export const OSC_SKU_PATTERN =
  /\b(?:B[A-Z0-9]*(?:-[A-Z0-9]+)+|W[A-Z0-9]*(?:-[A-Z0-9]+)+|T[A-Z0-9]*(?:-[A-Z0-9]+)+|BFH-[A-Z0-9-]+|V[A-Z0-9]*(?:-[A-Z0-9]+)+|EP[A-Z0-9-]*|FILL[A-Z0-9-]*|HOOD[A-Z0-9-]*|FS[A-Z0-9-]*|FLB-[A-Z0-9-]+|FLFH-[A-Z0-9-]+|FLSB-[A-Z0-9-]+|FLSBFH-[A-Z0-9-]+|FLDB[23](?:-[A-Z0-9-]+)?|FLS3(?:L|R|OE)|SB-[A-Z0-9-]+|SBFH-[A-Z0-9-]+|LS3612[LR])\b/g;

export function extractOscSkuCodes(text) {
  const seen = new Set();
  for (const m of text.matchAll(OSC_SKU_PATTERN)) {
    const code = m[0];
    if (!OSC_SKU_DENYLIST.has(code)) seen.add(code);
  }
  return seen;
}

export function categorizeOscSku(code) {
  if (code.startsWith("W")) return "wall";
  if (code.startsWith("T") || code.startsWith("BFH")) return "tall";
  if (code.startsWith("V")) return "vanity";
  if (code.startsWith("EP") || code.includes("END")) return "end-panel";
  if (code.startsWith("FILL")) return "filler";
  if (code.startsWith("HOOD")) return "hood";
  if (
    code.startsWith("FS") ||
    code.startsWith("FL") ||
    code.startsWith("SB-") ||
    code.startsWith("SBFH") ||
    code.startsWith("LS3612")
  ) {
    return "floating-shelf";
  }
  return "base";
}
