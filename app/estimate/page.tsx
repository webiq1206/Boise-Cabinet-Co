import { AboveFoldActions } from "@/components/marketing/AboveFoldActions";
import { LandingMobileActions } from "@/components/marketing/LandingMobileActions";
import { OpenChatButton } from "@/components/marketing/OpenChatButton";
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import {withBrandPageMetadata} from '@/lib/brand-page-metadata';
import { JsonLd } from "@/components/seo/JsonLd";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import Link from "next/link";

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
    <div className="quote-page">
      <JsonLd data={schemas} />
      <header className="quote-topbar">
        <Link href="/" aria-label="Boise Cabinet Co home"><ApprovedBrand /></Link>
      </header>
      <section data-p5-hero className="quote-hero pt-0">
        <div className="quote-copy">
          <p className="quote-kicker">Boise Cabinet Co</p>
          <h1>Get an Estimate</h1>
          <p>Share your project details for our team to review. Prefer to talk it through? Call or chat with Boise Cabinet Co.</p>
          <div className="quote-actions">
            <AboveFoldActions />
            <OpenChatButton className="quote-chat" />
          </div>
          <div id="estimate-request" tabIndex={-1} className="quote-form scroll-mt-28">
            <KitchenCabinetsQuoteForm context="cabinet-project" compact submitLabel="Send Estimate Request" />
            <p className="quote-fine">Submitting a request does not book an installation or confirm a price.</p>
          </div>
        </div>
        <img
          className="quote-photo"
          src="/images/approved/kitchen.webp"
          alt="Custom kitchen with light wood cabinets, a stone counter, and a bright window"
          width="1080"
          height="810"
        />
      </section>
      <details id="guided-scope" className="quote-optional">
        <summary>Prefer the guided project flow?</summary>
        <p>Optional. Use this when you want to scope cabinet sizes step by step. The short form above is enough to start.</p>
        <EstimateCalculator headingAs="h2" />
      </details>
      <LandingMobileActions />
    </div>
  );
}
