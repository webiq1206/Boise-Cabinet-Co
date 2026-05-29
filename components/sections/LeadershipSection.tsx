import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { LEADERSHIP_COPY } from "@/shared/siteContent";
import { SITE_IMAGES } from "@/shared/siteImages";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/2Fsvg%3E")`;

export function LeadershipSection() {
  return (
    <Section id="commitment" spacing="none" divider className="p-0">
      <div className="grid md:grid-cols-2 overflow-hidden">
        <div className="relative min-h-[360px] md:min-h-[520px] overflow-hidden order-1 md:order-2 md:border-l border-border">
          <Image
            src={SITE_IMAGES.leadership}
            alt="Finished kitchen remodel showcasing Boise Remodeling Co craftsmanship"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.028 }}
          />
        </div>

        <div className="section-y-sm px-8 md:px-14 lg:px-16 bg-card order-2 md:order-1">
          <Reveal>
            <div className="brc-label mb-5">{LEADERSHIP_COPY.label}</div>
            <h2 className="font-serif font-light text-section-title md:text-section-title-lg mb-8 text-foreground">
              {LEADERSHIP_COPY.headline}
            </h2>
            <div className="space-y-4 text-base leading-relaxed mb-8 text-muted-foreground">
              {LEADERSHIP_COPY.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <p className="font-medium text-base text-foreground">{LEADERSHIP_COPY.closing}</p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
