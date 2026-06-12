import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { GuidedCatalogWizard } from "@/components/catalog/GuidedCatalogWizard";
import { CABINET_PRODUCTS_BY_CATEGORY } from "@/shared/catalog";
import type { CabinetProductCategory } from "@/shared/catalog";
import { getProductImages } from "@/shared/catalog/entityImages";
import { catalogMetadata } from "@/lib/catalog-metadata";
import { generateWebPageSchema, generateBreadcrumbSchema, generateCollectionPageSchema } from "@/lib/schema";

const CATEGORY_LABELS: Record<CabinetProductCategory, string> = {
  base: "Base Cabinets",
  wall: "Wall Cabinets",
  tall: "Tall Cabinets",
  vanity: "Vanity Cabinets",
  "end-panel": "End Panels",
  filler: "Fillers",
  hood: "Hoods",
  "floating-shelf": "Floating Shelves",
  panel: "Panels",
};

export const metadata = catalogMetadata(
  "/products",
  "Cabinet Products",
  "Browse our full cabinet catalog: base, wall, tall, vanity, and specialty configurations.",
);

export default function ProductsHubPage() {
  const categories = Object.keys(CABINET_PRODUCTS_BY_CATEGORY) as CabinetProductCategory[];

  const webPageSchema = generateWebPageSchema({
    title: "Cabinet Products",
    description: "Browse our full cabinet catalog: base, wall, tall, vanity, and specialty configurations.",
    url: "/products",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
  ]);

  const collectionSchema = generateCollectionPageSchema({
    title: "Cabinet Products",
    description: "Browse our full cabinet catalog: base, wall, tall, vanity, and specialty configurations.",
    url: "/products",
    items: (Object.keys(CABINET_PRODUCTS_BY_CATEGORY) as CabinetProductCategory[])
      .filter((cat) => (CABINET_PRODUCTS_BY_CATEGORY[cat] ?? []).length > 0)
      .map((cat) => ({
        name: CATEGORY_LABELS[cat] ?? cat,
        url: `/products/${cat}`,
      })),
  });

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-4 md:pt-6">
        <div className="container px-4">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Products" },
            ]}
          />
          <PageHeader
            align="left"
            className="mt-6 max-w-3xl"
            eyebrow="Product catalog"
            title={
              <>
                Cabinet <em className="brc-accent text-accent">configurations</em>
              </>
            }
            description="Every cabinet code from our supplier catalog. Filter by category or use the guided wizard to narrow your project."
          />
        </div>
      </Section>

      <Section variant="surface">
        <div className="container px-4 max-w-3xl">
          <h2 className="text-lg font-medium mb-6">Guided product discovery</h2>
          <GuidedCatalogWizard />
        </div>
      </Section>

      <Section>
        <div className="container px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const items = CABINET_PRODUCTS_BY_CATEGORY[cat] ?? [];
              const count = items.length;
              if (count === 0) return null;
              const sample = items[0];
              const imageSrc = sample ? getProductImages(sample).hero : undefined;
              return (
                <CatalogVisualCard
                  key={cat}
                  name={CATEGORY_LABELS[cat] ?? cat}
                  description={`Browse ${count} ${cat.replace(/-/g, " ")} cabinet configurations.`}
                  imageSrc={imageSrc}
                  imageAlt={`${CATEGORY_LABELS[cat]} example configuration`}
                  specs={[{ label: "Configurations", value: String(count) }]}
                  primaryHref={`/products/${cat}`}
                  primaryLabel={`Browse ${CATEGORY_LABELS[cat]}`}
                  secondaryHref="/accessories"
                  secondaryLabel="Accessory families"
                />
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-8 text-center">
            Looking for roll-outs, trash pull-outs, or lazy susans?{" "}
            <Link href="/accessories" className="text-accent hover:underline">
              Browse accessory families
            </Link>
            .
          </p>
        </div>
      </Section>
      </div>
    </>
  );
}
