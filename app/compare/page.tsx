import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema,generateWebPageSchema } from "@/lib/schema";
import { CABINET_WORKMANSHIP_WARRANTY, MANUFACTURER_WARRANTY_PASS_THROUGH } from "@/shared/claims";
import { CATALOG_CONTENT, DOOR_STYLES, FINISHES } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const PAGE_TITLE = "Custom Cabinet Comparison | Spec Sheet";
const PAGE_DESCRIPTION =
  "Custom cabinet comparison from {company}: built-to-order specs beside stock and semi-custom lines, plus six door styles and 299 finishes.";

export const metadata = withBrandPageMetadata({
  ...catalogMetadata(
  "/compare",
  PAGE_TITLE,
  catalogDescription(PAGE_DESCRIPTION),
),
  // Explicit self canonical in the page file, so a change to the metadata
  // wrapper can never silently drop it.
  alternates: { canonical: buildCanonical("/compare") },
}, "/compare");

/**
 * /compare used to render one column of ticks for a single collection, which
 * compared nothing. It now compares real options, using only facts the site
 * already publishes:
 * - stock and semi-custom columns: the tier table in
 *   /blog/stock-vs-custom-cabinets-boise (shared/content/premiumPosts.ts)
 * - our column: /construction, the catalog data, the process and warranty copy
 * - door styles and finish families: shared/catalog generated data
 */
const FINISH_FAMILIES = [
  { id: "matte", label: "Matte" },
  { id: "gloss", label: "Gloss" },
  { id: "woodgrain", label: "Woodgrain" },
] as const;

function finishCount(category: string): number {
  return FINISHES.filter((finish) => finish.category === category).length;
}

function doorStylesFor(category: string): string[] {
  return DOOR_STYLES.filter((style) =>
    (style.compatibleFinishCategories as readonly string[]).includes(category),
  ).map((style) => style.name);
}

function drawerFront(notes: string | undefined): string {
  const match = notes?.match(/Drawer fronts:\s*([^.]+)\./);
  return match ? match[1].trim() : "Slab front";
}

function familyList(categories: readonly string[]): string {
  return FINISH_FAMILIES.filter((family) => categories.includes(family.id))
    .map((family) => family.label)
    .join(", ");
}

const TIER_ROWS: Array<{ factor: string; stock: string; semi: string; ours: string }> = [
  {
    factor: "Sizes",
    stock: "Fixed sizes in 3 inch increments",
    semi: "Standard sizes plus modifications",
    ours: "Built to your room's exact widths, heights, and depths",
  },
  {
    factor: "Door styles",
    stock: "Limited",
    semi: "Broad",
    ours: `${DOOR_STYLES.length}: ${DOOR_STYLES.map((style) => style.name).join(", ")}`,
  },
  {
    factor: "Finishes",
    stock: "Limited",
    semi: "Broad",
    ours: `${FINISHES.length}: ${FINISH_FAMILIES.map((family) => `${finishCount(family.id)} ${family.label.toLowerCase()}`).join(", ")}`,
  },
  {
    factor: "Fit to your space",
    stock: "Filler strips cover the gaps",
    semi: "Good",
    ours: "Field-measured, then leveled and scribed to your walls",
  },
  {
    factor: "Box construction",
    stock: "Varies, often basic",
    semi: "Better",
    ours: "Frameless box; exposed sides in 3/4 inch birch plywood; soft-close hinge and slide options",
  },
  {
    factor: "Design and drawings",
    stock: "Sold at home centers, often ready to assemble",
    semi: "Configured through a dealer or showroom",
    ours: "Free in-home design consultation and shop drawings you approve before the order",
  },
  {
    factor: "Installation",
    stock: "You or a separate installer",
    semi: "Often a separate installer",
    ours: "Installed by our own Treasure Valley crew",
  },
  {
    factor: "Lead time",
    stock: "Fastest",
    semi: "Moderate",
    ours: `Typically ${CATALOG_CONTENT.leadTime} from approved design`,
  },
  {
    factor: "Warranty",
    stock: "Varies by line",
    semi: "Varies by line",
    ours: `${CABINET_WORKMANSHIP_WARRANTY}; ${MANUFACTURER_WARRANTY_PASS_THROUGH.toLowerCase()}`,
  },
  {
    factor: "Relative cost",
    stock: "$",
    semi: "$$",
    ours: "$$$, quoted in writing after measurement",
  },
];

const tableShell = "overflow-x-auto rounded-sm border border-border bg-card";
const tableBase = "w-full min-w-[600px] border-collapse text-left text-sm";
const headCell = "px-4 py-3 font-medium text-foreground align-bottom";
const rowHead = "sticky left-0 z-10 bg-card px-4 py-3 font-medium text-foreground align-top";
const bodyCell = "px-4 py-3 text-foreground/90 align-top";

