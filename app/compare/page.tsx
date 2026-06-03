import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";
import { CatalogPageHero } from "@/components/catalog/CatalogPageHero";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import {
  COLLECTIONS,
  COLLECTION_COMPARISON,
  type ComparisonValue,
} from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { cn } from "@/lib/utils";

export const metadata = catalogMetadata(
  "/compare",
  "Compare Collections",
  catalogDescription(
    "Side-by-side comparison of our Custom Cabinets and Reserve cabinet lines from {company}.",
  ),
);

function ComparisonCell({ value }: { value: ComparisonValue | undefined }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center text-accent" aria-label="Yes">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center text-muted-foreground" aria-label="No">
        <X className="h-4 w-4" />
      </span>
    );
  }
  if (value === undefined) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  return <span className="text-sm text-foreground">{String(value)}</span>;
}

export default function ComparePage() {
  const matrix = COLLECTION_COMPARISON;

  const schemas = [
    generateWebPageSchema({
      title: "Compare Cabinet Collections",
      description: matrix.description,
      url: "/compare",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Compare Collections", url: "/compare" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Collections", href: "/collections" },
                { name: "Compare" },
              ]}
            />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Product catalog"
              title={
                <>
                  Compare{" "}
                  <em className="brc-accent text-accent">collections</em>
                </>
              }
              description={matrix.description}
            />
            <CatalogPageHero
              src="/images/catalog/collections/custom.webp"
              alt="Compare Custom Cabinets and Reserve cabinet collections"
              title="Compare Cabinet Collections | Boise Cabinet Co"
            />
            <Button variant="brand" asChild className="mt-4">
              <Link href="/design-studio">
                Start in Design Studio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow={matrix.title}
              title={<>Feature comparison</>}
              align="center"
              className="mb-8 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 pr-4 text-sm font-medium text-muted-foreground w-[28%] sticky left-0 bg-surface-greige z-10">
                      Feature
                    </th>
                    {COLLECTIONS.map((c) => (
                      <th key={c.id} className="py-4 px-3 text-sm font-medium text-foreground min-w-[120px]">
                        <Link
                          href={`/collections/${c.slug}`}
                          className="hover:underline underline-offset-2"
                        >
                          {c.name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.features.map((feature, rowIndex) => (
                    <tr
                      key={feature.id}
                      className={cn(
                        "border-b border-border/60",
                        rowIndex % 2 === 0 && "bg-card/40",
                      )}
                    >
                      <td className="py-3 pr-4 text-sm sticky left-0 bg-inherit z-10">
                        <span className="font-medium text-foreground">{feature.label}</span>
                        {feature.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {feature.description}
                          </p>
                        )}
                      </td>
                      {COLLECTIONS.map((c) => (
                        <td key={c.id} className="py-3 px-3 text-center align-middle">
                          <ComparisonCell value={feature.values[c.id]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
              Every {SITE_CONFIG.name} collection includes professional installation and soft-close
              hinges on doors. Details above reflect standard inclusions, ask about upgrades during
              your consultation.
            </p>
          </div>
        </Section>

        <Section>
          <div className="container px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {COLLECTIONS.map((c) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.slug}`}
                  className="marketing-card p-5 hover-elevate text-center block"
                >
                  <p className="font-sans font-light text-lg">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.leadTime}</p>
                </Link>
              ))}
            </div>
          </div>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
