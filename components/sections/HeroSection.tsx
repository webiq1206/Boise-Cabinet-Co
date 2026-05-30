import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { HERO_EYEBROW, HERO_SUBHEAD, HERO_STATS, TRUST_ITEMS } from "@/shared/siteContent";
import { SITE_IMAGES } from "@/shared/siteImages";
import { CTA_PRIMARY, CTA_SECONDARY } from "@/shared/ctaCopy";
import { DisplayNum } from "@/components/marketing";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/2Fsvg%3E")`;

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
          alt="Modern luxury home interior remodel in Boise Idaho Treasure Valley"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.72] img-brand-grade"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-inverse/90 via-inverse/55 to-inverse/15" />
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none bg-gradient-to-b from-inverse/80 via-inverse/45 to-transparent" />
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
                Remodel with{" "}
                <em className="brc-accent text-accent">clarity</em> and confidence.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl text-inverse-foreground/90">
                {HERO_SUBHEAD}
              </p>
              <div className="flex flex-wrap gap-3 mb-6 md:mb-0">
                <Button variant="brand" asChild>
                  <a href="#consult">{CTA_PRIMARY}</a>
                </Button>
                <Button variant="brandOutline" className="border-inverse-foreground/25 bg-inverse-foreground/10 text-inverse-foreground hover:bg-inverse-foreground/15" asChild>
                  <a href="#calculator">{CTA_SECONDARY}</a>
                </Button>
              </div>

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
      </section>

      <div className="bg-background border-t border-border/60 py-10 md:py-14">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <h2 className="font-serif text-xl md:text-2xl text-foreground">
              The standard we hold
            </h2>
            <span className="mt-4 h-px w-10 bg-primary/50" aria-hidden="true" />
            <div className="mt-7 md:mt-8 flex flex-wrap items-center justify-center gap-y-4">
              {TRUST_ITEMS.map((item, i) => (
                <div key={item} className="flex items-center">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden md:inline-block h-3.5 w-px bg-border mx-8 lg:mx-12"
                    />
                  )}
                  <span className="px-5 md:px-0 text-[11px] leading-snug tracking-[0.2em] uppercase text-muted-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
