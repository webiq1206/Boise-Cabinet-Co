import Link from "next/link";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { COLLECTIONS, DOOR_STYLES, FINISHES } from "@/shared/catalog";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dealer Catalog | Boise Cabinet Co",
  description: "One Source Cabinets catalog for authorized dealers.",
};

export default function DealerPortalPage() {
  return (
    <div className="flex flex-col pb-20">
      <Section spacing="sm" className="pt-8">
        <div className="container px-4 max-w-3xl">
          <PageHeader
            align="left"
            eyebrow="Dealer portal"
            title="Product catalog"
            description={`${COLLECTIONS.length} collections · ${DOOR_STYLES.length} door styles · ${FINISHES.length} finishes · OSC SKU catalog`}
          />
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="brand" asChild>
              <Link href="/products">Browse products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/partner">Partner dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">Search catalog</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
