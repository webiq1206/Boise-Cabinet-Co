import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSession,
  loginUser,
  establishSession,
  resolveLoginRedirect,
  sanitizeUser,
  AuthError,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
  returnTo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const user = await loginUser(data.email, data.password);
    const session = await getSession();
    await establishSession(session, user);
    return NextResponse.json({
      user: sanitizeUser(user),
      redirect: resolveLoginRedirect(user, data.returnTo),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 400 },
      );
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Login error:", error);
    return NextResponse.json({ message: "Failed to sign in" }, { status: 500 });
  }
}
