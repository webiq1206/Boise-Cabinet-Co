import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
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

        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {DIFFERENTIATORS.map((item, i) => (
            <Reveal key={item.title} delay={i * 50}>
              <MarketingCard padding="default" className="h-full md:p-8">
                <h3 className="font-sans font-medium text-sm mb-3 text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="text-foreground/80">{item.contrast}</span> {item.body}
                </p>
              </MarketingCard>
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
