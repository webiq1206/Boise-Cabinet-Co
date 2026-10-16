import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Boise Cabinet Co account or partner portal.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Welcome to Boise Cabinet Co</h1>
      {children}
    </>
  );
}
