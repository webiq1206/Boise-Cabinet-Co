import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { CITIES, SERVICES } from "@/shared/contentData";

const PHONE = "(208) 555-0100";
const PHONE_HREF = "tel:2085550100";
const EMAIL = "hello@boiseremodeling.co";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t">
      <div className="container px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div>
            <div className="mb-3">
              <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
                Boise Remodeling Co
              </span>
            </div>
            <p className="text-sm italic text-muted-foreground mb-5">
              A new kind of Boise remodeler.
            </p>
            <div className="space-y-2.5">
              <a
                href={PHONE_HREF}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                {EMAIL}
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Boise, Idaho — serving the Treasure Valley</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Serving {CITIES.map(c => c.name).join(", ")}
            </div>
          </div>

          {/* Services column */}
          <div>
            <h3 className="font-sans font-semibold text-sm mb-4 text-foreground">Services</h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <a
                    href="/#services"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio column */}
          <div>
            <h3 className="font-sans font-semibold text-sm mb-4 text-foreground">Studio</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/#founder" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="/#how-we-build" className="text-muted-foreground hover:text-primary transition-colors">
                  How We Build
                </a>
              </li>
              <li>
                <a href="/#principles" className="text-muted-foreground hover:text-primary transition-colors">
                  Principles
                </a>
              </li>
              <li>
                <a href="/#founding-clients" className="text-muted-foreground hover:text-primary transition-colors">
                  Founding Clients
                </a>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Visit Us column */}
          <div>
            <h3 className="font-sans font-semibold text-sm mb-4 text-foreground">Start a Conversation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/#consult" className="text-muted-foreground hover:text-primary transition-colors">
                  Book a free in-home visit
                </a>
              </li>
              <li>
                <a href="/#calculator" className="text-muted-foreground hover:text-primary transition-colors">
                  See your estimate range
                </a>
              </li>
              <li>
                <a href={PHONE_HREF} className="text-muted-foreground hover:text-primary transition-colors">
                  {PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-5 pt-5 border-t">
              <a
                href="/api/login"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Subcontractor Login
              </a>
            </div>
          </div>

        </div>

        {/* Base bar */}
        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            <span>&copy; {currentYear} Boise Remodeling Co. All rights reserved.</span>
            <span>Idaho Contractor License [Pending]</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
