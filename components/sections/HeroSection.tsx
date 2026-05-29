import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { HERO_SUBHEAD, TRUST_ITEMS } from "@/shared/siteContent";
import { SITE_IMAGES } from "@/shared/siteImages";
import { CTA_PRIMARY, CTA_SECONDARY } from "@/shared/ctaCopy";
import { DisplayNum } from "@/components/marketing";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/2Fsvg%3E")`;

const HERO_STATS = [
  { num: "60 sec", label: "Instant planning range" },
  { num: "Financing", label: "Flexible plans available" },
  { num: "2 yr", label: "Workmanship guarantee" },
];

export function HeroSection() {
  return (
    <>
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden bg-inverse">
        <Image
          src={SITE_IMAGES.hero}
          alt="Modern luxury home interior remodel in Boise Idaho Treasure Valley"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.72]"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-inverse/65 via-inverse/45 to-inverse/20" />
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-gradient-to-b from-inverse/55 to-transparent" />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-background via-background/40 to-transparent"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.03 }}
        />

        <div className="relative z-10 container px-4 md:px-8 py-24 md:py-36">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-center">
            <Reveal>
              <div className="brc-label mb-6 text-inverse-muted">
                Boise Remodeling Co · Treasure Valley Design-Build
              </div>
              <h1 className="font-sans font-light text-inverse-foreground text-display tracking-tight mb-6">
                Remodel with{" "}
                <em className="brc-accent text-accent">clarity</em> and confidence.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-4 max-w-xl text-inverse-muted">
                {HERO_SUBHEAD}
              </p>
              <p className="text-base md:text-lg leading-relaxed mb-8 max-w-xl text-inverse-muted/90">
                Design-build remodeling in Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.
              </p>
              <div className="flex flex-wrap gap-3 mb-8 md:mb-0">
                <Button variant="brandAccent" asChild>
                  <a href="#calculator">{CTA_SECONDARY}</a>
                </Button>
                <Button variant="brandInverseOutline" asChild>
                  <a href="#consult">{CTA_PRIMARY}</a>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 md:hidden mt-2">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.num}
                    className="px-3 py-3 rounded-sm bg-inverse-foreground/7 border border-inverse-foreground/12"
                  >
                    <DisplayNum className="text-inverse-foreground text-lg leading-none">
                      {stat.num}
                    </DisplayNum>
                    <div className="mt-1 text-[9px] tracking-[0.08em] uppercase text-inverse-muted leading-snug">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block mt-10 pt-8 border-t border-inverse-foreground/10">
                <p className="text-[11px] tracking-[0.12em] uppercase text-inverse-muted">
                  Serving Boise · Meridian · Eagle · Nampa · Kuna · Star · Middleton · Caldwell
                </p>
              </div>
            </Reveal>

            <div className="hidden md:flex flex-col gap-3">
              {HERO_STATS.map((stat, i) => (
                <Reveal key={stat.num} delay={i * 90}>
                  <div className="px-6 py-5 rounded-sm bg-inverse-foreground/7 border border-inverse-foreground/12">
                    <DisplayNum className="text-inverse-foreground text-3xl leading-none">
                      {stat.num}
                    </DisplayNum>
                    <div className="mt-1.5 text-[11px] tracking-[0.1em] uppercase text-inverse-muted">
                      {stat.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-background border-t border-border/60 py-5">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-2">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[11px] tracking-[0.10em] uppercase font-medium text-muted-foreground"
              >
                <span className="w-1 h-1 rounded-full flex-shrink-0 bg-foreground/30" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
