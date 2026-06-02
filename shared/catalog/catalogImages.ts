/**
 * Catalog product image paths — maps catalog slugs to manifest output filenames.
 */

/** Catalog hardware slug → image filename (without directory). */
export const HARDWARE_IMAGE_FILES: Record<string, string> = {
  "bar-pull-128-black": "bar-pull-128-black",
  "bar-pull-160-nickel": "bar-pull-160-nickel",
  "cup-pull-gold": "cup-pull-gold",
  "finger-edge-pull": "finger-edge-pull",
  "j-channel-pull": "j-channel-pull",
  "round-knob-nickel": "knob-round-nickel",
  "square-knob-black": "knob-square-black",
  "glass-knob-chrome": "glass-knob-chrome",
  "soft-close-hinge": "hinge-soft-close",
  "push-to-open-hinge": "push-to-open-hinge",
  "soft-close-drawer-slide": "slide-soft-close",
  "heavy-duty-drawer-slide": "slide-heavy-duty",
  "outdoor-bar-pull-stainless": "outdoor-bar-pull-stainless",
};

export function getHardwareImagePath(slug: string): string {
  const file = HARDWARE_IMAGE_FILES[slug] ?? slug;
  return `/images/catalog/hardware/${file}.webp`;
}

export function getAccessoryImagePath(slug: string): string {
  return `/images/catalog/accessories/${slug}.webp`;
}

export function getCatalogProductAlt(name: string, category: "hardware" | "accessory"): string {
  const label = category === "hardware" ? "cabinet hardware" : "cabinet accessory";
  return `${name} ${label} — Boise Cabinet Co`;
}
