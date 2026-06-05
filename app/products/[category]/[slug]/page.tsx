import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { ProductConfigurationCard } from "@/components/catalog/ProductConfigurationCard";
import { getCabinetProductBySlug, formatCabinetDimensions } from "@/shared/catalog";
import type { CabinetProductCategory } from "@/shared/catalog";
import { CABINET_PRODUCTS } from "@/shared/catalog";
import { getProductImages } from "@/shared/catalog/entityImages";
import { ProductConfigGallery } from "@/components/catalog/visual";
import { catalogMetadata } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateProductSchema } from "@/lib/schema";

const VALID: CabinetProductCategory[] = [
  "base",
  "wall",
  "tall",
  "vanity",
  "end-panel",
  "filler",
  "hood",
  "floating-shelf",
  "panel",
];

const CATEGORY_USE: Record<CabinetProductCategory, string> = {
  base: "Base cabinets sit on the floor and carry your countertop. This configuration is sized to drop into a custom run and pairs with any of our 299 finishes and six door styles.",
  wall: "Wall cabinets mount above the counter for everyday upper storage. This configuration is built to your ceiling line and finished to match your base cabinets.",
  tall: "Tall cabinets provide full-height pantry or utility storage. This configuration maximizes vertical space in kitchens, pantries, and mudrooms.",
  vanity: "Vanity cabinets organize the bathroom around your sink and plumbing. This configuration balances drawer and door storage for daily grooming items.",
  "end-panel": "Finished end panels close an exposed cabinet run for a built-in, furniture-grade look.",
  filler: "Filler strips close the gap between cabinets and walls so your run fits the room cleanly.",
  hood: "Hood cabinets and liners frame your range ventilation as a finished design feature.",
  "floating-shelf": "Floating shelves add open, finish-matched display storage between or beside cabinets.",
  panel: "Decorative panels finish islands, cabinet backs, and exposed surfaces to match your doors.",
};

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
  const dims = formatCabinetDimensions(p);
  return catalogMetadata(
    `/products/${params.category}/${params.slug}`,
    `${p.name} (${dims})`,
    `${p.description} ${dims}. Built to order by Boise Cabinet Co for Treasure Valley homes.`,
    { noindex: true },
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

  const path = `/products/${product.category}/${product.slug}`;
  const images = getProductImages(product);
  const schemas = [
    generateProductSchema({
      name: product.name,
      description: product.description,
      url: path,
      sku: product.slug,
      image: images.hero,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: product.category, url: `/products/${product.category}` },
      { name: product.name, url: path },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-4 md:pt-6">
        <div className="container px-4 max-w-xl">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Products", href: "/products" },
              { name: product.category, href: `/products/${product.category}` },
              { name: product.name },
            ]}
          />
          <div className="mt-8 max-w-xl">
            <ProductConfigGallery product={product} className="mb-8" />
            <ProductConfigurationCard product={product} showGallery={false} />
          </div>
          <p className="text-sm text-muted-foreground mt-6">{formatCabinetDimensions(product)}</p>
          <p className="text-muted-foreground mt-4 max-w-xl leading-relaxed">
            {CATEGORY_USE[product.category as CabinetProductCategory]}
          </p>
        </div>
      </Section>
    </div>
    </>
  );
}
