import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Studio",
  description: "Configure your custom cabinet design with Boise Cabinet Co.",
};

export default function DesignStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
    </div>
  );
}
