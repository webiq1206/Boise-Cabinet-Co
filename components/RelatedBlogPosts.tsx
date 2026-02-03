import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

// Mapping of service slugs to related blog post slugs
const serviceToBlogMapping: Record<string, string[]> = {
  // Lawn Care Services
  "lawn-mowing": ["mowing-frequency-treasure-valley-guide", "protect-grass-hot-dry-idaho-summers"],
  "aeration": ["spring-lawn-prep-checklist-treasure-valley", "fall-aeration-overseeding-extends-lawn-life", "core-aeration-vs-liquid-aeration-idaho"],
  "fertilization": ["spring-lawn-prep-checklist-treasure-valley", "fertilization-weed-control-explained-simply"],
  "weed-control": ["top-weeds-idaho-lawns-elimination", "control-crabgrass-dandelions-persistent-weeds", "fertilization-weed-control-explained-simply"],
  "overseeding": ["fall-aeration-overseeding-extends-lawn-life", "choosing-grass-seed-idaho-soil-weather"],
  "dethatching": ["when-to-dethatch-vs-aerate-idaho", "spring-lawn-prep-checklist-treasure-valley"],
  "lawn-edging": ["consistent-lawn-maintenance-long-term-protection"],
  "sod-installation": ["choosing-grass-seed-idaho-soil-weather", "lawn-brown-patches-how-to-fix"],
  "lawn-renovation": ["lawn-brown-patches-how-to-fix", "choosing-grass-seed-idaho-soil-weather"],
  
  // Seasonal Services
  "spring-cleanup": ["spring-lawn-prep-checklist-treasure-valley", "spring-cleanup-vs-fall-cleanup-comparison"],
  "fall-cleanup": ["winter-lawn-prep-southwest-idaho", "why-leaf-removal-matters", "spring-cleanup-vs-fall-cleanup-comparison"],
  "seasonal-cleanup": ["spring-cleanup-vs-fall-cleanup-comparison", "why-leaf-removal-matters"],
  "christmas-light-installation": ["seasonal-holiday-landscape-prep-timing"],
  "snow-removal": ["snow-removal-basics-homeowners-businesses", "snow-season-lawn-care-before-first-storm"],
  
  // Irrigation
  "sprinkler-system-installation": ["sprinkler-blowouts-and-repairs-idaho"],
  "sprinkler-repair": ["sprinkler-blowouts-and-repairs-idaho"],
  "irrigation-repair": ["sprinkler-blowouts-and-repairs-idaho"],
  "sprinkler-blowout": ["sprinkler-blowouts-and-repairs-idaho", "snow-season-lawn-care-before-first-storm"],
  "irrigation-maintenance": ["sprinkler-blowouts-and-repairs-idaho"],
  
  // Landscaping
  "patio-installation": ["seasonal-holiday-landscape-prep-timing"],
  "retaining-walls": [],
  "fence": [],
  "fire-pit-installation": [],
  "landscape-lighting": ["seasonal-holiday-landscape-prep-timing"],
  "mulch-installation": ["spring-lawn-prep-checklist-treasure-valley"],
  "hedge-trimming": ["keeping-shrubs-and-hedges-healthy-year-round"],
  "tree-trimming": ["keeping-shrubs-and-hedges-healthy-year-round"],
  
  // Commercial
  "commercial": ["commercial-lawn-care-treasure-valley-businesses"],
  
  // Lawn Issues
  "grub-control": ["grub-damage-idaho-lawns"],
};

// Blog post metadata for display (slug → title)
const blogPostTitles: Record<string, string> = {
  "spring-lawn-prep-checklist-treasure-valley": "The Ultimate Spring Lawn Prep Checklist for Treasure Valley Yards",
  "winter-lawn-prep-southwest-idaho": "How to Get Your Lawn Ready for Winter in Southwest Idaho",
  "top-weeds-idaho-lawns-elimination": "Top Weeds That Take Over Idaho Lawns and How to Eliminate Them",
  "protect-grass-hot-dry-idaho-summers": "How to Protect Your Grass During Hot Dry Idaho Summers",
  "fall-aeration-overseeding-extends-lawn-life": "Fall Aeration and Overseeding: Why It Extends the Life of Your Lawn",
  "snow-season-lawn-care-before-first-storm": "Snow Season Lawn Care: What Homeowners Should Do Before the First Storm",
  "recover-lawn-after-heat-wave-idaho": "How to Recover Your Lawn After a Heat Wave",
  "spring-cleanup-vs-fall-cleanup-comparison": "Spring Cleanup vs. Fall Cleanup: What Makes the Biggest Difference",
  "mowing-frequency-treasure-valley-guide": "How Often You Should Mow in the Treasure Valley and Why It Matters",
  "choosing-grass-seed-idaho-soil-weather": "Choosing the Right Grass Seed for Idaho Soil and Weather",
  "consistent-lawn-maintenance-long-term-protection": "Why Consistent Lawn Maintenance Protects Your Lawn Long Term",
  "fertilization-weed-control-explained-simply": "Fertilization and Weed Control Explained in Simple Terms",
  "core-aeration-vs-liquid-aeration-idaho": "Core Aeration vs. Liquid Aeration: What Idaho Homeowners Should Know",
  "sprinkler-blowouts-and-repairs-idaho": "Understanding Sprinkler Blowouts and Repairs in Our Climate",
  "when-to-dethatch-vs-aerate-idaho": "When You Should Dethatch and When You Should Aerate",
  "keeping-shrubs-and-hedges-healthy-year-round": "How to Keep Shrubs and Hedges Healthy Throughout the Year",
  "commercial-lawn-care-treasure-valley-businesses": "Commercial Lawn Care in the Treasure Valley: What Businesses Should Expect",
  "why-leaf-removal-matters": "Why Leaf Removal Matters More Than People Think",
  "seasonal-holiday-landscape-prep-timing": "Seasonal Holiday Landscape Prep and Why Timing Matters",
  "snow-removal-basics-homeowners-businesses": "Snow Removal Basics for Homeowners and Small Businesses",
  "lawn-brown-patches-how-to-fix": "Why Your Lawn Has Brown Patches and How to Fix Them",
  "grub-damage-idaho-lawns": "How to Spot and Treat Grub Damage in Idaho Lawns",
  "control-crabgrass-dandelions-persistent-weeds": "How to Control Crabgrass, Dandelions and Other Persistent Weeds",
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Helpful Resources</h3>
        </div>
        <ul className="space-y-3">
          {displaySlugs.map((slug) => (
            <li key={slug}>
              <Link 
                href={`/blog/${slug}`}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 group transition-colors"
              >
                <span className="line-clamp-2">{blogPostTitles[slug]}</span>
                <ArrowRight className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t">
          <Link 
            href="/blog"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All Articles
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
