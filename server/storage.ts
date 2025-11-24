import { type Quote, type InsertQuote, type GalleryPhoto, type InsertGalleryPhoto, type Testimonial, type InsertTestimonial, type BlogPost, type InsertBlogPost, type User, type UpsertUser, type Lead, type InsertLead, type LeadPurchase, type InsertLeadPurchase, type Notification, type InsertNotification } from "@shared/schema";
import { randomUUID } from "crypto";
import { BLOG_POSTS } from "@shared/blogContent";

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
  
  // User/Auth methods (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllSubcontractors(): Promise<User[]>;
  getAllAdmins(): Promise<User[]>;
  
  // Lead methods
  createLead(lead: InsertLead): Promise<Lead>;
  getAllLeads(): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  getLeadsForSubcontractor(filters?: { city?: string; serviceType?: string; maxPrice?: number }): Promise<Lead[]>;
  updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined>;
  updateLeadPrices(): Promise<void>;
  acceptLead(leadId: string, adminUserId: string): Promise<Lead | undefined>;
  declineLead(leadId: string, adminUserId: string): Promise<Lead | undefined>;
  
  // Lead Purchase methods
  createLeadPurchase(purchase: InsertLeadPurchase): Promise<LeadPurchase>;
  getLeadPurchasesByUser(userId: string): Promise<LeadPurchase[]>;
  getLeadPurchaseByLead(leadId: string): Promise<LeadPurchase | undefined>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>; // Alias for consistency
  markNotificationRead(id: string): Promise<void>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>; // Returns the notification
  markNotificationEmailSent(id: string): Promise<void>;
  
  // Lead Purchase methods (aliases for API consistency)
  getLeadPurchaseByLeadId(leadId: string): Promise<LeadPurchase | undefined>;
}

export class MemStorage implements IStorage {
  private quotes: Map<string, Quote>;
  private galleryPhotos: Map<string, GalleryPhoto>;
  private testimonials: Map<string, Testimonial>;
  private blogPosts: Map<string, BlogPost>;
  private users: Map<string, User>;
  private leads: Map<string, Lead>;
  private leadPurchases: Map<string, LeadPurchase>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.quotes = new Map();
    this.galleryPhotos = new Map();
    this.testimonials = new Map();
    this.blogPosts = new Map();
    this.users = new Map();
    this.leads = new Map();
    this.leadPurchases = new Map();
    this.notifications = new Map();
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

    // Seed blog posts from blogContent.ts
    const blogPostsFromContent: BlogPost[] = BLOG_POSTS.map(post => ({
      id: randomUUID(),
      slug: post.slug,
      title: post.title,
      seoTitle: post.seoTitle ?? null,
      metaDescription: post.metaDescription ?? null,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags,
      faqs: post.faqs ?? [],
      publishedAt: new Date(post.publishedAt),
      createdAt: new Date(),
    }));

    blogPostsFromContent.forEach(post => this.blogPosts.set(post.id, post));
    
    // Seed test users for development (hardcoded IDs match frontend)
    const testUsers: User[] = [
      {
        id: "admin-temp-id",
        email: "admin@lawncarekuna.com",
        firstName: "Admin",
        lastName: "User",
        phone: null,
        role: "admin",
        company: null,
        licenseNumber: null,
        insuranceExpiry: null,
        profileImageUrl: null,
        agreementAccepted: false,
        agreementAcceptedAt: null,
        stripeCustomerId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sub-temp-id",
        email: "contractor@example.com",
        firstName: "Test",
        lastName: "Subcontractor",
        phone: null,
        role: "subcontractor",
        company: null,
        licenseNumber: null,
        insuranceExpiry: null,
        profileImageUrl: null,
        agreementAccepted: true,
        agreementAcceptedAt: new Date(),
        stripeCustomerId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    testUsers.forEach(user => this.users.set(user.id, user));
  }

  // Quote methods
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = {
      ...insertQuote,
      address: insertQuote.address ?? null,
      propertySize: insertQuote.propertySize ?? null,
      frequency: insertQuote.frequency ?? null,
      message: insertQuote.message ?? null,
      selectedServices: insertQuote.selectedServices ?? null,
      acceptedAt: null,
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

  // User methods (Replit Auth compatible)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const existing = this.users.get(id);
    
    const user: User = {
      id,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      phone: userData.phone ?? null,
      role: userData.role ?? "subcontractor",
      company: userData.company ?? null,
      licenseNumber: userData.licenseNumber ?? null,
      insuranceExpiry: userData.insuranceExpiry ?? null,
      agreementAccepted: userData.agreementAccepted ?? false,
      agreementAcceptedAt: userData.agreementAcceptedAt ?? null,
      stripeCustomerId: userData.stripeCustomerId ?? null,
      isActive: userData.isActive ?? true,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: User = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async getAllSubcontractors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === "subcontractor" && u.isActive);
  }

  async getAllAdmins(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === "admin" && u.isActive);
  }

  // Lead methods
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    
    // Ensure baseLeadPrice and currentLeadPrice are set
    const baseLeadPrice = insertLead.baseLeadPrice || "0";
    const currentLeadPrice = insertLead.currentLeadPrice || baseLeadPrice;
    
