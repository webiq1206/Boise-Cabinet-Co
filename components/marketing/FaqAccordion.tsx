"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  /** How many questions show before the "Show all" action. Spec target: 5-7. */
  initialCount?: number;
  idPrefix?: string;
  /** Style overrides so this can match a section's existing look (e.g. the homepage's bordered rows). */
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

/**
 * Shared FAQ accordion: shows the first `initialCount` questions with a
 * "Show all N questions" action when there are more, so every FAQ list on
 * the site (homepage, room pages, location pages) behaves the same way
 * instead of each reimplementing its own show/hide logic.
 */
export function FaqAccordion({
  faqs,
  initialCount = 6,
  idPrefix = "faq",
  itemClassName,
  triggerClassName = "text-left",
  contentClassName = "text-muted-foreground leading-relaxed",
}: FaqAccordionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? faqs : faqs.slice(0, initialCount);

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        {visible.map((faq, i) => (
          <AccordionItem key={faq.question} value={`${idPrefix}-${i}`} className={itemClassName}>
            <AccordionTrigger className={triggerClassName}>{faq.question}</AccordionTrigger>
            <AccordionContent className={contentClassName}>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {!showAll && faqs.length > initialCount && (
        <div className="mt-6 text-center">
          <Button variant="brandOutline" type="button" onClick={() => setShowAll(true)}>
            Show all {faqs.length} questions
          </Button>
        </div>
      )}
    </>
  );
}
