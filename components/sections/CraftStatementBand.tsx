import Image from "next/image";
import { MARKETING_IMAGES } from "@/shared/siteImages";

const ALT =
  "Close-up of satin nickel bar pulls on custom painted cabinet drawers built by Boise Cabinet Co";

/**
 * Full-bleed cabinet-detail band with an overlaid statement. Used to break the
 * lower, text-heavy stretch of the homepage (reviews, differentiators, FAQ)
 * with a photographic moment. Copy sits on the darkened left; the hardware
 * detail reads through on the right.
 */
export function CraftStatementBand() {
  return (
    <section
      className="relative overflow-hidden section-divider"
      aria-label="Craftsmanship in the details"
    >
      <div className="relative h-[320px] md:h-[440px]">
        <Image
          src={MARKETING_IMAGES.hardware}
          alt={ALT}
          fill
          sizes="100vw"
          className="object-cover img-brand-grade"
        />
        {/* Darken the left for legible copy, let the detail read on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />

        <div className="absolute inset-0 flex items-center">
          <div className="container px-4">
            <div className="max-w-xl">
              <div className="brc-label mb-4">In the details</div>
              <p className="font-sans font-light text-[1.75rem] md:text-[2.5rem] leading-[1.12] tracking-tight text-foreground">
                The quality shows in what you{" "}
                <em className="brc-accent text-accent">touch every day</em>
              </p>
              <p className="mt-5 text-sm md:text-base leading-relaxed text-muted-foreground max-w-md">
                Soft-close hardware, hand-checked finishes, and frameless
                construction, built to order in our Meridian shop and installed to
                last.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
