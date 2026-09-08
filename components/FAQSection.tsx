import { Section } from "@/components/marketing/Section";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { Button } from "@/components/ui/button";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";
import { HOMEPAGE_FAQS } from "@/shared/homepageFaqs";

export { HOMEPAGE_FAQS };

/**
 * Common questions.
 *
 * The parent site's FAQ arrangement: heading and intro in the left column, the
 * accordion in the right. Questions are set in the serif at h4 scale so they
 * read as questions a person asked, not as menu items. FaqAccordion itself is
 * unchanged - it already handles keyboard and screen-reader behaviour.
 */
export function FAQSection() {
  const faqs = HOMEPAGE_FAQS.map((f) => ({ question: f.q, answer: f.a }));

  return (
    <Section id="faq" surface="dark" spacing="xl" edge>
      <div className="ed-shell">
        <div className="ed-split ed-split-narrow">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="ed-eyebrow">Common questions</p>
            <h2 className="ed-h2 ed-statement">
              Straight answers to the questions that{" "}
              <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                matter
              </em>
            </h2>
            <div className="mt-10">
              <Button variant="brand" asChild>
                <a href="#calculator">{CTA_ESTIMATE}</a>
              </Button>
            </div>
          </div>

          <div>
          <FaqAccordion
            faqs={faqs}
            initialCount={6}
            idPrefix="faq"
            itemClassName="border-0 border-t [border-color:var(--ed-line)]"
            triggerClassName="ed-h4 py-6 text-left hover:no-underline [&[data-state=open]]:[color:var(--ed-accent)]"
            contentClassName="ed-body pb-7 text-[0.9375rem]"
          />
          </div>
        </div>
      </div>
    </Section>
  );
}
