"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DesignStudioProvider } from "@/components/design-studio/DesignStudioProvider";
import { DesignWizard } from "@/components/design-studio/DesignWizard";
import { CatalogHandoffFromQuery } from "@/components/design-studio/CatalogHandoffFromQuery";
import { ShareView } from "@/components/design-studio/ShareView";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ArrowLeft, Loader2 } from "lucide-react";

function DesignStudioContent() {
  const searchParams = useSearchParams();
  const shareToken = searchParams.get("share");
  const projectId = searchParams.get("projectId");

  if (shareToken) {
    return <ShareView shareToken={shareToken} />;
  }

  return (
    <DesignStudioProvider projectId={projectId}>
      <CatalogHandoffFromQuery />
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="font-semibold text-sm shrink-0">
            {SITE_CONFIG.name}
          </Link>
          <p className="text-sm text-muted-foreground hidden sm:block">Design Studio</p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container px-4 py-8 md:py-12 max-w-6xl mx-auto w-full">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Design Studio" }]} />
        <div className="mb-8">
          <div className="relative aspect-[21/9] max-h-[280px] overflow-hidden rounded-sm mb-6">
            <Image
              src={MARKETING_IMAGES.designStudio}
              alt="Boise Cabinet Co Design Studio 3D cabinet preview and finish selection"
              title="Design Studio | Boise Cabinet Co"
              fill
              sizes="100vw"
              className="object-cover img-brand-grade"
              priority
            />
          </div>
          <p className="brc-label mb-2">Design Studio</p>
          <h1 className="text-3xl md:text-4xl font-sans font-light tracking-tight">
            Build your dream <em className="brc-accent text-accent">cabinets</em>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Add a room photo or rough size, pick a layout, visualize cabinets in your
            space, then save and share with our team for pricing.
          </p>
        </div>

        <DesignWizard />
      </main>
    </DesignStudioProvider>
  );
}

function DesignStudioLoading() {
  return (
    <main className="flex-1 container px-4 py-8 md:py-12 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <div className="relative aspect-[21/9] max-h-[280px] overflow-hidden rounded-sm mb-6 bg-muted animate-pulse" />
        <p className="brc-label mb-2">Design Studio</p>
        <h1 className="text-3xl md:text-4xl font-sans font-light tracking-tight">
          Build your dream <em className="brc-accent text-accent">cabinets</em>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Loading your design workspace…
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Preparing the studio
      </div>
    </main>
  );
}

export default function DesignStudioPage() {
  return (
    <Suspense fallback={<DesignStudioLoading />}>
      <DesignStudioContent />
    </Suspense>
  );
}