    const lead: Lead = {
      ...insertLead,
      quoteId: insertLead.quoteId ?? null,
      address: insertLead.address ?? null,
      selectedServices: insertLead.selectedServices ?? null,
      frequency: insertLead.frequency ?? null,
      finalQuote: insertLead.finalQuote ?? null,
      lineItems: insertLead.lineItems ?? null,
      serviceData: insertLead.serviceData ?? null,
      message: insertLead.message ?? null,
      baseLeadPrice,
      currentLeadPrice,
      status: insertLead.status ?? "pending_admin",
      priceReductionRate: insertLead.priceReductionRate ?? "1.50",
      adminDeclined: insertLead.adminDeclined ?? false,
      lastPriceUpdate: new Date(),
      adminReviewedBy: insertLead.adminReviewedBy ?? null,
      adminReviewedAt: null,
      purchasedBy: insertLead.purchasedBy ?? null,
      purchasedAt: null,
      purchasePrice: insertLead.purchasePrice ?? null,
      stripePaymentIntentId: insertLead.stripePaymentIntentId ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter(lead => lead.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeadsForSubcontractor(filters?: { city?: string; serviceType?: string; maxPrice?: number }): Promise<Lead[]> {
    let leads = Array.from(this.leads.values()).filter(lead => lead.status === "available");

    if (filters?.city) {
      leads = leads.filter(lead => lead.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters?.serviceType) {
      leads = leads.filter(lead => 
        lead.serviceType.toLowerCase().includes(filters.serviceType!.toLowerCase()) ||
        lead.selectedServices?.some(s => s.toLowerCase().includes(filters.serviceType!.toLowerCase()))
      );
    }

    if (filters?.maxPrice) {
      leads = leads.filter(lead => {
        const price = parseFloat(lead.currentLeadPrice as string);
        return !isNaN(price) && price <= filters.maxPrice!;
      });
    }

    return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;

    const updated: Lead = {
      ...lead,
      ...data,
      updatedAt: new Date(),
    };
    this.leads.set(id, updated);
    return updated;
  }

  async updateLeadPrices(): Promise<void> {
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (const lead of Array.from(this.leads.values())) {
      if (lead.status === "available" && lead.lastPriceUpdate) {
        const hoursSinceUpdate = (now.getTime() - new Date(lead.lastPriceUpdate).getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate >= 24) {
          const currentPrice = parseFloat(lead.currentLeadPrice as string);
          const reductionRate = parseFloat(lead.priceReductionRate as string) / 100;
          const newPrice = currentPrice * (1 - reductionRate);
          
          const minPrice = parseFloat(lead.baseLeadPrice as string) * 0.5;
          const finalPrice = Math.max(newPrice, minPrice);

          await this.updateLead(lead.id, {
            currentLeadPrice: finalPrice.toFixed(2),
            lastPriceUpdate: now,
          });
        }
      }
    }
  }

  async acceptLead(leadId: string, adminUserId: string): Promise<Lead | undefined> {
    const lead = this.leads.get(leadId);
    if (!lead || lead.status !== "pending_admin") return undefined;

    return await this.updateLead(leadId, {
      status: "accepted",
      adminReviewedBy: adminUserId,
      adminReviewedAt: new Date(),
      adminDeclined: false,
    });
  }

  async declineLead(leadId: string, adminUserId: string): Promise<Lead | undefined> {
    const lead = this.leads.get(leadId);
    if (!lead || lead.status !== "pending_admin") return undefined;

    return await this.updateLead(leadId, {
      status: "available",
      adminReviewedBy: adminUserId,
      adminReviewedAt: new Date(),
      adminDeclined: true,
    });
  }

  // Lead Purchase methods
  async createLeadPurchase(insertPurchase: InsertLeadPurchase): Promise<LeadPurchase> {
    const id = randomUUID();
    const purchase: LeadPurchase = {
      ...insertPurchase,
      stripeChargeId: insertPurchase.stripeChargeId ?? null,
      refunded: insertPurchase.refunded ?? false,
      refundReason: insertPurchase.refundReason ?? null,
      refundedAt: null,
      id,
      createdAt: new Date(),
    };
    this.leadPurchases.set(id, purchase);
    return purchase;
  }

  async getLeadPurchasesByUser(userId: string): Promise<LeadPurchase[]> {
    return Array.from(this.leadPurchases.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeadPurchaseByLead(leadId: string): Promise<LeadPurchase | undefined> {
    return Array.from(this.leadPurchases.values()).find(p => p.leadId === leadId);
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      leadId: insertNotification.leadId ?? null,
      read: insertNotification.read ?? false,
      emailSent: insertNotification.emailSent ?? false,
      emailSentAt: null,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, {
        ...notification,
        read: true,
      });
    }
  }

  async markNotificationEmailSent(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, {
        ...notification,
        emailSent: true,
        emailSentAt: new Date(),
      });
    }
  }

  // Alias methods for API consistency
  async getLeadPurchaseByLeadId(leadId: string): Promise<LeadPurchase | undefined> {
    return this.getLeadPurchaseByLead(leadId);
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return this.getNotificationsByUser(userId);
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    await this.markNotificationRead(id);
    return this.notifications.get(id);
  }
}

export const storage = new MemStorage();
