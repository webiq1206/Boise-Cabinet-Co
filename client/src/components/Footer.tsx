import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { generateLocalBusinessSchema } from "@/lib/schema";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Generate LocalBusiness schema for NAP (Name, Address, Phone) markup
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>
      <footer className="bg-muted border-t">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Lawn Care Kuna</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Most Trusted Lawn Care Services in Kuna, Idaho
            </p>
            <div className="space-y-2">
              <a href="tel:2083522011" className="flex items-center gap-2 text-sm hover:text-primary transition-colors" data-testid="link-phone-footer">
                <Phone className="h-4 w-4" />
                <span>(208) 352-2011</span>
              </a>
              <a href="mailto:hello@lawncarekuna.com" className="flex items-center gap-2 text-sm hover:text-primary transition-colors" data-testid="link-email-footer">
                <Mail className="h-4 w-4" />
                <span>hello@lawncarekuna.com</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Serving Kuna, Boise, Meridian, Nampa, Caldwell & Eagle</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact & Quote
                </Link>
              </li>
              <li>
                <Link href="/services/lawn-care" className="text-muted-foreground hover:text-primary transition-colors">
                  Lawn Care Services
                </Link>
              </li>
              <li>
                <Link href="/services/landscaping" className="text-muted-foreground hover:text-primary transition-colors">
                  Landscaping Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/lawn-mowing" className="text-muted-foreground hover:text-primary transition-colors">
                  Lawn Mowing
                </Link>
              </li>
              <li>
                <Link href="/services/aeration" className="text-muted-foreground hover:text-primary transition-colors">
                  Lawn Aeration
                </Link>
              </li>
              <li>
                <Link href="/services/patio-installation" className="text-muted-foreground hover:text-primary transition-colors">
                  Patio Installation
                </Link>
              </li>
              <li>
                <Link href="/services/pond-installation" className="text-muted-foreground hover:text-primary transition-colors">
                  Pond Installation
                </Link>
              </li>
              <li>
                <Link href="/services/christmas-lights" className="text-muted-foreground hover:text-primary transition-colors">
                  Christmas Lights
                </Link>
              </li>
              <li>
                <Link href="/commercial/hoa-services" className="text-muted-foreground hover:text-primary transition-colors">
                  HOA Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Service Areas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/areas/kuna" className="text-muted-foreground hover:text-primary transition-colors">
                  Kuna, Idaho
                </Link>
              </li>
              <li>
                <Link href="/areas/boise" className="text-muted-foreground hover:text-primary transition-colors">
                  Boise, Idaho
                </Link>
              </li>
              <li>
                <Link href="/areas/meridian" className="text-muted-foreground hover:text-primary transition-colors">
                  Meridian, Idaho
                </Link>
              </li>
              <li>
                <Link href="/areas/nampa" className="text-muted-foreground hover:text-primary transition-colors">
                  Nampa, Idaho
                </Link>
              </li>
              <li>
                <Link href="/areas/caldwell" className="text-muted-foreground hover:text-primary transition-colors">
                  Caldwell, Idaho
                </Link>
              </li>
              <li>
                <Link href="/areas/eagle" className="text-muted-foreground hover:text-primary transition-colors">
                  Eagle, Idaho
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-sm text-muted-foreground space-y-2">
          <p className="text-xs">
            <strong>Legal Disclaimer:</strong> Lawn Care Kuna reserves the right to subcontract services as needed to ensure quality service delivery.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {currentYear} Lawn Care Kuna. All rights reserved. Serving Idahoans since 2017.</p>
            <div className="flex gap-4 text-xs">
              <span>Fully Insured</span>
              <span>•</span>
              <span>No Hidden Fees</span>
              <span>•</span>
              <span>Free Quotes</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
