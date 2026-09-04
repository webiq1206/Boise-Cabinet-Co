import Image from "next/image";
import { MARKETING_IMAGES } from "@/shared/siteImages";

const ALT =
  "Close-up of satin nickel bar pulls on custom painted cabinet drawers built by Boise Cabinet Co";

/**
 * Full-bleed cabinet-detail band with an overlaid statement. Breaks the lower,
 * text-heavy stretch of the homepage with a photographic moment.
 *
 * The one place below the hero that uses the display size: a statement band is
 * a pause, and its heading should be the largest thing on the screen when it
 * arrives. Sans-light became the serif so it speaks in the same voice as every
 * other heading on the page.
 */
export function CraftStatementBand() {
  return (
    <section
      className="relative overflow-hidden ed-edge-top"
      aria-label="Craftsmanship in the details"
      data-contrast-skip
    >
      {/* Image behind, copy in normal flow. The first cut put the copy inside
          an absolutely-positioned flex container, which sized the text column
          to its content and wrapped an 89px heading one word per line. Flow
          layout with the image absolute is the arrangement the other three
          sites' statement bands use, and it measures correctly. */}
      <Image
        src={MARKETING_IMAGES.hardware}
        alt={ALT}
        fill
        sizes="100vw"
        className="object-cover img-brand-grade"
      />
      {/* Darken the left for legible copy, let the detail read on the right */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />

      <div className="ed-shell relative z-10 py-[var(--ed-pad-lg)]">
        <div>
          <p className="ed-eyebrow">In the details</p>
          <p className="ed-display ed-statement-display text-foreground">
            The quality shows in what you{" "}
            <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
              touch every day
            </em>
          </p>
          <p className="ed-lede mt-9 max-w-[40ch]" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
            Soft-close hardware, hand-checked finishes and frameless construction,
            built to order in our Meridian shop and installed to last.
          </p>
        </div>
      </div>
    </section>
  );
}
