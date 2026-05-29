import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { CLIENT_PRIORITIES } from "@/shared/siteContent";

export function ClientPriorities() {
  return (
    <Section id="why-us" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="What matters most"
          title="How we address what homeowners care about"
          description="Choosing a design-build partner is a major decision. Here is how we earn your trust at every step."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {CLIENT_PRIORITIES.map((item, i) => (
            <Reveal key={item.title} delay={i * 40}>
              <MarketingCard className="h-full">
                <item.icon className="h-5 w-5 mb-4 text-accent" />
                <h3 className="font-sans font-medium text-sm mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </MarketingCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Button variant="brand" asChild>
            <a href="#calculator">Explore your project range</a>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
