import Link from "next/link";
import { CITIES, SERVICES } from "@/shared/contentData";
import { SITE_TAGLINE } from "@/shared/siteContent";

const PHONE = "(208) 555-0100";
const PHONE_HREF = "tel:2085550100";
const EMAIL = "hello@boiseremodeling.co";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-inverse text-inverse-foreground">
      <div className="container px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="mb-4">
              <span className="font-serif font-light text-lg tracking-tight text-inverse-foreground">
                Boise <em className="italic text-accent">Remodeling</em> Co
              </span>
            </div>
            <p className="text-sm italic mb-6 text-inverse-muted font-serif">
              {SITE_TAGLINE}.
            </p>
            <div className="space-y-2">
              <a
                href={PHONE_HREF}
                className="block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                {EMAIL}
              </a>
              <p className="text-sm text-inverse-muted">
                Boise, Idaho · Treasure Valley
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Services
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <a
                    href="/#services"
                    className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Studio
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Why Choose Us", href: "/#why-choose-us" },
                { label: "Our Commitment", href: "/#commitment" },
                { label: "How We Build", href: "/#how-we-build" },
                { label: "Principles", href: "/#principles" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5 text-inverse-muted">
              Start a Conversation
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Schedule your consultation", href: "/#consult" },
                { label: "Plan your project range", href: "/#calculator" },
                { label: PHONE, href: PHONE_HREF },
                { label: EMAIL, href: `mailto:${EMAIL}` },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-inverse-muted hover:text-inverse-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-inverse-foreground/10">
              <a
                href="/api/login"
                className="text-xs text-inverse-muted hover:text-inverse-foreground transition-colors"
              >
                Subcontractor Login
              </a>
            </div>
          </div>
        </div>

        <div className="py-5 border-t border-b border-inverse-foreground/10 mb-5">
          <p className="text-[11px] tracking-[0.08em] text-inverse-muted">
            Serving {CITIES.map((c) => c.name).join(" · ")} · Ada and Canyon County, Idaho
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-inverse-muted">
          <div className="flex flex-wrap gap-4">
            <span>&copy; {currentYear} Boise Remodeling Co. All rights reserved.</span>
            <span>Idaho Contractor License [Pending]</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="transition-colors hover:text-inverse-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-inverse-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
