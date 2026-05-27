import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lawn Care Pricing | Mowing from $35",
  description: "Transparent lawn care prices in Kuna, Boise & Treasure Valley. Mowing from $35, fertilization from $50. No hidden fees. Get a free quote!",
  alternates: {
    canonical: "https://lawncarekuna.com/pricing",
  },
  openGraph: {
    title: "Lawn Care Pricing | Lawn Care Kuna",
    description: "Transparent lawn care and landscaping prices for Kuna, Idaho. Mowing, fertilization, aeration and more. Free quotes!",
    url: "https://lawncarekuna.com/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawn Care Pricing Kuna Idaho | Free Quote",
    description: "Transparent prices for lawn mowing, landscaping & seasonal services. No hidden fees. Get a free quote!",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
