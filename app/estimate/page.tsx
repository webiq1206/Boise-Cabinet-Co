import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
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
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Get an Estimate" }]} />
          </div>
        </Section>
        <EstimateCalculator headingAs="h1" />
      </div>
    </>
  );
}
