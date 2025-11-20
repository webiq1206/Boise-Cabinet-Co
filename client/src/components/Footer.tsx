import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import logoUrl from "@assets/Lawn-Care-Kuna-Replit-11-20-2025_03_01_PM_1763676084102.png";
import { PRIORITY_SERVICES, CITIES } from "@shared/contentData";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src={logoUrl} 
              alt="Lawn Care Kuna" 
              className="h-8 w-auto mb-4"
              data-testid="logo-footer"
            />
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
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy-policy-footer">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms-of-service-footer">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              {PRIORITY_SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
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
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link href={`/areas/${city.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {city.name}, Idaho
                  </Link>
                </li>
              ))}
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
  );
}
