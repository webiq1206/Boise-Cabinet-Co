import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";
import { COLLECTIONS } from "@/shared/catalog/collections";
import { CTA_EXPLORE_COLLECTIONS } from "@/shared/ctaCopy";

export function CollectionsBandSection() {
  return (
    <Section variant="greige" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Our cabinets"
          title={
            <>
              Custom cabinets,{" "}
              <em className="brc-accent text-accent">built your way</em>
            </>
          }
          description="One custom line, built to order for your space, with the same frameless construction and lifetime warranty on every cabinet."
        />

        <div className="grid gap-6 max-w-sm mx-auto">
          {COLLECTIONS.map((collection, i) => (
            <Reveal key={collection.slug} delay={i * 50}>
              <Link
                href="/catalog"
                className="block h-full rounded-sm border border-border bg-card overflow-hidden brc-lift transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={collection.heroImage}
                    alt={`${collection.name} custom cabinets, ${collection.tagline}`}
                    title={`${collection.name} Cabinet Collection | Boise Cabinet Co`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover img-brand-grade"
                  />
                </div>
                <div className="p-6">
                  <div className="brc-label mb-3 text-muted-foreground">
                    {collection.priceTier}
                  </div>
                  <h3 className="font-sans font-medium text-lg mb-2">{collection.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {collection.tagline}
                  </p>
                  <span className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
                    Explore collection →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="brandOutline" asChild>
            <Link href="/compare">{CTA_EXPLORE_COLLECTIONS}</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
