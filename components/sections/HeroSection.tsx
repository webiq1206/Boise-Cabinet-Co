import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { HERO_SUBHEAD, TRUST_ITEMS } from "@/shared/siteContent";
import { SITE_IMAGES } from "@/shared/siteImages";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/2Fsvg%3E")`;

export function HeroSection() {
  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-inverse">
        <Image
          src={SITE_IMAGES.hero}
          alt="Modern luxury home interior remodel in Boise Idaho Treasure Valley"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-br from-inverse/75 via-inverse/55 to-inverse/30"
        />
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-gradient-to-b from-inverse/70 to-transparent"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.03 }}
        />

        <div className="relative z-10 container px-4 md:px-8 py-28 md:py-36">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-center">
            <Reveal>
              <div className="brc-label mb-6 text-inverse-muted">
                Boise Remodeling Co · Treasure Valley Design-Build
              </div>
              <h1 className="font-serif font-light text-inverse-foreground text-display tracking-tight mb-6">
                Remodel with{" "}
                <em className="italic text-accent">clarity</em> and confidence.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-4 max-w-xl text-inverse-muted">
                {HERO_SUBHEAD}
              </p>
              <h2 className="text-base md:text-lg font-sans font-normal text-inverse-muted/90 mb-10 max-w-xl">
                Design-build remodeling in Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.
              </h2>
              <div className="flex flex-wrap gap-3">
                <Button variant="brandAccent" asChild>
                  <a href="#calculator">Plan your project range</a>
                </Button>
                <Button variant="brandInverseOutline" asChild>
                  <a href="#consult">Schedule your consultation</a>
                </Button>
              </div>
              <div className="mt-10 pt-8 border-t border-inverse-foreground/10">
                <p className="text-[11px] tracking-[0.12em] uppercase text-inverse-muted">
                  Serving Boise · Meridian · Eagle · Nampa · Kuna · Star · Middleton · Caldwell
                </p>
              </div>
            </Reveal>

            <div className="hidden md:flex flex-col gap-3">
              {[
                { num: "60 sec", label: "Instant planning range" },
                { num: "Financing", label: "Flexible plans available" },
                { num: "2 yr", label: "Workmanship guarantee" },
              ].map((stat, i) => (
                <Reveal key={stat.num} delay={i * 90}>
                  <div className="px-6 py-5 rounded-sm bg-inverse-foreground/7 border border-inverse-foreground/12">
                    <div className="font-serif font-light text-inverse-foreground text-3xl leading-none">
                      {stat.num}
                    </div>
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

      <Section variant="surface" spacing="none" className="py-5 section-divider">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-2">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[11px] tracking-[0.10em] uppercase font-medium text-muted-foreground"
              >
                <span className="w-1 h-1 rounded-full flex-shrink-0 bg-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
