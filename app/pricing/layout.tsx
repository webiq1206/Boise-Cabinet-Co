import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Lawn Care Kuna",
  description: "Transparent pricing for lawn care and landscaping services in Kuna, Idaho. View our service rates and get a free custom quote.",
  openGraph: {
    title: "Lawn Care Pricing | Lawn Care Kuna",
    description: "Transparent, competitive pricing for lawn care services in the Treasure Valley.",
    url: "/pricing",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
