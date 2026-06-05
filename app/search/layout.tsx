import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search the Catalog",
  description: "Search Boise Cabinet Co cabinets, finishes, and door styles.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
