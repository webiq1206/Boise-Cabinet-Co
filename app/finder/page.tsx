import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FinderFlow } from "@/components/catalog/FinderFlow";
import { catalogMetadata } from "@/lib/catalog-metadata";
import { generateWebPageSchema, generateBreadcrumbSchema } from "@/lib/schema";

export const metadata = catalogMetadata(
  "/finder",
  "Find Your Look | {company}",
  "Answer a few quick taps (room, look, color mood, and budget) and we'll show you a curated shortlist of finishes and a recommended door style. Skippable any time.",
);

export default function FinderPage() {
  const webPageSchema = generateWebPageSchema({
    title: "Find Your Look",
    description:
      "Answer a few quick taps (room, look, color mood, and budget) and we'll show you a curated shortlist of finishes and a recommended door style. Skippable any time.",
    url: "/finder",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Find Your Look", url: "/finder" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container px-4 py-8 md:py-12 max-w-5xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Find your look" }]} />

        <div className="max-w-2xl mt-6 mb-8">
          <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
            Guided finder
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Find your <em className="brc-accent text-accent">look</em>
          </h1>
          <p className="text-muted-foreground">
            A few quick taps and we'll point you to finishes and a door style that fit your space. No
            typing, no commitment - skip to the full library any time.
          </p>
        </div>

        <FinderFlow />
      </div>
    </>
  );
}
