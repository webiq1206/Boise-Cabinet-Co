import { permanentRedirect } from "next/navigation";

/** F21 / K-9: /testimonials reserved for real reviews; design galleries live at /design-ideas. */
export default function TestimonialsRedirectPage() {
  permanentRedirect("/design-ideas");
}
