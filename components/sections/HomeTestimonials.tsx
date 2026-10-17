import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { showTestimonials } from "@/shared/siteConfig";

/**
 * Server-only slot for the homepage reviews. ApprovedHome is a client
 * component, so it must not import the seed testimonials. With the flag off
 * this returns null and the seed names stay out of the client bundle.
 */
export function HomeTestimonials() {
  if (!showTestimonials()) return null;
  return <TestimonialsSection limit={3} showViewAll />;
}
