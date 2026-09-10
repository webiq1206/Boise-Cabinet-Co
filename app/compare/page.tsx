import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, X } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import {
  COLLECTIONS,
  COLLECTION_COMPARISON,
  DOOR_STYLE_COMPARISON,
  FINISH_TIER_COMPARISON,
  getDoorStyleImages,
  type CollectionComparisonMatrix,
  type ComparisonValue,
} from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { cn } from "@/lib/utils";

export const metadata = catalogMetadata(
  "/compare",
  "Compare Collections",
  catalogDescription(
    "How {company} builds Custom Cabinets to your exact sizes, finishes, and details.",
  ),
);

const FINISH_ROW_IMAGES: Record<string, string> = {
  "matte-finishes": "/images/catalog/finishes/category-matte.webp",
  "gloss-finishes": "/images/catalog/finishes/category-gloss.webp",
  "woodgrain-finishes": "/images/catalog/finishes/category-woodgrain.webp",
};

function ComparisonCell({ value }: { value: ComparisonValue | undefined }) {
  if (value === true) {
    return (
      <span className="tap-target inline-flex items-center justify-center text-accent" aria-label="Yes">
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

function ComparisonRowVisual({
  matrixId,
  featureId,
  label,
}: {
  matrixId: string;
  featureId: string;
  label: string;
}) {
  if (matrixId === "door-style-fit") {
    const { primary } = getDoorStyleImages(featureId);
    return (
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-muted">
          <Image src={primary} alt={`${label} door style`} fill sizes="40px" className="object-cover" />
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
    );
  }

  if (matrixId === "finish-tier-access") {
    const src = FINISH_ROW_IMAGES[featureId];
    if (src) {
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-muted">
            <Image src={src} alt={`${label} cabinet finish`} fill sizes="40px" className="object-cover" />
          </div>
          <span className="font-medium text-foreground">{label}</span>
        </div>
      );
    }
  }

  return <span className="font-medium text-foreground">{label}</span>;
}

/**
 * With a single collection a comparison table has nothing to compare: one
 * column of ticks beside a feature list. The same data reads far better as
 * a hairline matrix of what every cabinet includes.
 */
function SingleCollectionGrid({
  matrix,
  visualRows = false,
}: {
  matrix: CollectionComparisonMatrix;
  visualRows?: boolean;
}) {
  const only = COLLECTIONS[0];
  const cols = visualRows ? 3 : 2;
  return (
    <div
      className="ed-matrix mx-auto max-w-5xl"
      style={{ ["--ed-cols" as string]: cols, ["--ed-cell-h" as string]: "0" }}
    >
      {matrix.features.map((feature) => {
        const value = feature.values[only.id];
        return (
          <div key={feature.id} className="flex flex-col gap-3">
            {visualRows ? (
              <ComparisonRowVisual matrixId={matrix.id} featureId={feature.id} label={feature.label} />
            ) : (
              <span className="ed-h4">{feature.label}</span>
            )}
            {feature.description && (
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            )}
            <div className="mt-auto flex items-center gap-2 text-sm">
              {typeof value === "string" ? (
                <span className="text-foreground">{value}</span>
              ) : value === false ? (
                <>
                  <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Not included</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span className="text-foreground">Included</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonMatrixTable({
  matrix,
  visualRows = false,
}: {
  matrix: CollectionComparisonMatrix;
  visualRows?: boolean;
}) {
  if (COLLECTIONS.length === 1) return <SingleCollectionGrid matrix={matrix} visualRows={visualRows} />;
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="py-4 pr-4 text-sm font-medium text-muted-foreground w-[28%] sticky left-0 bg-surface-greige z-10">
              Feature
            </th>
            {COLLECTIONS.map((c) => (
              <th key={c.id} className="py-4 px-3 text-sm font-medium text-foreground min-w-[120px]">
                <Link href="/catalog" className="tap-target inline-flex items-center hover:underline underline-offset-2">
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
              className={cn("border-b border-border/60", rowIndex % 2 === 0 && "bg-card/40")}
            >
              <td className="py-3 pr-4 text-sm sticky left-0 bg-inherit z-10">
                {visualRows ? (
                  <ComparisonRowVisual
                    matrixId={matrix.id}
                    featureId={feature.id}
                    label={feature.label}
                  />
                ) : (
                  <span className="font-medium text-foreground">{feature.label}</span>
                )}
                {feature.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
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
  );
}

export default function ComparePage() {
  const schemas = [
    generateWebPageSchema({
      title: "Compare Cabinet Collections",
      description: COLLECTION_COMPARISON.description,
      url: "/compare",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Catalog", url: "/catalog" },
      { name: "Compare", url: "/compare" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <CinematicHero
          image={"/images/catalog/collections/custom.webp"}
          alt="Representative custom cabinetry with coordinated sizes and finishes"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Catalog", href: "/catalog" }, { name: "Compare" }]}
          eyebrow="Product catalog"
          title={<>
                  Compare <em className="brc-accent text-accent">collections</em>
                </>}
          description={COLLECTION_COMPARISON.description}
        >
<Button variant="brand" asChild className="mt-4">
              <Link href="/estimate">
                Get an estimate <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
        </CinematicHero>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow={COLLECTION_COMPARISON.title}
              title={COLLECTIONS.length === 1 ? <>What every cabinet includes</> : <>Feature comparison</>}
              className="mb-8"
            />
            <ComparisonMatrixTable matrix={COLLECTION_COMPARISON} />
            <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
              Every {SITE_CONFIG.name} collection includes professional installation and soft-close
              hinges on doors. Details above reflect standard inclusions, ask about upgrades during
              your consultation.
            </p>
          </div>
        </Section>

        <Section divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow={DOOR_STYLE_COMPARISON.title}
              title={<>Six door styles</>}
              description={DOOR_STYLE_COMPARISON.description}
              className="mb-8"
            />
            <ComparisonMatrixTable matrix={DOOR_STYLE_COMPARISON} visualRows />
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow={FINISH_TIER_COMPARISON.title}
              title={<>299 finishes</>}
              description={FINISH_TIER_COMPARISON.description}
              className="mb-8"
            />
            <ComparisonMatrixTable matrix={FINISH_TIER_COMPARISON} visualRows />
          </div>
        </Section>

        {COLLECTIONS.length > 1 && (
        <Section>
          <div className="ed-shell">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLLECTIONS.map((c) => (
                <Link
                  key={c.id}
                  href="/catalog"
                  className="marketing-card p-5 brc-lift text-center block"
                >
                  <p className="font-sans font-light text-lg">{c.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{c.leadTime}</p>
                </Link>
              ))}
            </div>
          </div>
        </Section>
        )}
        <CatalogClosingCTA />
      </div>
    </>
  );
}
