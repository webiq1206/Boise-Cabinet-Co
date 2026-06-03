import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSession,
  registerUser,
  establishSession,
  resolveLoginRedirect,
  sanitizeUser,
  AuthError,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  firstName: z.string().trim().min(1, "Please enter your first name."),
  lastName: z.string().trim().optional(),
  returnTo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const user = await registerUser(data);
    if (!user) {
      return NextResponse.json(
        { message: "Failed to create account" },
        { status: 500 },
      );
    }
    const session = await getSession();
    await establishSession(session, user);
    return NextResponse.json({
      user: sanitizeUser(user),
      redirect: resolveLoginRedirect(user, data.returnTo),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid input." },
        { status: 400 },
      );
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 },
    );
  }
}
