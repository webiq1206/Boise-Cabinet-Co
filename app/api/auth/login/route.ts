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
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
  returnTo: z.string().optional(),
});

// Throttle credential attempts to slow brute force, by IP and by email.
const PER_IP_LIMIT = 10;
const PER_EMAIL_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipLimited = rateLimit(`login:ip:${ip}`, PER_IP_LIMIT, WINDOW_MS);
    if (!ipLimited.ok) {
      return NextResponse.json(
        { message: "Too many sign-in attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(ipLimited.retryAfter) } },
      );
    }

    const body = await request.json();
    const data = schema.parse(body);

    const emailLimited = rateLimit(`login:email:${data.email.toLowerCase()}`, PER_EMAIL_LIMIT, WINDOW_MS);
    if (!emailLimited.ok) {
      return NextResponse.json(
        { message: "Too many sign-in attempts for this account. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(emailLimited.retryAfter) } },
      );
    }

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
