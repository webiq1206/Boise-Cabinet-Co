/** Minimum digit count for a US phone number (area code + number). */
export const MIN_PHONE_DIGITS = 10;

/** Count digits in a phone string (ignores formatting characters). */
export function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, "").length;
}

export function phoneHasEnoughDigits(phone: string): boolean {
  return countPhoneDigits(phone) >= MIN_PHONE_DIGITS;
}

export const PHONE_VALIDATION_MESSAGE =
  "Please enter a valid phone number with at least 10 digits";
