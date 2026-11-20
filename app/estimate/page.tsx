import { AboveFoldActions } from "@/components/marketing/AboveFoldActions";
import { Button } from "@/components/ui/button";
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import {withBrandPageMetadata} from '@/lib/brand-page-metadata';
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LazyEstimateCalculatorWizard as EstimateCalculatorWizard } from "@/components/estimate/LazyEstimateCalculatorWizard";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata = withBrandPageMetadata({
  ...catalogMetadata(
  "/estimate",
  // Its own search, distinct from /instant-estimate (SEO audit, owner decision 6).
  "Cabinet Quote Boise | Free Design Visit",
  catalogDescription(
    "Request a cabinet quote in Boise: share your kitchen, vanity or built-in project and photos, and we plan a free in-home design visit with you.",
  ),
),
  // Explicit self canonical in the page file, so a change to the metadata
  // wrapper can never silently drop it.
  alternates: { canonical: buildCanonical("/estimate") },
}, "/estimate");

export default function EstimatePage() {
  const schemas = [
    generateWebPageSchema({
      title: "Request a cabinet quote",
      description:
        "Share your cabinet project, photos or plans for team review before an estimate is prepared.",
      url: "/estimate",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Request a cabinet quote", url: "/estimate" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <header className="mx-auto w-full max-w-3xl px-6 pt-6"><ApprovedBrand /></header>
      {/* One bottom bar on this page: the form's own Continue bar. The marketing
          call/text bar is not mounted here, and the copy above the form stays short
          so the first field sits clear of that bar at 360x640. */}
      {/* The first screen is the form (owner, 1 November): the page heading, the
          quiet call and text line the first-screen check pins, then the fields.
          No intro paragraph sits in front of the form. One bottom bar on this
          page: the form's own docked send button. The marketing call/text bar is
          not mounted here. */}
      {/* pt-0: the shared first-section rule adds --ed-hero-top for a fixed site
          header this page does not have (its brand header above is in flow), which
          pushed the first field under the docked send button at 320x568. */}
      <section data-p5-hero className="mx-auto w-full max-w-3xl px-6 pb-8 pt-0">
        {/* One label in the H1 (SEO audit, owner decision 6, 20 November 2026):
            "Request a cabinet quote", the page's own search, distinct from the
            instant estimate. The old "Boise cabinet estimate" eyebrow inside the
            H1 read as a second label. The H1 is the form's heading, so the form
            shows no second one. */}
        <h1 className="mt-4 text-3xl font-serif">Request a cabinet quote</h1>
        <AboveFoldActions />
        <div id="estimate-request" tabIndex={-1} className="mt-3 scroll-mt-28">
          {/* The call and text line above already shows the number, so the form's
              own line under the fields does not repeat it. No second helper
              paragraph follows the form: it already says "No obligation." */}
          <KitchenCabinetsQuoteForm context="cabinet-project" heading={null} dock showPhone={false} />
        </div>
      </section>
      {/* Hidden once the request is sent (app/globals.css, "estimate-planner"): the
          success screen must not be followed by another set of questions. */}
      <details className="estimate-planner mx-auto w-full max-w-3xl px-6 pb-24" data-testid="estimate-d2-details" data-quote-dock-yield="">
        <summary className="min-h-11 cursor-pointer py-3 underline">
          Prefer a step-by-step planning range?
        </summary>
        <Button asChild variant="brandOutline" className="min-h-14 whitespace-normal">
        <a
          href="/estimate#estimate-request"
          data-testid="planning-contact-cta"
        >
          Request a cabinet quote
        </a>
        </Button>
        <div className="pt-4" data-estimate-wizard="">
          <EstimateCalculatorWizard fitViewport />
        </div>
      </details>
    </>
  );
}

