import { SITE_CONFIG } from "@/shared/siteConfig";

/**
 * Funnel pages under /estimate keep the marketing footer off. The registration
 * line still has to be on screen as plain text, with no DOPL link, and it must
 * not sit inside a clipped or nowrap box.
 */
export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <p
        data-registration-funnel=""
        className="fixed inset-x-0 bottom-0 z-[96] m-0 bg-background px-4 py-2 text-center text-xs leading-snug text-foreground"
        style={{
          whiteSpace: "normal",
          overflow: "visible",
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
      >
        {`Idaho Registered Contractor #${SITE_CONFIG.trust.licenseNumber}`}
      </p>
    </>
  );
}
