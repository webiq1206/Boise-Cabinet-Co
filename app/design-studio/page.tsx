"use client";

import Link from "next/link";
import { DesignStudioProvider } from "@/components/design-studio/DesignStudioProvider";
import { DesignWizard } from "@/components/design-studio/DesignWizard";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ArrowLeft } from "lucide-react";

export default function DesignStudioPage() {
  return (
    <DesignStudioProvider>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="font-semibold text-sm shrink-0">
            {SITE_CONFIG.name}
          </Link>
          <p className="text-sm text-muted-foreground hidden sm:block">Design Studio</p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to portal</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container px-4 py-8 md:py-12 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <p className="brc-label mb-2">Design Studio</p>
          <h1 className="text-3xl md:text-4xl font-sans font-light tracking-tight">
            Build your dream <em className="brc-accent text-accent">cabinets</em>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Walk through seven steps to explore collections, layouts, and finishes — then save
            your design to your {SITE_CONFIG.name} project.
          </p>
        </div>

        <DesignWizard />
      </main>
    </DesignStudioProvider>
  );
}
