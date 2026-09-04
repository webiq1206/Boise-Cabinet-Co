import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import {
  DIFFERENTIATORS,
  DIFFERENTIATORS_INTRO,
  HOMEPAGE_DIFFERENTIATOR_INDICES,
} from "@/shared/siteContent";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";

interface WhyChooseUsSectionProps {
  /** When set, show only the first N homepage-curated differentiators. */
  limit?: number;
}

/**
 * What sets us apart.
 *
 * WAS a centred heading over a single 768px column of divided rows.
 *
 * NOW a split: the heading and intro hold the left column and stay put while
 * the right column scrolls, so the claim stays in view beside every piece of
 * evidence for it. The differentiators become a numbered index, each contrast
 * line set in the serif so the "with us / elsewhere" turn reads as a turn.
 */
export function WhyChooseUsSection({ limit }: WhyChooseUsSectionProps) {
  const items =
    limit !== undefined
      ? HOMEPAGE_DIFFERENTIATOR_INDICES.map((i) => DIFFERENTIATORS[i])
      : DIFFERENTIATORS;

  return (
    <Section id="why-choose-us" surface="dark" spacing="xl" edge>
      <div className="ed-shell">
        <div className="ed-split ed-split-narrow">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="ed-eyebrow">What sets us apart</p>
              <h2 className="ed-h2 ed-statement">
                Built for homeowners who want{" "}
                <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                  clarity
                </em>
                , not chaos
              </h2>
              <p className="ed-body mt-7">{DIFFERENTIATORS_INTRO}</p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
                <Button variant="brand" className="w-full sm:w-auto" asChild>
                  <a href="#calculator">{CTA_ESTIMATE}</a>
                </Button>
                {limit !== undefined && (
                  <a href="/about" className="ed-link">
                    Our approach
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          <div className="ed-steps">
            {items.map((item, i) => (
              <Reveal key={item.title} delay={i * 40}>
                <div className="ed-step">
                  <span className="ed-step-n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="ed-h3">{item.title}</h3>
                    <p className="ed-body mt-3 max-w-[52ch] text-foreground">{item.contrast}</p>
                    <p className="ed-body mt-2">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
