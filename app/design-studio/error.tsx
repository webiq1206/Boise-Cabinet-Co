"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function DesignStudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Design Studio error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <CardTitle>The Design Studio hit a snag</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Something unexpected happened while loading your design. This is
            usually temporary — try again and you should be right back to
            building your cabinets.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => reset()} data-testid="button-retry-design-studio">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild data-testid="button-back-home">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to site
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Still stuck? Call us at{" "}
            <a href={SITE_CONFIG.phoneHref} className="underline">
              {SITE_CONFIG.phone}
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
