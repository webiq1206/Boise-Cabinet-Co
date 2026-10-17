import { showTestimonials } from "@/shared/siteConfig";

export interface PublishedReview {
  customerName: string;
  serviceType: string;
  city: string;
  rating: string;
  testimonial: string;
}

/**
 * Reviews that ship in the client and server bundles.
 * The seed list stays in testimonialsData.ts and is not imported here, so those
 * names are not copied into .next output while SHOW_TESTIMONIALS is false.
 */
export function visibleTestimonials(): PublishedReview[] {
  if (!showTestimonials()) return [];
  return [];
}
