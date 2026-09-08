import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Staff-only areas. robots.txt already disallows them; this header covers the
 * responses a crawler could still be handed a link to (documents, JSON,
 * downloads) and stops shared caches from serving an authenticated page to
 * somebody who never signed in. Mirrors the parent site's middleware.
 */
const PRIVATE_PREFIXES = ["/portal", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  if (PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("x-portal-route", "1");
  }
  return response;
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
