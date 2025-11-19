import { type Quote, type InsertQuote, type GalleryPhoto, type InsertGalleryPhoto, type Testimonial, type InsertTestimonial, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createQuote(quote: InsertQuote): Promise<Quote>;
  getAllQuotes(): Promise<Quote[]>;
  getQuoteById(id: string): Promise<Quote | undefined>;
  
  createGalleryPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto>;
  getAllGalleryPhotos(): Promise<GalleryPhoto[]>;
  getGalleryPhotosByService(serviceType: string): Promise<GalleryPhoto[]>;
  
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonialsByService(serviceType: string): Promise<Testimonial[]>;
  
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
}

export class MemStorage implements IStorage {
  private quotes: Map<string, Quote>;
  private galleryPhotos: Map<string, GalleryPhoto>;
  private testimonials: Map<string, Testimonial>;
  private blogPosts: Map<string, BlogPost>;

  constructor() {
    this.quotes = new Map();
    this.galleryPhotos = new Map();
    this.testimonials = new Map();
    this.blogPosts = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed gallery photos
    const sampleGalleryPhotos: GalleryPhoto[] = [
      {
        id: randomUUID(),
        serviceType: "lawn-care",
        city: "kuna",
        beforeImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        afterImageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800",
        title: "Overgrown Lawn Transformation",
        description: "Complete lawn restoration with mowing, edging, and fertilization in Kuna",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        serviceType: "lawn-care",
        city: "boise",
        beforeImageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
        afterImageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800",
        title: "Lawn Aeration & Overseeding",
        description: "Transformed a patchy, thin lawn into thick, healthy turf through professional aeration and overseeding in Boise",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        serviceType: "lawn-care",
        city: "meridian",
        beforeImageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        afterImageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800",
        title: "Professional Lawn Edging",
        description: "Crisp, clean edges along sidewalks and driveways with professional edging service in Meridian",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        serviceType: "lawn-care",
        city: "nampa",
        beforeImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        afterImageUrl: "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=800",
        title: "Spring Cleanup & Revival",
        description: "Complete spring cleanup with debris removal and fertilization to revitalize lawn after Idaho winter in Nampa",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        serviceType: "landscaping",
        city: "boise",
        beforeImageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        afterImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        title: "Backyard Patio Installation",
        description: "Custom paver patio with retaining wall in Boise",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        serviceType: "christmas-lights",
        city: "meridian",
        beforeImageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800",
        afterImageUrl: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
        title: "Holiday Light Installation",
        description: "Professional Christmas light installation in Meridian",
        createdAt: new Date(),
      },
    ];

    sampleGalleryPhotos.forEach(photo => this.galleryPhotos.set(photo.id, photo));

    // Seed testimonials
    const sampleTestimonials: Testimonial[] = [
      {
        id: randomUUID(),
        customerName: "Sarah M.",
        serviceType: "lawn-care",
        city: "kuna",
        rating: "5",
        testimonial: "Lawn Care Kuna has been taking care of our yard for 2 years now. Always on time, professional, and our lawn has never looked better!",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Mike R.",
        serviceType: "landscaping",
        city: "boise",
        rating: "5",
        testimonial: "They installed a beautiful patio in our backyard. The crew was professional and the work quality exceeded our expectations.",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Jennifer K.",
        serviceType: "christmas-lights",
        city: "meridian",
        rating: "5",
        testimonial: "Best Christmas light installation service in the valley! They made our home look amazing for the holidays.",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "David L.",
        serviceType: "lawn-care",
        city: "nampa",
        rating: "5",
        testimonial: "Reliable, affordable, and great results. We've recommended them to all our neighbors!",
        createdAt: new Date(),
      },
    ];

    sampleTestimonials.forEach(testimonial => this.testimonials.set(testimonial.id, testimonial));

    // Seed blog posts
    const sampleBlogPosts: BlogPost[] = [
      {
        id: randomUUID(),
        slug: "idaho-spring-lawn-care-guide",
        title: "Complete Spring Lawn Care Guide for Idaho Homeowners",
        excerpt: "Learn essential spring lawn care tips for the Treasure Valley climate. From fertilization to weed control, get your lawn ready for summer.",
        content: `Spring is the perfect time to revitalize your Idaho lawn after the harsh winter months. With our unique Treasure Valley climate, timing is everything when it comes to lawn care.\n\nStart with a thorough spring cleanup. Remove any remaining leaves, branches, and debris that accumulated over winter. This allows your grass to breathe and receive adequate sunlight.\n\nFertilization should begin when soil temperatures consistently reach 55-60°F, typically in late March or early April in the Kuna area. Choose a slow-release nitrogen fertilizer for best results.\n\nCore aeration is crucial in our clay-heavy Idaho soils. This process creates small holes in your lawn, allowing water, nutrients, and oxygen to penetrate the root zone more effectively.\n\nWeed control is essential in spring. Apply pre-emergent herbicides before soil temperatures reach 55°F to prevent crabgrass and other annual weeds from germinating.\n\nDon't forget irrigation! Check your sprinkler system for winter damage and adjust sprinkler heads for optimal coverage. In spring, lawns typically need 1-1.5 inches of water per week.`,
        author: "Lawn Care Kuna Team",
        category: "Seasonal Guides",
        tags: ["Spring", "Fertilization", "Aeration", "Idaho"],
        publishedAt: new Date("2024-03-15"),
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "treasure-valley-lawn-watering-guide",
        title: "Proper Lawn Watering for Treasure Valley's Hot Summers",
        excerpt: "Master the art of lawn irrigation in Idaho's dry climate. Learn when, how much, and how often to water for a healthy, drought-resistant lawn.",
        content: `Idaho summers can be challenging for lawns, with temperatures often exceeding 95°F and minimal rainfall. Proper watering techniques are essential for maintaining a healthy, green lawn.\n\nWater deeply and infrequently. Lawns need about 1-1.5 inches of water per week, including rainfall. It's better to water 2-3 times per week deeply than to water daily with shallow applications.\n\nTiming matters. Water early in the morning between 4 AM and 9 AM. This reduces evaporation and allows grass blades to dry before evening, preventing fungal diseases.\n\nAdjust for weather conditions. During the hottest weeks of July and August in Kuna and Boise, you may need to increase watering frequency. Watch for signs of drought stress like wilting or a bluish-gray tint.\n\nUse the tuna can test. Place empty tuna cans around your lawn while watering. When they contain 1 inch of water, you've watered enough. This helps you gauge how long to run your sprinklers.\n\nConsider your soil type. Our clay-heavy soils hold water longer but drain slowly. Sandy soils drain quickly and may need more frequent watering.`,
        author: "Lawn Care Kuna Team",
        category: "Lawn Maintenance",
        tags: ["Watering", "Summer", "Irrigation", "Treasure Valley"],
        publishedAt: new Date("2024-06-20"),
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "fall-lawn-winterization-idaho",
        title: "Fall Lawn Winterization: Preparing Your Idaho Lawn for Winter",
        excerpt: "Essential fall lawn care tasks to ensure your Treasure Valley lawn survives winter and thrives next spring. Don't skip these critical steps!",
        content: `As temperatures drop in Kuna, Meridian, and surrounding areas, it's time to prepare your lawn for Idaho's cold winter months.\n\nFall fertilization is the most important feeding of the year. Apply a winterizer fertilizer in late October or early November. This helps grass roots grow strong and store nutrients for winter dormancy.\n\nContinue mowing until grass stops growing, typically in late October. For the final mow, lower your blade slightly to 2-2.5 inches to reduce the risk of snow mold.\n\nAerate in early fall while soil is still warm. This is your last chance before winter to improve soil compaction and allow nutrients to reach the root zone.\n\nOverseed thin areas in early September. The warm soil and cooler air temperatures create ideal conditions for grass seed germination in the Treasure Valley.\n\nRake leaves promptly. Heavy leaf cover can smother grass and create disease problems. Consider mulching leaves with your mower instead of bagging them.\n\nPrepare your irrigation system. Schedule a professional sprinkler blowout before the first hard freeze, usually by mid-October in Idaho.`,
        author: "Lawn Care Kuna Team",
        category: "Seasonal Guides",
        tags: ["Fall", "Winterization", "Idaho", "Lawn Preparation"],
        publishedAt: new Date("2024-09-10"),
        createdAt: new Date(),
      },
    ];

    sampleBlogPosts.forEach(post => this.blogPosts.set(post.id, post));
  }

