import { LandingMobileActions } from "@/components/marketing/LandingMobileActions";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { withBrandPageMetadata } from "@/lib/brand-page-metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { EstimateCalculatorWizard } from "@/components/estimate/EstimateCalculatorWizard";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { SITE_CONFIG } from "@/shared/siteConfig";
import Image from "next/image";
import Link from "next/link";

export const metadata = withBrandPageMetadata(
  catalogMetadata(
    "/estimate",
    "Get an Estimate",
    catalogDescription(
      "Share your cabinet project with {company}. Our team will review your details and follow up to prepare an estimate.",
    ),
  ),
  "/estimate",
);

export default function EstimatePage() {
  const schemas = [
    generateWebPageSchema({
      title: "Get an Estimate",
      description:
        "Share your cabinet project, photos or plans for team review before an estimate is prepared.",
      url: "/estimate",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Get an Estimate", url: "/estimate" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="estimate-premium">
        <header className="estimate-premium__header">
          <ApprovedBrand />
          <Link href="/" className="estimate-premium__home">
            Back to home
          </Link>
        </header>
        <section
          data-p5-hero
          className="estimate-premium__hero relative isolate overflow-hidden"
        >
          <div className="absolute inset-0">
            <Image
              src={MARKETING_IMAGES.processHome}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1c1f1e]/92 via-[#1c1f1e]/72 to-[#1c1f1e]/35" />
          </div>
          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-end md:py-20">
            <div className="text-[#fbfaf6]">
              <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#659B9A]">
                Free design consultation
              </p>
              <h1
                className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >Get an Estimate</h1>
              <p className="mt-3 text-lg text-[#659B9A] md:text-xl">Boise Cabinet Co</p>
              <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-[#f1ede4]/90 md:text-lg">
                Share your kitchen, vanity, or built-in project. We reply within one business day
                with next steps for your free in-home design consultation.
              </p>
              <p className="mt-4 hidden text-sm text-[#f1ede4]/75 md:block">
                Prefer to talk? Call or text{" "}
                <a className="underline underline-offset-2" href={SITE_CONFIG.phoneHref}>
                  {SITE_CONFIG.phone}
                </a>
                .
              </p>
            </div>
            <div
              id="estimate-request"
              tabIndex={-1}
              className="estimate-premium__card scroll-mt-28"
            >
              <p className="estimate-premium__eyebrow">Project details</p>
              <h2 className="estimate-premium__card-title">Request your quote</h2>
              <KitchenCabinetsQuoteForm
                context="cabinet-project"
                submitLabel="Send Estimate Request"
              />
              <p className="estimate-premium__fine">
                Submitting a request does not book an installation or confirm a price.
              </p>
            </div>
          </div>
        </section>

        <section className="estimate-premium__next">
          <figure>
            <Image
              src="/images/approved/design-optimized.webp"
              alt="Cabinet door samples, finish swatches, and kitchen design plans"
              width={1536}
              height={1024}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, 560px"
            />
            <figcaption>
              Finish and door selections happen with your cabinet team, after we measure your space.
            </figcaption>
          </figure>
          <div>
            <p className="estimate-premium__eyebrow">What happens next</p>
            <h2 className="estimate-premium__section-title">Clarity before you commit.</h2>
            <ol>
              <li>
                <strong>1. We review your note</strong> and reply within one business day.
              </li>
              <li>
                <strong>2. Free in-home consultation</strong> to measure, discuss finishes, and plan
                the layout.
              </li>
              <li>
                <strong>3. Written proposal</strong> with drawings before anything is ordered.
              </li>
            </ol>
            <p className="estimate-premium__fine">
              Serving Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.{" "}
              <Link href="/about">Meet the team</Link>.
            </p>
          </div>
        </section>

        <details
          className="estimate-premium__wizard"
          data-testid="estimate-d2-details"
        >
          <summary>Prefer a step-by-step planning range?</summary>
          <div className="pt-4" data-estimate-wizard="">
            <EstimateCalculatorWizard fitViewport />
          </div>
        </details>
      </div>
      <LandingMobileActions />
    </>
  );
}
