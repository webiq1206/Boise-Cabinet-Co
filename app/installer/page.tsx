import Link from "next/link";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { OSC_CONSTRUCTION } from "@/shared/catalog";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Installer Resources | Boise Cabinet Co",
  description: "Construction specs and catalog reference for installation partners.",
};

export default function InstallerPortalPage() {
  return (
    <div className="flex flex-col pb-20">
      <Section spacing="sm" className="pt-8">
        <div className="container px-4 max-w-3xl">
          <PageHeader
            align="left"
            eyebrow="Installer portal"
            title="Installation reference"
            description={`${OSC_CONSTRUCTION.hingeType}. ${OSC_CONSTRUCTION.drawerSlides}.`}
          />
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="brand" asChild>
              <Link href="/construction">Construction standards</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Product codes</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/partner">Partner dashboard</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
