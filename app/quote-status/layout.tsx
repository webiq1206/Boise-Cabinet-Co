import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Quote Status",
  description: "Check the status of your lawn care quote request from Lawn Care Kuna. Enter your quote ID to see current progress.",
  alternates: {
    canonical: "https://lawncarekuna.com/quote-status",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function QuoteStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
