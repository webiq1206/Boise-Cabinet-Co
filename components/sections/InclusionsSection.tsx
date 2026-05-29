import { Reveal } from "@/components/Reveal";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { STANDARD_INCLUSIONS, OPTIONAL_ENHANCEMENTS } from "@/shared/siteContent";

export function InclusionsSection() {
  return (
    <Section spacing="sm" divider>
      <div className="container px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
          <Reveal>
            <MarketingCard className="h-full">
              <h3 className="font-sans font-medium text-sm mb-6 text-foreground">
                Included on every project
              </h3>
              <ul className="space-y-3">
                {STANDARD_INCLUSIONS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </MarketingCard>
          </Reveal>

          <Reveal delay={80}>
            <MarketingCard className="h-full flex flex-col border-accent/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted-foreground">
                  Optional enhancement
                </span>
              </div>
              <h3 className="font-sans font-medium text-sm mb-3 text-foreground">
                {OPTIONAL_ENHANCEMENTS.title}
              </h3>
              <p className="text-sm leading-relaxed flex-1 mb-4 text-muted-foreground">
                {OPTIONAL_ENHANCEMENTS.body}
              </p>
              <p className="text-xs mb-6 text-muted-foreground/80">
                {OPTIONAL_ENHANCEMENTS.note}
              </p>
              <a
                href="#consult"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Ask about visualizations
                <ArrowRight className="h-4 w-4" />
              </a>
            </MarketingCard>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
