import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowRight, Phone, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found (404)",
  description: "The page you're looking for could not be found. Browse our remodeling services or contact Boise Remodeling Co.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <Wrench className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          This page doesn&apos;t exist or may have moved. Let us help you find what you&apos;re looking for.
        </p>

        {/* Quick Links */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Popular Pages</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/#portfolio"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Our Work
              </Link>
              <Link
                href="/#consult"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Free Consultation
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Blog &amp; Ideas
              </Link>
              <Link
                href="/#calculator"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Estimate Calculator
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="tel:2085550100">
              <Phone className="h-5 w-5 mr-2" />
              Call (208) 555-0100
            </a>
          </Button>
        </div>

        {/* Service Areas */}
        <div className="mt-12">
          <p className="text-sm text-muted-foreground mb-3">
            We serve the full Treasure Valley
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Boise", "Meridian", "Eagle", "Nampa", "Kuna", "Star", "Middleton"].map((city) => (
              <span
                key={city}
                className="text-sm text-primary"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
