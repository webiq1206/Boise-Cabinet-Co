import { localAlt } from "../localAlt";

/**
 * Catalog product image paths, maps catalog slugs to manifest output filenames.
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
  // Every accessory has its own picture (19 November 2026); "partition" used to borrow the vertical divider's.
  return `/images/catalog/accessories/${slug}.webp`;
}

/**
 * What each accessory picture shows, by file name (owner-approved AI stills,
 * 19 November 2026). Only what is in the picture: the things stored in a tray
 * or a drawer are its contents. Never worded as a photograph of completed
 * work, and no qualifier word. Change a file and change its line.
 */
export const ACCESSORY_IMAGE_DESCRIPTION: Readonly<Record<string, string>> = {
  "appliance-garage": "appliance garage with a lift-up door open on a coffee maker, set on a gray countertop",
  "blind-corner-pullout": "blind corner cabinet with chrome wire baskets pulled out past the open door",
  "blind-corner": "blind corner cabinet with two white kidney-shaped shelves swung out of the opening",
  "cutting-board-insert": "wood cutting board pulled out from under a countertop above white drawer fronts",
  "drawer-organizer-kit": "open drawer with wood organizer compartments holding wooden spoons, a whisk and a spatula",
  "floating-shelf": "two oak floating shelves on a white wall beside white wall cabinets",
  "lazy-susan": "corner base cabinet with both doors open on a two-tier white lazy susan",
  "led-strip-channel": "LED strip channel lit under white wall cabinets above a white countertop",
  "mixer-lift": "stand mixer raised on a spring-loaded lift shelf out of a white base cabinet",
  "partition": "base cabinet with upright wood partitions holding baking sheets and cutting boards",
  "peg-board-drawer": "open peg board drawer with wood pegs holding stacks of white plates and bowls",
  "pull-out-hamper": "tilt-out cabinet hamper with a canvas bag pulled open from a white cabinet",
  "pull-out-pantry": "tall pull-out pantry with wire shelves of jars and cans drawn out of a white cabinet run",
  "pull-out-shelf": "wood pull-out shelf holding mixing bowls and a colander in an open white base cabinet",
  "rollout-tray": "wood roll-out tray with dovetail corners holding stainless pots and pans",
  "spice-rack-pullout": "narrow spice rack pull-out with shelves of jars open beside a range",
  "tip-out-tray": "sink front tip-out tray open on a sponge and a scrub brush under a stainless sink",
  "trash-pullout": "trash pull-out with two gray bins drawn out of a white base cabinet",
  "utensil-divider": "open drawer with wood dividers holding forks, knives and spoons",
  "vertical-divider": "cabinet beside a wall oven with upright dividers holding baking sheets and a muffin pan",
  "wine-rack-insert": "wood wine rack insert with three bottles between white base cabinets",
};

/**
 * The alt of an accessory's picture, in the site's local form ("Cabinet
 * accessories in Boise, Idaho: <what the picture shows>"). localAlt() leaves a
 * finished alt as it is, so callers may pass this through it again. A file
 * with no line yet falls back to the accessory's name.
 */
export function getAccessoryImageDescription(slug: string, name?: string): string {
  const description = ACCESSORY_IMAGE_DESCRIPTION[slug] ?? `${name ?? slug.replace(/-/g, " ")} cabinet accessory`;
  return localAlt(description, { subject: "cabinet accessories" });
}

/** OSC accessory family slug → application image (same path convention as accessories) */
export function getAccessoryFamilyImagePath(slug: string): string {
  return getAccessoryImagePath(slug);
}

export function getCatalogProductAlt(name: string, category: "hardware" | "accessory"): string {
  const label = category === "hardware" ? "cabinet hardware" : "cabinet accessory";
  return `${name} ${label}, Boise Cabinet Co`;
}
