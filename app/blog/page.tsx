import { InteriorPage } from '@/components/approved/InteriorLayout';
import { BlogIndexClient } from "@/components/marketing/BlogIndexClient";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from "@/lib/page-metadata";
import {
generateBreadcrumbSchema,
generateCollectionPageSchema,
generateWebPageSchema,
} from "@/lib/schema";
import { BLOG_POSTS } from "@/shared/blogContent";
import { Metadata } from "next";

export const metadata: Metadata = withBrandPageMetadata((buildPageMetadata({
  kind: "blog",
  path: "/blog",
})), "/blog");

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

  const collectionSchema = generateCollectionPageSchema({
    title: "Cabinet Design Insights",
    description:
      "Honest cabinet design advice for Idaho homeowners: finishes, layouts, timelines, and planning guidance from Boise Cabinet Co.",
    url: "/blog",
    items: BLOG_POSTS.map((post) => ({
      name: post.title,
      url: `/blog/${post.slug}`,
    })),
  });

  return (
    <InteriorPage kind="blog"><>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogIndexClient />
    </></InteriorPage>
  );
}
