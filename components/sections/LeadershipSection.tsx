import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { LEADERSHIP_COPY } from "@/shared/siteContent";

export function LeadershipSection() {
  return (
    <Section id="commitment" divider>
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
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
