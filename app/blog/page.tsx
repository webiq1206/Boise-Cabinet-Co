import { Metadata } from "next";
import { BlogIndexClient } from "@/components/marketing/BlogIndexClient";
import { buildPageMetadata } from "@/lib/page-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata: Metadata = buildPageMetadata({
  kind: "blog",
  path: "/blog",
});

export default function BlogPage() {
  const webPageSchema = generateWebPageSchema({
    title: "Cabinet Design Insights",
    description:
      "Honest cabinet design advice for Idaho homeowners: finishes, layouts, timelines, and planning guidance from Boise Cabinet Co.",
    url: "/blog",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogIndexClient />
    </>
  );
}
