import { NextRequest, NextResponse } from "next/server";
import { getSession, getExternalUrl, clearAuthHint } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  session.destroy();
  await clearAuthHint();
  return NextResponse.redirect(getExternalUrl(request, "/"));
}
