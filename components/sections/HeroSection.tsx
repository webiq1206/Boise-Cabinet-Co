import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { HERO_EYEBROW, HERO_SUBHEAD, HERO_STATS, TRUST_ITEMS } from "@/shared/siteContent";
import { SITE_IMAGES } from "@/shared/siteImages";
import { CTA_BROWSE_CABINETS, CTA_ESTIMATE } from "@/shared/ctaCopy";
import { DisplayNum } from "@/components/marketing";
import { AggregateRating } from "@/components/marketing/AggregateRating";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`;

function StatCard({ num, label }: { num: string; label: string }) {
  return (
    <div className="px-3 py-3 md:px-6 md:py-5 rounded-sm bg-inverse-foreground/10 border border-inverse-foreground/15 backdrop-blur-sm">
      <DisplayNum className="text-inverse-foreground text-lg md:text-3xl leading-none">
        {num}
      </DisplayNum>
      <div className="mt-1 md:mt-1.5 text-[9px] md:text-[11px] tracking-[0.08em] md:tracking-[0.1em] uppercase text-inverse-muted leading-snug">
        {label}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <>
      <section className="relative -mt-[60px] pt-[60px] min-h-[85vh] md:min-h-screen flex items-center overflow-hidden bg-inverse">
        <Image
          src={SITE_IMAGES.hero}
          alt="Custom cream shaker kitchen cabinets with a white oak island, aged brass hardware, and lit glass-front uppers in a Treasure Valley, Idaho home by Boise Cabinet Co"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover opacity-[0.92] img-brand-grade"
        />
        <div className="hidden md:block absolute inset-0 pointer-events-none bg-gradient-to-r from-inverse/90 via-inverse/55 to-inverse/25" />
        {/* Mobile stacks the copy over the middle of the photo, so it needs a
            bottom-up scrim the desktop left-to-right one cannot provide. */}
        <div className="md:hidden absolute inset-0 pointer-events-none bg-gradient-to-t from-inverse/85 via-inverse/70 to-inverse/45" />
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none bg-gradient-to-b from-inverse/70 via-inverse/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.03 }}
        />

        <div className="relative z-10 container px-4 md:px-8 py-20 md:py-32 pb-16 md:pb-28">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-center">
            <Reveal>
              <div className="brc-label mb-6 text-inverse-muted">{HERO_EYEBROW}</div>
              <h1 className="font-sans font-light text-inverse-foreground text-display tracking-tight mb-6">
                Idaho&apos;s premier{" "}
                <em className="brc-accent text-accent">cabinet</em> company.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl text-inverse-foreground">
                {HERO_SUBHEAD}
              </p>
              <div className="flex flex-wrap gap-3 mb-6 md:mb-0">
                <Button variant="brand" asChild>
                  <Link href="/estimate">{CTA_ESTIMATE}</Link>
                </Button>
                <Button variant="brandOutline" className="border-inverse-foreground/25 bg-inverse-foreground/10 text-inverse-foreground hover:bg-inverse-foreground/15" asChild>
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

              <div className="grid grid-cols-3 gap-3 md:hidden">
                {HERO_STATS.map((stat) => (
                  <StatCard key={stat.num} num={stat.num} label={stat.label} />
                ))}
              </div>
            </Reveal>

            <div className="hidden md:flex flex-col gap-3">
              {HERO_STATS.map((stat, i) => (
                <Reveal key={stat.num} delay={i * 90}>
                  <StatCard num={stat.num} label={stat.label} />
                </Reveal>
              ))}
            </div>
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
                className="flex items-center justify-center gap-2 px-4 py-5 md:py-3 text-center border-r border-b border-accent/20"
              >
                <span className="h-1 w-1 rounded-full bg-accent shrink-0" aria-hidden="true" />
                <span className="text-[11px] leading-snug tracking-[0.2em] uppercase text-foreground/80 font-medium">
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
