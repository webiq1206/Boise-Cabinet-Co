import { NextRequest, NextResponse } from "next/server";
import { getSession, getExternalUrl } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(getExternalUrl(request, "/"));
}
