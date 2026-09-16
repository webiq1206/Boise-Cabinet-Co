import {withBrandPageMetadata} from '@/lib/brand-page-metadata';
import type { Metadata } from "next";

export const metadata: Metadata = withBrandPageMetadata(({
  title: "Search the Catalog",
  description: "Search Boise Cabinet Co cabinets, finishes, and door styles.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
}), "__layout__");

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
