import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { SERVICES } from "@/shared/contentData";
import { PROMISE_ITEMS } from "@/shared/siteContent";

export function ServicesGrid() {
  return (
    <Section id="services" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Our services"
          title="Design-build expertise for every major remodel"
          description="Full design-build coordination under one roof, not piecemeal trades managed by multiple vendors. One team handles layout, permitting, and construction so your project stays aligned from start to finish."
        />

        <div className="grid sm:grid-cols-2 gap-4 max-w-5xl mx-auto mb-20">
          {SERVICES.map((service, i) => (
            <Reveal key={service.slug} delay={i * 60}>
              <MarketingCard className="h-full flex flex-col">
                <h3 className="font-sans font-medium text-base mb-3 text-foreground">
                  {service.name}
                </h3>
                <p className="text-sm leading-relaxed flex-1 mb-6 text-muted-foreground">
                  {service.shortDescription}
                </p>
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  Get a planning range
                  <ArrowRight className="h-4 w-4" />
                </a>
              </MarketingCard>
            </Reveal>
          ))}
        </div>

        <SectionHeader
          eyebrow="What we stand for"
          title="Four commitments on every project"
          reveal={false}
          className="mb-10"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-border max-w-6xl mx-auto">
          {PROMISE_ITEMS.map((item, i) => (
            <Reveal
              key={item.num}
              delay={i * 60}
              className="pt-8 pb-8 pr-0 lg:pr-10 border-b sm:border-b-0 last:border-0 border-border"
            >
              <div className="w-6 h-px mb-6 bg-accent" />
              <h3 className="font-sans font-medium text-sm mb-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
