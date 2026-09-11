import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { HERO_EYEBROW, HERO_SUBHEAD, HERO_STATS, TRUST_ITEMS } from "@/shared/siteContent";
import { SITE_IMAGES } from "@/shared/siteImages";
import { CTA_BROWSE_CABINETS, CTA_ESTIMATE } from "@/shared/ctaCopy";

import { AggregateRating } from "@/components/marketing/AggregateRating";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`;

export function HeroSection() {
  return (
    <>
      <section className="relative -mt-[60px] pt-[60px] min-h-[85vh] md:min-h-screen flex items-center overflow-hidden bg-inverse">
        <Image
          src={SITE_IMAGES.hero}
          alt="kitchen with cream Shaker cabinets, a white oak island, brass hardware and glass-front upper cabinets"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover img-brand-grade animate-hero-reveal"
        />
        <div className="hidden md:block absolute inset-0 pointer-events-none bg-gradient-to-r from-inverse/90 via-inverse/60 to-inverse/10" />
        {/* Mobile stacks the copy over the middle of the photo, so it needs a
            bottom-up scrim the desktop left-to-right one cannot provide. */}
        <div className="md:hidden absolute inset-0 pointer-events-none bg-gradient-to-t from-inverse/85 via-inverse/70 to-inverse/45" />
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none bg-gradient-to-b from-inverse/70 via-inverse/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.025 }}
        />

        <div className="relative z-10 container px-4 md:px-8 py-20 md:py-32 pb-16 md:pb-28">
          <div className="ed-hero-copy">
            <Reveal>
              <div className="brc-label mb-6 text-inverse-foreground">{HERO_EYEBROW}</div>
              {/* Display scale from the family layer: up to 92px, tight leading,
                  negative tracking. The hero heading is the one line the whole
                  site is judged on in the first second. */}
              <h1 className="ed-display text-inverse-foreground mb-8 max-w-[16ch]">
                Idaho&apos;s premier{" "}
                <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                  cabinet
                </em>{" "}
                company.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl text-inverse-foreground">
                {HERO_SUBHEAD}
              </p>
              {/* Phones: both CTAs full width and stacked, same height and
                  format, so the pair reads as a pair. */}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap mb-6 md:mb-0">
                <Button variant="brand" className="w-full sm:w-auto" asChild>
                  <Link href="/estimate">{CTA_ESTIMATE}</Link>
                </Button>
                <Button variant="heroOutline" className="w-full sm:w-auto" asChild>
                  <Link href="/cabinets">{CTA_BROWSE_CABINETS}</Link>
                </Button>
              </div>

              {/* Social proof at the primary decision point. Renders only when
                  real review data is configured (SITE_CONFIG.trust). */}
              <AggregateRating
                variant="inline"
                align="start"
                className="mb-8 md:mb-0 [&_.text-muted-foreground]:text-inverse-muted"
              />

              <dl className="ed-hero-facts">
                {HERO_STATS.map((stat) => (
                  <div key={stat.num} className="flex flex-col">
                    <dt className="order-2">{stat.label}</dt>
                    <dd className="order-1">{stat.num}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>

        {/* Marks where the hero ends so Navigation's sticky mobile CTA bar
            can stay hidden until a visitor scrolls past it. */}
        <div id="hero-sentinel" className="absolute bottom-0 left-0 h-px w-full" aria-hidden="true" />
      </section>

      <div className="bg-tint-warm border-t-2 border-t-accent py-8 md:py-10">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto border-l border-t border-accent/20">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center justify-start gap-2.5 px-3.5 py-3.5 text-left md:justify-center md:px-4 md:py-3 md:text-center border-r border-b border-accent/20"
              >
                <span className="h-1 w-1 rounded-full bg-accent shrink-0" aria-hidden="true" />
                <span className="text-[12px] leading-snug tracking-[0.12em] md:tracking-[0.2em] uppercase text-foreground/80 font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
