import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CatalogVisualCard } from "@/components/catalog/visual";
import {
  ACCESSORY_FAMILY_BY_SLUG,
  filterProductsByAccessoryFamily,
  getCabinetProductsByCategory,
} from "@/shared/catalog";
import type { CabinetProduct, CabinetProductCategory } from "@/shared/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";

const VALID: CabinetProductCategory[] = [
  "base",
  "wall",
  "tall",
  "vanity",
  "end-panel",
  "filler",
  "hood",
  "floating-shelf",
];

const CATEGORY_LABELS: Record<CabinetProductCategory, string> = {
  base: "Base",
  wall: "Wall",
  tall: "Tall",
  vanity: "Vanity",
  "end-panel": "End panel",
  filler: "Filler",
  hood: "Hood",
  "floating-shelf": "Floating shelf",
};

function productSpecs(product: CabinetProduct) {
  const cfg = product.configuration;
  const specs: { label: string; value: string }[] = [];
  if (cfg.doors) specs.push({ label: "Doors", value: String(cfg.doors) });
  if (cfg.drawers) specs.push({ label: "Drawers", value: String(cfg.drawers) });
  if (cfg.shelves) specs.push({ label: "Shelves", value: String(cfg.shelves) });
  if (cfg.rollouts) specs.push({ label: "Roll-outs", value: String(cfg.rollouts) });
  specs.push({
    label: "Width range",
    value: `${product.widthRange.minInches}"–${product.widthRange.maxInches}"`,
  });
  return specs;
}

export function generateStaticParams() {
  return VALID.map((category) => ({ category }));
}

export default function ProductCategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams?: { family?: string };
}) {
  const category = params.category as CabinetProductCategory;
  if (!VALID.includes(category)) notFound();

  const familySlug = searchParams?.family;
  const family = familySlug ? ACCESSORY_FAMILY_BY_SLUG[familySlug] : undefined;
  let products = getCabinetProductsByCategory(category, 200);
  if (familySlug) {
    products = filterProductsByAccessoryFamily(products, familySlug);
  }

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-4 md:pt-6">
        <div className="container px-4">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Products", href: "/products" },
              { name: category },
            ]}
          />
          <PageHeader
            align="left"
            className="mt-6"
            title={
              <>
                {family ? family.name : CATEGORY_LABELS[category]} {family ? "SKUs" : "cabinets"}
              </>
            }
            description={
              family
                ? `${products.length} One Source configurations with ${family.oscCodePattern} accessory options.`
                : `${products.length} One Source configurations in this category.`
            }
          />
          {family && (
            <p className="text-sm text-muted-foreground mt-2">
              Filtered by{" "}
              <Link href="/accessories" className="text-accent hover:underline">
                {family.name}
              </Link>
              .{" "}
              <Link href={`/products/${category}`} className="hover:underline">
                Clear filter
              </Link>
            </p>
          )}
        </div>
      </Section>
      <Section>
        <div className="container px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <CatalogVisualCard
              key={p.id}
              name={p.oscCode}
              description={p.description}
              specs={productSpecs(p)}
              primaryHref={`/products/${p.category}/${p.slug}`}
              primaryLabel="Specifications"
              secondaryHref={`/design-studio?product=${p.slug}`}
              secondaryLabel="Design Studio"
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
