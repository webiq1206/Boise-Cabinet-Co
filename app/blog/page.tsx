import { Metadata } from "next";
import { BlogIndexClient } from "@/components/marketing/BlogIndexClient";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  kind: "blog",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndexClient />;
}
