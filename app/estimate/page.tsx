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
      {/* One-screen tool: fill the viewport below the sticky site header so the
          estimator never requires page scrolling on any device. */}
      <div className="flex h-[calc(100dvh-var(--app-header-h,3.75rem))] flex-col overflow-hidden">
        <div className="container shrink-0 px-4 pt-1.5 pb-0.5">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Get an Estimate" }]} />
        </div>
        <EstimateCalculator headingAs="h1" viewportFit />
      </div>
    </>
  );
}
