/** Price tier shown to customers as $-$$$$$ ; "Price on request" when unconfirmed. */
export function formatPriceTier(finish: { priceTierMarker: number; priceConfirm?: boolean }): string {
  if (finish.priceConfirm) return "Price on request";
  const n = Math.min(5, Math.max(1, finish.priceTierMarker || 1));
  return "$".repeat(n);
}
