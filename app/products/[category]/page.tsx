import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ProductConfigurationCard } from "@/components/catalog/ProductConfigurationCard";
import { getCabinetProductsByCategory } from "@/shared/catalog";
import type { CabinetProductCategory } from "@/shared/catalog";
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

export function generateStaticParams() {
  return VALID.map((category) => ({ category }));
}

export default function ProductCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = params.category as CabinetProductCategory;
  if (!VALID.includes(category)) notFound();

  const products = getCabinetProductsByCategory(category, 200);

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
            title={<> {category.replace(/-/g, " ")} cabinets </>}
            description={`${products.length} One Source configurations in this category.`}
          />
        </div>
      </Section>
      <Section>
        <div className="container px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductConfigurationCard key={p.id} product={p} />
          ))}
        </div>
      </Section>
    </div>
  );
}
