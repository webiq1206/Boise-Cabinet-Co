import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { GuidedCatalogWizard } from "@/components/catalog/GuidedCatalogWizard";
import { CABINET_PRODUCTS_BY_CATEGORY } from "@/shared/catalog";
import type { CabinetProductCategory } from "@/shared/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";

const CATEGORY_LABELS: Record<CabinetProductCategory, string> = {
  base: "Base Cabinets",
  wall: "Wall Cabinets",
  tall: "Tall Cabinets",
  vanity: "Vanity Cabinets",
  "end-panel": "End Panels",
  filler: "Fillers",
  hood: "Hoods",
  "floating-shelf": "Floating Shelves",
};

export const metadata = catalogMetadata(
  "/products",
  "Cabinet Products",
  "Browse the full One Source Cabinets SKU catalog: base, wall, tall, vanity, and specialty configurations.",
);

export default function ProductsHubPage() {
  const categories = Object.keys(CABINET_PRODUCTS_BY_CATEGORY) as CabinetProductCategory[];

  return (
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
                One Source <em className="brc-accent text-accent">configurations</em>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = CABINET_PRODUCTS_BY_CATEGORY[cat]?.length ?? 0;
              if (count === 0) return null;
              return (
                <MarketingCard key={cat}>
                  <h3 className="font-medium">{CATEGORY_LABELS[cat] ?? cat}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{count} configurations</p>
                  <Link
                    href={`/products/${cat}`}
                    className="text-sm text-accent mt-3 inline-block hover:underline"
                  >
                    Browse {CATEGORY_LABELS[cat]}
                  </Link>
                </MarketingCard>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}
