import { type Quote, type InsertQuote, type GalleryPhoto, type InsertGalleryPhoto, type Testimonial, type InsertTestimonial } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private quotes: Map<string, Quote>;
  private galleryPhotos: Map<string, GalleryPhoto>;
  private testimonials: Map<string, Testimonial>;

  constructor() {
    this.quotes = new Map();
    this.galleryPhotos = new Map();
    this.testimonials = new Map();
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
}

export const storage = new MemStorage();
