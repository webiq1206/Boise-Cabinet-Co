export const HOUSE_NUMBER_REGEX = /^\d+[A-Za-z]?\s+\S/;

export const HOUSE_NUMBER_ERROR_MESSAGE =
  "Please include your house number (for example, 4521 W Cherry Ln).";

export function hasLeadingHouseNumber(address: string | null | undefined): boolean {
  if (!address) return false;
  return HOUSE_NUMBER_REGEX.test(address.trim());
}

export function extractLeadingHouseNumber(value: string | null | undefined): string {
  if (!value) return "";
  const m = value.trim().match(/^(\d+[A-Za-z]?)\b/);
  return m ? m[1] : "";
}
