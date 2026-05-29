"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";

const FAQS = [
  {
    q: "How are you different from other remodeling companies in the Treasure Valley?",
    a: "We operate as a true design-build firm with one accountable team from first visit to final walkthrough, not separate designers and contractors you have to coordinate. You receive a written scope with documented finish selections before construction, weekly written Friday updates, and written change orders before any additional work. We protect your home with daily dust barriers and floor protection, communicate schedule changes early, and handle Ada and Canyon County permits in-house. We stand behind our work with a final walkthrough and a 2-year workmanship guarantee. Our free consultation focuses on planning guidance, not commission-driven sales pressure.",
  },
  {
    q: "How do you help me understand project costs?",
    a: "We provide honest planning ranges based on your project type, size, finish level, and goals. After your in-home consultation, you receive a written scope with your project investment outlined clearly. We do not share itemized material costs, subcontractor costs, or line-item pricing. Instead, we focus on clear expectations, budget guidance, and proactive communication throughout your project.",
  },
  {
    q: "How do you help me stay on budget?",
    a: "Before construction begins, you receive a written scope outlining what is included and your project investment. If selections, site conditions, or scope changes may affect your budget, we communicate early and in writing. Any additional work requires a written change order with your approval before we proceed.",
  },
  {
    q: "What does a typical project timeline look like?",
    a: "Kitchen remodels typically run 6 to 10 weeks from permit approval. Bathroom remodels are 3 to 5 weeks. Whole-home renovations range from 3 to 6 months depending on scope. We give you a week-by-week schedule at project kickoff and update it every Friday. You always know exactly where we are.",
  },
  {
    q: "Do you handle permits?",
    a: "Yes. Permits are included in our scope and handled entirely in-house. We know the Ada and Canyon County permit offices well and build permit timelines into your project schedule from day one. You never have to chase paperwork.",
  },
  {
    q: "Can I stay in my home during the remodel?",
    a: "For most kitchen and bathroom projects, yes, with some daily inconvenience. We install dust barriers, protect floors, and schedule noisy work for reasonable hours. For whole-home renovations or additions involving HVAC or electrical throughout the house, we will give you an honest assessment at consultation of whether staying is practical.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve the full Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. If you are just outside these areas, reach out and we will let you know if we can accommodate your project.",
  },
  {
    q: "What financing options do you offer?",
    a: "We partner with GreenSky and Mosaic to offer financing starting from 0% APR on qualifying projects. Applications take about five minutes and you can get a decision the same day. We can walk you through options at your free in-home consultation.",
  },
  {
    q: "What does the free in-home visit include?",
    a: "A 60 to 90 minute walkthrough with our lead designer and estimator. We look at your space, discuss your goals and wish list, share relevant design ideas, and give you a planning range on the spot. No pressure. You leave with information, not a sales pitch.",
  },
  {
    q: "Are 3D renderings and visualizations included?",
    a: "3D renderings and visualizations are available as an optional design enhancement for clients who want to visualize their project before construction begins. They are not included on every project. They add to both project investment and design timeline, but many clients find them valuable for major layout and finish decisions. Ask about this during your consultation.",
  },
  {
    q: "What is your workmanship guarantee?",
    a: "We stand behind our work with a 2-year workmanship guarantee. If something we built or installed fails due to workmanship (not normal wear or homeowner modifications), we fix it at no charge. We also pass through all manufacturer warranties on fixtures, cabinetry, and appliances.",
  },
];

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
            {FAQS.map((faq, i) => (
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
          <div className="pt-4 border-t border-border" />
        </div>
      </div>
    </Section>
  );
}
