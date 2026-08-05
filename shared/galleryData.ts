import { GALLERY_IMAGES } from "./siteImages";

/**
 * Cabinet design concepts used across the marketing site as inspiration.
 *
 * CREDIBILITY RULE: these are illustrative cabinetry renderings, NOT photographs
 * of specific completed Boise Cabinet Co homes. They must never be captioned,
 * marked up, or framed as documented before/after projects or verified customer
 * installations. When real, verified project photography becomes available,
 * replace these entries with actual installs (one property per entry) and remove
 * the "concept" framing in the components that render them.
 */
export interface DesignConcept {
  serviceType: string;
  /** Treasure Valley area the concept is styled for (local relevance only). */
  area: string;
  /** Completed-look rendering. Single image only, no fabricated "before". */
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
}

/** Short, visible disclosure shown wherever these concepts render. */
export const DESIGN_CONCEPT_DISCLOSURE =
  "Illustrative design renderings, not photographs of specific completed homes. We build to your space and selections.";

export const GALLERY_PROJECTS: DesignConcept[] = [
  {
    serviceType: "kitchen-cabinets",
    area: "Boise",
    imageUrl: GALLERY_IMAGES.kitchen.after,
    imageAlt:
      "Design concept: custom shaker kitchen cabinets with a quartz island and satin nickel hardware",
    title: "Modern shaker kitchen concept",
    description:
      "Custom kitchen cabinets with shaker doors, full-extension drawer storage, soft-close hardware, and a quartz island.",
  },
  {
    serviceType: "bathroom-vanities",
    area: "Meridian",
    imageUrl: GALLERY_IMAGES.bathroom.after,
    imageAlt:
      "Design concept: double bathroom vanity with a linen tower and organized drawer storage",
    title: "Double vanity suite concept",
    description:
      "Double vanity with a linen tower, drawer stack between sinks, and coordinated mirrors and hardware.",
  },
  {
    serviceType: "whole-home-cabinets",
    area: "Eagle",
    imageUrl: GALLERY_IMAGES.wholeHome.after,
    imageAlt:
      "Design concept: coordinated whole-home cabinetry sharing one door style and finish schedule",
    title: "Whole-home finish schedule concept",
    description:
      "Kitchen, bath, mudroom, and office cabinetry coordinated under a single door style and finish schedule.",
  },
  {
    serviceType: "built-in-storage",
    area: "Nampa",
    imageUrl: GALLERY_IMAGES.addition.after,
    imageAlt:
      "Design concept: floor-to-ceiling pantry and mudroom locker system with bench storage",
    title: "Pantry and mudroom storage concept",
    description:
      "Floor-to-ceiling pantry paired with a mudroom locker system, bench seating, and concealed cubby storage.",
  },
  {
    serviceType: "bar-cabinets",
    area: "Boise",
    imageUrl: GALLERY_IMAGES.basement.after,
    imageAlt:
      "Design concept: custom wet bar cabinets with glass-front uppers and lower drawer storage",
    title: "Wet bar cabinetry concept",
    description:
      "Custom wet bar and entertainment storage with glass-front uppers, drawer banks, and durable countertops.",
  },
  {
    serviceType: "outdoor-cabinets",
    area: "Meridian",
    imageUrl: GALLERY_IMAGES.outdoor.after,
    imageAlt:
      "Design concept: weather-rated outdoor kitchen cabinetry under a covered patio",
    title: "Covered outdoor kitchen concept",
    description:
      "Weather-rated outdoor kitchen cabinetry with a durable finish, planned for a covered patio.",
  },
];
