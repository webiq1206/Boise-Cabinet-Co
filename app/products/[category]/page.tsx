import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CatalogVisualCard } from "@/components/catalog/visual";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductImages } from "@/shared/catalog/entityImages";
import {
  ACCESSORY_FAMILY_BY_SLUG,
  filterProductsByAccessoryFamily,
  formatCabinetDimensions,
  getCabinetProductsByCategory,
} from "@/shared/catalog";
import type { CabinetProduct, CabinetProductCategory } from "@/shared/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/lib/schema";

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

const CATEGORY_LABELS: Record<CabinetProductCategory, string> = {
  base: "Base",
  wall: "Wall",
  tall: "Tall",
  vanity: "Vanity",
  "end-panel": "End panel",
  filler: "Filler",
  hood: "Hood",
  "floating-shelf": "Floating shelf",
  panel: "Panel",
};

/** Unique, search-intent-aligned intro copy per category (no duplicate boilerplate). */
const CATEGORY_INTRO: Record<CabinetProductCategory, string> = {
  base: "Base cabinets carry your countertops and anchor every kitchen layout. Browse door, drawer, and roll-out configurations sized in 1/4 inch increments for Treasure Valley homes.",
  wall: "Wall cabinets add upper storage and set the visual rhythm of a kitchen. Compare heights, widths, and glass or solid door options built to your ceiling line.",
  tall: "Tall cabinets give you full-height pantry and utility storage. Explore oven, pantry, and broom configurations that maximize vertical space.",
  vanity: "Vanity cabinets organize the bathroom around your sink and plumbing. Browse widths and drawer layouts that fit Boise-area baths and powder rooms.",
  "end-panel": "Decorative and finished end panels close exposed cabinet runs for a built-in, furniture-grade look.",
  filler: "Filler strips close gaps between cabinets and walls so your run fits the room cleanly.",
  hood: "Range hood cabinets and liners frame your ventilation as a design feature.",
  "floating-shelf": "Floating shelves add open, finish-matched display storage between cabinets.",
  panel: "Cabinet panels and accessories finish islands, backs, and exposed surfaces to match your doors.",
};

export function generateStaticParams() {
  return VALID.map((category) => ({ category }));
}

export function generateMetadata({
  params,
}: {
  params: { category: string };
}): Metadata {
  const category = params.category as CabinetProductCategory;
  if (!VALID.includes(category)) {
    return catalogMetadata("/products", "Cabinet Products", "Browse the cabinet catalog.");
  }
  const label = CATEGORY_LABELS[category];
  const count = getCabinetProductsByCategory(category).length;
  return catalogMetadata(
    `/products/${category}`,
    `${label} Cabinets | Sizes & Specs | {company}`,
    `Compare ${count} ${label.toLowerCase()} cabinet sizes and configurations from {company}, custom-built for Boise and the Treasure Valley. Frameless construction, soft-close hardware, 299 finishes.`,
  );
}

function productSpecs(product: CabinetProduct) {
  const cfg = product.configuration;
  const specs: { label: string; value: string }[] = [];
  if (cfg.doors) specs.push({ label: "Doors", value: String(cfg.doors) });
  if (cfg.drawers) specs.push({ label: "Drawers", value: String(cfg.drawers) });
  if (cfg.shelves) specs.push({ label: "Shelves", value: String(cfg.shelves) });
  if (cfg.rollouts) specs.push({ label: "Roll-outs", value: String(cfg.rollouts) });
  specs.push({ label: "Dimensions", value: formatCabinetDimensions(product) });
  return specs;
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
  let products = getCabinetProductsByCategory(category);
  if (familySlug) {
    products = filterProductsByAccessoryFamily(products, familySlug);
  }

  const schemas = [
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: CATEGORY_LABELS[category], url: `/products/${category}` },
    ]),
    generateCollectionPageSchema({
      title: `${CATEGORY_LABELS[category]} Cabinets`,
      description: CATEGORY_INTRO[category],
      url: `/products/${category}`,
      items: products.slice(0, 50).map((p) => ({
        name: p.name,
        url: `/products/${p.category}/${p.slug}`,
      })),
    }),
  ];

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <JsonLd data={schemas} />
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
                ? `${products.length} cabinet configurations with ${family.name} accessory options.`
                : `${products.length} cabinet configurations in this category.`
            }
          />
          {!family && (
            <p className="text-muted-foreground mt-4 max-w-3xl">
              {CATEGORY_INTRO[category]}
            </p>
          )}
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
          {products.map((p) => {
            const imgs = getProductImages(p);
            return (
              <CatalogVisualCard
                key={p.id}
                name={p.name}
                description={p.description}
                imageSrc={imgs.thumb}
                imageAlt={`${p.name} cabinet configuration`}
                specs={productSpecs(p)}
                primaryHref={`/products/${p.category}/${p.slug}`}
                primaryLabel="Specifications"
                secondaryHref={`/design-studio?product=${p.slug}`}
                secondaryLabel="Design Studio"
              />
            );
          })}
        </div>
      </Section>
    </div>
  );
}
