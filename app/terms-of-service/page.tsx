import { InteriorDocument,InteriorPage } from '@/components/approved/InteriorLayout';
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema,generateWebPageSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { FINAL_COMPLETION_EXPLAINED, REGISTERED_ENTITY_NAME } from "@/shared/claims";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = withBrandPageMetadata(({
  title: { absolute: "Terms of Service | Boise Cabinet Co" },
  description: "Terms of service for Boise Cabinet Co: your signed agreement controls, written scope and changes, supply-only and installed payment terms, and warranty.",
  alternates: {
    canonical: buildCanonical("/terms-of-service"),
  },
  openGraph: {
    title: "Terms of Service | Boise Cabinet Co",
    description: "Your rights when using Boise Cabinet Co custom cabinet services in Idaho's Treasure Valley.",
    url: buildCanonical("/terms-of-service"),
    type: "website",
    siteName: "Boise Cabinet Co",
    locale: "en_US",
    images: [{ url: "/images/marketing/og-default.png", width: 1200, height: 630, alt: "Boise Cabinet Co custom cabinets" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Boise Cabinet Co",
    description: "Your rights when using Boise Cabinet Co custom cabinet services in Idaho's Treasure Valley.",
    images: ["/images/marketing/og-default.png"],
  },
}), "/terms-of-service");

export default function TermsOfServicePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Terms of Service", url: "/terms-of-service" },
  ]);
  const webPageSchema = generateWebPageSchema({
    title: "Terms of Service",
    description: "Terms of service for Boise Cabinet Co. Your rights and responsibilities when using our services.",
    url: "/terms-of-service",
  });

  return (
    <InteriorPage kind="legal"><div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto mb-6">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Terms of Service" }]} />
          </div>
          <InteriorDocument heading={<h1>Terms of service for Boise Cabinet Co</h1>} contents={[{"id":"document-section-1","label":"Agreement to terms"},{"id":"document-section-2","label":"Services"},{"id":"document-section-3","label":"Scope, pricing and changes"},{"id":"document-section-4","label":"Free consultation and paid work"},{"id":"document-section-5","label":"Payment terms"},{"id":"document-section-6","label":"Cancellation and special orders"},{"id":"document-section-7","label":"Fabrication and installation scheduling"},{"id":"document-section-8","label":"Property access"},{"id":"document-section-9","label":"Installation partners and subcontractors"},{"id":"document-section-10","label":"Limitation of liability"},{"id":"document-section-11","label":"Workmanship warranty"},{"id":"document-section-12","label":"Changes to terms"},{"id":"document-section-13","label":"Contact information"}]}>

            <p className="lead text-muted-foreground">
              Last updated November 8, 2026
            </p>

            <h2 id="document-section-1">Agreement to terms</h2>
            <p>
              Boise Cabinet Co is a brand of {REGISTERED_ENTITY_NAME} (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These terms are a general summary of how we work. By using our website or services, you agree to them.
            </p>
            <p>
              Your signed agreement controls. If anything here differs from a signed agreement, the signed agreement governs, and these terms do not change any agreement you have already signed.
            </p>

            <h2 id="document-section-2">Services</h2>
            <p>
              Boise Cabinet Co provides custom cabinet design, cabinet supply, and cabinet installation for residential and commercial customers in the Treasure Valley area of Idaho. Some orders are supply-only, where we provide the cabinets and you or another installer installs them. Others are installed projects, where we supply and install. Each type has its own written agreement.
            </p>

            <h2 id="document-section-3">Scope, pricing and changes</h2>
            <ul>
              <li>Online planning ranges and consultation ranges are for planning, based on the information available at the time, and are not a binding quote</li>
              <li>Scope and price are set in writing before work begins or anything is ordered</li>
              <li>Changes to scope, price or schedule are agreed in writing before the affected work or orders proceed</li>
            </ul>

            <h2 id="document-section-4">Free consultation and paid work</h2>
            <p>
              The first conversation and project review are free. Any paid planning or design work happens only after you approve its scope and price in writing.
            </p>

            <h2 id="document-section-5">Payment terms</h2>
            <ul>
              <li>Payment follows the schedule in your signed agreement</li>
              <li>Supply-only orders are paid as stated in the supply agreement when the order is approved</li>
              <li>Installed projects follow the payment schedule in the installed agreement</li>
              <li>We accept major credit cards, checks, and electronic payments</li>
              <li>Late payments may incur additional fees as described in your signed agreement</li>
            </ul>

            <h2 id="document-section-6">Cancellation and special orders</h2>
            <p>
              Custom and special-order items are built for your project and may not be cancellable once ordered. We tell you which items this applies to before you approve them.
            </p>

            <h2 id="document-section-7">Fabrication and installation scheduling</h2>
            <ul>
              <li>Custom cabinets are built to order, so lead times are estimated and may shift based on material availability and order volume</li>
              <li>We will make reasonable efforts to keep you informed of your fabrication and installation timeline</li>
              <li>Installation dates are scheduled in advance; please let us know promptly if you need to reschedule</li>
            </ul>

            <h2 id="document-section-8">Property access</h2>
            <p>
              By engaging our services, you grant us permission to access your home as necessary to take field measurements and complete installation. Please ensure the work area is clear and accessible on scheduled measurement and installation days.
            </p>

            <h2 id="document-section-9">Installation partners and subcontractors</h2>
            <p>
              Installation is performed by our team or a qualified installation partner we manage, and some work, such as licensed plumbing or electrical work, may be performed by subcontractors. Your agreement identifies who is responsible for each part of the work.
            </p>

            <h2 id="document-section-10">Limitation of liability</h2>
            <p>
              While we take great care in providing our services, Boise Cabinet Co&apos;s liability for any claims arising from our services is limited to the amount paid for the specific service in question. We are not liable for pre-existing conditions, normal wear, or conditions outside our control.
            </p>

            <h2 id="document-section-11">Workmanship warranty</h2>
            <ul>
              <li>Work performed by our own team carries one-year workmanship coverage from documented Final Completion. {FINAL_COMPLETION_EXPLAINED}.</li>
              <li>Work performed by a subcontractor or installation partner is covered by that company&apos;s own warranty. At the end of every project we provide a complete list of the subcontractors who worked on it, with their contact information.</li>
              <li>Manufacturer and product warranties are separate and follow the manufacturer&apos;s terms. Supply-only orders do not cover another installer&apos;s workmanship.</li>
              <li>Your signed agreement sets the notice method for a formal warranty claim. See the <Link href="/warranty" className="text-primary hover:underline">warranty page</Link> for how to get help with a completed project.</li>
            </ul>

            <h2 id="document-section-12">Changes to terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website.
            </p>

            <h2 id="document-section-13">Contact information</h2>
            <p>
              For questions about these Terms of Service, please contact us:
            </p>
            <ul>
              <li>Email: <ObfuscatedEmail user={SITE_CONFIG.email.split("@")[0]} domain={SITE_CONFIG.email.split("@")[1]} className="text-primary hover:underline inline-flex items-center gap-1" showIcon={false} label={SITE_CONFIG.email} /></li>
              <li>Phone: <a href={SITE_CONFIG.phoneHref} className="text-primary hover:underline">{SITE_CONFIG.phone}</a></li>
              <li>{SITE_CONFIG.name}, {SITE_CONFIG.address.city}, {SITE_CONFIG.address.state}</li>
            </ul>
          </InteriorDocument>
        </div>
      </section>
    </div></InteriorPage>
  );
}
