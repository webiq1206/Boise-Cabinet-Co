import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { DoorStyleExplorer } from "@/components/catalog/DoorStyleExplorer";
import { ProductConfigurationCard } from "@/components/catalog/ProductConfigurationCard";
import { getProductsForDoorStyle, getFinishesForDoorStyle } from "@/shared/catalog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema, generateFAQSchema } from "@/lib/schema";
import { DOOR_STYLES, getDoorStyleBySlug } from "@/shared/catalog";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return DOOR_STYLES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const style = getDoorStyleBySlug(params.slug);
  if (!style) return {};
  return catalogMetadata(
    `/door-styles/${style.slug}`,
    `${style.name} Door Style`,
    catalogDescription(style.description.slice(0, 160) + "…"),
  );
}

export default function DoorStyleDetailPage({ params }: { params: { slug: string } }) {
  const style = getDoorStyleBySlug(params.slug);
  if (!style) notFound();

  const sampleProducts = getProductsForDoorStyle(style.slug, 6);
  const finishCount = getFinishesForDoorStyle(style.slug).length;

  const faqs = [
    {
      question: `What finishes work with the ${style.name} door style?`,
      answer: `The ${style.name} door pairs with ${finishCount} of our cabinet finishes across the matte, gloss, and woodgrain families. You can browse the compatible finishes on this page and request sample doors before you sign off.`,
    },
    {
      question: `Is the ${style.name} door a good choice for resale in the Treasure Valley?`,
      answer: `Match the profile to your home's era for the broadest resale appeal. Classic Shaker profiles date the slowest and suit most Boise, Meridian, and Eagle homes, while slab reads best in modern and mid-century houses.`,
    },
    {
      question: `Are ${style.name} cabinets framed or frameless?`,
      answer: `We build frameless, full-access cabinets, so you get wider drawers and doors and easier reach into the box regardless of the door style you choose.`,
    },
    {
      question: `How much does the ${style.name} door style cost?`,
      answer: `Door style has a real but moderate effect on price. Slab and simple Shaker profiles are typically the most cost-effective, while more detailed profiles add to the door line. Use our estimate tool for a tailored planning range.`,
    },
  ];

  const schemas = [
    generateWebPageSchema({
      title: `${style.name} Door Style`,
      description: style.description,
      url: `/door-styles/${style.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Door Styles", url: "/door-styles" },
      { name: style.name, url: `/door-styles/${style.slug}` },
    ]),
    generateFAQSchema(faqs),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Door Styles", href: "/door-styles" },
                { name: style.name },
              ]}
            />
            <DoorStyleExplorer style={style} />
          </div>
        </Section>

        {sampleProducts.length > 0 && (
          <Section variant="surface" divider>
            <div className="container px-4">
              <SectionHeader
                eyebrow="Configurations"
                title={<>Example products</>}
                align="center"
                className="mb-8 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {sampleProducts.map((p) => (
                  <ProductConfigurationCard key={p.id} product={p} />
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline" asChild>
                  <Link href={`/products?doorStyle=${style.slug}`}>
                    View all configurations <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Section>
        )}

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-section-title mb-6 text-foreground">
              {style.name} door style questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      </div>
    </>
  );
}
