import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";
import { COLLECTIONS } from "@/shared/catalog/collections";
import { CTA_SECONDARY } from "@/shared/ctaCopy";

export function CollectionsBandSection() {
  return (
    <Section variant="greige" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Our collections"
          title={
            <>
              Four paths to your perfect{" "}
              <em className="brc-accent text-accent">cabinets</em>
            </>
          }
          description="From fully bespoke to fast-track reserve finishes, every collection shares the same frameless construction and lifetime warranty."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {COLLECTIONS.map((collection, i) => (
            <Reveal key={collection.slug} delay={i * 50}>
              <Link
                href={`/collections/${collection.slug}`}
                className="block h-full rounded-sm border border-border bg-card overflow-hidden hover-elevate transition-shadow"
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
            <Link href="/compare">{CTA_SECONDARY}</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
