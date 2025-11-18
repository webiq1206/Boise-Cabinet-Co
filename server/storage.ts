import { type Quote, type InsertQuote } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createQuote(quote: InsertQuote): Promise<Quote>;
  getAllQuotes(): Promise<Quote[]>;
  getQuoteById(id: string): Promise<Quote | undefined>;
}

export class MemStorage implements IStorage {
  private quotes: Map<string, Quote>;

  constructor() {
    this.quotes = new Map();
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = {
      ...insertQuote,
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
}

export const storage = new MemStorage();
