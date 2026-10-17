import {withBrandPageMetadata} from '@/lib/brand-page-metadata';
import { JsonLd } from "@/components/seo/JsonLd";
import { AboveFoldActions } from "@/components/marketing/AboveFoldActions";
import { EstimatePageFrame } from "@/components/EstimatePageFrame";
import { ESTIMATE_HEADLINE } from "@/lib/aboveFoldHeadlines";
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
      title: "Get an Estimate",
      description:
        "A short guided flow that turns your room, size, and style into a cabinet planning range.",
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
      <header className="estimate-above-fold" data-site-header>
        <h1>{ESTIMATE_HEADLINE}</h1>
        <AboveFoldActions />
      </header>
      <EstimatePageFrame />
    </>
  );
}
