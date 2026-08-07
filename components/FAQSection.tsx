import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { Button } from "@/components/ui/button";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";
import { HOMEPAGE_FAQS } from "@/shared/homepageFaqs";

export { HOMEPAGE_FAQS };

export function FAQSection() {
  const faqs = HOMEPAGE_FAQS.map((f) => ({ question: f.q, answer: f.a }));

  return (
    <Section id="faq" divider>
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            eyebrow="Common questions"
            size="display"
            title={
              <>
                Straight answers to the questions that{" "}
                <em className="brc-accent text-accent">matter</em>
              </>
            }
            className="mb-10"
          />
          <FaqAccordion
            faqs={faqs}
            initialCount={6}
            idPrefix="faq"
            itemClassName="border-0 border-t border-border"
            triggerClassName="text-left py-5 hover:no-underline font-sans font-medium text-sm text-foreground"
            contentClassName="text-sm leading-relaxed pb-6 text-muted-foreground"
          />
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Button variant="brand" asChild>
              <a href="#calculator">{CTA_ESTIMATE}</a>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