  // Quote methods
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = {
      ...insertQuote,
      propertySize: insertQuote.propertySize ?? null,
      message: insertQuote.message ?? null,
      id,
      createdAt: new Date(),
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values());
  }

  async getQuoteById(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  // Gallery photo methods
  async createGalleryPhoto(insertPhoto: InsertGalleryPhoto): Promise<GalleryPhoto> {
    const id = randomUUID();
    const photo: GalleryPhoto = {
      ...insertPhoto,
      description: insertPhoto.description ?? null,
      id,
      createdAt: new Date(),
    };
    this.galleryPhotos.set(id, photo);
    return photo;
  }

  async getAllGalleryPhotos(): Promise<GalleryPhoto[]> {
    return Array.from(this.galleryPhotos.values());
  }

  async getGalleryPhotosByService(serviceType: string): Promise<GalleryPhoto[]> {
    return Array.from(this.galleryPhotos.values()).filter(
      photo => photo.serviceType === serviceType
    );
  }

  // Testimonial methods
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      createdAt: new Date(),
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getTestimonialsByService(serviceType: string): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(
      t => t.serviceType === serviceType
    );
  }

  // Blog post methods
  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    // Check for slug uniqueness
    const existing = Array.from(this.blogPosts.values()).find(
      post => post.slug === insertPost.slug
    );
    if (existing) {
      throw new Error(`Blog post with slug "${insertPost.slug}" already exists`);
    }

    const id = randomUUID();
    const post: BlogPost = {
      ...insertPost,
      id,
      createdAt: new Date(),
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      post => post.slug === slug
    );
  }
}

export const storage = new MemStorage();
