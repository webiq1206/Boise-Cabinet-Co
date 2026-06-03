import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { CTA_DESIGN_STUDIO } from "@/shared/ctaCopy";
import { Palette, LayoutGrid, Box, Share2 } from "lucide-react";

const FEATURES = [
  { icon: LayoutGrid, title: "Scan your room", body: "Measure your space with phone AR or a room photo, then only see layouts that fit." },
  { icon: Palette, title: "Instant finish preview", body: "Swap door styles, colors, and hardware in real time." },
  { icon: Box, title: "3D & AR preview", body: "View true-scale cabinets in 3D and place them in your room on your phone." },
  { icon: Share2, title: "Save & share", body: "Save your design and request pricing with one click." },
];

export function DesignStudioSection() {
  return (
    <Section variant="inverse" divider>
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <Reveal>
            <div className="brc-label mb-4 text-inverse-muted">Design Studio</div>
            <h2 className="font-sans font-light text-display tracking-tight text-inverse-foreground mb-4">
              Design your cabinets{" "}
              <em className="brc-accent text-accent">online</em>
            </h2>
            <p className="text-inverse-muted text-lg leading-relaxed mb-8">
              Scan your room first, pick a layout that fits your space, preview in 3D and AR, then save and request pricing, we confirm exact dimensions at your consultation.
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mt-10">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60}>
              <div className="rounded-sm border border-inverse-foreground/15 bg-inverse-foreground/5 p-5">
                <feature.icon className="h-5 w-5 text-accent mb-3" />
                <h3 className="font-medium text-inverse-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-sm text-inverse-muted">{feature.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
