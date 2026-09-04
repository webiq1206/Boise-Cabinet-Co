import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { CTA_DESIGN_STUDIO } from "@/shared/ctaCopy";
import { DESIGN_STUDIO_ENABLED } from "@/shared/featureFlags";
import { Palette, LayoutGrid, Box, Share2 } from "lucide-react";

const FEATURES = [
  { icon: LayoutGrid, title: "Start with your room", body: "Use a photo or pick a rough size, then see layouts that fit and edit them on your floor plan." },
  { icon: Palette, title: "Instant finish preview", body: "Swap door styles, colors, and hardware in real time." },
  { icon: Box, title: "3D & AR preview", body: "View true-scale cabinets in 3D and place them in your room on your phone." },
  { icon: Share2, title: "Save & share", body: "Save your design and request pricing with one click." },
];

export function DesignStudioSection() {
  if (!DESIGN_STUDIO_ENABLED) return null;

  return (
    <Section surface="deep" spacing="xl" edge>
      <div className="ed-shell">
        <div className="ed-split ed-split-center">
          <Reveal>
            <p className="ed-eyebrow">Design Studio</p>
            <h2 className="ed-h2 ed-statement">
              Design your cabinets{" "}
              <em className="not-italic" style={{ color: "var(--ed-accent)" }}>online</em>
            </h2>
            <p className="ed-lede mt-8 mb-10 max-w-[44ch]">
              Add a room photo or size, pick a layout, preview and edit in your space, then save and request pricing. We confirm exact dimensions at your consultation.
            </p>
            <Button variant="brand" className="bg-inverse-foreground text-inverse hover:bg-inverse-foreground/90" asChild>
              <Link href="/design-studio">{CTA_DESIGN_STUDIO}</Link>
            </Button>
          </Reveal>

          <Reveal delay={80}>
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-inverse-foreground/15">
              <Image
                src={MARKETING_IMAGES.designStudio}
                alt="Boise Cabinet Co Design Studio showing 3D custom cabinet preview and finish selection"
                title="Design Studio | Boise Cabinet Co"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover img-brand-grade"
              />
            </div>
          </Reveal>
        </div>

        <div className="ed-matrix mt-[clamp(40px,5vw,72px)]" style={{ ["--ed-cols" as string]: 4, ["--ed-cell-h" as string]: "190px" }}>
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60}>
              <div className="flex h-full flex-col">
                <feature.icon className="h-5 w-5" style={{ color: "var(--ed-accent)" }} aria-hidden="true" />
                <h3 className="ed-h4 mt-auto pt-8">{feature.title}</h3>
                <p className="ed-body mt-2 text-[0.875rem]">{feature.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
