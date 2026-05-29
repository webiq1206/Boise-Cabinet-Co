import Link from "next/link";
import { CITIES, SERVICES } from "@/shared/contentData";

const PHONE = "(208) 555-0100";
const PHONE_HREF = "tel:2085550100";
const EMAIL = "hello@boiseremodeling.co";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: "#3A3E3D" }}>
      <div className="container px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div>
            <div className="mb-4">
              <span className="font-serif font-light text-lg tracking-tight" style={{ color: "#FFFFFF" }}>
                Boise <em className="italic" style={{ color: "#999F93" }}>Remodeling</em> Co
              </span>
            </div>
            <p className="text-sm italic mb-6" style={{ color: "rgba(255,255,255,0.66)", fontFamily: "var(--font-fraunces, Georgia, serif)" }}>
              A more honest way to remodel.
            </p>
            <div className="space-y-2">
              <a
                href={PHONE_HREF}
                className="block text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="block text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                {EMAIL}
              </a>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.62)" }}>
                Boise, Idaho — Treasure Valley
              </p>
            </div>
          </div>

          {/* Services column */}
          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.62)" }}>Services</h3>
            <ul className="space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <a
                    href="/#services"
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.70)" }}
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio column */}
          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.62)" }}>Studio</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Our Story", href: "/#founder" },
                { label: "How We Build", href: "/#how-we-build" },
                { label: "Principles", href: "/#principles" },
                { label: "Founding Clients", href: "/#founding-clients" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.70)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Start a Conversation column */}
          <div>
            <h3 className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.62)" }}>Start a Conversation</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Book a free in-home visit", href: "/#consult" },
                { label: "See your estimate range", href: "/#calculator" },
                { label: PHONE, href: PHONE_HREF },
                { label: EMAIL, href: `mailto:${EMAIL}` },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.70)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <a
                href="/api/login"
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.62)" }}
              >
                Subcontractor Login
              </a>
            </div>
          </div>

        </div>

        {/* Service area */}
        <div className="py-5 border-t border-b mb-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-[11px] tracking-[0.08em]" style={{ color: "rgba(255,255,255,0.62)" }}>
            Serving {CITIES.map(c => c.name).join(" · ")} — Ada &amp; Canyon County, Idaho
          </p>
        </div>

        {/* Base bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.62)" }}>
          <div className="flex flex-wrap gap-4">
            <span>&copy; {currentYear} Boise Remodeling Co. All rights reserved.</span>
            <span>Idaho Contractor License [Pending]</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="transition-colors hover:opacity-70">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition-colors hover:opacity-70">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

