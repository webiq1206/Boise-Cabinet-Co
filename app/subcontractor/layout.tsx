import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subcontractor Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    nosnippet: true,
  },
};

export default function SubcontractorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
