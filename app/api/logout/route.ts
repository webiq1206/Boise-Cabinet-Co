import { NextRequest, NextResponse } from "next/server";
import { getSession, getOidcConfig, getBaseUrl } from "@/lib/auth";
import * as client from "openid-client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const config = await getOidcConfig();

    session.destroy();

    const hostname = request.headers.get("host") || request.nextUrl.host;
    const postLogoutUri = getBaseUrl(hostname, request.url);

    const endSessionUrl = client.buildEndSessionUrl(config, {
      client_id: process.env.REPL_ID!,
      post_logout_redirect_uri: postLogoutUri,
    });

    return NextResponse.redirect(endSessionUrl.href);
  } catch (error) {
    console.error("Logout error:", error);
    const session = await getSession();
    session.destroy();
    return NextResponse.redirect(new URL("/", request.url));
  }
}
