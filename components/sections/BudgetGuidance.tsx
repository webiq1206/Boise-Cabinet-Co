import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { BUDGET_GUIDANCE_POINTS } from "@/shared/siteContent";

export function BudgetGuidance() {
  return (
    <Section id="budget" divider>
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="Budget and planning"
            title="Clear guidance, not guesswork"
            description="We help you plan with confidence. Our goal is to give you realistic expectations and proactive communication throughout your project, not a spreadsheet of material and subcontractor costs."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {BUDGET_GUIDANCE_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 60}>
                <MarketingCard className="h-full">
                  <h3 className="font-sans font-medium text-sm mb-2 text-foreground">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{point.body}</p>
                </MarketingCard>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <Button variant="brand" asChild>
              <a href="#consult">Schedule a detailed project evaluation</a>
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
