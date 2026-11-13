import { InteriorPage } from "@/components/approved/InteriorLayout";
import EstimatorAnalytics from "@/components/estimator/EstimatorAnalytics";
import EstimatorFrame from "@/components/estimator/EstimatorFrame";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from "@/lib/brand-page-metadata";
import { catalogDescription, catalogMetadata } from "@/lib/catalog-metadata";
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { CTA_QUOTE_HREF, CTA_REQUEST_QUOTE, INSTANT_ESTIMATE_HREF } from "@/shared/ctaCopy";
import { ESTIMATOR_BRAND_ID, ESTIMATOR_PROJECT_PATTERN } from "@/shared/instantEstimate";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { Phone } from "lucide-react";
import Link from "next/link";

/**
 * The instant estimate (owner decision, 13 November 2026).
 *
 * This page frames the P5 family's one estimator, which runs on the parent
 * company's site. Its questions, pricing, property lookup and lead delivery
 * all happen there; nothing here prices anything, and none of that logic may
 * be copied into this repository (see CLAUDE.md, "Instant estimate").
 *
 * The block above the frame stays short on purpose: on a phone the first
 * estimator question has to be on the first screen. The estimator shows a
 * preliminary price range, so this page never calls it a quote, a bid or a
 * final price. The quote request form at /estimate stays as the path to a
 * person.
 */

const TITLE = "Instant Cabinet Estimate in Boise";
const DESCRIPTION =
  "Get an instant preliminary cabinet estimate from {company}. Answer a few questions about your kitchen, vanity or built-ins and see a price range on screen. Free, any time.";

/**
 * The family sticky header is 64px tall on phones and 76px from 640px up
 * (styles/family-tokens.css, --header-height). The frame takes one number, so
 * it gets the taller one: a question screen is never cut off under the header.
 */
const HEADER_OFFSET = 76;

const STEPS = [
  {
    number: "01",
    title: "Pick your project and answer a few questions",
    desc: "Choose kitchen cabinets, a bathroom vanity, a cabinet refresh or built-ins, then tell us about the room.",
  },
  {
    number: "02",
    title: "We add your home's public record",
    desc: "Where the county publishes it, the estimator fills in what it can about your home, so there is less for you to look up.",
  },
  {
    number: "03",
    title: "See your preliminary range on screen",
    desc: "Your preliminary price range appears with a breakdown by division of work.",
  },
];

export const metadata = withBrandPageMetadata(
  {
    ...catalogMetadata(INSTANT_ESTIMATE_HREF, TITLE, catalogDescription(DESCRIPTION)),
    // Explicit self canonical in the page file: a ?project= link is the same page.
    alternates: { canonical: buildCanonical(INSTANT_ESTIMATE_HREF) },
  },
  INSTANT_ESTIMATE_HREF,
);

export default async function InstantEstimatePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const requested = searchParams.project;
  const project = typeof requested === "string" && ESTIMATOR_PROJECT_PATTERN.test(requested) ? requested : null;

  const schemas = [
    generateWebPageSchema({
      title: "Instant cabinet estimate",
      description:
        "Answer a few questions and see a preliminary price range for cabinets on screen. A firm written proposal follows a site visit, measurements and selections.",
      url: INSTANT_ESTIMATE_HREF,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Instant estimate", url: INSTANT_ESTIMATE_HREF },
    ]),
  ];

  return (
    <InteriorPage kind="instant-estimate">
      <>
        <JsonLd data={schemas} />
        <div className="flex flex-col">
          <section className="instant-estimate-intro pt-0">
            <div className="ed-shell">
              <h1>Get your instant cabinet estimate</h1>
              <p className="instant-estimate-support">
                Answer a few questions and see a personalized preliminary price range on screen. Free, any time,
                with no appointment and no waiting for a callback.
              </p>
            </div>
          </section>

          <section className="instant-estimate-frame" aria-label="Instant estimate">
            <EstimatorAnalytics />
            <EstimatorFrame
              brand={ESTIMATOR_BRAND_ID}
              project={project}
              title={`${SITE_CONFIG.name} instant estimate`}
              headerOffset={HEADER_OFFSET}
            />
          </section>

          <Section variant="greige" divider>
            <div className="ed-shell">
              <div className="ed-split ed-split-narrow">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHeader eyebrow="How it works" title={<>Three steps to your range</>} align="left" className="mb-0" />
                </div>
                <ol className="ed-steps m-0 list-none p-0">
                  {STEPS.map((step) => (
                    <li key={step.number} className="ed-step">
                      <span className="ed-step-n" aria-hidden="true">{step.number}</span>
                      <div>
                        <h3 className="ed-h4">{step.title}</h3>
                        <p className="ed-body mt-2 text-[0.9375rem]">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Section>

          <Section divider>
            <div className="ed-shell">
              <div className="ed-split ed-split-narrow">
                <SectionHeader
                  eyebrow="What the number means"
                  title={<>A preliminary estimate, then a firm proposal</>}
                  align="left"
                  className="mb-0"
                />
                <div>
                  <p className="ed-body">
                    The instant estimate is a preliminary price range for budgeting. It is built from your answers,
                    before anyone has measured the room.
                  </p>
                  <p className="ed-body mt-4">
                    A firm written proposal follows a site visit, measurements and your selections.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section variant="inverse">
            <div className="container mx-auto max-w-lg px-4 text-center">
              <h2 className="ed-h2-sm">Prefer to talk to us?</h2>
              <p className="mb-4 mt-4 text-inverse-muted">
                Call or text {SITE_CONFIG.name}, or send your project through the request form and our team will
                review it.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="brand" asChild>
                  <a href={SITE_CONFIG.phoneHref}>
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call {SITE_CONFIG.phone}
                  </a>
                </Button>
                <Button variant="brandOutline" asChild>
                  <Link href={CTA_QUOTE_HREF} prefetch={false}>
                    {CTA_REQUEST_QUOTE}
                  </Link>
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </>
    </InteriorPage>
  );
}
