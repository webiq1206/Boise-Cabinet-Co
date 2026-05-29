import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  DIFFERENTIATORS,
  DIFFERENTIATORS_HEADLINE,
  DIFFERENTIATORS_INTRO,
} from "@/shared/siteContent";

export function WhyChooseUsSection() {
  return (
    <Section id="why-choose-us" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="What sets us apart"
          title={DIFFERENTIATORS_HEADLINE}
          description={DIFFERENTIATORS_INTRO}
          className="max-w-3xl"
        />

        <div className="max-w-3xl mx-auto divide-y divide-border border-t border-border">
          {DIFFERENTIATORS.map((item, i) => (
            <Reveal key={item.title} delay={i * 40}>
              <div className="py-7 md:py-8 grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1fr] gap-x-4 md:gap-x-8 items-start">
                <div className="font-serif font-light text-accent text-2xl md:text-3xl leading-none tabular-nums pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-serif font-light text-foreground text-xl md:text-2xl leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                    <span className="text-foreground/70">{item.contrast}</span> {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Button variant="brand" asChild>
            <a href="#consult">Schedule your consultation</a>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
