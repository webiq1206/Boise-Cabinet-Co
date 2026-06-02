import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    nosnippet: true,
  },
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
