import type { ReactNode } from "react";
import { Section } from "@/components/marketing/Section";

/**
 * The first section under a fitted hero. A hero keeps one support line, one
 * primary action and the quiet call/text line, so the rest of what the hero
 * used to say lands here, word for word, at a readable measure.
 */
export function HeroFollowOn({ children }: { children: ReactNode }) {
  return (
    <Section spacing="sm" className="hero-follow-on">
      <div className="ed-shell hero-follow-on-body">{children}</div>
    </Section>
  );
}
