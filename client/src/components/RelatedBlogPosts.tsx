import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

// Mapping of service slugs to related blog post slugs
const serviceToBlogMapping: Record<string, string[]> = {
  // Lawn Care Services
  "lawn-mowing": ["summer-lawn-care-tips", "common-lawn-problems"],
  "aeration": ["spring-lawn-prep-checklist", "fall-lawn-care-checklist"],
  "fertilization": ["spring-lawn-prep-checklist", "summer-lawn-care-tips"],
  "weed-control": ["spring-lawn-prep-checklist", "common-lawn-problems"],
  "overseeding": ["fall-lawn-care-checklist", "common-lawn-problems"],
  "dethatching": ["spring-lawn-prep-checklist", "common-lawn-problems"],
  "lawn-edging": ["summer-lawn-care-tips"],
  "sod-installation": ["common-lawn-problems"],
  "lawn-renovation": ["spring-lawn-prep-checklist", "common-lawn-problems"],
  
  // Seasonal Services
  "spring-cleanup": ["spring-lawn-prep-checklist"],
  "fall-cleanup": ["fall-lawn-care-checklist", "holiday-landscape-prep"],
  "christmas-light-installation": ["holiday-landscape-prep"],
  "snow-removal": ["small-business-winter-prep"],
  
  // Irrigation
  "sprinkler-system-installation": ["spring-lawn-prep-checklist", "summer-lawn-care-tips"],
  "sprinkler-repair": ["spring-lawn-prep-checklist", "common-lawn-problems"],
  "irrigation-repair": ["spring-lawn-prep-checklist"],
  "sprinkler-blowout": ["fall-lawn-care-checklist"],
  
  // Landscaping
  "patio-installation": ["holiday-landscape-prep"],
  "retaining-walls": [],
  "fence": [],
  "fire-pit-installation": [],
  "landscape-lighting": ["holiday-landscape-prep"],
  "mulch-installation": ["spring-lawn-prep-checklist"],
  "hedge-trimming": ["holiday-landscape-prep"],
  "tree-trimming": ["holiday-landscape-prep"],
  "seasonal-cleanup": ["spring-lawn-prep-checklist", "fall-lawn-care-checklist"],
};

// Blog post metadata for display (slug → title)
const blogPostTitles: Record<string, string> = {
  "spring-lawn-prep-checklist": "Spring Lawn Prep Checklist for Treasure Valley Yards",
  "fall-lawn-care-checklist": "Essential Fall Lawn Care Checklist for Idaho Lawns",
  "summer-lawn-care-tips": "Summer Lawn Care Tips for Hot, Dry Idaho Climate",
  "common-lawn-problems": "Common Idaho Lawn Problems and How to Fix Them",
  "holiday-landscape-prep": "Complete Holiday Landscape Preparation Timeline",
  "small-business-winter-prep": "Small Business Winter Preparedness Guide",
};

interface RelatedBlogPostsProps {
  serviceSlug: string;
  limit?: number;
}

export function RelatedBlogPosts({ serviceSlug, limit = 3 }: RelatedBlogPostsProps) {
  const relatedSlugs = serviceToBlogMapping[serviceSlug] || [];
  
  // If no related posts, don't render anything
  if (relatedSlugs.length === 0) {
    return null;
  }
  
  // Limit the number of posts shown
  const displaySlugs = relatedSlugs.slice(0, limit);
  
  return (
    <Card data-testid="related-blog-posts">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Helpful Resources</h3>
        </div>
        <ul className="space-y-3">
          {displaySlugs.map((slug) => (
            <li key={slug}>
              <Link href={`/blog/${slug}`}>
                <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1 group transition-colors">
                  <span className="line-clamp-2">{blogPostTitles[slug]}</span>
                  <ArrowRight className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t">
          <Link href="/blog">
            <span className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
              View All Articles
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
