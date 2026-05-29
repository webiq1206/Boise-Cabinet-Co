import { Reveal } from "@/components/Reveal";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import {
  BUDGET_GUIDANCE_POINTS,
  STANDARD_INCLUSIONS,
  OPTIONAL_ENHANCEMENTS,
} from "@/shared/siteContent";
import { Button } from "@/components/ui/button";
import { CTA_PRIMARY } from "@/shared/ctaCopy";

export function BudgetInclusionsSection() {
  return (
    <Section id="budget" divider>
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="Budget and scope"
            title="Clear guidance on what to expect"
            description="Planning ranges upfront, a written scope before construction, and standard inclusions on every project, so you always know where things stand."
            className="mb-10"
          />

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {BUDGET_GUIDANCE_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 40}>
                <MarketingCard className="h-full">
                  <h3 className="font-sans font-medium text-sm mb-2 text-foreground">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{point.body}</p>
                </MarketingCard>
              </Reveal>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-foreground/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </MarketingCard>
            </Reveal>

            <Reveal delay={60}>
              <MarketingCard className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-foreground/60" />
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

          <Reveal className="mt-10">
            <Button variant="brand" asChild>
              <a href="#consult">{CTA_PRIMARY}</a>
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
