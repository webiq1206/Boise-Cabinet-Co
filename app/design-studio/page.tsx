"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DesignStudioProvider } from "@/components/design-studio/DesignStudioProvider";
import { DesignWizard } from "@/components/design-studio/DesignWizard";
import { CatalogHandoffFromQuery } from "@/components/design-studio/CatalogHandoffFromQuery";
import { DesignAutosaveStatus } from "@/components/design-studio/DesignAutosaveStatus";
import { DesignResumeHandoff } from "@/components/design-studio/DesignResumeHandoff";
import { ShareView } from "@/components/design-studio/ShareView";
import { Button } from "@/components/ui/button";
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
        <div className="container flex h-14 items-center justify-between gap-2 px-4">
          <Link href="/" className="font-semibold text-sm shrink-0">
            {SITE_CONFIG.name}
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <DesignAutosaveStatus />
            <DesignResumeHandoff />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to site</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-5 md:py-6 max-w-6xl mx-auto w-full">
        {/* Slim, app-style intro so the wizard sits near the top of the screen. */}
        <div className="mb-5">
          <p className="brc-label mb-1">Design Studio</p>
          <h1 className="text-2xl md:text-3xl font-serif tracking-tight">
            Build your dream <em className="brc-accent text-accent">cabinets</em>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            Room, layout, style, finish, then send it to us for pricing. Everything
            saves automatically as you go.
          </p>
        </div>

        <DesignWizard />
      </main>
    </DesignStudioProvider>
  );
}

function DesignStudioLoading() {
  return (
    <main className="flex-1 container px-4 py-5 md:py-6 max-w-6xl mx-auto w-full">
      <div className="mb-5">
        <p className="brc-label mb-1">Design Studio</p>
        <h1 className="text-2xl md:text-3xl font-serif tracking-tight">
          Build your dream <em className="brc-accent text-accent">cabinets</em>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-xl">
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
