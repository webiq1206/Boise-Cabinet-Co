"use client";

import { Section } from "@/components/marketing";
import { EstimateCalculatorWizard } from "@/components/estimate/EstimateCalculatorWizard";
import { ESTIMATE_VALUE_PROP } from "@/shared/estimateEngine";

interface EstimateCalculatorProps {
  inModal?: boolean;
  onBookVisit?: () => void;
  /** Open the flow directly on a given step (e.g. "contact"). */
  startStep?: "project" | "size" | "layout" | "style" | "result" | "contact";
  /**
   * Heading level for the title. Defaults to `h2` (used as a section on the
   * homepage). The standalone `/estimate` page passes `h1` so the page has
   * exactly one top-level heading for SEO and accessibility.
   */
  headingAs?: "h1" | "h2";
  /**
   * Homepage treatment: frames the wizard as an elevated, teal-accented tool so
   * it reads as a featured instrument instead of blending into the page rhythm.
   * The standalone `/estimate` page (which IS the tool) leaves this off.
   */
  featured?: boolean;
  /**
   * Standalone `/estimate` treatment: the tool fills one screen below the site
   * header with a tight heading, and the wizard runs in viewport-fit mode so the
   * step header + primary CTA stay on screen without page scroll.
   */
  viewportFit?: boolean;
}

export function EstimateCalculator({ inModal = false, onBookVisit, startStep, headingAs = "h2", featured = false, viewportFit = false }: EstimateCalculatorProps = {}) {
  if (inModal) {
    return <EstimateCalculatorWizard inModal fitViewport onBookVisit={onBookVisit} startStep={startStep} />;
  }

  const Heading = headingAs;

  // Standalone `/estimate`: one-screen tool. A compact heading sits above the
  // wizard, which fills the remaining height and pins its own CTA - no page
  // scroll to reach any step or the primary action.
  if (viewportFit) {
    return (
      <div className="container flex min-h-0 flex-1 flex-col px-4 pb-3">
        <div className="mb-2 shrink-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <Heading className="font-sans font-light text-xl sm:text-2xl leading-tight text-foreground">
              Plan your cabinet <em className="brc-accent text-accent">investment</em>
            </Heading>
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Free · No obligation · Instant range
            </span>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <EstimateCalculatorWizard fitViewport onBookVisit={onBookVisit} startStep={startStep} />
        </div>
      </div>
    );
  }

  return (
    <Section id="calculator" divider>
      <div className="container px-4 pb-8">
        <div className="max-w-3xl mx-auto mb-5 md:mb-10">
          <div className="brc-label mb-2 md:mb-3">Project Estimator</div>
          {featured && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs tracking-wide text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Free &middot; No obligation &middot; Instant range
            </span>
          )}
          <Heading className="font-sans font-light text-section-title md:text-section-title-lg mb-2 md:mb-3 text-foreground">
            Plan your cabinet{" "}
            <em className="brc-accent text-accent">investment</em>
          </Heading>
          {/* Descriptive copy is redundant with each step's own description on
              small screens, so we hide it there to keep the flow above the fold. */}
          <p className="hidden sm:block text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            A short guided flow - pick your project, size, and style. Your planning range stays
            in view and updates at each step.
          </p>
          <p className="hidden sm:block text-base max-w-2xl leading-relaxed text-foreground/80">
            {ESTIMATE_VALUE_PROP}
          </p>
        </div>

        {featured ? (
          /* Elevated module: neutral hairline border + shadow lift the tool off
             the flat page, and a solid teal accent line across the top marks it
             as a distinct interactive module. */
          <div className="max-w-5xl mx-auto overflow-hidden rounded-xl border border-border bg-card/40 shadow-xl">
            <div className="h-1 bg-accent" aria-hidden="true" />
            <div className="p-4 sm:p-6 md:p-8">
              <EstimateCalculatorWizard onBookVisit={onBookVisit} />
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <EstimateCalculatorWizard onBookVisit={onBookVisit} />
          </div>
        )}
      </div>
    </Section>
  );
}
