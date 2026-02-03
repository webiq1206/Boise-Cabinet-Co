import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowRight, Phone, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <Leaf className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! It looks like this page has been trimmed from our garden. 
          Let us help you find what you're looking for.
        </p>

        {/* Quick Links */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Popular Pages</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/services"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Our Services
              </Link>
              <Link 
                href="/get-quote"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Get a Quote
              </Link>
              <Link 
                href="/blog"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Blog & Tips
              </Link>
              <Link 
                href="/contact"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowRight className="h-4 w-4 text-primary" />
                Contact Us
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
            <a href="tel:2083522011">
              <Phone className="h-5 w-5 mr-2" />
              Call Us
            </a>
          </Button>
        </div>

        {/* Service Areas */}
        <div className="mt-12">
          <p className="text-sm text-muted-foreground mb-3">
            Looking for lawn care in your area?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Kuna", "Boise", "Meridian", "Eagle", "Star", "Middleton"].map((city) => (
              <Link
                key={city}
                href={`/areas/${city.toLowerCase()}`}
                className="text-sm text-primary hover:underline"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
