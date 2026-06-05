import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { FinishExplorer } from "@/components/catalog/FinishExplorer";
import { catalogMetadata } from "@/lib/catalog-metadata";
import {
  FINISHES_BY_CATEGORY,
  getFinishBySlug,
  getDoorStylesForFinish,
  getCollectionsForFinish,
  type FinishCategory,
} from "@/shared/catalog";
import {
  isFinishIndexable,
  finishMetaTitle,
} from "@/lib/catalog/indexation";
import {
  buildFinishIntro,
  buildFinishSections,
  buildFinishFaqs,
} from "@/lib/catalog/finishContent";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateProductSchema,
} from "@/lib/schema";

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
  const fam = finish.colorFamily ? `${finish.colorFamily.toLowerCase()} ` : "";
  return catalogMetadata(
    `/finishes/${params.category}/${params.slug}`,
    finishMetaTitle(finish),
    `${finish.name} is a ${fam}${finish.category} cabinet finish from Boise Cabinet Co, built to order for Treasure Valley kitchens, baths, and built-ins. See pairings, care, and door styles.`,
    { noindex: !isFinishIndexable(finish) },
  );
}

export default function FinishDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const finish = getFinishBySlug(params.slug);
  if (!finish || finish.category !== params.category) notFound();

  const path = `/finishes/${finish.category}/${finish.slug}`;
  const doorStyles = getDoorStylesForFinish(finish.slug).map((d) => d.name);
  const collections = getCollectionsForFinish(finish.slug).map((c) => c.name);
  const pairings = { doorStyles, collections };

  const intro = buildFinishIntro(finish);
  const sections = buildFinishSections(finish, pairings);
  const faqs = buildFinishFaqs(finish, pairings);

  const schemas: object[] = [
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Finishes", url: "/finishes" },
      { name: finish.category, url: `/finishes/${finish.category}` },
      { name: finish.name, url: path },
    ]),
    generateProductSchema({
      name: `${finish.name} Cabinet Finish`,
      description: intro,
      url: path,
      sku: finish.slug,
      image: finish.imagePath,
    }),
    generateFAQSchema(faqs),
  ];

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <JsonLd data={schemas} />
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

          <div className="mt-10 max-w-2xl space-y-8">
            <p className="text-muted-foreground leading-relaxed">{intro}</p>

            {sections.map((block) => (
              <div key={block.heading}>
                <h2 className="text-xl font-light tracking-tight mb-2">{block.heading}</h2>
                <p className="text-muted-foreground leading-relaxed">{block.body}</p>
              </div>
            ))}

            <div>
              <h2 className="text-xl font-light tracking-tight mb-4">
                {finish.name} finish FAQs
              </h2>
              <dl className="space-y-5">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <dt className="font-medium">{faq.question}</dt>
                    <dd className="text-muted-foreground mt-1 leading-relaxed">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
