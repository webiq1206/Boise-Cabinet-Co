/** Values that can be sent to Google Ads as enhanced-conversion user_data. */
export function normalizedEnhancedConversionEmail(email: unknown): string | undefined {
  if (typeof email !== "string") return undefined;
  const value = email.trim().toLowerCase();
  return value || undefined;
}

/** E.164 +1XXXXXXXXXX only when the input has exactly 10 digits. */
export function normalizedEnhancedConversionPhone(phone: unknown): string | undefined {
  if (typeof phone !== "string") return undefined;
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : undefined;
}
