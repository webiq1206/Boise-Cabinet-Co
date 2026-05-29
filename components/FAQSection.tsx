"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "You're new. Why should I trust you?",
    a: "That's the right question to ask. Being new means we don't have a decade of bureaucratic habits — but it also means our reputation is everything to us right now. We publish our pricing methodology upfront, provide 3D renders before a single nail is pulled, and put every scope commitment in writing. We're extending a founding-client offer precisely because we want to earn your trust by doing exceptional work, not just selling you on our history.",
  },
  {
    q: "How do you price projects?",
    a: "We use a transparent cost-plus model: you see the cost of materials and labor, plus our fixed management fee. There are no hidden markups on subcontractors or material deliveries. Before signing, you receive a full scope document with line-item pricing. If scope changes mid-project, we present a written change order before any work begins.",
  },
  {
    q: "What does a typical project timeline look like?",
    a: "Kitchen remodels typically run 6–10 weeks from permit approval. Bathroom remodels are 3–5 weeks. Whole-home renovations range from 3–6 months depending on scope. We give you a week-by-week schedule at project kickoff and update it every Friday. You always know exactly where we are.",
  },
  {
    q: "Do you handle permits?",
    a: "Yes — permits are included in our scope and handled entirely in-house. We know the Ada and Canyon County permit offices well and build permit timelines into your project schedule from day one. You never have to chase paperwork.",
  },
  {
    q: "Can I stay in my home during the remodel?",
    a: "For most kitchen and bathroom projects, yes — with some daily inconvenience. We install dust barriers, protect floors, and schedule noisy work for reasonable hours. For whole-home renovations or additions involving HVAC or electrical throughout the house, we'll give you an honest assessment at consultation of whether staying is practical.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve the full Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, and Middleton. If you're just outside these areas, reach out — we'll let you know if we can accommodate your project.",
  },
  {
    q: "What financing options do you offer?",
    a: "We partner with GreenSky and Mosaic to offer financing starting from 0% APR on qualifying projects. Applications take about five minutes and you can get a decision the same day. We can walk you through options at your free in-home consultation.",
  },
  {
    q: "What does the free in-home visit include?",
    a: "A 60–90 minute walkthrough with our lead designer/estimator. We look at your space, discuss your goals and wish list, share relevant design ideas, and give you a rough budget range on the spot. No pressure — you leave with information, not a sales pitch.",
  },
  {
    q: "What is your workmanship guarantee?",
    a: "We stand behind our work with a 2-year workmanship guarantee. If something we built or installed fails due to workmanship (not normal wear or homeowner modifications), we fix it at no charge. We also pass through all manufacturer warranties on fixtures, cabinetry, and appliances.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" style={{ background: "#FFFFFF" }} className="py-20 md:py-28">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div className="brc-label mb-4">Common questions</div>
            <h2 className="font-serif font-light text-3xl md:text-4xl tracking-tight" style={{ color: "#3A3E3D" }}>
              Honest answers to hard questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-0 border-t"
                style={{ borderColor: "rgba(58,62,61,0.12)" }}
              >
                <AccordionTrigger
                  className="text-left py-5 hover:no-underline font-sans font-medium text-sm"
                  style={{ color: "#3A3E3D" }}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent
                  className="text-sm leading-relaxed pb-6"
                  style={{ color: "#6E736F" }}
                >
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="pt-4 border-t" style={{ borderColor: "rgba(58,62,61,0.12)" }} />
        </div>
      </div>
    </section>
  );
}

