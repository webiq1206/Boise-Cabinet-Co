import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CabinetCollection } from "@/shared/catalog";
import {
  COLLECTIONS,
  DOOR_STYLES,
  FINISHES,
  ACCESSORIES,
  getMostLovedFinishes,
} from "@/shared/catalog";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { RelatedPostCards } from "@/components/marketing/RelatedPostCards";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { FinishSwatchGrid } from "@/components/catalog/FinishSwatchGrid";
import { Chip } from "@/components/marketing/Chip";
import { TextLink } from "@/components/marketing/TextLink";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/Reveal";
import { getCollectionFaqs } from "@/components/catalog/collectionFaqs";
import { SITE_CONFIG } from "@/shared/siteConfig";

const PRICE_TIER_LABELS: Record<CabinetCollection["priceTier"], string> = {
  entry: "Entry",
  mid: "Mid",
  premium: "Premium",
  luxury: "Luxury",
};

export interface CollectionLandingTemplateProps {
  collection: CabinetCollection;
}

export function CollectionLandingTemplate({ collection }: CollectionLandingTemplateProps) {
  const doorStyles = DOOR_STYLES.filter((d) =>
    d.availableInCollections.includes(collection.id),
  );
  const doorStyleIds = new Set(doorStyles.map((d) => d.id));
  const finishes = FINISHES.filter((f) =>
    f.compatibleDoorStyleIds.some((id) => doorStyleIds.has(id)),
  );
  // Curated sample (never the full library) for the collection finish section.
  const finishIds = new Set(finishes.map((f) => f.id));
  const lovedSample = getMostLovedFinishes(8).filter((f) => finishIds.has(f.id));
  const finishSample = lovedSample.length >= 6 ? lovedSample : finishes.slice(0, 8);
  const accessories = ACCESSORIES.filter((a) =>
    a.compatibleCollectionIds.includes(collection.id),
  );
  const related = COLLECTIONS.filter((c) => c.id !== collection.id);
  const faqs = getCollectionFaqs(collection);

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-0">
        <div className="relative aspect-[21/9] md:aspect-[3/1] max-h-[420px] w-full overflow-hidden bg-muted">
          <Image
            src={collection.heroImage}
            alt={`${collection.name} cabinet collection`}
            fill
            priority
            sizes="100vw"
            className="object-cover img-brand-grade"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container px-4 pb-8 md:pb-12">
            <p className="brc-label mb-3 text-foreground/80">Cabinet collection</p>
            <h1 className="font-sans font-light text-display md:text-[2.75rem] tracking-tight text-foreground max-w-3xl">
              {collection.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{collection.tagline}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Chip>{PRICE_TIER_LABELS[collection.priceTier]}</Chip>
              <Chip>{collection.leadTime}</Chip>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container px-4 max-w-3xl">
          <SectionHeader
            eyebrow="Overview"
            title={<>Built for Treasure Valley homes</>}
            description={collection.description}
            align="left"
            className="mb-0"
          />
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {collection.features.map((feature) => (
              <li
                key={feature}
                className="flex gap-2 text-sm text-muted-foreground leading-relaxed"
              >
                <span className="text-accent shrink-0" aria-hidden>&bull;</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section variant="greige" divider>
        <div className="container px-4">
          <SectionHeader
            eyebrow="Door styles"
            title={<>Profiles available in {collection.name}</>}
            description="Each door style pairs with compatible finish categories. Explore full profiles in our door style library."
            align="center"
            className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {doorStyles.map((style, i) => (
              <Reveal key={style.id} delay={i * 40}>
                <MarketingCard className="h-full flex flex-col">
                  <h3 className="text-lg font-sans font-light tracking-tight mb-2">
                    {style.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex-1 leading-relaxed line-clamp-4">
                    {style.description}
                  </p>
                  <TextLink href="/catalog" className="mt-4" showArrow>
                    View {style.name}
                  </TextLink>
                </MarketingCard>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section divider>
        <div className="container px-4">
          <SectionHeader
            eyebrow="Finishes"
            title={<>Finish palette for this line</>}
            description={`Sample of finishes compatible with ${collection.name} door profiles. View the full library or filter by matte, gloss, and woodgrain.`}
            align="center"
            className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
          />
          <FinishSwatchGrid finishes={finishSample} showCategoryLinks />
          <div className="text-center mt-8">
            <Button variant="brandOutline" asChild>
              <Link href="/catalog">Browse all finishes</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section variant="surface" divider>
        <div className="container px-4 max-w-3xl">
          <SectionHeader
            eyebrow="Construction"
            title={<>How {collection.name} is built</>}
            description={`${SITE_CONFIG.name} cabinets are engineered in our Meridian shop with plywood box construction, precision door machining, and hardware matched to your project.`}
            align="left"
            className="mb-8"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <MarketingCard>
              <h3 className="text-base font-medium mb-2">Box &amp; drawers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plywood box construction with dovetail drawer boxes sized to your layout and soft-close hardware throughout.
              </p>
            </MarketingCard>
            <MarketingCard>
              <h3 className="text-base font-medium mb-2">Hardware &amp; quality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Soft-close hinges included on every door. Drawer slides and pulls are selected during design,
                and our cabinets include premium soft-close slides rated for heavy daily use.
              </p>
            </MarketingCard>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            <Link href="/construction" className="underline-offset-2 hover:underline">
              Read our construction standards
            </Link>
            {" · "}
            <Link href="/compare" className="underline-offset-2 hover:underline">
              Compare all collections
            </Link>
          </p>
        </div>
      </Section>

      {accessories.length > 0 && (
        <Section divider>
          <div className="container px-4">
            <SectionHeader
              eyebrow="Accessories"
              title={<>Organize every inch</>}
              description={`Popular interior upgrades compatible with ${collection.name}.`}
              align="center"
              className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {accessories.map((item) => (
                <MarketingCard key={item.id} className="p-5">
                  <Chip className="mb-2 capitalize">{item.category}</Chip>
                  <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
                </MarketingCard>
              ))}
            </div>
            <p className="text-center mt-8">
              <TextLink href="/accessories" showArrow>
                View full accessory catalog
              </TextLink>
            </p>
          </div>
        </Section>
      )}

      <Section variant="greige" divider>
        <div className="container px-4 max-w-2xl mx-auto">
          <SectionHeader
            eyebrow="FAQ"
            title={<>Common questions</>}
            align="center"
            className="mb-8 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
          />
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.question} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      <Section divider>
        <div className="container px-4">
          <SectionHeader
            eyebrow="Explore more"
            title={<>Other collections</>}
            align="center"
            className="mb-10 max-w-xl mx-auto text-center [&_.brc-label]:justify-center"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {related.map((c) => (
              <MarketingCard key={c.id} className="flex flex-col h-full">
                <h3 className="text-lg font-sans font-light mb-1">{c.name}</h3>
                <p className="text-sm text-muted-foreground flex-1">{c.tagline}</p>
                <TextLink
                  href="/catalog"
                  className="mt-4"
                  showArrow
                >
                  Explore {c.name}
                </TextLink>
              </MarketingCard>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container px-4">
          <RelatedPostCards
            path={`/collections/${collection.slug}`}
            title="Related cabinet guides and pages"
          />
        </div>
      </Section>

      <Section variant="inverse">
        <div className="container px-4 text-center max-w-xl mx-auto">
          <h2 className="font-sans font-light text-section-title text-inverse-foreground mb-3">
            Ready to price your cabinets?
          </h2>
          <p className="text-inverse-muted mb-6 leading-relaxed">
            Tell us about your {collection.name} project, layout, finishes, and room
            configurations, and the {SITE_CONFIG.name} team will put together your estimate.
          </p>
          <Button variant="brand" asChild>
            <Link href="/estimate">
              Get an estimate <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}
