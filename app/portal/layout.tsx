import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    nosnippet: true,
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
