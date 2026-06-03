import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowRight, Phone, Wrench } from "lucide-react";
import { DisplayNum } from "@/components/marketing";
import { SITE_CONFIG } from "@/shared/siteConfig";

export const metadata: Metadata = {
  title: "Page Not Found (404)",
  description: "The page you're looking for could not be found. Browse our cabinet catalog, Design Studio, or contact Boise Cabinet Co.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-background flex items-center justify-center p-4 section-y">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 mb-4">
            <Wrench className="h-12 w-12 text-accent" />
          </div>
          <h1 className="text-6xl mb-2">
            <DisplayNum className="text-foreground">404</DisplayNum>
          </h1>
        </div>

        <h2 className="text-2xl md:text-3xl font-sans font-light tracking-tight mb-4 text-foreground">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          This page doesn&apos;t exist or may have moved. Let us help you find what you&apos;re looking for.
        </p>

        <Card className="marketing-card mb-8 text-left">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4 text-foreground">Popular Pages</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/cabinets", label: "Cabinet Catalog" },
                { href: "/design-studio", label: "Design Studio" },
                { href: "/collections", label: "Collections" },
                { href: "/contact", label: "Free Consultation" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 p-3 rounded-sm hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowRight className="h-4 w-4 text-accent" />
                  {item.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="brand" size="lg" asChild>
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button variant="brandOutline" size="lg" asChild>
            <a href={SITE_CONFIG.phoneHref}>
              <Phone className="h-5 w-5 mr-2" />
              Call {SITE_CONFIG.phone}
            </a>
          </Button>
        </div>

      </div>
    </div>
  );
}
