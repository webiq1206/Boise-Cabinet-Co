import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb, getExternalUrl } from "@/lib/auth";
import { getPortalHomePath, normalizeRole } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.redirect(getExternalUrl(request, "/"));
    }

    let user = null;
    try {
      user = await getUserFromDb(session.userId);
    } catch (dbError) {
      console.error("Failed to fetch user during post-login (continuing):", dbError);
    }
    const returnTo = session.returnTo;
    delete session.returnTo;
    await session.save();

    const safeReturnTo =
      typeof returnTo === "string" && returnTo.startsWith("/") ? returnTo : null;

    const role = normalizeRole(user?.role);

    if (safeReturnTo?.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(getExternalUrl(request, "/admin"));
    }

    if (safeReturnTo?.startsWith("/portal") && role !== "customer" && role !== "admin") {
      return NextResponse.redirect(getExternalUrl(request, getPortalHomePath(role)));
    }

    if (role === "customer") {
      return NextResponse.redirect(getExternalUrl(request, safeReturnTo || "/portal"));
    }

    if (role === "partner") {
      return NextResponse.redirect(
        getExternalUrl(request, safeReturnTo || "/partner"),
      );
    }

    if (user?.role === "subcontractor") {
      return NextResponse.redirect(
        getExternalUrl(request, safeReturnTo || "/partner"),
      );
    }

    if (role === "admin") {
      return NextResponse.redirect(
        getExternalUrl(request, safeReturnTo || "/admin/dashboard"),
      );
    }

    return NextResponse.redirect(getExternalUrl(request, safeReturnTo || "/"));
  } catch (error) {
    console.error("Post-login error:", error);
    return NextResponse.redirect(getExternalUrl(request, "/"));
  }
}
