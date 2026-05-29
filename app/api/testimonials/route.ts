import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/lib/db";
import { testimonials } from "@/shared/schema";

export async function GET() {
  if (isDbAvailable && db) {
    try {
      const dbTestimonials = await db.select().from(testimonials).limit(50);
      return NextResponse.json(dbTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials from database:", error);
    }
  }

  return NextResponse.json([]);
}
