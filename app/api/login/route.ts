import { NextRequest, NextResponse } from "next/server";
import { getExternalUrl } from "@/lib/auth";

// Backwards-compatible entry point: old links pointed at /api/login. Redirect
// them to the email + password login page.
export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const suffix =
    returnTo && returnTo.startsWith("/")
      ? `?returnTo=${encodeURIComponent(returnTo)}`
      : "";
  return NextResponse.redirect(getExternalUrl(request, `/login${suffix}`));
}
