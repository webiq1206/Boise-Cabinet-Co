import {withBrandPageMetadata} from '@/lib/brand-page-metadata';
import { JsonLd } from "@/components/seo/JsonLd";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { CallTextActions } from "@/components/marketing/CallTextActions";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata = withBrandPageMetadata((catalogMetadata(
  "/estimate",
  "Get an Estimate",
  catalogDescription(
    "Get an instant cabinet planning range for your {company} project - pick your room, size, door style, and finish in a short guided flow.",
  ),
)), "/estimate");

export default function EstimatePage() {
  const schemas = [
    generateWebPageSchema({
      title: "Start your cabinet quote in a few minutes",
      description: "Share your scope, photos or plans. We'll look it over and prepare your estimate.",
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
      <header
        data-site-header=""
        data-estimator-reach=""
        className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-inverse px-4 py-3 text-inverse-foreground"
      >
        <h1 className="text-lg font-medium leading-tight">Start your cabinet quote in a few minutes</h1>
        <p className="mt-1 text-sm leading-snug text-inverse-foreground/85">
          Share your scope, photos or plans. We&apos;ll look it over and prepare your estimate.
        </p>
        <div className="mt-2">
          <CallTextActions />
        </div>
      </header>
      <EstimateCalculator headingAs="h2" viewportFit />
    </>
  );
}
