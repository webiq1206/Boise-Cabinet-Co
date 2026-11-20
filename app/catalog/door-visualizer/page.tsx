import { InteriorPage } from "@/components/approved/InteriorLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DoorVisualizer } from "@/components/catalog/DoorVisualizer";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Section } from "@/components/marketing/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { withBrandPageMetadata } from "@/lib/brand-page-metadata";
import { catalogDescription, catalogMetadata } from "@/lib/catalog-metadata";
import { versionedSrc } from "@/lib/images/imageVersion";
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import {
  DOOR_VISUALIZER_PATH,
  parseVisualizerSelection,
  visualizerFinishes,
  visualizerStyles,
} from "@/shared/doorVisualizer";
import Link from "next/link";

const FINISHES = visualizerFinishes();
const STYLES = visualizerStyles();

export const metadata = withBrandPageMetadata({
  ...catalogMetadata(
    DOOR_VISUALIZER_PATH,
    "Cabinet Door Visualizer",
    catalogDescription(
      // Kept within 160 characters (SEO audit CAB-T8).
      `Cabinet door visualizer: see any of ${FINISHES.length} finishes on ${STYLES.length} door styles, from Slab to Beta Shaker, then share the link or request a quote with your pick.`,
    ),
  ),
  // Explicit self canonical in the page file: every finish and style opens on
  // this one address with query parameters, and the page itself is the canonical.
  alternates: { canonical: buildCanonical(DOOR_VISUALIZER_PATH) },
}, DOOR_VISUALIZER_PATH);

/** /catalog/door-visualizer?finish=matte-snow-white&style=modern-shaker */
export default async function DoorVisualizerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = { ...parseVisualizerSelection(params, FINISHES), all: params.all === "1" };
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Door Visualizer",
      description: `Every cabinet finish in the catalog on every door style: ${FINISHES.length} finishes and ${STYLES.length} door styles.`,
      url: DOOR_VISUALIZER_PATH,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Catalog", url: "/catalog" },
      { name: "Door visualizer", url: DOOR_VISUALIZER_PATH },
    ]),
  ];
  // The URLs handed to the browser carry their content version; the catalog paths stay plain.
  const finishes = FINISHES.map((finish) => ({
    ...finish,
    imageUrl: versionedSrc(finish.image),
    chipUrl: versionedSrc(finish.chip),
  }));

  return (
    <InteriorPage kind="catalog"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col">
        <Section spacing="sm" className="dv-head pt-4 md:pt-6">
          <div className="container px-4">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Catalog", href: "/catalog" }, { name: "Door visualizer" }]} />
            <div className="mt-6">
              <PageHeader
                align="left"
                eyebrow="Product catalog"
                title={
                  <>
                    Every finish, on every <em className="brc-accent text-accent">door</em>
                  </>
                }
                description={`Choose any of the ${STYLES.length} door styles and ${FINISHES.length} catalog finishes to see them together.`}
              />
            </div>
          </div>
        </Section>
        <Section spacing="sm" className="pt-0">
          <div className="container px-4">
            <DoorVisualizer finishes={finishes} styles={STYLES} initial={initial} />
            <p className="dv-onward">
              <Link prefetch={false} href="/catalog">Full catalog</Link>
              <Link prefetch={false} href="/shaker-cabinets">Shaker cabinets</Link>
              <Link prefetch={false} href="/cabinets">Cabinets by room</Link>
            </p>
          </div>
        </Section>
      </div>
    </>
    </InteriorPage>
  );
}
