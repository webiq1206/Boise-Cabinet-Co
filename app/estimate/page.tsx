import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata = catalogMetadata(
  "/estimate",
  "Get an Estimate",
  catalogDescription(
    "Get an instant cabinet planning range for your {company} project - pick your room, size, door style, and finish in a short guided flow.",
  ),
);

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
      <EstimateCalculator headingAs="h1" viewportFit />
    </>
  );
}
