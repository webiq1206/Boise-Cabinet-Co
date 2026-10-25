import { SITE_CONFIG } from "@/shared/siteConfig";

/**
 * Funnel pages under /estimate keep the marketing footer off. The registration
 * line stays in page flow for the short form and is fixed only while the guided
 * estimator is active. It has no DOPL link and must
 * not sit inside a clipped or nowrap box.
 */
export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <p
        data-registration-funnel=""
        className="m-0 bg-background px-4 py-2 text-center text-xs leading-snug text-foreground"
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
