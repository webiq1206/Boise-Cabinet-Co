import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Studio",
  description: "Configure your custom cabinet design with Boise Cabinet Co.",
  alternates: { canonical: "/design-studio" },
  robots: { index: false, follow: true },
};

export default function DesignStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background flex flex-col pb-[env(safe-area-inset-bottom)]">
      {children}
    </div>
  );
}
