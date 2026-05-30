import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/shared/blogContent";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSpeakableSchema,
} from "@/lib/schema";
import { buildCanonical } from "@/lib/page-metadata";
import { BlogPostLayout } from "@/components/marketing/BlogPostLayout";
import {
  getAbsoluteImageUrl,
  getBlogHeroImage,
  getBlogImageAlt,
} from "@/shared/blogImages";
import { getBaseUrl } from "@/lib/seo";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.seoTitle || post.title;
  const description =
    post.metaDescription ||
    (post.excerpt.length > 160 ? post.excerpt.substring(0, 157) + "..." : post.excerpt);
  const heroPath = getBlogHeroImage(post.slug, post.heroImage);
  const imageUrl = getAbsoluteImageUrl(heroPath, getBaseUrl());
  const imageAlt = getBlogImageAlt(post.slug);

  return {
    title,
    description,
    alternates: {
      canonical: buildCanonical(`/blog/${post.slug}`),
    },
    openGraph: {
      title: `${title} | Boise Remodeling Co Blog`,
      description,
      url: buildCanonical(`/blog/${post.slug}`),
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Boise Remodeling Co Blog`,
      description,
      images: [imageUrl],
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    publishedAt: post.publishedAt,
    author: post.author,
    slug: post.slug,
    image: getAbsoluteImageUrl(getBlogHeroImage(post.slug, post.heroImage), getBaseUrl()),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const faqSchema = post.faqs.length > 0 ? generateFAQSchema(post.faqs) : null;
  const speakableSchema = post.quickAnswer
    ? generateSpeakableSchema({ name: post.title, path: `/blog/${post.slug}` })
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {speakableSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
        />
      )}
      <BlogPostLayout post={post} formatDate={formatDate} />
    </>
  );
}
