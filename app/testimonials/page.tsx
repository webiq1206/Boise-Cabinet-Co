import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import { ProjectGallerySection } from "@/components/sections/ProjectGallerySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  kind: "about",
  path: "/testimonials",
  titleOverride: "Projects & Reviews",
  descriptionOverride:
    "See Treasure Valley remodeling transformations and read reviews from Boise Remodeling Co homeowners. Kitchen, bath, whole-home, and addition projects.",
});

export default function TestimonialsPage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-8 md:pt-12">
        <div className="container px-4 max-w-3xl">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Projects & Reviews" },
            ]}
          />
          <h1 className="font-sans font-light text-display md:text-[2.75rem] tracking-tight text-foreground mt-6 mb-6">
            Projects &amp; homeowner reviews
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Explore recent design-build work across the Treasure Valley and hear from homeowners
            who prioritized clarity, craftsmanship, and communication.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="brand" asChild>
              <Link href="/#consult">
                Schedule consultation <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="brandOutline" asChild>
              <Link href="/#calculator">Plan your project range</Link>
            </Button>
          </div>
        </div>
      </Section>

      <ProjectGallerySection limit={6} showViewAll={false} />
      <TestimonialsSection limit={4} showViewAll={false} />

      <Section variant="inverse">
        <div className="container px-4 text-center max-w-2xl mx-auto">
          <h2 className="font-sans font-light text-section-title mb-4 text-inverse-foreground">
            Ready to start your project?
          </h2>
          <p className="text-sm text-inverse-muted mb-8">
            Schedule a free in-home visit for planning guidance, design direction, and an honest
            project range.
          </p>
          <Button variant="brandAccent" asChild>
            <Link href="/#consult">Schedule your consultation</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}
