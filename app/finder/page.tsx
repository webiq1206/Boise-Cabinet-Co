import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Find Your Cabinets | Boise Cabinet Co",
  description:
    "Not sure where to start? Pick the path that fits your project and we will point you to the right finishes, door styles, and a free design consultation.",
};

const PATHS = [
  {
    title: "Browse finishes",
    body: "See matte, gloss, and woodgrain colors grouped by color family.",
    href: "/finishes",
    cta: "View finishes",
  },
  {
    title: "Compare door styles",
    body: "Slab, shaker, and raised-panel doors shown side by side.",
    href: "/door-styles",
    cta: "View doors",
  },
  {
    title: "Design your space",
    body: "Build a layout and see a price range in the Design Studio.",
    href: "/design-studio",
    cta: "Open Design Studio",
  },
];

export default function FinderPage() {
  return (
    <div className="container px-4 py-8 md:py-12">
      <Breadcrumbs
        items={[{ name: "Home", href: "/" }, { name: "Find your cabinets" }]}
      />

      <div className="max-w-2xl mt-6">
        <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
          Guided finder
        </p>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
          Not sure where to <em className="brc-accent text-accent">start?</em>
        </h1>
        <p className="text-muted-foreground">
          A step-by-step finder is on the way. In the meantime, pick the path
          that fits where you are today, or book a free consultation and we will
          guide you through it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-8">
        {PATHS.map((path) => (
          <Card key={path.href} className="flex flex-col p-5">
            <h2 className="text-base font-medium mb-1">{path.title}</h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              {path.body}
            </p>
            <Button variant="brandOutline" size="sm" asChild className="self-start">
              <Link href={path.href}>{path.cta}</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
