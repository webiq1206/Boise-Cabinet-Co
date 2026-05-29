import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SERVICES } from "@/shared/contentData";
import { servicePath } from "@/lib/seo-routes";
import { CTA_SECONDARY } from "@/shared/ctaCopy";

export function ServicesGrid() {
  return (
    <Section id="services" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Our services"
          size="display"
          title={
            <>
              Design-build expertise for every major{" "}
              <em className="brc-accent text-accent">remodel</em>
            </>
          }
          description="Full design-build coordination under one roof, not piecemeal trades managed by multiple vendors. One team handles layout, permitting, and construction so your project stays aligned from start to finish."
        />

        <div className="max-w-3xl mx-auto divide-y divide-border border-t border-border">
          {SERVICES.map((service, i) => (
            <Reveal key={service.slug} delay={i * 40}>
              <div className="py-7 md:py-8">
                <h3 className="font-sans font-medium text-base mb-2 text-foreground">
                  {service.name}
                </h3>
                <p className="text-sm leading-relaxed mb-4 text-muted-foreground">
                  {service.shortDescription}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <a
                    href={servicePath(service.slug)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#calculator"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {CTA_SECONDARY}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
