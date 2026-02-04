import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const user = await getUserFromDb(session.userId);
    const returnTo = session.returnTo;
    delete session.returnTo;
    await session.save();

    const safeReturnTo = 
      typeof returnTo === "string" && returnTo.startsWith("/") 
        ? returnTo 
        : null;

    if (safeReturnTo?.startsWith("/admin") && user?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (user?.role === "subcontractor") {
      return NextResponse.redirect(new URL("/subcontractor/portal", request.url));
    }

    if (user?.role === "admin") {
      return NextResponse.redirect(new URL(safeReturnTo || "/admin/dashboard", request.url));
    }

    return NextResponse.redirect(new URL(safeReturnTo || "/", request.url));
  } catch (error) {
    console.error("Post-login error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
