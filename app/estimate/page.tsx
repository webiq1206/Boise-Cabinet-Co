import { LandingMobileActions } from "@/components/marketing/LandingMobileActions";
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { LandingContactActions } from "@/components/marketing/LandingContactActions";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import {withBrandPageMetadata} from '@/lib/brand-page-metadata';
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EstimateCalculator } from "@/components/EstimateCalculator";
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
      <header><ApprovedBrand /></header>
      <section data-p5-hero className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-serif">Get an Estimate</h1>
        <p className="mt-4">Share your project details for our team to review. Prefer to talk it through? Call or text Boise Cabinet Co.</p>
        <LandingContactActions formId="estimate-request" formLabel="Send Estimate Request" />
        <div id="estimate-request" tabIndex={-1} className="scroll-mt-28">
          <KitchenCabinetsQuoteForm context="cabinet-project" submitLabel="Send Estimate Request" />
          <p className="mt-4 text-sm">Submitting a request does not book an installation or confirm a price.</p>
        </div>
      </section>
      <details className="mx-auto w-full max-w-3xl px-6 pb-24">
        <summary className="min-h-11 cursor-pointer py-3 underline">Prefer the guided project flow?</summary>
        <EstimateCalculator headingAs="h2" />
      </details>
      <LandingMobileActions />
    </>
  );
}
