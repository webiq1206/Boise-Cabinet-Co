import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { FinishExplorer } from "@/components/catalog/FinishExplorer";
import { catalogMetadata } from "@/lib/catalog-metadata";
import { FINISHES_BY_CATEGORY, getFinishBySlug, type FinishCategory } from "@/shared/catalog";

const CATEGORIES: FinishCategory[] = ["matte", "gloss", "woodgrain"];

export function generateStaticParams() {
  return CATEGORIES.flatMap((category) =>
    (FINISHES_BY_CATEGORY[category] ?? []).map((f) => ({
      category,
      slug: f.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const finish = getFinishBySlug(params.slug);
  if (!finish || finish.category !== params.category) return {};
  return catalogMetadata(
    `/finishes/${params.category}/${params.slug}`,
    `${finish.name} Finish`,
    `${finish.name} — ${finish.panelBrand} ${finish.panelSeries} ${finish.category} finish from One Source Cabinets.`,
  );
}

export default function FinishDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const finish = getFinishBySlug(params.slug);
  if (!finish || finish.category !== params.category) notFound();

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-4 md:pt-6">
        <div className="container px-4 max-w-3xl">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Finishes", href: "/finishes" },
              { name: finish.category, href: `/finishes/${finish.category}` },
              { name: finish.name },
            ]}
          />
          <FinishExplorer finish={finish} />
        </div>
      </Section>
    </div>
  );
}
