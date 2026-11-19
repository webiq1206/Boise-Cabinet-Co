import type { ReactNode } from "react";
import { SectionHeader } from "@/components/marketing/SectionHeader";

export interface FaqSplitItem {
  question: string;
  answer: ReactNode;
}

/**
 * The questions block for interior pages: heading in a left column, questions
 * in a wider right column, so the section fills the container on desktop. One
 * column on phones and tablets.
 *
 * Questions are native <details> sharing one name: tap to open, one open at a
 * time, the first open on load. Every answer stays in the HTML whether its row
 * is open or not. The words are the caller's; FAQ structured data is emitted
 * by the page from the same list.
 */
export function FaqSplit({
  eyebrow = "Common questions",
  title,
  faqs,
  name,
}: {
  eyebrow?: string;
  title: ReactNode;
  faqs: readonly FaqSplitItem[];
  /** Groups the rows so opening one closes the others. Unique per page. */
  name: string;
}) {
  return (
    <div className="ed-split ed-split-narrow lx-faq-split">
      <div className="lx-faq-head">
        <SectionHeader eyebrow={eyebrow} title={title} align="left" className="mb-0" />
      </div>
      <div className="lx-faq">
        {faqs.map((faq, index) => (
          <details key={faq.question} name={name} open={index === 0}>
            <summary>
              <h3 className="ed-h4">{faq.question}</h3>
            </summary>
            <div className="lx-faq-answer">{faq.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
