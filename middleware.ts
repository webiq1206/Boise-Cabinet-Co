import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTAL_PREFIXES = ["/portal", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const response = NextResponse.next();
    response.headers.set("x-portal-route", "1");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