export default function ComparePage() {
  const schemas = [
    generateWebPageSchema({
      title: "Custom cabinet comparison",
      description: catalogDescription(PAGE_DESCRIPTION),
      url: "/compare",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Catalog", url: "/catalog" },
      { name: "Compare", url: "/compare" },
    ]),
  ];

  return (
    <InteriorPage kind="compare"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        <CinematicHero
          image={"/images/catalog/collections/custom.webp"}
          alt="custom cabinetry with coordinated sizes and finishes"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Catalog", href: "/catalog" }, { name: "Compare" }]}
          eyebrow="Compare your options"
          title={<>
                  Custom cabinet <em className="brc-accent text-accent">comparison</em>
                </>}
          description={`How ${SITE_CONFIG.name} custom cabinets compare with stock and semi-custom lines, plus our ${DOOR_STYLES.length} door styles and ${FINISHES.length} finishes side by side.`}
        >
<Button variant="brand" asChild className="mt-4">
              <Link href="/estimate">
                Request a quote <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
        </CinematicHero>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Stock, semi-custom, or custom"
              title={<>How our custom cabinets compare</>}
              description="Stock cabinets are pre-built in fixed sizes, semi-custom lines start from a catalog and allow modifications, and custom cabinets are built to your exact dimensions. Here is where ours sit on each factor."
              align="left"
              className="mb-8"
            />
            <div className={tableShell}>
              <table className={tableBase}>
                <caption className="sr-only">
                  Stock, semi-custom, and {SITE_CONFIG.name} custom cabinets compared
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={`${headCell} sticky left-0 z-10 bg-card w-[22%]`}>Factor</th>
                    <th scope="col" className={headCell}>Stock</th>
                    <th scope="col" className={headCell}>Semi-custom</th>
                    <th scope="col" className={headCell}>{SITE_CONFIG.name} custom</th>
                  </tr>
                </thead>
                <tbody>
                  {TIER_ROWS.map((row) => (
                    <tr key={row.factor} className="border-b border-border/60 last:border-b-0">
                      <th scope="row" className={rowHead}>{row.factor}</th>
                      <td className={bodyCell}>{row.stock}</td>
                      <td className={bodyCell}>{row.semi}</td>
                      <td className={`${bodyCell} text-foreground`}>{row.ours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
              Custom describes fit and options, not quality on its own. Judge any cabinet by its box,
              drawer boxes, and hinges; our{" "}
              <Link href="/construction" className="text-foreground underline underline-offset-2 hover:text-accent">
                construction specifications
              </Link>{" "}
              list ours, and the{" "}
              <Link href="/blog/stock-vs-custom-cabinets-boise" className="text-foreground underline underline-offset-2 hover:text-accent">
                stock vs custom cabinets guide
              </Link>{" "}
              explains each tier in depth.
            </p>
          </div>
        </Section>

        <Section divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Door styles"
              title={<>{DOOR_STYLES.length} door styles compared</>}
              description="Every door style is available on every cabinet we build. The finish families each profile accepts, and the drawer front it pairs with, are listed below."
              align="left"
              className="mb-8"
            />
            <div className={tableShell}>
              <table className={tableBase}>
                <caption className="sr-only">Door styles compared by look, finish families, and drawer fronts</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={`${headCell} sticky left-0 z-10 bg-card w-[22%]`}>Door style</th>
                    <th scope="col" className={headCell}>Look</th>
                    <th scope="col" className={headCell}>Finish families</th>
                    <th scope="col" className={headCell}>Drawer fronts</th>
                  </tr>
                </thead>
                <tbody>
                  {DOOR_STYLES.map((style) => (
                    <tr key={style.id} className="border-b border-border/60 last:border-b-0">
                      <th scope="row" className={rowHead}>{style.name}</th>
                      <td className={bodyCell}>{style.description}</td>
                      <td className={bodyCell}>{familyList(style.compatibleFinishCategories)}</td>
                      <td className={bodyCell}>{drawerFront(style.constructionNotes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
              Four of the six are shaker profiles; see{" "}
              <Link href="/shaker-cabinets" className="text-foreground underline underline-offset-2 hover:text-accent">
                shaker cabinets
              </Link>{" "}
              for how they differ, or browse every door in the{" "}
              <Link href="/catalog" className="text-foreground underline underline-offset-2 hover:text-accent">
                cabinet catalog
              </Link>
              .
            </p>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Finishes"
              title={<>{FINISHES.length} finishes in three families</>}
              description="Finish counts come from the current catalog. Physical samples are confirmed in your light at the design visit."
              align="left"
              className="mb-8"
            />
            <div className={tableShell}>
              <table className={tableBase}>
                <caption className="sr-only">Finish families compared by count and door styles</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={`${headCell} sticky left-0 z-10 bg-card w-[22%]`}>Finish family</th>
                    <th scope="col" className={headCell}>Finishes</th>
                    <th scope="col" className={headCell}>Door styles</th>
                  </tr>
                </thead>
                <tbody>
                  {FINISH_FAMILIES.map((family) => (
                    <tr key={family.id} className="border-b border-border/60 last:border-b-0">
                      <th scope="row" className={rowHead}>{family.label}</th>
                      <td className={bodyCell}>{finishCount(family.id)}</td>
                      <td className={bodyCell}>{doorStylesFor(family.id).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <CatalogClosingCTA />
      </div>
    </></InteriorPage>
  );
}
