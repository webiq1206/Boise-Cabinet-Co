/**
 * Attribute-driven content generator for finish detail pages.
 *
 * Finish data carries no editorial copy, which left ~299 finish pages thin and
 * near-duplicate (see seo-audit/programmatic-seo-analysis.md). This module
 * derives genuinely useful, finish-specific prose + FAQs from the structured
 * attributes (color family, sheen, category, compatibility) so each page gives
 * real guidance instead of a swatch + chips.
 */

import type { Finish } from "@/shared/catalog";

const CATEGORY_LABEL: Record<string, string> = {
  matte: "matte",
  gloss: "high-gloss",
  woodgrain: "woodgrain",
};

const SHEEN_NOTE: Record<string, string> = {
  flat: "a flat, glare-free surface that keeps the focus on the cabinet form",
  matte: "a soft, low-sheen surface that hides fingerprints and resists glare in bright Treasure Valley kitchens",
  satin: "a gentle satin sheen that balances easy cleaning with a soft look",
  "semi-gloss": "a semi-gloss surface that wipes clean easily and adds subtle light",
  gloss: "a reflective gloss surface that brightens rooms and makes compact kitchens feel larger",
  "high-gloss": "a mirror-like high-gloss surface that maximizes light and reads ultra-modern",
};

function familyRoomNote(finish: Finish): string {
  const fam = (finish.colorFamily ?? "").toLowerCase();
  if (["white", "cream", "beige", "off-white"].some((k) => fam.includes(k))) {
    return "Light, neutral tones like this open up smaller Boise and Meridian kitchens and pair well with most countertops and flooring.";
  }
  if (["grey", "gray", "greige"].some((k) => fam.includes(k))) {
    return "Greys are a flexible, on-trend choice that works as a full-kitchen color or as a contrasting island in an Eagle or Star home.";
  }
  if (["black", "charcoal", "anthracite"].some((k) => fam.includes(k))) {
    return "Deep tones make a strong statement on islands, lower cabinets, and built-ins, and they pair well with lighter uppers for a two-tone look.";
  }
  if (["blue", "navy", "green"].some((k) => fam.includes(k))) {
    return "Saturated colors add personality to a kitchen or vanity and stay timeless when balanced with neutral counters and hardware.";
  }
  if (finish.category === "woodgrain") {
    return "Woodgrain finishes bring warmth and texture to kitchens, mudrooms, and built-ins, and pair beautifully with matte accents in a two-tone design.";
  }
  return "This finish works across kitchens, bathrooms, laundry rooms, and built-ins throughout the Treasure Valley.";
}

export interface FinishContentBlock {
  heading: string;
  body: string;
}

export function buildFinishIntro(finish: Finish): string {
  const cat = CATEGORY_LABEL[finish.category] ?? finish.category;
  const fam = finish.colorFamily ? `${finish.colorFamily.toLowerCase()} ` : "";
  const sheen = SHEEN_NOTE[finish.sheen] ?? "a durable, easy-to-clean surface";
  return `${finish.name} is a ${fam}${cat} cabinet finish offered by Boise Cabinet Co. It has ${sheen}. Every door, drawer front, and panel is built to order and finished to match, so your cabinets read as one cohesive piece in your home.`;
}

export function buildFinishSections(
  finish: Finish,
  pairings: { doorStyles: string[]; collections: string[] },
): FinishContentBlock[] {
  const blocks: FinishContentBlock[] = [];

  blocks.push({
    heading: `Where ${finish.name} works best`,
    body: familyRoomNote(finish),
  });

  if (pairings.doorStyles.length) {
    blocks.push({
      heading: `Door styles that pair with ${finish.name}`,
      body: `${finish.name} is available on ${pairings.doorStyles.join(", ")}. ${
        finish.category === "gloss"
          ? "Slab and minimal-frame doors show off the reflective surface best."
          : finish.category === "woodgrain"
            ? "Slab and modern shaker doors let the grain run cleanly across the front."
            : "Shaker profiles add subtle depth while slab doors keep the look streamlined."
      }`,
    });
  }

  blocks.push({
    heading: `Caring for ${finish.name} cabinets`,
    body:
      finish.category === "gloss"
        ? "Wipe high-gloss surfaces with a soft, damp microfiber cloth and a mild cleaner; avoid abrasive pads that can dull the shine. Idaho's dry climate is gentle on finishes, but quick cleanup of splashes keeps the surface looking new."
        : finish.category === "woodgrain"
          ? "Dust regularly and clean with a slightly damp cloth and mild soap. In the Treasure Valley's dry climate, avoid over-wetting and dry surfaces after cleaning to protect the textured laminate."
          : "Clean with a soft, damp cloth and a mild, non-abrasive cleaner. Matte surfaces hide smudges well and hold up to daily use in busy kitchens.",
  });

  return blocks;
}

export function buildFinishFaqs(
  finish: Finish,
  pairings: { doorStyles: string[]; collections: string[] },
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  faqs.push({
    question: `What color family is ${finish.name}?`,
    answer: `${finish.name} is a ${finish.category} cabinet finish${
      finish.colorFamily ? ` in the ${finish.colorFamily.toLowerCase()} family` : ""
    } with ${SHEEN_NOTE[finish.sheen] ?? "a durable surface"}.`,
  });

  if (pairings.doorStyles.length) {
    faqs.push({
      question: `Which door styles can I get in ${finish.name}?`,
      answer: `${finish.name} is available on ${pairings.doorStyles.join(", ")}. We finish doors, drawer fronts, and matching panels together so the cabinet reads as one piece.`,
    });
  }

  faqs.push({
    question: `Is ${finish.name} available for custom sizes?`,
    answer: `Yes. ${finish.name} is built to order in our custom line, so you can size cabinets to your room in 1/4 inch increments rather than relying on stock widths.`,
  });

  faqs.push({
    question: `Can I see ${finish.name} in person before ordering?`,
    answer: `We provide a finish sample during your design consultation so you can evaluate ${finish.name} in your home's natural light before production begins. Call or book a free consultation to get started.`,
  });

  return faqs;
}
