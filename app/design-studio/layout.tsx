import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DESIGN_STUDIO_ENABLED } from "@/shared/featureFlags";

export const metadata: Metadata = {
  title: "Design Studio",
  description: "Configure your custom cabinet design with Boise Cabinet Co.",
  alternates: { canonical: "/design-studio" },
  robots: { index: false, follow: false },
};

export default function DesignStudioLayout({ children }: { children: React.ReactNode }) {
  // Hidden while the studio is rebuilt. Enable locally via
  // NEXT_PUBLIC_DESIGN_STUDIO_ENABLED=true to keep working on it.
  if (!DESIGN_STUDIO_ENABLED) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col pb-[env(safe-area-inset-bottom)]">
      {children}
    </div>
  );
}
