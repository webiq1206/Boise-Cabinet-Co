"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";
import { CTA_PRIMARY, CTA_SECONDARY } from "@/shared/ctaCopy";
import { HOMEPAGE_FAQS } from "@/shared/homepageFaqs";

export { HOMEPAGE_FAQS };

export function FAQSection() {
  return (
    <Section id="faq" divider>
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            eyebrow="Common questions"
            title="Straight answers to the questions that matter"
            className="mb-10"
          />
          <Accordion type="single" collapsible className="w-full">
            {HOMEPAGE_FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-0 border-t border-border"
              >
                <AccordionTrigger className="text-left py-5 hover:no-underline font-sans font-medium text-sm text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed pb-6 text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Button variant="brand" asChild>
              <a href="#consult">{CTA_PRIMARY}</a>
            </Button>
            <Button variant="brandOutline" asChild>
              <a href="#calculator">{CTA_SECONDARY}</a>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
