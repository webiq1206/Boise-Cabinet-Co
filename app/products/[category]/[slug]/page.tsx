import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { ProductConfigurationCard } from "@/components/catalog/ProductConfigurationCard";
import { getCabinetProductBySlug } from "@/shared/catalog";
import type { CabinetProductCategory } from "@/shared/catalog";
import { CABINET_PRODUCTS } from "@/shared/catalog";
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
  return CABINET_PRODUCTS.map((p) => ({
    category: p.category,
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const p = getCabinetProductBySlug(params.slug);
  if (!p) return {};
  return catalogMetadata(
    `/products/${params.category}/${params.slug}`,
    p.oscCode,
    p.description,
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const product = getCabinetProductBySlug(params.slug);
  if (!product || product.category !== params.category) notFound();
  if (!VALID.includes(product.category as CabinetProductCategory)) notFound();

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-4 md:pt-6">
        <div className="container px-4 max-w-xl">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Products", href: "/products" },
              { name: product.category, href: `/products/${product.category}` },
              { name: product.oscCode },
            ]}
          />
          <div className="mt-8">
            <ProductConfigurationCard product={product} />
          </div>
          <p className="text-sm text-muted-foreground mt-6">{product.widthRange.note}</p>
        </div>
      </Section>
    </div>
  );
}
