import { AboveFoldActions } from "@/components/marketing/AboveFoldActions";
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import {withBrandPageMetadata} from '@/lib/brand-page-metadata';
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EstimateCalculatorWizard } from "@/components/estimate/EstimateCalculatorWizard";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata = withBrandPageMetadata((catalogMetadata(
  "/estimate",
  "Get an Estimate",
  catalogDescription(
    "Share your cabinet project with {company}. Our team will review your details and follow up to prepare an estimate.",
  ),
)), "/estimate");

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
      <header className="mx-auto w-full max-w-3xl px-6 pt-6"><ApprovedBrand /></header>
      {/* One bottom bar on this page: the form's own Continue bar. The marketing
          call/text bar is not mounted here, and the copy above the form stays short
          so the first field sits clear of that bar at 360x640. */}
      <section data-p5-hero className="mx-auto w-full max-w-3xl px-6 pb-8 pt-4">
        <h1 className="text-3xl font-serif">Get an Estimate</h1>
        <p className="mt-2">Share your project details for our team to review. Prefer to talk it through?</p>
        <AboveFoldActions />
        <div id="estimate-request" tabIndex={-1} className="mt-2 scroll-mt-28">
          <KitchenCabinetsQuoteForm context="cabinet-project" submitLabel="Send Estimate Request" />
          <p className="mt-4 text-sm">Submitting a request does not book an installation or confirm a price.</p>
        </div>
      </section>
      <details className="mx-auto w-full max-w-3xl px-6 pb-24" data-testid="estimate-d2-details">
        <summary className="min-h-11 cursor-pointer py-3 underline">
          Prefer a step-by-step planning range?
        </summary>
        <div className="pt-4" data-estimate-wizard="">
          <EstimateCalculatorWizard fitViewport />
        </div>
      </details>
    </>
  );
}
